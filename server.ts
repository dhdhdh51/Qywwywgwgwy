/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { DBStore } from './server-db';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

// In client-side application requests we can save uploads metadata here
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Enable standard headers and simulate security
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Helper to check user-agent telemetry or headers
function getClientIp(req: express.Request): string {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  return Array.isArray(ip) ? ip[0] : (ip as string);
}

// -----------------------------------------------------
// TENANT RESOLUTION MIDDLEWARE
// -----------------------------------------------------
function getTenantContext(req: express.Request) {
  // We can look at custom headers, subdomain from Host header, or fallback query param for preview emulation
  const customHeaderSubdomain = req.headers['x-tenant-subdomain'] as string;
  const queryParamSubdomain = req.query.emulator_subdomain as string;
  
  let host = req.get('host') || '';
  let subdomain: string | null = null;
  
  if (customHeaderSubdomain) {
    subdomain = customHeaderSubdomain;
  } else if (queryParamSubdomain) {
    subdomain = queryParamSubdomain;
  } else {
    // Try to extract from Host header (e.g. acme.mycrm.com)
    const hostParts = host.split('.');
    if (hostParts.length > 2) {
      subdomain = hostParts[0];
    }
  }

  const tenants = DBStore.getTenants();
  
  // Find matched tenant via subdomain or customDomain
  let tenant = tenants.find(t => t.subdomain === subdomain);
  if (!tenant) {
    tenant = tenants.find(t => t.customDomain === host);
  }
  
  return tenant || null;
}

// -----------------------------------------------------
// API AUTH ROUTES
// -----------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { email, password, emulator_subdomain } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const users = DBStore.getUsers();
  const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!matchedUser) {
    DBStore.addAuditLog(null, 'anonymous', email, 'LOGIN_FAILED', 'User email not found.', getClientIp(req));
    return res.status(401).json({ error: 'Invalid credentials. Try tenant@acme.com / acme123 or admin@crm.com / admin123' });
  }

  // Very simple simulation checks for sandbox:
  if (matchedUser.passwordHash !== password) {
    DBStore.addAuditLog(matchedUser.tenantId, matchedUser.id, matchedUser.name, 'LOGIN_FAILED', 'Incorrect password submitted.', getClientIp(req));
    return res.status(401).json({ error: 'Incorrect password' });
  }

  // Record audit logs
  DBStore.addAuditLog(
    matchedUser.tenantId, 
    matchedUser.id, 
    matchedUser.name, 
    'LOGIN_SUCCESS', 
    `Logged in from application client web interface.`, 
    getClientIp(req)
  );

  const { passwordHash, ...userWithoutPassword } = matchedUser;
  res.json({ token: `simulated-jwt-${matchedUser.id}`, user: userWithoutPassword });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized credentials' });
  }

  const userId = token.replace('Bearer ', '').replace('simulated-jwt-', '');
  const users = DBStore.getUsers();
  const matchedUser = users.find(u => u.id === userId);

  if (!matchedUser) {
    return res.status(401).json({ error: 'User session expired or not found' });
  }

  const { passwordHash, ...userWithoutPassword } = matchedUser;
  res.json({ user: userWithoutPassword });
});


// -----------------------------------------------------
// TENANT SPECIFIC CRM CLIENT APIS
// -----------------------------------------------------
app.get('/api/crm/tenant-details', (req, res) => {
  const tenant = getTenantContext(req);
  if (!tenant) {
    return res.status(404).json({ error: 'No matching tenant found for Host/Emulated Subdomain' });
  }
  res.json(tenant);
});

// GET Leads
app.get('/api/crm/leads', (req, res) => {
  const tenant = getTenantContext(req);
  if (!tenant) return res.status(403).json({ error: 'Unauthorized tenant scope' });
  
  const leads = DBStore.getLeads().filter(l => l.tenantId === tenant.id);
  res.json(leads);
});

// POST lead / PUT lead
app.post('/api/crm/leads', (req, res) => {
  const tenant = getTenantContext(req);
  if (!tenant) return res.status(403).json({ error: 'Unauthorized tenant scope' });

  const { name, email, phone, company, status, value, source, notes, assignedToId } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Lead name and email are mandatory fields' });
  }

  const newLead = {
    id: 'lead-' + Date.now(),
    tenantId: tenant.id,
    name,
    email,
    phone: phone || '',
    company: company || '',
    status: status || 'NEW',
    value: Number(value) || 0,
    source: source || 'Manual Input',
    notes: notes || '',
    assignedToId: assignedToId || null,
    createdAt: new Date().toISOString()
  };

  DBStore.saveLead(newLead);
  DBStore.addAuditLog(tenant.id, 'System', 'Staff/API', 'CRM_LEAD_CREATE', `Created lead for ${name}`, getClientIp(req));
  res.status(201).json(newLead);
});

app.put('/api/crm/leads/:id', (req, res) => {
  const tenant = getTenantContext(req);
  if (!tenant) return res.status(403).json({ error: 'Unauthorized tenant scope' });

  const leadId = req.params.id;
  const leads = DBStore.getLeads();
  const leadIdx = leads.findIndex(l => l.id === leadId && l.tenantId === tenant.id);

  if (leadIdx < 0) {
    return res.status(404).json({ error: 'Lead not found in this tenant CRM' });
  }

  const updatedLead = {
    ...leads[leadIdx],
    ...req.body,
    id: leadId,
    tenantId: tenant.id
  };

  DBStore.saveLead(updatedLead);
  res.json(updatedLead);
});

app.delete('/api/crm/leads/:id', (req, res) => {
  const tenant = getTenantContext(req);
  if (!tenant) return res.status(403).json({ error: 'Unauthorized tenant scope' });

  const leadId = req.params.id;
  DBStore.deleteLead(leadId);
  res.json({ success: true, id: leadId });
});

// Contact endpoints
app.get('/api/crm/contacts', (req, res) => {
  const tenant = getTenantContext(req);
  if (!tenant) return res.status(403).json({ error: 'Unauthorized tenant scope' });
  const list = DBStore.getContacts().filter(c => c.tenantId === tenant.id);
  res.json(list);
});

app.post('/api/crm/contacts', (req, res) => {
  const tenant = getTenantContext(req);
  if (!tenant) return res.status(403).json({ error: 'Unauthorized tenant' });
  const { name, email, phone, company, position } = req.body;
  if (!name) return res.status(400).json({ error: 'Contact name is required' });

  const newContact = {
    id: 'contact-' + Date.now(),
    tenantId: tenant.id,
    name,
    email: email || '',
    phone: phone || '',
    company: company || '',
    position: position || '',
    createdAt: new Date().toISOString()
  };
  DBStore.saveContact(newContact);
  res.status(201).json(newContact);
});

// Tasks
app.get('/api/crm/tasks', (req, res) => {
  const tenant = getTenantContext(req);
  if (!tenant) return res.status(403).json({ error: 'Unauthorized tenant' });
  res.json(DBStore.getTasks().filter(t => t.tenantId === tenant.id));
});

app.post('/api/crm/tasks', (req, res) => {
  const tenant = getTenantContext(req);
  if (!tenant) return res.status(403).json({ error: 'Unauthorized tenant' });
  const { title, description, status, priority, dueDate, assignedToId, leadId } = req.body;
  
  const newTask = {
    id: 'task-' + Date.now(),
    tenantId: tenant.id,
    title: title || 'New Task',
    description: description || '',
    status: status || 'TODO',
    priority: priority || 'MEDIUM',
    dueDate: dueDate || new Date(Date.now() + 86400000 * 2).toISOString(),
    assignedToId: assignedToId || null,
    leadId: leadId || null,
    createdAt: new Date().toISOString()
  };
  DBStore.saveTask(newTask);
  res.status(201).json(newTask);
});

app.put('/api/crm/tasks/:id', (req, res) => {
  const tenant = getTenantContext(req);
  if (!tenant) return res.status(403).json({ error: 'Unauthorized' });
  const taskId = req.params.id;
  const tasks = DBStore.getTasks();
  const taskIdx = tasks.findIndex(t => t.id === taskId && t.tenantId === tenant.id);
  if (taskIdx < 0) return res.status(404).json({ error: 'Task not found' });

  const updated = {
    ...tasks[taskIdx],
    ...req.body,
    id: taskId,
    tenantId: tenant.id
  };
  DBStore.saveTask(updated);
  res.json(updated);
});

// Invoices
app.get('/api/crm/invoices', (req, res) => {
  const tenant = getTenantContext(req);
  if (!tenant) return res.status(403).json({ error: 'Unauthorized' });
  res.json(DBStore.getInvoices().filter(i => i.tenantId === tenant.id));
});

app.post('/api/crm/invoices', (req, res) => {
  const tenant = getTenantContext(req);
  if (!tenant) return res.status(403).json({ error: 'Unauthorized' });
  const { clientName, clientEmail, items, status, dueDate } = req.body;

  const invoiceItems = items || [];
  const total = invoiceItems.reduce((acc: number, item: any) => acc + (Number(item.quantity) * Number(item.unitPrice)), 0);

  const num = 'INV-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

  const newInvoice = {
    id: 'inv-' + Date.now(),
    tenantId: tenant.id,
    invoiceNumber: num,
    clientName: clientName || 'Walk-in Client',
    clientEmail: clientEmail || '',
    items: invoiceItems,
    total,
    status: status || 'DRAFT',
    dueDate: dueDate || new Date(Date.now() + 86400000 * 14).toISOString(),
    createdAt: new Date().toISOString()
  };
  DBStore.saveInvoice(newInvoice);
  res.status(201).json(newInvoice);
});

// Products
app.get('/api/crm/products', (req, res) => {
  const tenant = getTenantContext(req);
  if (!tenant) return res.status(403).json({ error: 'Unauthorized' });
  res.json(DBStore.getProducts().filter(p => p.tenantId === tenant.id));
});

app.post('/api/crm/products', (req, res) => {
  const tenant = getTenantContext(req);
  if (!tenant) return res.status(403).json({ error: 'Unauthorized' });
  const { name, sku, price, stock, description } = req.body;

  const newProd = {
    id: 'prod-' + Date.now(),
    tenantId: tenant.id,
    name,
    sku: sku || 'SKU-' + Date.now(),
    price: Number(price) || 0,
    stock: Number(stock) || 0,
    description: description || ''
  };
  DBStore.saveProduct(newProd);
  res.status(201).json(newProd);
});

// Expenses
app.get('/api/crm/expenses', (req, res) => {
  const tenant = getTenantContext(req);
  if (!tenant) return res.status(403).json({ error: 'Unauthorized' });
  res.json(DBStore.getExpenses().filter(e => e.tenantId === tenant.id));
});

app.post('/api/crm/expenses', (req, res) => {
  const tenant = getTenantContext(req);
  if (!tenant) return res.status(403).json({ error: 'Unauthorized' });
  const { description, amount, category, date, paymentMethod } = req.body;

  const newExp = {
    id: 'exp-' + Date.now(),
    tenantId: tenant.id,
    description: description || 'Miscellaneous Expense',
    amount: Number(amount) || 0,
    category: category || 'Utilities',
    date: date || new Date().toISOString(),
    paymentMethod: paymentMethod || 'Cash'
  };
  DBStore.saveExpense(newExp);
  res.status(201).json(newExp);
});

// Broadcast marketing Campaigns
app.get('/api/crm/campaigns', (req, res) => {
  const tenant = getTenantContext(req);
  if (!tenant) return res.status(403).json({ error: 'Unauthorized' });
  res.json(DBStore.getCampaigns().filter(c => c.tenantId === tenant.id));
});

app.post('/api/crm/campaigns', (req, res) => {
  const tenant = getTenantContext(req);
  if (!tenant) return res.status(403).json({ error: 'Unauthorized' });
  const { name, subject, body, type } = req.body;

  const newCamp = {
    id: 'camp-' + Date.now(),
    tenantId: tenant.id,
    name: name || 'Newsletter Campaign',
    subject: subject || '',
    body: body || '',
    type: type || 'EMAIL',
    status: 'SENT' as any, // Instant dispatch
    sentCount: Math.floor(50 + Math.random() * 250),
    createdAt: new Date().toISOString()
  };
  DBStore.saveCampaign(newCamp);
  res.status(201).json(newCamp);
});

// Tickets
app.get('/api/crm/tickets', (req, res) => {
  const tenant = getTenantContext(req);
  if (!tenant) return res.status(403).json({ error: 'Unauthorized' });
  res.json(DBStore.getTickets().filter(t => t.tenantId === tenant.id));
});

app.post('/api/crm/tickets', (req, res) => {
  const tenant = getTenantContext(req);
  if (!tenant) return res.status(403).json({ error: 'Unauthorized' });
  const { subject, description, priority, contactEmail } = req.body;

  const newTicket = {
    id: 'tix-' + Date.now(),
    tenantId: tenant.id,
    subject: subject || 'System issues',
    description: description || '',
    priority: priority || 'MEDIUM',
    status: 'OPEN' as any,
    contactEmail: contactEmail || 'customer@client.com',
    createdAt: new Date().toISOString()
  };
  DBStore.saveTicket(newTicket);
  res.status(201).json(newTicket);
});

app.put('/api/crm/tickets/:id', (req, res) => {
  const tenant = getTenantContext(req);
  if (!tenant) return res.status(403).json({ error: 'Unauthorized' });
  const ticketId = req.params.id;
  const tickets = DBStore.getTickets();
  const idx = tickets.findIndex(t => t.id === ticketId && t.tenantId === tenant.id);
  if (idx < 0) return res.status(404).json({ error: 'Ticket not found' });

  const updated = {
    ...tickets[idx],
    ...req.body,
    id: ticketId,
    tenantId: tenant.id
  };
  DBStore.saveTicket(updated);
  res.json(updated);
});


// -----------------------------------------------------
// IMAGES AND DOCUMENTS CAROUSEL / MEDIA LIBRARY UPLOAD
// -----------------------------------------------------
app.post('/api/crm/media/upload', (req, res) => {
  const tenant = getTenantContext(req);
  const tenantId = tenant ? tenant.id : 'global';
  
  // Clean mock JSON response with random Unsplash mockup to simulate beautiful visual files upload
  const mockUnsplashImages = [
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&h=300&q=80',
    'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=400&h=300&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&h=300&q=80',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&h=300&q=80'
  ];

  const randomImg = mockUnsplashImages[Math.floor(Math.random() * mockUnsplashImages.length)];
  
  res.json({
    success: true,
    file: {
      name: 'receipt_upload_' + Date.now() + '.png',
      size: '245 KB',
      mimeType: 'image/png',
      url: randomImg,
      uploadedAt: new Date().toISOString()
    }
  });
});


// -----------------------------------------------------
// SERVER-SIDE AI COPILOT SMART SCORING (GEMINI)
// -----------------------------------------------------
app.post('/api/ai/analyze-lead', async (req, res) => {
  const { leadDetails } = req.body;
  if (!leadDetails) {
    return res.status(400).json({ error: 'No lead details provided' });
  }

  // Check if Gemini Key is available
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // Elegant fallback simulation
    const simulatedRating = Math.floor(65 + Math.random() * 32);
    const feedback = `AI Lead Analyser Heuristics: Lead is tagged in high priority industry. Company profile indicates solid scaling capability. Status is inside standard sales cycle. Strongly advise calling back with custom target integration quotes. (Please set up your real GEMINI_API_KEY in Secrets context to experience full-blown deep AI suggestions!)`;
    return res.json({
      score: simulatedRating,
      summary: `Lead ${leadDetails.name} from ${leadDetails.company || 'Unknown Corp'} rated solid at ${simulatedRating}% conversion chance.`,
      suggestions: feedback,
      aiActive: false
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are an enterprise CRM Lead Conversion scientist. Review the following client profile detail:
      Name: ${leadDetails.name}
      Company: ${leadDetails.company}
      Current CRM status pipeline: ${leadDetails.status}
      Deal value estimate: $${leadDetails.value || 0}
      Activity Note details: ${leadDetails.notes}

      Return a JSON block containing exact properties:
      "score" (an integer from 0 to 100),
      "summary" (a one-sentence high value executive summary),
      "suggestions" (a helpful bullet point list of 3 specific follow-up actions under 150 words).
      Provide ONLY clean valid parseable JSON without any raw markdown surrounding wrappers (do not include \`\`\`json wrappers, strictly pure JSON text).`,
      config: {
        temperature: 0.7,
      }
    });

    const text = response.text || '';
    // Strip possible raw markdown code backticks if the model returned them anyway
    const sanitizedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const resultObj = JSON.parse(sanitizedText);
    
    res.json({
      score: resultObj.score || 85,
      summary: resultObj.summary || 'Strong potential sales lead.',
      suggestions: resultObj.suggestions || 'Call client immediately.',
      aiActive: true
    });

  } catch (error: any) {
    console.error("Gemini API call failed:", error);
    res.json({
      score: 75,
      summary: `Deterministic Score fallback for ${leadDetails.name}. Could not parse AI outputs.`,
      suggestions: `1. Setup direct phone intake.\n2. Confirm corporate budget size.\n3. Request active security requirements sheets.`,
      aiActive: false,
      apiError: error.message
    });
  }
});


// -----------------------------------------------------
// GLOBAL CMS + SUPER ADMIN SETTINGS ENDPOINTS
// -----------------------------------------------------
app.get('/api/stats/global', (req, res) => {
  const tenants = DBStore.getTenants();
  const leads = DBStore.getLeads();
  const users = DBStore.getUsers();
  
  const totalRev = DBStore.getPlans().reduce((acc, p) => {
    const count = tenants.filter(t => t.subscriptionPlanId === p.id).length;
    return acc + (count * p.price);
  }, 0);

  res.json({
    totalRevenue: totalRev + 1250, // base add on fees
    totalTenants: tenants.length,
    activeUsers: users.length,
    subscriptionRate: Math.round((tenants.filter(t => t.status === 'ACTIVE').length / (tenants.length || 1)) * 100)
  });
});

app.get('/api/plans', (req, res) => {
  res.json(DBStore.getPlans());
});

app.post('/api/plans', (req, res) => {
  const { name, price, billingPeriod, features, maxLeads, maxUsers, maxStorageMb } = req.body;
  if (!name) return res.status(400).json({ error: 'Plan name is required' });

  const newPlan = {
    id: 'plan-' + Date.now(),
    name,
    price: Number(price) || 0,
    billingPeriod: billingPeriod || 'monthly',
    features: features || [],
    maxLeads: Number(maxLeads) || 1000,
    maxUsers: Number(maxUsers) || 10,
    maxStorageMb: Number(maxStorageMb) || 1000,
    isActive: true
  };
  DBStore.savePlan(newPlan);
  res.status(201).json(newPlan);
});

app.get('/api/tenants', (req, res) => {
  res.json(DBStore.getTenants());
});

app.post('/api/tenants', (req, res) => {
  const { name, subdomain, customDomain, planId, primaryColor } = req.body;
  if (!subdomain) return res.status(400).json({ error: 'Subdomain is required' });

  const matchedPlan = DBStore.getPlans().find(p => p.id === planId) || DBStore.getPlans()[0];

  const newTenant = {
    id: 'tenant-' + Date.now(),
    name: name || `${subdomain} Inc`,
    subdomain: subdomain.toLowerCase().trim(),
    customDomain: customDomain || null,
    status: 'ACTIVE' as any,
    logoUrl: null,
    primaryColor: primaryColor || '#2563eb',
    subscriptionPlanId: matchedPlan.id,
    subscriptionExpiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
    createdAt: new Date().toISOString(),
    settings: {
      businessType: 'General SaaS business',
      currency: 'USD',
      emailSignature: `Kind regards, ${name || subdomain}`,
    }
  };

  DBStore.saveTenant(newTenant);
  
  // Auto-generate a local Tenant Admin for this new space to make platform immediately fully functional!
  const newTenantAdmin = {
    id: 'user-' + Date.now(),
    tenantId: newTenant.id,
    email: `admin@${newTenant.subdomain}.com`,
    passwordHash: 'password123',
    name: `${newTenant.name} Administrator`,
    role: 'TENANT_ADMIN' as any,
    status: 'ACTIVE' as any,
    avatarUrl: null,
    createdAt: new Date().toISOString()
  };
  DBStore.saveUser(newTenantAdmin);

  res.status(201).json({ tenant: newTenant, autoAdminCreds: { email: newTenantAdmin.email, password: 'password123' } });
});

// Blog CMS
app.get('/api/blogs', (req, res) => {
  res.json(DBStore.getBlogs());
});

app.post('/api/blogs', (req, res) => {
  const { title, excerpt, content, imageUrl } = req.body;
  const newBlog = {
    id: 'blog-' + Date.now(),
    title: title || 'New Insightful Article',
    slug: (title || 'article').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    excerpt: excerpt || '',
    content: content || '',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&h=250&q=80',
    published: true,
    createdAt: new Date().toISOString()
  };
  DBStore.saveBlog(newBlog);
  res.status(201).json(newBlog);
});

// FAQ CMS
app.get('/api/faqs', (req, res) => {
  res.json(DBStore.getFaqs());
});

// Testimonials CMS
app.get('/api/testimonials', (req, res) => {
  res.json(DBStore.getTestimonials());
});

// SMTP Admin Config
app.get('/api/settings/smtp', (req, res) => {
  res.json(DBStore.getSmtpSettings());
});

app.post('/api/settings/smtp', (req, res) => {
  DBStore.updateSmtp(req.body);
  res.json({ success: true, settings: DBStore.getSmtpSettings() });
});

// SEO Admin Settings
app.get('/api/settings/seo', (req, res) => {
  res.json(DBStore.getSeoSettings());
});

app.post('/api/settings/seo', (req, res) => {
  DBStore.updateSeo(req.body);
  res.json({ success: true, settings: DBStore.getSeoSettings() });
});

app.get('/api/coupons', (req, res) => {
  res.json(DBStore.getCoupons());
});

app.post('/api/coupons', (req, res) => {
  const { code, discountType, discountValue, expiresAt } = req.body;
  const newCoupon = {
    id: 'coupon-' + Date.now(),
    code: (code || 'CODE').toUpperCase(),
    discountType: discountType || 'PERCENT',
    discountValue: Number(discountValue) || 10,
    expiresAt: expiresAt || new Date(Date.now() + 864500000).toISOString(),
    isActive: true
  };
  DBStore.saveCoupon(newCoupon);
  res.status(201).json(newCoupon);
});

// Audit log view
app.get('/api/audit-logs', (req, res) => {
  // Filters could limit logs by tenant
  const tenant = getTenantContext(req);
  const logs = DBStore.getAuditLogs();
  
  if (tenant) {
    return res.json(logs.filter(l => l.tenantId === tenant.id));
  }
  // If Superadmin is requesting, we can pass a parameter to see everything
  res.json(logs);
});


// -----------------------------------------------------
// STATIC SERVING FOR PRODUCTION SPA
// -----------------------------------------------------
const DIST_PATH = path.join(process.cwd(), 'dist');
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
}

// Fallback all other client requests to SPA index.html to support routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  const SPA_INDEX = path.join(DIST_PATH, 'index.html');
  if (fs.existsSync(SPA_INDEX)) {
    return res.sendFile(SPA_INDEX);
  }
  // Backup if build not executed yet
  res.send(`<h2>SaaS CRM Development Server is Active!</h2><p>Please execute Vite production bundle builds, or utilize API endpoints.</p>`);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[OmniSaas Backend active at http://0.0.0.0:${PORT}]`);
});
