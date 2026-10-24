import React, { useState } from 'react';
import { useRfp } from '../../context/RfpContext';
import { useCrm } from '../../context/CrmContext';
import {
  AlertTriangle,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { RfpConflictFlag } from '../../types/rfp';

interface ConflictFlagsModalProps {
  onClose: () => void;
  onNavigateToSection?: (sectionId: string) => void;
}

export const ConflictFlagsModal: React.FC<ConflictFlagsModalProps> = ({
  onClose,
  onNavigateToSection,
}) => {
  const { conflictFlags, resolveConflictFlag, selectedTenderId } = useRfp();
  const { currentUser } = useCrm();

  const [resolvingFlagId, setResolvingFlagId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  const tenderConflicts = conflictFlags.filter((f) => f.rfpId === selectedTenderId);
  const activeConflicts = tenderConflicts.filter((f) => f.status === 'Active');
  const resolvedConflicts = tenderConflicts.filter((f) => f.status === 'Resolved');

  const handleResolve = (flag: RfpConflictFlag) => {
    if (!resolutionText.trim()) return;

    resolveConflictFlag(
      flag.id,
      resolutionText.trim(),
      currentUser?.name || 'Ananya Sharma (Pre-Sales Lead)'
    );

    setResolvingFlagId(null);
    setResolutionText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-rose-950 text-white flex items-center justify-between border-b border-rose-900">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="text-sm font-bold tracking-tight">RFP Cross-Section Conflict Flags</h3>
              <p className="text-[11px] text-rose-200">
                Automated continuous reconciliation across BOMs, SoW clauses, PBQ responses, and timelines.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-rose-300 hover:text-white p-1 rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200">
            <span>
              Showing <strong>{activeConflicts.length}</strong> active discrepancies requiring Pre-Sales sign-off
            </span>
            <span className="text-emerald-600 font-semibold">{resolvedConflicts.length} resolved</span>
          </div>

          {/* Active Conflicts List */}
          <div className="space-y-3">
            {activeConflicts.map((flag) => (
              <div
                key={flag.id}
                className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          flag.severity === 'High'
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {flag.severity} Discrepancy
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                          {flag.sourceSection}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-rose-500" />
                        <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                          {flag.targetSection}
                        </span>
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 pt-1">{flag.title}</h4>
                    <p className="text-xs text-slate-700 leading-relaxed">{flag.description}</p>
                  </div>
                </div>

                {resolvingFlagId === flag.id ? (
                  <div className="p-3 bg-white border border-rose-300 rounded-lg space-y-2 animate-in fade-in duration-150">
                    <label className="block text-[11px] font-bold text-slate-800">
                      Pre-Sales Resolution Notes & Mitigation Action:
                    </label>
                    <textarea
                      value={resolutionText}
                      onChange={(e) => setResolutionText(e.target.value)}
                      placeholder="e.g. Expanded NVMe storage provisioning to 36TB in Infra Sizing; reconciled with client 3-year audit requirement..."
                      rows={2}
                      className="w-full text-xs rounded border border-slate-300 p-2 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setResolvingFlagId(null)}
                        className="px-3 py-1 text-xs text-slate-600 hover:text-slate-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResolve(flag)}
                        className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700 shadow-2xs"
                      >
                        Commit Resolution
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2 border-t border-rose-200/60">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Detected {new Date(flag.detectedAt).toLocaleString()}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setResolvingFlagId(flag.id);
                        setResolutionText('');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-semibold shadow-2xs transition cursor-pointer"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Resolve Discrepancy</span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {activeConflicts.length === 0 && (
              <div className="p-8 text-center bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
                <h4 className="text-xs font-bold text-emerald-900">Zero Cross-Section Conflicts</h4>
                <p className="text-xs text-emerald-700 max-w-md mx-auto">
                  All Volume Metrics, Infra Sizing, SoW line items, PBQ client responses, and Project Plan timelines are fully reconciled with zero discrepancies.
                </p>
              </div>
            )}
          </div>

          {/* Resolved History */}
          {resolvedConflicts.length > 0 && (
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Resolved Discrepancy Audit
              </div>
              <div className="space-y-2">
                {resolvedConflicts.map((flag) => (
                  <div
                    key={flag.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 text-slate-600"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 line-through">{flag.title}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Resolved
                      </span>
                    </div>
                    {flag.resolutionNotes && (
                      <p className="text-[11px] text-slate-700 italic">
                        &quot;{flag.resolutionNotes}&quot; — {flag.resolvedBy}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
