import React from 'react';
import { Account, AuditEntry } from '../../types/crm';
import { X, History, Sparkles, User, Calendar, ShieldCheck } from 'lucide-react';

interface AuditTrailModalProps {
  account: Account;
  onClose: () => void;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({ account, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">Field-Level Audit Trail</h3>
              <p className="text-xs text-slate-500">
                Audited timeline for <strong>{account.name}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-5 overflow-y-auto flex-1 text-xs">
          {account.fieldAuditTrail.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-medium">
              No field-level change events recorded for this account yet.
            </div>
          ) : (
            <div className="space-y-3">
              {account.fieldAuditTrail.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/60 transition space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
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
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Back-Dated Entry
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400">
                      System Time: {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 rounded bg-slate-50 text-[11px]">
                    <div>
                      <span className="text-slate-400 font-semibold">Previous Value:</span>
                      <div className="font-medium text-slate-700 truncate">{entry.oldValue}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold">New Value:</span>
                      <div className="font-bold text-slate-900 truncate">{entry.newValue}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
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

                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Effective Date: <strong>{entry.effectiveDate}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-900 text-xs"
          >
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};
