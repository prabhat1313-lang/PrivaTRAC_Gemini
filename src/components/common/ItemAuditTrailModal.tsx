import React from 'react';
import { AuditEntry } from '../../types/crm';
import { X, History, Sparkles, User, Calendar, ShieldCheck, Building, Tag, CheckCircle2 } from 'lucide-react';

interface ItemAuditTrailModalProps {
  title: string;
  subtitle?: string;
  entityType?: 'Account' | 'Contact' | 'Task' | 'Admin' | 'Other';
  entries: AuditEntry[];
  onClose: () => void;
}

export const ItemAuditTrailModal: React.FC<ItemAuditTrailModalProps> = ({
  title,
  subtitle,
  entityType = 'Other',
  entries,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">{title}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                  {entityType}
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  {entries.length} {entries.length === 1 ? 'event' : 'events'} logged
                </span>
              </div>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table / Timeline */}
        <div className="p-5 overflow-y-auto flex-1 text-xs">
          {entries.length === 0 ? (
            <div className="py-14 text-center text-slate-400 font-medium">
              <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p>No audit trail change events recorded for this {entityType.toLowerCase()} yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Any modifications to editable fields will be timestamped and permanently tracked here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/70 transition space-y-2.5 shadow-2xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{entry.field}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          entry.provenance === 'AI-suggested'
                            ? 'bg-purple-100 text-purple-900'
                            : entry.provenance === 'Human-confirmed'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}
                      >
                        {entry.provenance}
                      </span>
                      {entry.isBackDated && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Back-Dated Entry
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono">
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>

                  {/* Previous vs New Values */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 text-[11px] border border-slate-100">
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">Previous Value</span>
                      <div className="font-medium text-slate-700 break-words mt-0.5">
                        {entry.oldValue || 'None / Empty'}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">New Value</span>
                      <div className="font-bold text-slate-900 break-words mt-0.5">
                        {entry.newValue || 'None / Empty'}
                      </div>
                    </div>
                  </div>

                  {/* Attribution & Effective Date */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="flex items-center gap-1.5 flex-wrap">
                        <span>Actor:</span>
                        {entry.actor === 'SalesOps Copilot' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[10px]">
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            SalesOps Copilot
                          </span>
                        ) : (
                          <strong className="text-slate-800">{entry.actor}</strong>
                        )}
                        {entry.actingOnBehalfOf && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200/80 text-amber-900 font-semibold text-[10px]">
                            On behalf of: <strong className="text-slate-900">{entry.actingOnBehalfOf}</strong>
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Effective Date: <strong className="text-slate-800">{entry.effectiveDate}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Immutable audit trail governed by enterprise compliance standards</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
};
