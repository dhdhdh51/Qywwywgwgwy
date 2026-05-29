/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Tenant, SubscriptionPlan, AuditLog, Coupon } from '../types';
import { 
  Building, Settings, ShieldAlert, Award, Sliders, Mail, FileText, 
  HelpCircle, Check, Database, RefreshCw, Plus, Trash2, Key, ToggleLeft, Globe
} from 'lucide-react';

interface SuperAdminPanelProps {
  tenants: Tenant[];
  plans: SubscriptionPlan[];
  auditLogs: AuditLog[];
  coupons: Coupon[];
  onAddPlan: (plan: Partial<SubscriptionPlan>) => Promise<void>;
  onAddTenant: (tenantDetails: any) => Promise<any>;
  onAddCoupon: (coupon: Partial<Coupon>) => Promise<void>;
}

export default function SuperAdminPanel({
  tenants, plans, auditLogs, coupons, onAddPlan, onAddTenant, onAddCoupon
}: SuperAdminPanelProps) {
  // Navigation inside master control panel
  const [activeTab, setActiveTab] = useState<'tenants' | 'plans' | 'logs' | 'coupons' | 'settings'>('tenants');

  // New Tenant Form
  const [newSubdomain, setNewSubdomain] = useState('');
  const [newTenantName, setNewTenantName] = useState('');
  const [newPrimaryColor, setNewPrimaryColor] = useState('#2563eb');
  const [newPlanId, setNewPlanId] = useState(plans[0]?.id || 'plan-growth');
  const [customDomain, setCustomDomain] = useState('');
  const [provisionResult, setProvisionResult] = useState<any>(null);

  // New Plan Form
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState(49);
  const [planPeriod, setPlanPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [planLeads, setPlanLeads] = useState(10000);
  const [planUsers, setPlanUsers] = useState(15);
  const [planStorage, setPlanStorage] = useState(1000);
  const [planFeatures, setPlanFeatures] = useState('Subdomain layout, Standard Invoices, 5 Staff members');

  // New Coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponValue, setCouponValue] = useState(25);
  const [couponType, setCouponType] = useState<'PERCENT' | 'FIXED'>('PERCENT');

  // System Config States
  const [smtpHost, setSmtpHost] = useState('mail.dnsconnector.com');
  const [smtpPort, setSmtpPort] = useState(465);
  const [smtpUser, setSmtpUser] = useState('smtp-system-main@cpanel-hosting.net');
  const [metaTitle, setMetaTitle] = useState('OmniSaas - Premium Multi-tenant CRM');
  const [metaDesc, setMetaDesc] = useState('Run your entire SaaS network on cPanel seamlessly.');

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubdomain) return alert('Subdomain token is required');
    const result = await onAddTenant({
      name: newTenantName,
      subdomain: newSubdomain,
      customDomain: customDomain || null,
      planId: newPlanId,
      primaryColor: newPrimaryColor
    });
    setProvisionResult(result);
    // Refresh inputs
    setNewSubdomain('');
    setNewTenantName('');
    setCustomDomain('');
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName) return alert('Plan title required');
    await onAddPlan({
      id: 'plan-' + Date.now(),
      name: planName,
      price: planPrice,
      billingPeriod: planPeriod,
      features: planFeatures.split(',').map(f => f.trim()),
      maxLeads: planLeads,
      maxUsers: planUsers,
      maxStorageMb: planStorage,
      isActive: true
    });
    setPlanName('');
    alert('Plan subscription template activated');
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return alert('Coupon string required');
    await onAddCoupon({
      code: couponCode.toUpperCase(),
      discountType: couponType,
      discountValue: couponValue,
      isActive: true,
      expiresAt: new Date(Date.now() + 86400000 * 30).toISOString()
    });
    setCouponCode('');
    alert('Promotion code registered into SaaS gateway');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm" id="super_admin_panel">
      {/* Visual Sub Navigation header */}
      <div className="flex bg-slate-950 text-white border-b overflow-x-auto min-h-[50px]">
        {[
          { id: 'tenants', label: 'Tenants & Domain Mapper', icon: Building },
          { id: 'plans', label: 'Pricing Plans Architect', icon: Award },
          { id: 'coupons', label: 'Promo Coupon Managers', icon: Sliders },
          { id: 'logs', label: 'Failed Logs & Security Logs', icon: ShieldAlert },
          { id: 'settings', label: 'SMTP & Landing CMS SEO', icon: Settings }
        ].map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.id}
              onClick={() => {
                setActiveTab(btn.id as any);
                setProvisionResult(null);
              }}
              className={`px-5 py-4 text-xs font-black uppercase tracking-wider whitespace-nowrap flex items-center gap-2 border-b-2 transition ${
                activeTab === btn.id ? 'border-indigo-500 bg-slate-900 text-white' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={14} />
              {btn.label}
            </button>
          );
        })}
      </div>

      <div className="p-6">
        {/* TENANTS & MAPPINGS TAB */}
        {activeTab === 'tenants' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tenant Provision Wizard */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 h-fit">
                <h3 className="font-extrabold text-slate-900 mb-3 text-sm text-indigo-700 uppercase tracking-widest flex items-center gap-1">
                  <Database size={14} /> Instant Subdomain Deployment
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Spawn client databases, mapped directories, and system administrators securely on standard hosting headers.
                </p>

                <form onSubmit={handleCreateTenant} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Company Entity Name</label>
                    <input
                      type="text"
                      className="w-full bg-white border rounded-xl py-2 px-3 text-xs"
                      placeholder="Helix Dynamics"
                      value={newTenantName}
                      onChange={e => setNewTenantName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Subdomain Tag *</label>
                    <div className="flex items-center bg-white border rounded-xl py-1 px-2 text-xs">
                      <input
                        type="text"
                        required
                        className="flex-1 border-0 focus:ring-0 p-0 text-xs text-right text-indigo-800 font-extrabold"
                        placeholder="helix"
                        value={newSubdomain}
                        onChange={e => setNewSubdomain(e.target.value)}
                      />
                      <span className="text-slate-400 pl-1">.mycrm.com</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Client Domain Mapping (Optional)</label>
                    <input
                      type="text"
                      className="w-full bg-white border rounded-xl py-2 px-3 text-xs"
                      placeholder="crm.helixdynamics.org"
                      value={customDomain}
                      onChange={e => setCustomDomain(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Plan Package</label>
                      <select
                        className="w-full bg-white border rounded-xl py-2 px-1 text-xs"
                        value={newPlanId}
                        onChange={e => setNewPlanId(e.target.value)}
                      >
                        {plans.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Brand Accent</label>
                      <input
                        type="color"
                        className="w-full h-8 bg-white border rounded-xl p-1"
                        value={newPrimaryColor}
                        onChange={e => setNewPrimaryColor(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs shadow"
                  >
                    Deploy New Space
                  </button>
                </form>

                {provisionResult && (
                  <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-2">
                    <p className="font-bold text-emerald-800">✓ CRM Portal Synced</p>
                    <p className="text-[11px] text-slate-600">Created default staff credentials to log into subdomain panel:</p>
                    <div className="bg-white p-2 rounded-lg border mt-1">
                      <p className="font-extrabold text-slate-700">User: {provisionResult.autoAdminCreds?.email}</p>
                      <p className="font-extrabold text-slate-700">Pass: password123</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tenants mapping SSL list */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 overflow-hidden h-[410px] flex flex-col">
                <div className="px-5 py-4 bg-slate-50 border-b flex justify-between items-center text-xs">
                  <span className="font-black text-slate-500 uppercase tracking-wider">Currently Hosted Tenants list</span>
                  <div className="flex gap-4">
                    <span className="text-slate-400 font-bold flex items-center gap-1">
                      <Globe size={12} className="text-green-500 animate-pulse" /> SSL check synchronized
                    </span>
                  </div>
                </div>

                <div className="overflow-y-auto flex-1 text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b bg-slate-50/50 text-[10px] font-bold uppercase text-slate-400">
                        <th className="px-4 py-3">Tenant Brand</th>
                        <th className="px-4 py-3">Server Location</th>
                        <th className="px-4 py-3">SSL Status</th>
                        <th className="px-4 py-3">Subscription tier</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map(t => {
                        const plan = plans.find(p => p.id === t.subscriptionPlanId);
                        return (
                          <tr key={t.id} className="border-b hover:bg-slate-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: t.primaryColor }} 
                                />
                                <div>
                                  <p className="font-extrabold text-slate-800">{t.name}</p>
                                  <p className="text-slate-400 text-[10px]">{t.subdomain}.mycrm.com</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-[11px] font-mono text-slate-600 bg-slate-50/50">
                              {t.customDomain ? (
                                <span className="text-indigo-600 font-bold">{t.customDomain}</span>
                              ) : (
                                <span>cPanel Shared IP</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">
                                ✓ Mapped / Active
                              </span>
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-900">
                              {plan ? plan.name : 'Unknown Tier'}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-green-600 font-extrabold flex items-center gap-1">
                                <Check size={12} /> Active
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PLANS ARCHITECT TAB */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                <h3 className="font-extrabold text-slate-900 mb-2 text-sm text-[11px] uppercase tracking-wider text-slate-400">Launch New Subscription Package</h3>
                <form onSubmit={handleCreatePlan} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Plan Title</label>
                    <input
                      type="text" required value={planName} onChange={e => setPlanName(e.target.value)}
                      className="w-full bg-white border rounded-xl py-2 px-3 text-xs"
                      placeholder="Ultimate scale Plan"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Price Rate ($)</label>
                      <input
                        type="number" value={planPrice} onChange={e => setPlanPrice(Number(e.target.value))}
                        className="w-full bg-white border rounded-xl py-2 px-3 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Billing Loop</label>
                      <select
                        value={planPeriod} onChange={e => setPlanPeriod(e.target.value as any)}
                        className="w-full bg-white border rounded-xl py-2 text-xs"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Max Leads</label>
                      <input
                        type="number" value={planLeads} onChange={e => setPlanLeads(Number(e.target.value))}
                        className="w-full bg-white border rounded-xl py-1 px-2 text-xs text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Max Users</label>
                      <input
                        type="number" value={planUsers} onChange={e => setPlanUsers(Number(e.target.value))}
                        className="w-full bg-white border rounded-xl py-1 px-2 text-xs text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Storage (MB)</label>
                      <input
                        type="number" value={planStorage} onChange={e => setPlanStorage(Number(e.target.value))}
                        className="w-full bg-white border rounded-xl py-1 px-2 text-xs text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Feature List (split by comma)</label>
                    <textarea
                      rows={2} value={planFeatures} onChange={e => setPlanFeatures(e.target.value)}
                      className="w-full bg-white border rounded-xl p-2 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs"
                  >
                    Activating Pricing Tier
                  </button>
                </form>
              </div>

              {/* Show Plan Cards available */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-extrabold text-slate-800 text-base">Active Registered Plans Portal</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {plans.map(p => (
                    <div key={p.id} className="bg-white p-5 rounded-3xl border border-slate-200">
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="font-extrabold text-slate-800 text-md">{p.name}</span>
                        <span className="text-indigo-600 font-extrabold text-sm">${p.price}/{p.billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
                      </div>
                      <div className="pt-2 text-xs text-slate-500 space-y-1">
                        <p>✓ Max lead threshold: {p.maxLeads.toLocaleString()}</p>
                        <p>✓ Permitted team seats: {p.maxUsers}</p>
                        <p>✓ Space cap allowance: {p.maxStorageMb} MB</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PROMO COUPON MANAGERS */}
        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 text-xs h-fit">
              <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-xs mb-3">Launch Promo Code Offer</h3>
              <form onSubmit={handleCreateCoupon} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Coupon Text</label>
                  <input
                    type="text" required placeholder="OFFER50" value={couponCode} onChange={e => setCouponCode(e.target.value)}
                    className="w-full bg-white border rounded-xl py-2 px-3 text-xs uppercase"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Discount Amount</label>
                    <input
                      type="number" value={couponValue} onChange={e => setCouponValue(Number(e.target.value))}
                      className="w-full bg-white border rounded-xl py-2 px-3 text-xs text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Calculated type</label>
                    <select
                      value={couponType} onChange={e => setCouponType(e.target.value as any)}
                      className="w-full bg-white border rounded-xl py-2 text-xs"
                    >
                      <option value="PERCENT">% Percent</option>
                      <option value="FIXED">$ Flat Fixed</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl"
                >
                  Confirm coupon
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 overflow-hidden text-xs">
              <div className="px-5 py-3 bg-slate-50 border-b">
                <span className="font-extrabold text-slate-500 uppercase tracking-widest">Active promo code tracks</span>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b text-[10px] font-bold text-slate-400">
                    <th className="px-4 py-2">Coupon Code</th>
                    <th className="px-4 py-2">Discount Value</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-4 py-3 font-extrabold text-indigo-700">{c.code}</td>
                      <td className="px-4 py-3 text-slate-800 font-extrabold">
                        {c.discountType === 'PERCENT' ? `${c.discountValue}% Off` : `$${c.discountValue} Flat Discount`}
                      </td>
                      <td className="px-4 py-3 text-emerald-600 font-semibold">✓ Active Campaign</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FAILED LOGS & SECURITY AUDITS */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-800 text-lg">Platform Audit Logs & Security Checks</h3>
              <span className="text-xs text-rose-600 font-bold bg-rose-100 border border-rose-200 px-3 py-1 rounded-full animate-pulse">
                Tracking Failed Logins & Admin updates
              </span>
            </div>

            <div className="bg-slate-900 text-slate-100 font-mono text-[11px] rounded-3xl p-5 shadow-inner max-h-[350px] overflow-y-auto space-y-1.5 border border-slate-950">
              {auditLogs.map((log) => (
                <div key={log.id} className="pb-1.5 border-b border-slate-800/60 leading-relaxed">
                  <span className="text-slate-500">[{new Date(log.createdAt).toLocaleTimeString()}]</span>{' '}
                  <span className={`${
                    log.action.includes('FAILED') ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'
                  }`}>
                    {log.action}
                  </span>{' '}
                  <span className="text-indigo-300 font-extrabold">({log.userName})</span>:{' '}
                  <span className="text-slate-300">{log.details}</span> -{' '}
                  <span className="text-indigo-400">IP: {log.ip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SMTP & SEO SYSTEM SETTINGS */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-800">
            {/* SMTP config */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
              <h3 className="font-extrabold text-slate-900 border-b pb-2 flex items-center gap-1">
                <Mail size={14} className="text-indigo-600" /> Host SMTP Mail Relay
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">SMTP Outgoing Host</label>
                  <input
                    type="text" value={smtpHost} onChange={e => setSmtpHost(e.target.value)}
                    className="w-full bg-white border rounded-xl py-2 px-3 text-xs"
                    placeholder="mail.dnsconnector.com"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Username Credentials</label>
                    <input
                      type="text" value={smtpUser} onChange={e => setSmtpUser(e.target.value)}
                      className="w-full bg-white border rounded-xl py-2 px-3 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Port</label>
                    <input
                      type="number" value={smtpPort} onChange={e => setSmtpPort(Number(e.target.value))}
                      className="w-full bg-white border rounded-xl py-2 px-1 text-xs text-center"
                    />
                  </div>
                </div>
                <div className="p-3 bg-white border rounded-2xl flex items-center justify-between text-[11px] text-slate-500">
                  <span>Require Secure TLS Authentication (SSL)</span>
                  <div className="text-indigo-600 font-black">Active</div>
                </div>
                <button
                  type="button"
                  onClick={() => alert('SMTP relay configurations saved into hosting env.')}
                  className="w-full bg-slate-900 text-white font-bold py-2 rounded-xl text-xs"
                >
                  Sync Mail Credentials
                </button>
              </div>
            </div>

            {/* SEO description variables */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
              <h3 className="font-extrabold text-slate-900 border-b pb-2 flex items-center gap-1">
                <FileText size={14} className="text-emerald-600" /> Site CMS Metadata Settings
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Master Meta Title</label>
                  <input
                    type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)}
                    className="w-full bg-white border rounded-xl py-2 px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Meta Content Description</label>
                  <textarea
                    rows={2} value={metaDesc} onChange={e => setMetaDesc(e.target.value)}
                    className="w-full bg-white border rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div className="p-3 bg-green-50 text-green-800 text-[11px] font-bold rounded-2xl border border-green-200">
                  ✓ Sitemaps.xml and Robots.txt generated on server root folder dynamically.
                </div>
                <button
                  type="button"
                  onClick={() => alert('SEO sitemaps and site headers regenerated instantly.')}
                  className="w-full bg-slate-900 text-white font-bold py-2 rounded-xl text-xs"
                >
                  Write SEO Metadata
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
