/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'STAFF' | 'CUSTOMER';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  maxLeads: number;
  maxUsers: number;
  maxStorageMb: number;
  isActive: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  logoUrl: string | null;
  primaryColor: string; // Tailwind color or hex
  subscriptionPlanId: string;
  subscriptionExpiresAt: string;
  createdAt: string;
  settings: {
    businessType: string;
    currency: string;
    emailSignature: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
    whatsappApiKey?: string;
    smsApiKey?: string;
  };
}

export interface User {
  id: string;
  tenantId: string | null; // null for Super Admin
  email: string;
  name: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  avatarUrl: string | null;
  createdAt: string;
}

export interface CRMLead {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
  value: number;
  source: string;
  assignedToId: string | null;
  notes: string;
  createdAt: string;
}

export interface CRMContact {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  createdAt: string;
}

export interface CRMTask {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string;
  assignedToId: string | null;
  leadId: string | null;
  createdAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CRMInvoice {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  items: InvoiceItem[];
  total: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
  dueDate: string;
  createdAt: string;
}

export interface CRMExpense {
  id: string;
  tenantId: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: string;
}

export interface CRMProduct {
  id: string;
  tenantId: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  description: string;
}

export interface SupportTicket {
  id: string;
  tenantId: string;
  subject: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  contactEmail: string;
  createdAt: string;
}

export interface MarketingCampaign {
  id: string;
  tenantId: string;
  name: string;
  subject: string;
  body: string;
  type: 'EMAIL' | 'SMS' | 'WHATSAPP';
  status: 'DRAFT' | 'SENT';
  sentCount: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  tenantId: string | null;
  userId: string;
  userName: string;
  action: string;
  details: string;
  ip: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  expiresAt: string;
  isActive: boolean;
}

export interface BlogCMS {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  published: boolean;
  createdAt: string;
}

export interface FaqCMS {
  id: string;
  question: string;
  answer: string;
}

export interface TestimonialCMS {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  avatarUrl: string;
}

export interface GlobalStats {
  totalRevenue: number;
  totalTenants: number;
  activeUsers: number;
  subscriptionRate: number;
}
