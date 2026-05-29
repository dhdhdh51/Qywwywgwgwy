/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User, Tenant, SubscriptionPlan, CRMLead, CRMContact, CRMTask, 
  CRMInvoice, CRMExpense, CRMProduct, SupportTicket, MarketingCampaign, 
  AuditLog, Coupon, BlogCMS, FaqCMS, TestimonialCMS 
} from './types';
import LeadKanban from './components/LeadKanban';
import InvoiceBuilder from './components/InvoiceBuilder';
import SuperAdminPanel from './components/SuperAdminPanel';
import { 
  Sparkles, Award, Building, Database, Settings, Sliders, Globe, ShieldAlert,
  HelpCircle, Check, Key, Mail, Terminal, Send, CheckCircle, BarChart2,
  Users, Layers, DollarSign, CheckSquare, FileText, Plus, Trash2, Search,
  Play, Laptop, UserCheck, Shield, ChevronDown, List, BookOpen, Clock,
  Upload, Image, FileUp, Zap, HelpCircle as HelpIcon, MessageSquare, Briefcase,
  Menu, X
} from 'lucide-react';

export default function App() {
  // -----------------------------------------------------
  // EMULATED SANDBOX ROUTER STATES
  // -----------------------------------------------------
  const [currentRole, setCurrentRole] = useState<'VISITOR' | 'SUPER_ADMIN' | 'TENANT_ADMIN_ACME' | 'TENANT_ADMIN_APEX'>('VISITOR');
  const [activeSubdomain, setActiveSubdomain] = useState<string>(''); // For sandbox emulating headers
  const [isTenantSidebarOpen, setIsTenantSidebarOpen] = useState(false);
  const [isSuperAdminSidebarOpen, setIsSuperAdminSidebarOpen] = useState(false);

  // Global Loaded Database Data
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [blogs, setBlogs] = useState<BlogCMS[]>([]);
  const [faqs, setFaqs] = useState<FaqCMS[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialCMS[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [globalStats, setGlobalStats] = useState<any>({
    totalRevenue: 45000,
    totalTenants: 2,
    activeUsers: 4,
    subscriptionRate: 100
  });

  // Current session authenticated details
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Tenant Portal Context and CRM Collections state
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [tasks, setTasks] = useState<CRMTask[]>([]);
  const [invoices, setInvoices] = useState<CRMInvoice[]>([]);
  const [expenses, setExpenses] = useState<CRMExpense[]>([]);
  const [products, setProducts] = useState<CRMProduct[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [tenantStaff, setTenantStaff] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Navigation Inside Tenant CRM Portals
  const [crmActiveTab, setCrmActiveTab] = useState<'dashboard' | 'leads' | 'contacts' | 'tasks' | 'invoices' | 'products' | 'campaigns' | 'tickets' | 'media'>('dashboard');

  // Media Library elements state
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([
    { name: 'Onboarding_Manual_v1.pdf', size: '1.2 MB', mimeType: 'application/pdf', url: '#', uploadedAt: new Date().toISOString() },
    { name: 'acme_marketing_receipt.png', size: '245 KB', mimeType: 'image/png', url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=120&h=120&q=80', uploadedAt: new Date().toISOString() }
  ]);
  const [mediaUploadLoading, setMediaUploadLoading] = useState(false);

  // -----------------------------------------------------
  // QUICK SEED FETCHERS
  // -----------------------------------------------------
  const fetchGlobalData = async () => {
    try {
      const pRes = await fetch('/api/plans');
      setPlans(await pRes.json());

      const tRes = await fetch('/api/tenants');
      setTenants(await tRes.json());

      const bRes = await fetch('/api/blogs');
      setBlogs(await bRes.json());

      const fRes = await fetch('/api/faqs');
      setFaqs(await fRes.json());

      const teRes = await fetch('/api/testimonials');
      setTestimonials(await teRes.json());

      const cRes = await fetch('/api/coupons');
      setCoupons(await cRes.json());

      const sRes = await fetch('/api/stats/global');
      setGlobalStats(await sRes.json());

      const logRes = await fetch('/api/audit-logs');
      setAuditLogs(await logRes.json());
    } catch (err) {
      console.error("Failed to sync global schema", err);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, []);

  // Sync specific CRM collections whenever we change active Tenant Context
  const fetchTenantCRMData = async (sub: string) => {
    try {
      const headers = { 'x-tenant-subdomain': sub };
      
      const tDetails = await fetch(`/api/crm/tenant-details?emulator_subdomain=${sub}`);
      if (!tDetails.ok) return;
      const tenantData: Tenant = await tDetails.json();
      setActiveTenant(tenantData);

      // Collect specific stats
      const lRes = await fetch(`/api/crm/leads?emulator_subdomain=${sub}`, { headers });
      setLeads(await lRes.json());

      const cRes = await fetch(`/api/crm/contacts?emulator_subdomain=${sub}`, { headers });
      setContacts(await cRes.json());

      const tkRes = await fetch(`/api/crm/tasks?emulator_subdomain=${sub}`, { headers });
      setTasks(await tkRes.json());

      const invRes = await fetch(`/api/crm/invoices?emulator_subdomain=${sub}`, { headers });
      setInvoices(await invRes.json());

      const prRes = await fetch(`/api/crm/products?emulator_subdomain=${sub}`, { headers });
      setProducts(await prRes.json());

      const tkTickets = await fetch(`/api/crm/tickets?emulator_subdomain=${sub}`, { headers });
      setTickets(await tkTickets.json());

      const campRes = await fetch(`/api/crm/campaigns?emulator_subdomain=${sub}`, { headers });
      setCampaigns(await campRes.json());

      // Fetch audit logs just for this tenant
      const auditRes = await fetch(`/api/audit-logs?emulator_subdomain=${sub}`, { headers });
      setAuditLogs(await auditRes.json());
    } catch (err) {
      console.error("CRM tenant fetch exception", err);
    }
  };

  // Switch role profiles inside mock bar (Simulates client domain map resolver)
  const handleSandboxRoleSwitch = async (role: typeof currentRole) => {
    setCurrentRole(role);
    setAuthError('');
    if (role === 'VISITOR') {
      setCurrentUser(null);
      setActiveTenant(null);
      setActiveSubdomain('');
    } else if (role === 'SUPER_ADMIN') {
      // Simulate Admin session config
      setCurrentUser({
        id: 'user-superadmin',
        tenantId: null,
        email: 'admin@crm.com',
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&h=120&q=80',
        createdAt: new Date().toISOString()
      });
      setActiveTenant(null);
      setActiveSubdomain('');
    } else if (role === 'TENANT_ADMIN_ACME') {
      setCurrentUser({
        id: 'user-acme-admin',
        tenantId: 'tenant-acme',
        email: 'tenant@acme.com',
        name: 'Sarah Jenkins',
        role: 'TENANT_ADMIN',
        status: 'ACTIVE',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
        createdAt: new Date().toISOString()
      });
      setActiveSubdomain('acme');
      fetchTenantCRMData('acme');
    } else if (role === 'TENANT_ADMIN_APEX') {
      setCurrentUser({
        id: 'user-apex-admin',
        tenantId: 'tenant-apex',
        email: 'apex@crm.com',
        name: 'John Apex',
        role: 'TENANT_ADMIN',
        status: 'ACTIVE',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
        createdAt: new Date().toISOString()
      });
      setActiveSubdomain('apex');
      fetchTenantCRMData('apex');
    }
  };

  // Explicit Form Sign-in logic
  const handleExplicitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPass })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication Failed');
      }

      setCurrentUser(data.user);
      setAuthEmail('');
      setAuthPass('');

      // Auto resolve active workspace subdomain context
      if (data.user.role === 'SUPER_ADMIN') {
        setCurrentRole('SUPER_ADMIN');
        setActiveSubdomain('');
      } else {
        // Resolve tenant domain mapping
        const tResult = tenants.find(t => t.id === data.user.tenantId);
        if (tResult) {
          if (tResult.subdomain === 'acme') setCurrentRole('TENANT_ADMIN_ACME');
          else if (tResult.subdomain === 'apex') setCurrentRole('TENANT_ADMIN_APEX');
          
          setActiveSubdomain(tResult.subdomain);
          fetchTenantCRMData(tResult.subdomain);
        }
      }
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // -----------------------------------------------------
  // CRM CLIENT MUTATIONS (Leads, Contacts, Tasks, Invoices, Campaigns)
  // -----------------------------------------------------
  const handleSaveLead = async (leadData: Partial<CRMLead>) => {
    if (!activeSubdomain) return;
    const isEdit = !!leadData.id;
    const url = isEdit ? `/api/crm/leads/${leadData.id}?emulator_subdomain=${activeSubdomain}` : `/api/crm/leads?emulator_subdomain=${activeSubdomain}`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-subdomain': activeSubdomain
        },
        body: JSON.stringify(leadData)
      });
      if (res.ok) {
        fetchTenantCRMData(activeSubdomain);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      const res = await fetch(`/api/crm/leads/${id}?emulator_subdomain=${activeSubdomain}`, {
        method: 'DELETE',
        headers: {
          'x-tenant-subdomain': activeSubdomain
        }
      });
      if (res.ok) {
        fetchTenantCRMData(activeSubdomain);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveInvoice = async (invoiceData: Partial<CRMInvoice>) => {
    if (!activeSubdomain) return;
    try {
      const res = await fetch(`/api/crm/invoices?emulator_subdomain=${activeSubdomain}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-subdomain': activeSubdomain
        },
        body: JSON.stringify(invoiceData)
      });
      if (res.ok) {
        fetchTenantCRMData(activeSubdomain);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const frm = e.currentTarget as HTMLFormElement;
    const formData = new FormData(frm);
    const dataObj = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      company: formData.get('company') as string,
      position: formData.get('position') as string,
    };

    if (!dataObj.name) return;

    try {
      const res = await fetch(`/api/crm/contacts?emulator_subdomain=${activeSubdomain}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-subdomain': activeSubdomain
        },
        body: JSON.stringify(dataObj)
      });
      if (res.ok) {
        fetchTenantCRMData(activeSubdomain);
        frm.reset();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const frm = e.currentTarget as HTMLFormElement;
    const formData = new FormData(frm);
    const dataObj = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      priority: formData.get('priority') as string,
      dueDate: formData.get('dueDate') as string,
    };

    if (!dataObj.title) return;

    try {
      const res = await fetch(`/api/crm/tasks?emulator_subdomain=${activeSubdomain}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-subdomain': activeSubdomain
        },
        body: JSON.stringify(dataObj)
      });
      if (res.ok) {
        fetchTenantCRMData(activeSubdomain);
        frm.reset();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'TODO' ? 'IN_PROGRESS' : currentStatus === 'IN_PROGRESS' ? 'DONE' : 'TODO';
    try {
      const res = await fetch(`/api/crm/tasks/${taskId}?emulator_subdomain=${activeSubdomain}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-subdomain': activeSubdomain
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        fetchTenantCRMData(activeSubdomain);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const frm = e.currentTarget as HTMLFormElement;
    const formData = new FormData(frm);
    const dataObj = {
      name: formData.get('name') as string,
      sku: formData.get('sku') as string,
      price: Number(formData.get('price')) || 0,
      stock: Number(formData.get('stock')) || 0,
      description: formData.get('description') as string
    };

    if (!dataObj.name) return;

    try {
      const res = await fetch(`/api/crm/products?emulator_subdomain=${activeSubdomain}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-subdomain': activeSubdomain
        },
        body: JSON.stringify(dataObj)
      });
      if (res.ok) {
        fetchTenantCRMData(activeSubdomain);
        frm.reset();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const frm = e.currentTarget as HTMLFormElement;
    const formData = new FormData(frm);
    const dataObj = {
      name: formData.get('name') as string,
      subject: formData.get('subject') as string,
      body: formData.get('body') as string,
      type: formData.get('type') as string
    };

    if (!dataObj.name) return;

    try {
      const res = await fetch(`/api/crm/campaigns?emulator_subdomain=${activeSubdomain}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-subdomain': activeSubdomain
        },
        body: JSON.stringify(dataObj)
      });
      if (res.ok) {
        fetchTenantCRMData(activeSubdomain);
        frm.reset();
        alert('Active Campaign blasted and logged into server analytics!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const frm = e.currentTarget as HTMLFormElement;
    const formData = new FormData(frm);
    const dataObj = {
      subject: formData.get('subject') as string,
      description: formData.get('description') as string,
      priority: formData.get('priority') as string,
      contactEmail: formData.get('contactEmail') as string
    };

    if (!dataObj.subject) return;

    try {
      const res = await fetch(`/api/crm/tickets?emulator_subdomain=${activeSubdomain}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-subdomain': activeSubdomain
        },
        body: JSON.stringify(dataObj)
      });
      if (res.ok) {
        fetchTenantCRMData(activeSubdomain);
        frm.reset();
        alert('Support Ticket lodged with IT team');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Media Library drag & drop file upload simulator API
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setMediaUploadLoading(true);

    try {
      const res = await fetch('/api/crm/media/upload', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        // Overwrite standard list inside memory
        setUploadedFiles([
          { 
            name: files[0].name, 
            size: `${Math.round(files[0].size / 1024)} KB`, 
            mimeType: files[0].type || 'image/png', 
            url: data.file?.url, 
            uploadedAt: new Date().toISOString() 
          },
          ...uploadedFiles
        ]);
        alert('Document securely compressed & cataloged inside cPanel media folder.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMediaUploadLoading(false);
    }
  };


  // -----------------------------------------------------
  // SUPER ADMIN MUTATIONS CALLS
  // -----------------------------------------------------
  const handleAddPlan = async (plan: Partial<SubscriptionPlan>) => {
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan)
      });
      if (res.ok) {
        fetchGlobalData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTenant = async (tenantDetails: any) => {
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenantDetails)
      });
      const data = await res.json();
      if (res.ok) {
        fetchGlobalData();
        return data;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const handleAddCoupon = async (coupon: Partial<Coupon>) => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coupon)
      });
      if (res.ok) {
        fetchGlobalData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800" id="main_saas_crm_app">
      
      {/* ===================================================
          AISTUDIO PREVIEW ENVIRONMENT EMULATOR BAR
          This bar sits at the absolute top of the app to allow
          the visual sandbox evaluator to test true client-subdomain
          separation instantly!
         =================================================== */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white p-3 px-4 md:px-6 text-xs flex flex-col sm:flex-row justify-between items-center gap-3 border-b border-indigo-200/20 z-40 shadow-md">
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <span className="bg-indigo-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider animate-pulse/20">
            Sandbox Simulator
          </span>
          <div className="hidden sm:flex items-center gap-1.5 font-mono text-indigo-300">
            <Globe size={13} />
            <span className="text-white font-bold underline bg-slate-800 px-2 py-0.5 rounded text-[11px]">
              {currentRole === 'VISITOR' ? 'mycrm.com' : currentRole === 'SUPER_ADMIN' ? 'admin.mycrm.com' : `${activeSubdomain}.mycrm.com`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => handleSandboxRoleSwitch('VISITOR')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 text-[11px] whitespace-nowrap ${
              currentRole === 'VISITOR' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Laptop size={12} /> Landing Site
          </button>
          
          <button
            onClick={() => handleSandboxRoleSwitch('SUPER_ADMIN')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 text-[11px] whitespace-nowrap ${
              currentRole === 'SUPER_ADMIN' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Shield size={12} /> Master Admin
          </button>
          
          <button
            onClick={() => handleSandboxRoleSwitch('TENANT_ADMIN_ACME')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 text-[11px] whitespace-nowrap ${
              currentRole === 'TENANT_ADMIN_ACME' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-teal-500" /> Acme Panel
          </button>

          <button
            onClick={() => handleSandboxRoleSwitch('TENANT_ADMIN_APEX')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 text-[11px] whitespace-nowrap ${
              currentRole === 'TENANT_ADMIN_APEX' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Apex Panel
          </button>
        </div>
      </div>

      {/* ===================================================
          ROUTING: MOCK LANDING MARKETING FRONT
         =================================================== */}
      {currentRole === 'VISITOR' && (
        <div className="flex-1 flex flex-col" id="crm_landing_site">
          {/* Header */}
          <header className="bg-white border-b sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-xl">Ω</div>
                <span className="text-xl font-black text-slate-900 tracking-tight">OmniCRM</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-extrabold px-2 py-0.5 rounded">Multi-Tenant SaaS</span>
              </div>
              <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-600">
                <a href="#features" className="hover:text-indigo-600">Features</a>
                <a href="#pricing" className="hover:text-indigo-600">Pricing Tiers</a>
                <a href="#blog" className="hover:text-indigo-600">SaaS Digest</a>
                <a href="#faq" className="hover:text-indigo-600">System FAQ</a>
              </nav>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleSandboxRoleSwitch('SUPER_ADMIN')}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-4 py-2.5 rounded-xl transition"
                >
                  Live Sandbox Login
                </button>
              </div>
            </div>
          </header>

          {/* Hero Banner Zone */}
          <section className="bg-gradient-to-b from-slate-900 to-indigo-950 text-white py-20 px-6 text-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="max-w-4xl mx-auto space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 font-bold text-xs py-1.5 px-4 rounded-full border border-indigo-400/20">
                <Sparkles size={13} className="fill-indigo-300" />
                Dual-optimized specifically for cPanel Shared Hosting & Node Passenger
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
                Instantly Spawn Custom <br />
                <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">Multi-Tenant CRM Portals</span>
              </h1>
              
              <p className="text-slate-300 text-md sm:text-lg max-w-2xl mx-auto leading-relaxed">
                Connect your domains or subdomains. Our plug-and-play architecture configures client logos, localized assets, secure email relays, and AI insights scoring without root access.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button 
                  onClick={() => handleSandboxRoleSwitch('TENANT_ADMIN_ACME')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-8 py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50"
                >
                  <Play size={16} fill="white" /> Launch Acme Tenant Demo
                </button>
                <a 
                  href="#pricing"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-extrabold px-8 py-4 rounded-2xl"
                >
                  View Subscription Options
                </a>
              </div>
            </div>
          </section>

          {/* Core visual badges */}
          <section id="features" className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center space-y-2 mb-12">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Granular CRM Capability Matrix</h2>
              <p className="text-slate-500">Every tenant subscription is fully loaded with native high performance modules.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: 'Subdomain Isolation', desc: 'Secure logical boundaries. Mapped custom domains automatically configure isolated tenant parameters.', icon: Globe },
                { title: 'Smart Kanban Engine', desc: 'Gemini AI integration scores lead priority, analyzes deals size, and drafts bullet suggested callback drafts.', icon: Sparkles },
                { title: 'Itemized Billing Desk', desc: 'Generate visual PDF invoices with automatic arithmetic rows sum math and instant print features.', icon: FileText },
                { title: 'SMTP Mail Relays', desc: 'SaaS super administrators configure global SMTP mailers; tenants map their dedicated custom relays.', icon: Mail },
              ].map((f, idx) => {
                const Icon = f.icon;
                return (
                  <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base">{f.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* PRICING PLANS */}
          <section id="pricing" className="bg-slate-900 text-white py-20 px-6">
            <div className="max-w-7xl mx-auto space-y-12">
              <div className="text-center space-y-3">
                <span className="text-emerald-400 font-mono text-[11px] uppercase tracking-widest font-black">Flexible Tier Matrix</span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">SaaS Subscriptions Plans</h2>
                <p className="text-slate-400 max-w-md mx-auto text-sm">Deploy instantly. Change or cancel plans anytime with immediate localized configurations updating.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((p) => (
                  <div key={p.id} className="bg-slate-950 border border-slate-800 rounded-3xl p-8 space-y-6 flex flex-col justify-between relative">
                    <div className="space-y-4">
                      {p.name.includes('Growth') && (
                        <div className="absolute -top-3.5 left-6 bg-indigo-600 text-white font-black text-[10px] uppercase py-1 px-3.5 rounded-full tracking-wider border border-indigo-400/30">
                          Most Recommended
                        </div>
                      )}
                      <div>
                        <h3 className="font-black text-xl text-slate-200">{p.name}</h3>
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-3xl font-black text-white">${p.price}</span>
                          <span className="text-slate-500 text-xs">/ per month</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2.5 pt-4 text-xs text-slate-400 border-t border-slate-800">
                        {p.features?.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Check size={14} className="text-green-500" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 pt-6">
                      <button
                        onClick={() => {
                          alert(`Subscribing to ${p.name}! Select Acme or Apex portal above to emulates tenant workspace directly.`);
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 rounded-xl text-xs transition"
                      >
                        Subscribe Now
                      </button>
                      <div className="flex justify-center items-center gap-2 text-[10px] text-slate-500">
                        <span>Stripe</span> • <span>PayPal</span> • <span>Razorpay Secure</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ SECTION */}
          <section id="faq" className="max-w-5xl mx-auto px-6 py-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Frequently Asked Queries</h2>
              <p className="text-slate-500 mt-2">Everything you need to know about cPanel Multi-tenant installations.</p>
            </div>

            <div className="space-y-4">
              {faqs.map((f) => (
                <div key={f.id} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
                  <h4 className="font-extrabold text-slate-900 text-sm md:text-base flex items-center gap-2">
                    <HelpIcon size={16} className="text-indigo-600" /> {f.question}
                  </h4>
                  <p className="text-slate-600 text-xs md:text-sm pl-6 leading-relaxed">
                    {f.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* BLOG ARTICLE CMS FEED */}
          <section id="blog" className="bg-slate-50 border-t py-20 px-6">
            <div className="max-w-7xl mx-auto space-y-12">
              <div className="text-center space-y-2">
                <span className="text-indigo-600 font-mono font-black text-[11px] uppercase tracking-wider">Expert Insights</span>
                <h2 className="text-3xl font-black tracking-tight text-slate-900">Multi-tenant Saas Digests</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {blogs.map((b) => (
                  <div key={b.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm flex flex-col md:flex-row">
                    <img 
                      src={b.imageUrl} 
                      alt={b.title} 
                      className="w-full md:w-48 h-48 object-cover"
                    />
                    <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 font-black px-2 py-0.5 rounded-full uppercase">
                          Featured Deployment
                        </span>
                        <h3 className="font-black text-slate-900 text-base leading-snug hover:text-indigo-600 cursor-pointer">
                          {b.title}
                        </h3>
                        <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                          {b.excerpt}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold border-t pt-2.5">
                        <span>Read Time: 4 min</span>
                        <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-slate-950 text-slate-400 py-12 px-6 border-t border-slate-800 text-center text-xs">
            <div className="max-w-7xl mx-auto space-y-4">
              <p className="text-slate-300 font-bold text-sm">OmniCRM SaaS Solutions Platform</p>
              <p>Certified fully compatible with Apache environment, PM2 startup, CloudLinux, Passenger.js and .htaccess servers.</p>
              <div className="flex justify-center gap-6 text-slate-500">
                <span>Privacy Regulations</span> • <span>Terms of agreement</span> • <span>cPanel deployment manuals</span>
              </div>
            </div>
          </footer>
        </div>
      )}


      {/* ===================================================
          ROUTING: SUPER ADMIN MASTER DESK
         =================================================== */}
      {currentRole === 'SUPER_ADMIN' && currentUser && (
        <div className="flex-1 flex flex-col md:flex-row relative" id="super_admin_pane_view">
          {/* Mobile Header Bar */}
          <div className="md:hidden bg-slate-900 text-white flex justify-between items-center p-4 border-b border-slate-800 z-30 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center font-black">Ω</div>
              <span className="font-extrabold text-sm">CRM Master Console</span>
            </div>
            <button 
              onClick={() => setIsSuperAdminSidebarOpen(!isSuperAdminSidebarOpen)}
              className="p-1 hover:bg-slate-800 rounded transition"
            >
              <Menu size={20} />
            </button>
          </div>

          {/* Drawer Backdrop for Mobile */}
          {isSuperAdminSidebarOpen && (
            <div 
              className="md:hidden fixed inset-0 bg-slate-950/60 z-30 animate-fade-in" 
              onClick={() => setIsSuperAdminSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside className={`
            w-64 bg-slate-900 text-white flex flex-col p-6 space-y-6 z-40 md:z-10 shadow-lg select-none
            fixed md:static inset-y-0 left-0 transform ${isSuperAdminSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
            transition-transform duration-300 ease-in-out pt-16 md:pt-6
          `}>
            {/* Close button inside sidebar for mobile */}
            <div className="md:hidden absolute top-4 right-4">
              <button onClick={() => setIsSuperAdminSidebarOpen(false)} className="text-slate-400 hover:text-white transition">
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-black">Ω</div>
              <span className="text-lg font-black tracking-tight">CRM Master Console</span>
            </div>

            <div className="p-4 bg-slate-800 rounded-2xl space-y-1 text-xs">
              <p className="text-slate-400">Database Engine Host</p>
              <p className="font-mono text-[10px] text-indigo-300">SQLite/JSON Fallback</p>
              <p className="text-slate-400 mt-2">Active License Server</p>
              <p className="text-green-500 font-bold">● Operations normal</p>
            </div>

            <div className="flex-1 space-y-1">
              <button className="w-full flex items-center justify-start gap-3 py-3 px-4 bg-indigo-600 text-white rounded-xl text-xs font-bold font-black uppercase tracking-wider">
                <Database size={15} /> System Overview
              </button>
              <button 
                onClick={() => {
                  handleSandboxRoleSwitch('VISITOR');
                  setIsSuperAdminSidebarOpen(false);
                }}
                className="w-full flex items-center justify-start gap-3 py-3 px-4 text-slate-400 hover:text-white rounded-xl text-xs font-bold text-left"
              >
                <Laptop size={15} /> Return to Landing Page
              </button>
            </div>

            <div className="border-t pt-4 text-xs space-y-3">
              <div className="flex items-center gap-2">
                <img src={currentUser.avatarUrl || ''} className="w-8 h-8 rounded-full border border-slate-700" />
                <div>
                  <p className="font-bold">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400">Super Administrator</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main super admin panels contents */}
          <main className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8 overflow-y-auto w-full">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none">Super Admin Master Control</h1>
                <p className="text-slate-500 text-xs mt-1.5">Configure pricing, monitor domains, and deploy new CRM tenant instances.</p>
              </div>
              <div className="text-xs bg-indigo-50 text-indigo-800 rounded-full font-bold px-4 py-1.5 border border-indigo-200 w-fit">
                System Time UTC: 2026-05-29
              </div>
            </div>

            {/* Admin visual dashboard summaries */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-1 shadow-sm">
                <span className="text-xs text-slate-400 font-bold uppercase whitespace-nowrap">Monthly SaaS Revenues</span>
                <p className="text-2xl md:text-3xl font-black text-slate-900">${globalStats.totalRevenue?.toLocaleString()}</p>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-black">+14% Growth</span>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-1 shadow-sm">
                <span className="text-xs text-slate-400 font-bold uppercase whitespace-nowrap">Active Mapped Tenants</span>
                <p className="text-2xl md:text-3xl font-black text-slate-900">{globalStats.totalTenants ?? 0}</p>
                <span className="text-[10px] text-slate-400">100% active SSLs validated</span>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-1 shadow-sm">
                <span className="text-xs text-slate-400 font-bold uppercase whitespace-nowrap">Active Users Seats</span>
                <p className="text-2xl md:text-3xl font-black text-slate-900">{globalStats.activeUsers ?? 0}</p>
                <span className="text-[10px] text-indigo-600">Across subdomains</span>
              </div>
              <div className="bg-indigo-900 text-white p-6 rounded-3xl space-y-1 shadow">
                <span className="text-xs text-indigo-300 font-bold uppercase whitespace-nowrap">System Web Server Uptime</span>
                <p className="text-2xl md:text-3xl font-black">99.98%</p>
                <span className="text-[10px] text-indigo-200">No Docker/Redis checks required</span>
              </div>
            </div>

            {/* Main administrative matrix component */}
            <SuperAdminPanel 
              tenants={tenants}
              plans={plans}
              auditLogs={auditLogs}
              coupons={coupons}
              onAddPlan={handleAddPlan}
              onAddTenant={handleAddTenant}
              onAddCoupon={handleAddCoupon}
            />
          </main>
        </div>
      )}


      {/* ===================================================
          ROUTING: TENANT CRM USER INTERFACE
         =================================================== */}
      {(currentRole === 'TENANT_ADMIN_ACME' || currentRole === 'TENANT_ADMIN_APEX') && activeTenant && (
        <div className="flex-1 flex flex-col md:flex-row relative" id="tenant_crm_interface_view">
          
          {/* Mobile Header Bar */}
          <div className="md:hidden bg-slate-900 text-white flex justify-between items-center p-4 border-b border-slate-800 z-35 shadow-sm">
            <div className="flex items-center gap-2">
              {activeTenant.logoUrl ? (
                <img src={activeTenant.logoUrl} className="w-8 h-8 rounded object-cover" />
              ) : (
                <div className="w-8 h-8 bg-indigo-600 rounded font-bold flex items-center justify-center text-white text-xs">
                  {activeTenant.name[0]}
                </div>
              )}
              <span className="font-extrabold text-sm">{activeTenant.name} Panel</span>
            </div>
            <button 
              onClick={() => setIsTenantSidebarOpen(!isTenantSidebarOpen)}
              className="p-1 hover:bg-slate-800 rounded transition"
            >
              <Menu size={20} />
            </button>
          </div>

          {/* Drawer Backdrop for Mobile */}
          {isTenantSidebarOpen && (
            <div 
              className="md:hidden fixed inset-0 bg-slate-950/60 z-30 animate-fade-in" 
              onClick={() => setIsTenantSidebarOpen(false)}
            />
          )}

          {/* Main workspace Sidebar navigation */}
          <aside className={`
            w-64 bg-slate-900 text-slate-200 flex flex-col p-6 z-40 md:z-10 shadow-lg select-none
            fixed md:static inset-y-0 left-0 transform ${isTenantSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
            transition-transform duration-300 ease-in-out pt-16 md:pt-6
          `}>
            {/* Close button inside sidebar for mobile */}
            <div className="md:hidden absolute top-4 right-4">
              <button onClick={() => setIsTenantSidebarOpen(false)} className="text-slate-400 hover:text-white transition">
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
              {activeTenant.logoUrl ? (
                <img src={activeTenant.logoUrl} className="w-10 h-10 rounded-xl object-cover" />
              ) : (
                <div className="w-10 h-10 bg-indigo-600 rounded-xl font-bold flex items-center justify-center text-white">
                  {activeTenant.name[0]}
                </div>
              )}
              <div>
                <p className="font-extrabold text-white text-sm truncate max-w-[130px]">{activeTenant.name}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">{activeTenant.settings?.businessType || 'CRM Suite'}</p>
              </div>
            </div>

            {/* Custom tenant branding visual indicators */}
            <div className="p-3 bg-slate-800/40 rounded-xl mt-4 border border-slate-800 text-[10px] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Subscription Package:</span>
                <span className="font-bold text-white uppercase">{activeTenant.subscriptionPlanId?.replace('plan-', '')}</span>
              </div>
              <p className="text-[9px] text-indigo-300 text-right">Expires: {new Date(activeTenant.subscriptionExpiresAt).toLocaleDateString()}</p>
            </div>

            {/* Navigation links stack */}
            <nav className="flex-1 space-y-1 pt-6 overflow-y-auto">
              {[
                { id: 'dashboard', label: 'Company Overview', icon: Laptop },
                { id: 'leads', label: 'Leads Pipeline & AI', icon: Sparkles },
                { id: 'contacts', label: 'Client directory', icon: Users },
                { id: 'tasks', label: 'Our checklist Tasks', icon: CheckSquare },
                { id: 'invoices', label: 'Invoice desk Creator', icon: FileText },
                { id: 'products', label: 'Product Catalog', icon: Briefcase },
                { id: 'campaigns', label: 'Campaign blasting', icon: Send },
                { id: 'tickets', label: 'Helpdesk Tickets', icon: HelpCircle },
                { id: 'media', label: 'File Upload & Media', icon: Upload }
              ].map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      setCrmActiveTab(link.id as any);
                      setIsTenantSidebarOpen(false); // Auto close sidebar on mobile
                    }}
                    className={`w-full flex items-center gap-3 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-left transition ${
                      crmActiveTab === link.id ? 'bg-indigo-600 text-white font-extrabold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={14} />
                    {link.label}
                  </button>
                );
              })}
            </nav>

            {/* Session profile avatar */}
            <div className="border-t border-slate-800 pt-4 text-xs space-y-3">
              <div className="flex items-center gap-2">
                <img 
                  src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&h=80&q=80'} 
                  className="w-8 h-8 rounded-full border border-slate-705" 
                />
                <div>
                  <p className="font-extrabold text-white text-xs">{currentUser?.name}</p>
                  <p className="text-[9px] text-slate-500 uppercase font-bold">{currentUser?.role}</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main scroll workspace */}
          <main className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8 overflow-y-auto w-full">
            {/* Context Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white p-5 rounded-3xl border border-slate-200 gap-4">
              <div className="flex items-center gap-4">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: activeTenant.primaryColor }} 
                  title="Tenant Brand Color"
                />
                <div>
                  <h1 className="text-lg md:text-xl font-extrabold text-slate-900">{activeTenant.name} Command Panel</h1>
                  <p className="text-xs text-slate-500">MAPPED SUBDOMAIN ENDPOINT: <span className="font-bold underline">{activeTenant.subdomain}.mycrm.com</span></p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs">
                {activeTenant.customDomain && (
                  <span className="bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200">
                    Mapped custom domain: {activeTenant.customDomain}
                  </span>
                )}
                <span className="text-slate-400">Session Status: <span className="text-emerald-600 font-bold">● Active Online</span></span>
              </div>
            </div>

            {/* CRM DASHBOARD CONTAINER */}
            {crmActiveTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats Widgets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-1 shadow-sm">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active CRM Leads</span>
                    <p className="text-3xl font-black text-slate-900">{leads.length}</p>
                    <div className="text-[10px] text-indigo-600 font-bold">Total target database list</div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-1 shadow-sm">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Contacts cataloged</span>
                    <p className="text-3xl font-black text-slate-900">{contacts.length}</p>
                    <div className="text-[10px] text-slate-500 font-bold">Validated accounts</div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-1 shadow-sm">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Completed Invoices</span>
                    <p className="text-3xl font-black text-emerald-600">${invoices.reduce((acc, i) => acc + i.total, 0).toLocaleString()}</p>
                    <div className="text-[10px] text-slate-500 font-medium">{invoices.filter(i => i.status === 'PAID').length} paid ledger items</div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-1 shadow-sm">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Helpdesk Tickets</span>
                    <p className="text-3xl font-black text-rose-600">{tickets.filter(t => t.status === 'OPEN').length}</p>
                    <p className="text-[10px] text-slate-500">Awaiting technical team</p>
                  </div>
                </div>

                {/* Dashboard layout widgets: Leads summaries, checkmarks lists */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Lead funnel status overview */}
                  <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-sm md:text-base border-b pb-2">Recent Prospect Register Intake</h3>
                    <div className="space-y-3">
                      {leads.slice(0, 3).map(lead => (
                        <div key={lead.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border">
                          <div>
                            <p className="font-extrabold text-slate-800 text-xs">{lead.name}</p>
                            <p className="text-[10px] text-slate-400">{lead.company || 'Direct Contact'}</p>
                          </div>
                          <div className="flex gap-4 items-center">
                            <span className="text-xs font-black text-slate-900">${(lead.value || 0).toLocaleString()}</span>
                            <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                              {lead.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resource consumption quota monitor */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-sm border-b pb-2 uppercase tracking-wide text-slate-400">License Storage space Quota</h3>
                    
                    <div className="space-y-4 pt-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-600">
                          <span>Local public_html media logs</span>
                          <span>14.5 MB / 500 MB</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full w-[3%]" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-600">
                          <span>Permitted CRM staff accounts</span>
                          <span>3 seats used / 5 seats max</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full w-[60%]" />
                        </div>
                      </div>

                      <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-800 text-[11px] rounded-xl leading-relaxed">
                        ★ Need more space? Expand to Growth plan directly on landing pricing panel to unlock custom certificates, workflows and unlimited users.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CRM LEADS KANBAN VIEWS */}
            {crmActiveTab === 'leads' && (
              <LeadKanban 
                leads={leads}
                staff={tenantStaff}
                onSaveLead={handleSaveLead}
                onDeleteLead={handleDeleteLead}
              />
            )}

            {/* CRM CONTACT CLIENT DIRECTORY */}
            {crmActiveTab === 'contacts' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Accounts Contacts Directory</h2>
                    <p className="text-slate-500 text-sm text-[11px]">Keep direct business card listings of verified partners and leads contacts.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Create visual contact form */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 h-fit space-y-4">
                    <h3 className="font-extrabold text-slate-800 text-sm border-b pb-2 uppercase tracking-wider text-slate-400">Add client contact card</h3>
                    <form onSubmit={handleCreateContactSubmit} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Company Staff Member Full Name *</label>
                        <input
                          type="text" required name="name"
                          className="w-full bg-slate-50 border rounded-xl py-2 px-3"
                          placeholder="Gregory Mills"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Position / Role</label>
                        <input
                          type="text" name="position"
                          className="w-full bg-slate-50 border rounded-xl py-2 px-3"
                          placeholder="VP Commerce"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Email Address</label>
                        <input
                          type="email" name="email"
                          className="w-full bg-slate-50 border rounded-xl py-2 px-3"
                          placeholder="greg@brand.fr"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Office Telephone Phone</label>
                        <input
                          type="text" name="phone"
                          className="w-full bg-slate-50 border rounded-xl py-2 px-3"
                          placeholder="+33 6 55 91 21"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Corporate Company</label>
                        <input
                          type="text" name="company"
                          className="w-full bg-slate-50 border rounded-xl py-2 px-3"
                          placeholder="Brand Retail Corp"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs"
                      >
                        Pin Contact Card
                      </button>
                    </form>
                  </div>

                  {/* List contacts card layout */}
                  <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 overflow-hidden text-xs">
                    <div className="flex justify-between items-center p-4 bg-slate-50 border-b">
                      <span className="font-extrabold text-slate-500 uppercase">Directory Database Items ({contacts.length})</span>
                    </div>

                    <div className="overflow-x-auto min-h-[300px]">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-100 text-[10px] uppercase font-bold text-slate-400">
                            <th className="px-4 py-2">Full Name</th>
                            <th className="px-4 py-2">Coordinates Contact</th>
                            <th className="px-4 py-2">Company Brand</th>
                            <th className="px-4 py-2">Target Position</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contacts.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="p-12 text-center text-slate-400 font-medium">No contact cards assigned yet. Fill out the creation form.</td>
                            </tr>
                          ) : (
                            contacts.map(c => (
                              <tr key={c.id} className="border-b">
                                <td className="px-4 py-3 font-extrabold text-slate-800">{c.name}</td>
                                <td className="px-4 py-3">
                                  <p className="font-bold text-slate-600">{c.email}</p>
                                  <p className="text-slate-400 text-[10px]">{c.phone}</p>
                                </td>
                                <td className="px-4 py-3 font-semibold text-slate-800">{c.company}</td>
                                <td className="px-4 py-3">
                                  <span className="bg-slate-100 text-slate-700 font-bold py-1 px-2.5 rounded">
                                    {c.position || 'Standard associate'}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TEAM CHECKLIST TASKS */}
            {crmActiveTab === 'tasks' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Workflow Checklist Tasks</h2>
                  <p className="text-slate-500 text-sm">Organize client targets and technical tasks mapped daily.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Create screen */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 text-xs h-fit space-y-4">
                    <h3 className="font-extrabold text-slate-850 uppercase tracking-widest text-[11px] text-slate-400 border-b pb-2">Map task target</h3>
                    <form onSubmit={handleCreateTaskSubmit} className="space-y-3">
                      <div>
                        <label className="block font-bold text-slate-500 mb-1">Task Title *</label>
                        <input
                          type="text" required name="title"
                          placeholder="Send customization price guide"
                          className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-500 mb-1">Brief Description</label>
                        <textarea
                          rows={2} name="description"
                          placeholder="Call dev lead to evaluate options..."
                          className="w-full bg-slate-50 border rounded-xl p-2 text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-200 mb-1">Priority</label>
                          <select name="priority" className="w-full bg-slate-50 border rounded-xl py-2 text-xs">
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-200 mb-1">Due Date</label>
                          <input
                            type="date" name="dueDate"
                            className="w-full bg-slate-50 border rounded-xl py-2 px-2 text-xs"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs"
                      >
                        Deploy Task
                      </button>
                    </form>
                  </div>

                  {/* Tasks List */}
                  <div className="lg:col-span-2 space-y-3">
                    {tasks.length === 0 ? (
                      <div className="bg-white p-12 text-center text-slate-400 rounded-3xl border">No active system tasks currently scheduled. Add yours using the panel sidebar form.</div>
                    ) : (
                      tasks.map(task => (
                        <div key={task.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center group">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {task.status === 'DONE' ? (
                                <button 
                                  onClick={() => handleUpdateTaskStatus(task.id, task.status)}
                                  className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold"
                                >
                                  ✓
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleUpdateTaskStatus(task.id, task.status)}
                                  className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-indigo-500"
                                />
                              )}
                              <span className={`font-extrabold text-sm ${task.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                {task.title}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 pl-7">{task.description}</p>
                          </div>

                          <div className="flex gap-3 items-center">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                              task.priority === 'HIGH' ? 'bg-red-100 text-red-800' : task.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {task.priority}
                            </span>
                            <span className="text-xs text-slate-400">{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* IMAGES AND MEDIA ARCHIVE UPLOAD DRAWER */}
            {crmActiveTab === 'media' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Company Public Media Assets</h2>
                  <p className="text-slate-500 text-sm">Secure local shared-hosting compatible directory upload. Mapped to /public/uploads/.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* File Upload drag card */}
                  <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-8 flex flex-col items-center justify-center text-center space-y-4 hover:border-indigo-500 transition cursor-pointer relative">
                    <input 
                      type="file" 
                      onChange={handleFileUpload} 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                      <Upload size={28} />
                    </div>
                    <div>
                      <p className="font-extrabold text-sm text-slate-800">Select business receipts, contracts, or screenshots</p>
                      <p className="text-xs text-slate-400 mt-1">Accepts PNG, JPG, PDF up to 10MB</p>
                    </div>
                    {mediaUploadLoading && (
                      <p className="text-xs text-indigo-600 animate-pulse font-bold">Compressing & loading files details...</p>
                    )}
                  </div>

                  {/* List Uploaded mock directory assets */}
                  <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 overflow-hidden text-xs">
                    <div className="px-5 py-4 border-b bg-slate-50">
                      <span className="font-extrabold text-slate-500 uppercase tracking-widest">Saved Attachments list</span>
                    </div>

                    <div className="p-4 space-y-3">
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                              {file.mimeType.includes('image') ? <Image size={18} /> : <FileUp size={18} />}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-800 text-xs">{file.name}</p>
                              <p className="text-[10px] text-slate-400">{file.size} • Compressed png/pdf storage</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-400 font-semibold">{new Date(file.uploadedAt).toLocaleDateString()}</span>
                            <a 
                              href={file.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="bg-white border text-slate-700 px-3 py-1 bg-white hover:bg-slate-100 rounded-lg text-[10px] font-bold"
                            >
                              Explore Asset
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CRM CUSTOMER INVOICES MODULE */}
            {crmActiveTab === 'invoices' && (
              <InvoiceBuilder 
                invoices={invoices}
                onSaveInvoice={handleSaveInvoice}
              />
            )}

            {/* CRM OFFERING PRODUCT CATALOGS */}
            {crmActiveTab === 'products' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Commercial Product Catalogs</h2>
                  <p className="text-slate-500 text-sm">Define stock item models to speed select invoice items automatically.</p>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {/* Create product form */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 text-xs h-fit space-y-4">
                    <h3 className="font-extrabold text-slate-850 uppercase tracking-wide text-[11px] text-slate-400 border-b pb-2">Add Stock SKU</h3>
                    <form onSubmit={handleCreateProductSubmit} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-550 mb-1">Product Title *</label>
                        <input
                          type="text" required name="name"
                          placeholder="1-Year Support Subscription Support Bundle"
                          className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-550 mb-1">SKU Tag Code</label>
                          <input
                            type="text" name="sku"
                            placeholder="CRM-SPEC-1"
                            className="w-full bg-slate-50 border rounded-xl py-2 px-2 text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-550 mb-1">Unit Rate ($)</label>
                          <input
                            type="number" required name="price"
                            placeholder="1200"
                            className="w-full bg-slate-50 border rounded-xl py-2 px-2 text-[11px]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-550 mb-1">Stock Vol</label>
                        <input
                          type="number" name="stock"
                          placeholder="999"
                          className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-550 mb-1">Stock Details</label>
                        <textarea
                          rows={2} name="description"
                          className="w-full bg-slate-50 border rounded-xl p-2 text-xs"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs"
                      >
                        Publish Catalog Row
                      </button>
                    </form>
                  </div>

                  {/* Products list visual grids */}
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    {products.length === 0 ? (
                      <div className="col-span-2 bg-white p-12 text-center text-slate-400 rounded-3xl border">No product items found in this tenants catalogue directory. Publish stock rows to display indexes.</div>
                    ) : (
                      products.map(p => (
                        <div key={p.id} className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col justify-between shadow-sm hover:border-indigo-400 transition">
                          <div className="space-y-2">
                            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                              {p.sku}
                            </span>
                            <h4 className="font-extrabold text-slate-900 text-sm">{p.name}</h4>
                            <p className="text-slate-500 text-xs line-clamp-2">{p.description}</p>
                          </div>
                          <div className="flex justify-between items-center text-xs mt-4 pt-3 border-t">
                            <span className="font-extrabold text-slate-400">Available: {p.stock} pcs</span>
                            <span className="text-base font-black text-slate-900">${p.price?.toLocaleString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* CRM BROADCAST MARKETING CAMPAIGNS */}
            {crmActiveTab === 'campaigns' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Blast CRM Marketing Campaigns</h2>
                  <p className="text-slate-500 text-sm">Disseminate WhatsApp hooks alerts, mobile SMS, or newsletter campaign mails to listed leads instantly.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Create campaign */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 text-xs h-fit space-y-4">
                    <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider text-slate-400 border-b pb-2">Launch Broadcast Blast</h3>
                    <form onSubmit={handleCreateCampaignSubmit} className="space-y-3">
                      <div>
                        <label className="block font-bold text-slate-500 mb-1">Campaign Tag Name *</label>
                        <input
                          type="text" required name="name"
                          placeholder="Black Friday CRM Early Hook"
                          className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-500 mb-1">Medium</label>
                          <select name="type" className="w-full bg-slate-50 border rounded-xl py-2 text-xs">
                            <option value="EMAIL">EMail Template</option>
                            <option value="SMS">SMS Text</option>
                            <option value="WHATSAPP">WhatsApp Target Hook</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-500 mb-1">Mail Subject</label>
                          <input
                            type="text" name="subject"
                            placeholder="Special Custom licensing rates"
                            className="w-full bg-slate-50 border rounded-xl py-2 px-2 text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-550 mb-1">Message Body</label>
                        <textarea
                          rows={3} name="body"
                          placeholder="Dear client, check out your workspace today..."
                          className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
                      >
                        <Send size={12} /> Blast Audience Now
                      </button>
                    </form>
                  </div>

                  {/* Campaigns historical lists representation */}
                  <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 overflow-hidden text-xs">
                    <div className="px-5 py-4 bg-slate-50">
                      <span className="font-extrabold text-slate-500 uppercase tracking-widest">Active dispatch records</span>
                    </div>

                    <div className="p-4 space-y-3">
                      {campaigns.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 font-medium">No marketing broadcasts dispatched yet. Launch one.</div>
                      ) : (
                        campaigns.map(c => (
                          <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                            <div className="space-y-1">
                              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                                {c.type}
                              </span>
                              <h4 className="font-extrabold text-slate-800 text-sm mt-1">{c.name}</h4>
                              <p className="text-slate-500 text-xs italic">Subject: "{c.subject || 'Direct SMS'}"</p>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-indigo-600 text-base">{c.sentCount} items</p>
                              <span className="text-emerald-600 text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 justify-end">
                                ● Dispatched Sent
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CRM HELP HELPDESK TICKETS */}
            {crmActiveTab === 'tickets' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">IT Helpdesk Support Tickets</h2>
                  <p className="text-slate-500 text-sm">Need custom database assistance or domain sync support? Log issues directly.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Create Ticket */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 text-xs h-fit space-y-4">
                    <h3 className="font-extrabold text-slate-800 text-xs mb-2 uppercase tracking-wide text-slate-400 border-b pb-2">Lodge Ticket</h3>
                    <form onSubmit={handleCreateTicketSubmit} className="space-y-3">
                      <div>
                        <label className="block text-slate-500 mb-1 font-bold">General Subject *</label>
                        <input
                          type="text" required name="subject"
                          placeholder="Invoices layout formatting"
                          className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-550 mb-1 font-bold">Priority</label>
                          <select name="priority" className="w-full bg-slate-50 border rounded-xl py-2 text-xs">
                            <option value="LOW">Low priority</option>
                            <option value="MEDIUM">Medium priority</option>
                            <option value="HIGH">High priority</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-550 mb-1 font-bold">Contact Email</label>
                          <input
                            type="email" required name="contactEmail"
                            placeholder="greg@dns.com"
                            className="w-full bg-slate-50 border rounded-xl py-2 px-2 text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-550 mb-1 font-bold">Comprehensive Issue details</label>
                        <textarea
                          rows={3} name="description"
                          className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-slate-900 text-white font-extrabold py-2.5 rounded-xl text-xs"
                      >
                        File technical Request
                      </button>
                    </form>
                  </div>

                  {/* List tickets */}
                  <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 overflow-hidden text-xs">
                    <div className="px-5 py-4 border-b bg-slate-50 flex justify-between items-center text-xs">
                      <span className="font-extrabold text-slate-500 uppercase">IT Help Desk Issues Drawer</span>
                    </div>

                    <div className="p-4 space-y-3">
                      {tickets.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 font-medium">All support tickets solved. No pending issues.</div>
                      ) : (
                        tickets.map(t => (
                          <div key={t.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                            <div className="space-y-1">
                              <h4 className="font-extrabold text-slate-800 text-sm">{t.subject}</h4>
                              <p className="text-slate-500 text-xs">{t.description}</p>
                              <p className="text-[10px] text-slate-400">Reporter: {t.contactEmail}</p>
                            </div>
                            <div className="text-right space-y-1">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                t.priority === 'HIGH' ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {t.priority}
                              </span>
                              <div className="text-indigo-600 font-extrabold uppercase text-[10px] text-right pt-2">
                                {t.status}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
