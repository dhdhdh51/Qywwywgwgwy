/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CRMLead, User } from '../types';
import { 
  Sparkles, Plus, Trash2, Edit3, DollarSign, Phone, Mail, Building, 
  MapPin, Loader2, RefreshCw, BarChart2, ShieldAlert, AlignLeft 
} from 'lucide-react';

interface LeadKanbanProps {
  leads: CRMLead[];
  staff: User[];
  onSaveLead: (lead: Partial<CRMLead>) => Promise<void>;
  onDeleteLead: (id: string) => Promise<void>;
}

export default function LeadKanban({ leads, staff, onSaveLead, onDeleteLead }: LeadKanbanProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Partial<CRMLead> | null>(null);
  
  // States for new/edit lead form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState<CRMLead['status']>('NEW');
  const [value, setValue] = useState(0);
  const [source, setSource] = useState('Google');
  const [assignedToId, setAssignedToId] = useState('');
  const [notes, setNotes] = useState('');

  // AI Assistant Analysis State
  const [analyzingLead, setAnalyzingLead] = useState<CRMLead | null>(null);
  const [aiScore, setAiScore] = useState<number | null>(null);
  const [aiSummary, setAiSummary] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiActive, setAiActive] = useState(false);
  const [activeMobileColumn, setActiveMobileColumn] = useState<CRMLead['status']>('NEW');

  // Kanban Columns
  const columns: { id: CRMLead['status']; label: string; color: string }[] = [
    { id: 'NEW', label: 'New Propose', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    { id: 'CONTACTED', label: 'Contacted', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    { id: 'QUALIFIED', label: 'Qualified', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { id: 'PROPOSAL', label: 'Proposal Sent', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { id: 'WON', label: 'Won & Closed', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  ];

  const handleOpenAdd = () => {
    setEditingLead(null);
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setStatus('NEW');
    setValue(1500);
    setSource('Direct Refer');
    setAssignedToId(staff[0]?.id || '');
    setNotes('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (lead: CRMLead) => {
    setEditingLead(lead);
    setName(lead.name);
    setEmail(lead.email);
    setPhone(lead.phone);
    setCompany(lead.company);
    setStatus(lead.status);
    setValue(lead.value);
    setSource(lead.source);
    setAssignedToId(lead.assignedToId || '');
    setNotes(lead.notes);
    setShowAddModal(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return alert('Name and Email are required.');

    await onSaveLead({
      id: editingLead?.id,
      name,
      email,
      phone,
      company,
      status,
      value: Number(value),
      source,
      assignedToId: assignedToId || null,
      notes
    });

    setShowAddModal(false);
  };

  const triggerLeadAnalysis = async (lead: CRMLead) => {
    setAnalyzingLead(lead);
    setAiLoading(true);
    setAiScore(null);
    setAiSummary('');
    setAiSuggestions('');
    
    try {
      const res = await fetch(`/api/ai/analyze-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadDetails: lead }),
      });
      const data = await res.json();
      setAiScore(data.score);
      setAiSummary(data.summary);
      setAiSuggestions(data.suggestions);
      setAiActive(data.aiActive);
    } catch (err) {
      console.error(err);
      setAiScore(70);
      setAiSuggestions("Setup client pitch discussion immediately to request feedback.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="lead_kanban_component">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sales Lead Pipeline</h2>
          <p className="text-slate-500 text-sm">Organize and score leads visually. Click a card to request deep Gemini insights.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-indigo-700 transition"
        >
          <Plus size={16} />
          Create Lead
        </button>
      </div>

      {/* Top statistics overview line */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Deal Volume</p>
          <p className="text-xl font-black text-slate-800">
            ${leads.reduce((acc, l) => acc + l.value, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Pitch Count</p>
          <p className="text-xl font-black text-indigo-600">
            {leads.filter(l => l.status !== 'WON').length} Opportunities
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Conversions Rate</p>
          <p className="text-xl font-black text-emerald-600">
            {leads.length ? Math.round((leads.filter(l => l.status === 'WON').length / leads.length) * 100) : 0}%
          </p>
        </div>
        <div className="bg-indigo-900 text-indigo-100 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-indigo-300 font-bold uppercase">Gemini AI</p>
            <p className="text-xs">Select any lead to score.</p>
          </div>
          <Sparkles className="animate-pulse text-indigo-300" size={20} />
        </div>
      </div>

      {/* Active AI scoring console if open */}
      {analyzingLead && (
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-3xl p-6 shadow-sm relative animate-fade-in">
          <button 
            onClick={() => setAnalyzingLead(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold"
          >
            ✕ Close Analysis
          </button>
          
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl font-black flex flex-col items-center justify-center shadow-lg">
              {aiLoading ? (
                <Loader2 className="animate-spin text-white" size={24} />
              ) : (
                <>
                  <span className="text-2xl">{aiScore ?? '--'}</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider">Score</span>
                </>
              )}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-600 fill-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Gemini Agent Insights: <span className="text-indigo-700">{analyzingLead.name}</span>
                </h3>
                {aiActive ? (
                  <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200">
                    Live Gemini AI Active
                  </span>
                ) : (
                  <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Heuristic Simulator Fallback
                  </span>
                )}
              </div>
              
              {aiLoading ? (
                <div className="text-slate-500 text-sm animate-pulse flex items-center gap-2">
                  <Loader2 className="animate-spin" size={14} /> Evaluating company size, estimated value (${analyzingLead.value}), and historical workflow metrics...
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-800 text-sm font-semibold italic bg-white p-3 rounded-xl border border-indigo-100">
                    "{aiSummary}"
                  </p>
                  <div>
                    <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest mb-1.5">Suggested Action Checklist</h4>
                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-indigo-100">
                      {aiSuggestions}
                    </div>
                  </div>
                  {!aiActive && (
                    <p className="text-[10px] text-slate-400">
                      * Customize process.env.GEMINI_API_KEY in the build secrets bar to connect model.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Column Tabs selector */}
      <div className="md:hidden flex overflow-x-auto gap-2 pb-2 mb-4 scrollbar-none border-b border-slate-200">
        {columns.map((col) => {
          const count = leads.filter(l => l.status === col.id).length;
          const isSelected = activeMobileColumn === col.id;
          return (
            <button
              key={col.id}
              onClick={() => setActiveMobileColumn(col.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                isSelected 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{col.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {columns.map((col) => {
          const columnLeads = leads.filter(l => l.status === col.id);
          const columnTotal = columnLeads.reduce((acc, l) => acc + l.value, 0);

          return (
            <div 
              key={col.id} 
              className={`${activeMobileColumn === col.id ? 'flex' : 'hidden md:flex'} bg-slate-100 rounded-2xl p-3 flex-col min-h-[480px]`}
            >
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200">
                <span className={`text-[11px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${col.color}`}>
                  {col.label} ({columnLeads.length})
                </span>
                <span className="text-xs font-bold text-slate-600">
                  ${columnTotal.toLocaleString()}
                </span>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto">
                {columnLeads.length === 0 ? (
                  <div className="h-full border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-xs text-slate-400 font-medium">No leads here</p>
                  </div>
                ) : (
                  columnLeads.map(lead => {
                    const assignedStaff = staff.find(s => s.id === lead.assignedToId);
                    return (
                      <div 
                        key={lead.id} 
                        className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-500 cursor-pointer hover:shadow-md transition-all group"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 
                            onClick={() => triggerLeadAnalysis(lead)} 
                            className="font-black text-slate-800 text-sm group-hover:text-indigo-600 transition"
                          >
                            {lead.name}
                          </h4>
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
                            <button 
                              onClick={() => handleOpenEdit(lead)} 
                              className="text-slate-400 hover:text-slate-800"
                              title="Edit lead"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button 
                              onClick={() => {
                                if(confirm('Delete lead?')) onDeleteLead(lead.id);
                              }} 
                              className="text-slate-400 hover:text-red-600"
                              title="Delete lead"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {lead.company && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-2">
                            <Building size={10} />
                            <span>{lead.company}</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-xs font-black text-slate-900 bg-slate-50 -mx-4 -mb-4 mt-2 px-4 py-2 bg-gradient-to-r from-white to-slate-100 border-t border-slate-100 rounded-b-2xl">
                          <span>${(lead.value || 0).toLocaleString()}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerLeadAnalysis(lead);
                            }}
                            className="text-[10px] text-indigo-600 font-extrabold flex items-center gap-1 bg-white hover:bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200"
                          >
                            <Sparkles size={9} /> AI Score
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 animate-scale-in">
            <h3 className="text-xl font-extrabold text-slate-900 mb-4 pb-2 border-b">
              {editingLead ? 'Edit Lead Opportunity' : 'Launch New CRM Lead'}
            </h3>
            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company/Lead Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="Charles Sterling"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Coordinates *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="charles@sterling.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="+1 (555) 302-9182"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Corporate Client</label>
                  <input
                    type="text"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="Sterling Developments"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pipeline Section</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                  >
                    <option value="NEW">New Opportunity</option>
                    <option value="CONTACTED">Active Contact</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="PROPOSAL">Proposal Shared</option>
                    <option value="WON">Closed - WON</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estimated Value</label>
                  <input
                    type="number"
                    value={value}
                    onChange={e => setValue(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                    placeholder="12000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Referral Source</label>
                  <input
                    type="text"
                    value={source}
                    onChange={e => setSource(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assigned Account Handler</label>
                <select
                  value={assignedToId}
                  onChange={e => setAssignedToId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                >
                  <option value="">Choose partner...</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deal Brief & Call Logs</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="Needs 2-year subscription custom license setup..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-bold text-white shadow-md"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
