/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { 
  User, Tenant, SubscriptionPlan, CRMLead, CRMContact, CRMTask, 
  CRMInvoice, CRMExpense, CRMProduct, SupportTicket, MarketingCampaign, 
  AuditLog, Coupon, BlogCMS, FaqCMS, TestimonialCMS, GlobalStats 
} from './src/types';

interface JSONDatabase {
  plans: SubscriptionPlan[];
  tenants: Tenant[];
  users: (User & { passwordHash: string })[];
  leads: CRMLead[];
  contacts: CRMContact[];
  tasks: CRMTask[];
  invoices: CRMInvoice[];
  expenses: CRMExpense[];
  products: CRMProduct[];
  tickets: SupportTicket[];
  campaigns: MarketingCampaign[];
  auditLogs: AuditLog[];
  coupons: Coupon[];
  blogs: BlogCMS[];
  faqs: FaqCMS[];
  testimonials: TestimonialCMS[];
  smtpSettings: {
    host: string;
    port: number;
    user: string;
    secure: boolean;
  };
  seoSettings: {
    metaTitle: string;
    metaDescription: string;
    googleAnalyticsId: string;
  };
}

const DB_PATH = path.join(process.cwd(), 'database.json');

// Helper to seed data if file doesn't exist
function getInitialData(): JSONDatabase {
  const plans: SubscriptionPlan[] = [
    {
      id: 'plan-starter',
      name: 'Starter Plan',
      price: 29,
      billingPeriod: 'monthly',
      features: ['Up to 1,000 leads', 'Up to 5 staff', '500MB local storage', 'Subdomain Access'],
      maxLeads: 1000,
      maxUsers: 5,
      maxStorageMb: 500,
      isActive: true,
    },
    {
      id: 'plan-growth',
      name: 'Growth Plan',
      price: 79,
      billingPeriod: 'monthly',
      features: ['Up to 10,000 leads', 'Up to 20 staff', '2GB storage', 'Custom Domain Mapping', 'Automated Workflows'],
      maxLeads: 10000,
      maxUsers: 20,
      maxStorageMb: 2000,
      isActive: true,
    },
    {
      id: 'plan-enterprise',
      name: 'Enterprise Plan',
      price: 199,
      billingPeriod: 'monthly',
      features: ['Unlimited leads', 'Unlimited staff', '10GB storage', 'Custom Domains + SSL', 'Dedicated Support API', 'Branded Email Templates'],
      maxLeads: 999999,
      maxUsers: 999999,
      maxStorageMb: 10000,
      isActive: true,
    },
  ];

  const tenants: Tenant[] = [
    {
      id: 'tenant-acme',
      name: 'Acme Global Ltd',
      subdomain: 'acme',
      customDomain: 'crm.acmeportal.com',
      status: 'ACTIVE',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
      primaryColor: '#0f766e', // Teal 700
      subscriptionPlanId: 'plan-growth',
      subscriptionExpiresAt: '2028-12-31T23:59:59Z',
      createdAt: '2026-01-15T08:00:00Z',
      settings: {
        businessType: 'B2B Professional Services',
        currency: 'USD',
        emailSignature: 'With regards, Acme Support Team',
        smtpHost: 'mail.acmeportal.com',
        smtpPort: 587,
        smtpUser: 'crm@acmeportal.com',
      }
    },
    {
      id: 'tenant-apex',
      name: 'Apex Marketing Corp',
      subdomain: 'apex',
      customDomain: null,
      status: 'ACTIVE',
      logoUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=120&h=120&q=80',
      primaryColor: '#2563eb', // Blue 600
      subscriptionPlanId: 'plan-starter',
      subscriptionExpiresAt: '2026-11-20T23:59:59Z',
      createdAt: '2026-03-10T12:00:00Z',
      settings: {
        businessType: 'Marketing Agency',
        currency: 'EUR',
        emailSignature: 'Kind regards, Apex Agency',
      }
    }
  ];

  const users: (User & { passwordHash: string })[] = [
    // Super Admins
    {
      id: 'user-superadmin',
      tenantId: null,
      email: 'admin@crm.com',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
      passwordHash: 'admin123', // Clean plain or hashed. For simplicity, we compare string
      createdAt: '2026-01-01T00:00:00Z',
    },
    // Acme Users
    {
      id: 'user-acme-admin',
      tenantId: 'tenant-acme',
      email: 'tenant@acme.com',
      name: 'Sarah Jenkins',
      role: 'TENANT_ADMIN',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
      passwordHash: 'acme123',
      createdAt: '2026-01-15T08:30:00Z',
    },
    {
      id: 'user-acme-staff',
      tenantId: 'tenant-acme',
      email: 'sales@acme.com',
      name: 'Mark Fletcher',
      role: 'STAFF',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
      passwordHash: 'sales123',
      createdAt: '2026-01-16T09:00:00Z',
    },
    // Apex Users
    {
      id: 'user-apex-admin',
      tenantId: 'tenant-apex',
      email: 'apex@crm.com',
      name: 'John Apex',
      role: 'TENANT_ADMIN',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
      passwordHash: 'apex123',
      createdAt: '2026-03-10T12:30:00Z',
    }
  ];

  const leads: CRMLead[] = [
    {
      id: 'lead-1',
      tenantId: 'tenant-acme',
      name: 'Charles Sterling',
      email: 'charles@sterlinggroup.com',
      phone: '+1 (555) 382-9182',
      company: 'Sterling Developments',
      status: 'PROPOSAL',
      value: 12500,
      source: 'Google Campaign',
      assignedToId: 'user-acme-staff',
      notes: 'Requested custom API integration quote. Needs 3-year agreement.',
      createdAt: '2026-05-10T14:30:00Z'
    },
    {
      id: 'lead-2',
      tenantId: 'tenant-acme',
      name: 'Angela Wu',
      email: 'awu@cloudprism.io',
      phone: '+1 (555) 289-4019',
      company: 'CloudPrism Labs',
      status: 'NEW',
      value: 8200,
      source: 'Cold Email',
      assignedToId: 'user-acme-admin',
      notes: 'Interested in B2B customer pipeline tracking. Demo scheduled next Wednesday.',
      createdAt: '2026-05-24T10:15:00Z'
    },
    {
      id: 'lead-3',
      tenantId: 'tenant-acme',
      name: 'David Carter',
      email: 'carter@quantumtech.org',
      phone: '+1 (555) 901-4432',
      company: 'Quantum Technology',
      status: 'WON',
      value: 24000,
      source: 'Partner Referral',
      assignedToId: 'user-acme-staff',
      notes: 'Agreement signed! Project kickoff scheduled. Setup onboarding session first.',
      createdAt: '2026-04-18T11:00:00Z'
    },
    {
      id: 'lead-4',
      tenantId: 'tenant-acme',
      name: 'Regina Hall',
      email: 'r.hall@metasync.com',
      phone: '+1 (555) 726-1188',
      company: 'MetaSync Corp',
      status: 'CONTACTED',
      value: 5400,
      source: 'Organic Search',
      assignedToId: 'user-acme-staff',
      notes: 'Left message. Looking to replace Hubspot. Prefers lightweight dashboard.',
      createdAt: '2026-05-28T09:45:00Z'
    },
    {
      id: 'lead-5',
      tenantId: 'tenant-apex',
      name: 'Gregory Mills',
      email: 'gmills@apexbrand.com',
      phone: '+33 6 55 91 21',
      company: 'Apex Brand Retail',
      status: 'QUALIFIED',
      value: 3200,
      source: 'Website Form',
      assignedToId: 'user-apex-admin',
      notes: 'Inquired about social media target management campaign services.',
      createdAt: '2026-05-12T16:00:00Z'
    }
  ];

  const contacts: CRMContact[] = [
    {
      id: 'contact-1',
      tenantId: 'tenant-acme',
      name: 'Charles Sterling',
      email: 'charles@sterlinggroup.com',
      phone: '+1 (555) 382-9182',
      company: 'Sterling Developments',
      position: 'VP Operations',
      createdAt: '2026-05-10T14:35:00Z'
    },
    {
      id: 'contact-2',
      tenantId: 'tenant-acme',
      name: 'David Carter',
      email: 'carter@quantumtech.org',
      phone: '+1 (555) 901-4432',
      company: 'Quantum Technology',
      position: 'Chief Innovation Officer',
      createdAt: '2026-04-18T11:05:00Z'
    }
  ];

  const tasks: CRMTask[] = [
    {
      id: 'task-1',
      tenantId: 'tenant-acme',
      title: 'Send custom integration quote to Charles',
      description: 'Review cost checklist with the dev group. Send pricing sheet by Friday morning.',
      status: 'TODO',
      priority: 'HIGH',
      dueDate: '2026-06-05T17:00:00Z',
      assignedToId: 'user-acme-staff',
      leadId: 'lead-1',
      createdAt: '2026-05-29T14:00:00Z'
    },
    {
      id: 'task-2',
      tenantId: 'tenant-acme',
      title: 'Setup kickoff meeting for Quantum Technology',
      description: 'Prepare folder layout and secure access permissions to folders.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      dueDate: '2026-06-03T10:00:00Z',
      assignedToId: 'user-acme-staff',
      leadId: 'lead-3',
      createdAt: '2026-05-28T10:00:00Z'
    },
    {
      id: 'task-3',
      tenantId: 'tenant-acme',
      title: 'Initial brief follow-up call with Regina',
      description: 'Call back to introduce team. Confirm their budget constraints.',
      status: 'TODO',
      priority: 'LOW',
      dueDate: '2026-06-02T15:00:00Z',
      assignedToId: 'user-acme-staff',
      leadId: 'lead-4',
      createdAt: '2026-05-29T12:00:00Z'
    },
    {
      id: 'task-4',
      tenantId: 'tenant-acme',
      title: 'Upload standard security audit PDF',
      description: 'Completed annual security audit logs.',
      status: 'DONE',
      priority: 'LOW',
      dueDate: '2026-05-25T18:00:00Z',
      assignedToId: 'user-acme-admin',
      leadId: null,
      createdAt: '2026-05-20T11:00:00Z'
    }
  ];

  const invoices: CRMInvoice[] = [
    {
      id: 'inv-1',
      tenantId: 'tenant-acme',
      invoiceNumber: 'INV-2026-001',
      clientName: 'Quantum Technology Ltd',
      clientEmail: 'billing@quantumtech.org',
      items: [
        { description: 'CRM SaaS Suite Setup Premium', quantity: 1, unitPrice: 15000 },
        { description: 'Onboarding & Virtual Support Days', quantity: 3, unitPrice: 3000 }
      ],
      total: 24000,
      status: 'PAID',
      dueDate: '2026-05-15T23:59:59Z',
      createdAt: '2026-04-18T11:10:00Z'
    },
    {
      id: 'inv-2',
      tenantId: 'tenant-acme',
      invoiceNumber: 'INV-2026-002',
      clientName: 'Sterling Developments',
      clientEmail: 'charles@sterlinggroup.com',
      items: [
        { description: 'Quarterly Custom Integration Support', quantity: 1, unitPrice: 12500 }
      ],
      total: 12500,
      status: 'SENT',
      dueDate: '2026-06-15T23:59:59Z',
      createdAt: '2026-05-11T09:00:00Z'
    }
  ];

  const expenses: CRMExpense[] = [
    {
      id: 'exp-1',
      tenantId: 'tenant-acme',
      description: 'Google AdWords PPC Network Campaign',
      amount: 1450,
      category: 'Marketing',
      date: '2026-05-01T00:00:00Z',
      paymentMethod: 'Corporate Visa Card'
    },
    {
      id: 'exp-2',
      tenantId: 'tenant-acme',
      description: 'Co-working Office Rent Monthly Room A',
      amount: 1200,
      category: 'Rent & Utilities',
      date: '2026-05-10T00:00:00Z',
      paymentMethod: 'Bank Transfer'
    }
  ];

  const products: CRMProduct[] = [
    {
      id: 'prod-1',
      tenantId: 'tenant-acme',
      name: 'CRM Premium SaaS Subscription (1 Year)',
      sku: 'CRM-PREM-1YR',
      price: 1500,
      stock: 999,
      description: 'Standard custom enterprise sales track subscription keys.'
    },
    {
      id: 'prod-2',
      tenantId: 'tenant-acme',
      name: 'Onboarding Dedicated Virtual Days',
      sku: 'CRM-ONB-DAY',
      price: 1000,
      stock: 100,
      description: 'One complete business day training and data mapping integration.'
    }
  ];

  const tickets: SupportTicket[] = [
    {
      id: 'tix-1',
      tenantId: 'tenant-acme',
      subject: 'Import pipeline CSV format error',
      description: 'Getting missing date columns layout fault while trying to import client spreadsheet.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      contactEmail: 'awu@cloudprism.io',
      createdAt: '2026-05-25T08:00:00Z'
    },
    {
      id: 'tix-2',
      tenantId: 'tenant-acme',
      subject: 'White labeling color palette options',
      description: 'Can we configure custom branding details like hex codes directly?',
      priority: 'LOW',
      status: 'RESOLVED',
      contactEmail: 'charles@sterlinggroup.com',
      createdAt: '2026-05-20T10:00:00Z'
    }
  ];

  const campaigns: MarketingCampaign[] = [
    {
      id: 'camp-1',
      tenantId: 'tenant-acme',
      name: 'May Re-engagement Campaign',
      subject: 'Still managing sales leaks on paper forms?',
      body: 'Hi, we saw you registered on Acme! Check out our new automated visual pipelines.',
      type: 'EMAIL',
      status: 'SENT',
      sentCount: 152,
      createdAt: '2026-05-05T09:00:00Z'
    }
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'log-1',
      tenantId: 'tenant-acme',
      userId: 'user-acme-admin',
      userName: 'Sarah Jenkins',
      action: 'LOGIN_SUCCESS',
      details: 'User logged in successfully from Chrome on desktop.',
      ip: '192.168.1.1',
      createdAt: '2026-05-29T08:00:00Z'
    },
    {
      id: 'log-2',
      tenantId: null,
      userId: 'user-superadmin',
      userName: 'Super Admin',
      action: 'SYSTEM_PLAN_UPDATE',
      details: 'Updated starter subscription plan default features array.',
      ip: '127.0.0.1',
      createdAt: '2026-05-29T10:00:00Z'
    }
  ];

  const coupons: Coupon[] = [
    {
      code: 'WELCOME50',
      discountType: 'PERCENT',
      discountValue: 50,
      expiresAt: '2027-12-31T23:59:59Z',
      isActive: true,
    },
    {
      code: 'STARTFIRST',
      discountType: 'FIXED',
      discountValue: 15,
      expiresAt: '2026-11-30T23:59:59Z',
      isActive: true,
    }
  ];

  const blogs: BlogCMS[] = [
    {
      id: 'blog-1',
      title: '5 Ways to Automate Your Sales Lead Pipeline',
      slug: 'automate-sales-lead-pipeline',
      content: 'Effective lead automation decreases staff burden by nearly 40%. Start by defining direct statuses like contacting, qualification steps, and setting up daily notification alerts for neglected opportunities.',
      excerpt: 'Struggling to keep up with incoming sales prospects? Discover the key triggers to automate custom lead tracking.',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&h=250&q=80',
      published: true,
      createdAt: '2026-04-10T00:00:00Z',
    },
    {
      id: 'blog-2',
      title: 'The Perfect cPanel Node.js Deployment Secrets',
      slug: 'cpanel-nodejs-deployment-secrets',
      content: 'Node.js is fully compatible with shared hosting today. Utilizing standard setup variables inside your root server file alongside configured .htaccess and Passenger handlers ensures continuous robust uptime without custom containers.',
      excerpt: 'Learn how to easily set up Node.js Passenger and ecosystem config to run SaaS products on cPanel.',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&h=250&q=80',
      published: true,
      createdAt: '2026-05-15T00:00:00Z',
    }
  ];

  const faqs: FaqCMS[] = [
    {
      id: 'faq-1',
      question: 'Will this application run properly on cPanel Shared Hosting?',
      answer: 'Yes! It is compiled into a single clean bundle and configures with Passenger hooks. Included are .htaccess, passenger.js, and ecosystem configurations ensuring absolute plug and play setup without Docker or root server commands.',
    },
    {
      id: 'faq-2',
      question: 'How do Custom Domains configuration works?',
      answer: 'Tenants configure their mapping domain inside their dashboards. Your global web server detects request header hosts (e.g. crm.clientcompany.com) matching mapped tenants automatically, configuring customized logo palettes and staff users.',
    }
  ];

  const testimonials: TestimonialCMS[] = [
    {
      id: 'testi-1',
      name: 'Jessica Vance',
      role: 'Head of Growth',
      company: 'SyncCorp',
      quote: 'Deploying this multi-tenant system on our standard cPanel server was effortless. The visual dashboards keep our multi-country operations clean.',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80',
    },
    {
      id: 'testi-2',
      name: 'Albin Karlson',
      role: 'Founder',
      company: 'Nordic Creative',
      quote: 'Total pipeline clarity. The integrated Invoice builder and automations are lightweight but cover everything standard enterprise systems package.',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&h=100&q=80',
    }
  ];

  return {
    plans,
    tenants,
    users,
    leads,
    contacts,
    tasks,
    invoices,
    expenses,
    products,
    tickets,
    campaigns,
    auditLogs,
    coupons,
    blogs,
    faqs,
    testimonials,
    smtpSettings: {
      host: 'smtp.mailtrap.io',
      port: 2525,
      user: 'smtp_demo_user',
      secure: false
    },
    seoSettings: {
      metaTitle: 'CRM Platform - Ultimate SaaS CRM Solution',
      metaDescription: 'Manage pipelines, invoices, campaigns, employees, and tickets for your business. Perfect for shared, cPanel, and Node.js hosting.',
      googleAnalyticsId: 'G-XXXXXXXXXX'
    }
  };
}

// Low-overhead File IO store with synchronous guards. Yes, standard for this sandboxed environment!
export class DBStore {
  private static data: JSONDatabase | null = null;

  static load(): JSONDatabase {
    if (this.data) return this.data;

    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        const initial = getInitialData();
        fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
        this.data = initial;
      }
    } catch (e) {
      console.error("Database loading exception. Initializing in-memory fallback:", e);
      this.data = getInitialData();
    }

    return this.data!;
  }

  static persist() {
    if (!this.data) return;
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error("Database save failed:", e);
    }
  }

  // General query methods
  static getPlans() { return this.load().plans; }
  static getTenants() { return this.load().tenants; }
  static getUsers() { return this.load().users; }
  static getLeads() { return this.load().leads; }
  static getContacts() { return this.load().contacts; }
  static getTasks() { return this.load().tasks; }
  static getInvoices() { return this.load().invoices; }
  static getExpenses() { return this.load().expenses; }
  static getProducts() { return this.load().products; }
  static getTickets() { return this.load().tickets; }
  static getCampaigns() { return this.load().campaigns; }
  static getAuditLogs() { return this.load().auditLogs; }
  static getCoupons() { return this.load().coupons; }
  static getBlogs() { return this.load().blogs; }
  static getFaqs() { return this.load().faqs; }
  static getTestimonials() { return this.load().testimonials; }
  static getSmtpSettings() { return this.load().smtpSettings || { host: '', port: 587, user: '', secure: false }; }
  static getSeoSettings() { return this.load().seoSettings || { metaTitle: '', metaDescription: '', googleAnalyticsId: '' }; }

  // Admin and management writers
  static updateSmtp(settings: any) {
    const db = this.load();
    db.smtpSettings = settings;
    this.persist();
  }

  static updateSeo(settings: any) {
    const db = this.load();
    db.seoSettings = settings;
    this.persist();
  }

  static saveTenant(tenant: Tenant) {
    const db = this.load();
    const idx = db.tenants.findIndex(t => t.id === tenant.id);
    if (idx >= 0) db.tenants[idx] = tenant;
    else db.tenants.push(tenant);
    this.persist();
  }

  static saveUser(user: User & { passwordHash?: string }) {
    const db = this.load();
    const idx = db.users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      db.users[idx] = { ...db.users[idx], ...user };
    } else {
      db.users.push({
        ...user,
        passwordHash: user.passwordHash || 'password123'
      } as any);
    }
    this.persist();
  }

  static saveLead(lead: CRMLead) {
    const db = this.load();
    const idx = db.leads.findIndex(l => l.id === lead.id);
    if (idx >= 0) db.leads[idx] = lead;
    else db.leads.push(lead);
    this.persist();
  }

  static deleteLead(id: string) {
    const db = this.load();
    db.leads = db.leads.filter(l => l.id !== id);
    this.persist();
  }

  static saveContact(contact: CRMContact) {
    const db = this.load();
    const idx = db.contacts.findIndex(c => c.id === contact.id);
    if (idx >= 0) db.contacts[idx] = contact;
    else db.contacts.push(contact);
    this.persist();
  }

  static saveTask(task: CRMTask) {
    const db = this.load();
    const idx = db.tasks.findIndex(t => t.id === task.id);
    if (idx >= 0) db.tasks[idx] = task;
    else db.tasks.push(task);
    this.persist();
  }

  static saveInvoice(invoice: CRMInvoice) {
    const db = this.load();
    const idx = db.invoices.findIndex(i => i.id === invoice.id);
    if (idx >= 0) db.invoices[idx] = invoice;
    else db.invoices.push(invoice);
    this.persist();
  }

  static saveExpense(expense: CRMExpense) {
    const db = this.load();
    const idx = db.expenses.findIndex(e => e.id === expense.id);
    if (idx >= 0) db.expenses[idx] = expense;
    else db.expenses.push(expense);
    this.persist();
  }

  static saveProduct(product: CRMProduct) {
    const db = this.load();
    const idx = db.products.findIndex(p => p.id === product.id);
    if (idx >= 0) db.products[idx] = product;
    else db.products.push(product);
    this.persist();
  }

  static saveTicket(ticket: SupportTicket) {
    const db = this.load();
    const idx = db.tickets.findIndex(t => t.id === ticket.id);
    if (idx >= 0) db.tickets[idx] = ticket;
    else db.tickets.push(ticket);
    this.persist();
  }

  static saveCampaign(campaign: MarketingCampaign) {
    const db = this.load();
    const idx = db.campaigns.findIndex(c => c.id === campaign.id);
    if (idx >= 0) db.campaigns[idx] = campaign;
    else db.campaigns.push(campaign);
    this.persist();
  }

  static savePlan(plan: SubscriptionPlan) {
    const db = this.load();
    const idx = db.plans.findIndex(p => p.id === plan.id);
    if (idx >= 0) db.plans[idx] = plan;
    else db.plans.push(plan);
    this.persist();
  }

  static saveCoupon(coupon: Coupon) {
    const db = this.load();
    const idx = db.coupons.findIndex(c => c.code === coupon.code);
    if (idx >= 0) db.coupons[idx] = coupon;
    else db.coupons.push(coupon);
    this.persist();
  }

  static saveBlog(blog: BlogCMS) {
    const db = this.load();
    const idx = db.blogs.findIndex(b => b.id === blog.id);
    if (idx >= 0) db.blogs[idx] = blog;
    else db.blogs.push(blog);
    this.persist();
  }

  static addAuditLog(tenantId: string | null, userId: string, userName: string, action: string, details: string, ip: string) {
    const db = this.load();
    const newLog: AuditLog = {
      id: 'log-' + Date.now() + Math.random().toString(36).substr(2, 5),
      tenantId,
      userId,
      userName,
      action,
      details,
      ip: ip || '127.0.0.1',
      createdAt: new Date().toISOString()
    };
    db.auditLogs.unshift(newLog);
    // Keep logs size bounded (e.g. 500 max)
    if (db.auditLogs.length > 500) {
      db.auditLogs = db.auditLogs.slice(0, 500);
    }
    this.persist();
    return newLog;
  }
}
