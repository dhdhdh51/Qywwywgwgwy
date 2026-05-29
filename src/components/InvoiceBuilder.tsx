/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CRMInvoice, InvoiceItem } from '../types';
import { FileText, Plus, Trash2, CheckCircle, Clock, AlertTriangle, Printer, Download } from 'lucide-react';

interface InvoiceBuilderProps {
  invoices: CRMInvoice[];
  onSaveInvoice: (invoice: Partial<CRMInvoice>) => Promise<void>;
}

export default function InvoiceBuilder({ invoices, onSaveInvoice }: InvoiceBuilderProps) {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: 'Premium CRM Enterprise License Integration', quantity: 1, unitPrice: 1500 }
  ]);
  const [status, setStatus] = useState<'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'>('DRAFT');

  // Preview selected invoice metadata modal
  const [selectedInvoice, setSelectedInvoice] = useState<CRMInvoice | null>(null);

  const handleAddItem = () => {
    setItems([...items, { description: 'Training support task', quantity: 1, unitPrice: 200 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    if (field === 'description') {
      updated[index][field] = value;
    } else {
      updated[index][field] = Number(value) || 0;
    }
    setItems(updated);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName) return alert('Customer Name must be declared');

    await onSaveInvoice({
      clientName,
      clientEmail,
      dueDate,
      items,
      status
    });

    setShowInvoiceModal(false);
    // Reset defaults
    setClientName('');
    setClientEmail('');
    setDueDate('');
    setItems([{ description: 'Custom SaaS Installation service', quantity: 1, unitPrice: 1500 }]);
  };

  const totalSum = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <div className="space-y-6" id="invoice_builder_root">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-slate-900 text-white p-6 rounded-3xl tracking-tight gap-4 font-sans">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <FileText className="text-indigo-400" /> Itemized Invoice Billing
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Build custom receipts, print statements, and automatically track incoming revenue.
          </p>
        </div>
        <button
          onClick={() => setShowInvoiceModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 font-bold px-5 py-3 rounded-xl flex items-center gap-1.5 transition text-sm"
        >
          <Plus size={16} /> New Statement
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Active Client Ledger</span>
            <span className="text-xs text-slate-400">Total stored: {invoices.length} invoices</span>
          </div>

          <div className="overflow-x-auto min-h-[350px]">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                  <th className="px-6 py-3">Register Number</th>
                  <th className="px-6 py-3">Recipient Customer</th>
                  <th className="px-6 py-3">Issued Value</th>
                  <th className="px-6 py-3">Workflow State</th>
                  <th className="px-6 py-3">Due Target</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400 font-medium">
                      No invoices currently logged. Create your initial ledger above.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr 
                      key={inv.id} 
                      onClick={() => setSelectedInvoice(inv)}
                      className="border-b hover:bg-slate-50 transition cursor-pointer"
                    >
                      <td className="px-6 py-4 font-extrabold text-indigo-700">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4">
                        <p className="font-extrabold text-slate-800">{inv.clientName}</p>
                        <p className="text-slate-400 text-[10px]">{inv.clientEmail}</p>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-800">${(inv.total || 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        {inv.status === 'PAID' && (
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                            <CheckCircle size={10} /> Paid
                          </span>
                        )}
                        {inv.status === 'SENT' && (
                          <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                            <Clock size={10} /> Sent Out
                          </span>
                        )}
                        {inv.status === 'DRAFT' && (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                            Draft Mode
                          </span>
                        )}
                        {inv.status === 'OVERDUE' && (
                          <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 animate-pulse">
                            <AlertTriangle size={10} /> Overdue
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{new Date(inv.dueDate).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side summary receipt viewer */}
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
          <h3 className="font-black text-slate-800 border-b pb-2 text-sm text-[11px] uppercase tracking-wider text-slate-400">Statement Preview Reel</h3>
          {selectedInvoice ? (
            <div className="space-y-4 pt-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-indigo-600 font-extrabold text-base">{selectedInvoice.invoiceNumber}</h4>
                  <p className="text-xs font-semibold text-slate-800">{selectedInvoice.clientName}</p>
                  <p className="text-[10px] text-slate-500">{selectedInvoice.clientEmail}</p>
                </div>
                <button 
                  onClick={() => window.print()}
                  className="bg-white border text-slate-600 p-2 hover:bg-slate-100 rounded-lg"
                  title="Print Slip"
                >
                  <Printer size={12} />
                </button>
              </div>

              <div className="bg-white rounded-2xl p-4 border space-y-2 text-xs">
                {selectedInvoice.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between border-b pb-1.5 last:border-b-0">
                    <div className="max-w-[120px]">
                      <p className="font-bold text-slate-700 truncate">{item.description}</p>
                      <p className="text-[9px] text-slate-400">{item.quantity} units @ ${item.unitPrice}</p>
                    </div>
                    <span className="font-black text-slate-900">${item.quantity * item.unitPrice}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-black text-slate-800 bg-white p-4 rounded-2xl border">
                <span>Grand Total:</span>
                <span className="text-indigo-600">${selectedInvoice.total?.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 text-xs">
              Select any ledger statement in the table list to access print layouts and items breakdown.
            </div>
          )}
        </div>
      </div>

      {/* Save Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 animate-scale-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-extrabold text-slate-900 mb-4 pb-2 border-b">Create Statement</h3>
            
            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                    placeholder="Sallie Walker"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Billing Email</label>
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={e => setClientEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                    placeholder="sallie@company.org"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Payment Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="SENT">Sent Out</option>
                    <option value="PAID">Paid</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Itemized Rows</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-indigo-600 font-extrabold hover:underline"
                  >
                    + Add row
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={e => handleItemChange(idx, 'description', e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-md py-1 px-2 text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        style={{ width: '60px' }}
                        onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                        className="bg-white border border-slate-200 rounded-md py-1 px-1 text-xs text-center"
                      />
                      <input
                        type="number"
                        placeholder="Rate"
                        style={{ width: '90px' }}
                        value={item.unitPrice}
                        onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                        className="bg-white border border-slate-200 rounded-md py-1 px-1 text-xs text-center"
                      />
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation Display */}
              <div className="bg-indigo-50 p-4 rounded-2xl flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-900">Computed Statement Amount:</span>
                <span className="text-lg font-black text-indigo-700">${totalSum.toLocaleString()}</span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-5 py-2.5 bg-slate-100 rounded-xl font-bold text-slate-700 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow"
                >
                  Save statement Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
