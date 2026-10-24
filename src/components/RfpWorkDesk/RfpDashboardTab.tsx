import React, { useState } from 'react';
import { useRfp } from '../../context/RfpContext';
import { useCrm } from '../../context/CrmContext';
import {
  ShieldCheck,
  Cpu,
  Truck,
  Coins,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  FileCheck,
  PenTool,
  Users,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { ExecutiveSignOff } from '../../types/rfp';

interface RfpDashboardTabProps {
  onSelectSection: (sectionId: string) => void;
  onOpenConflictModal: () => void;
  onOpenReviewQueue: () => void;
}

export const RfpDashboardTab: React.FC<RfpDashboardTabProps> = ({
  onSelectSection,
  onOpenConflictModal,
  onOpenReviewQueue,
}) => {
  const {
    selectedTender,
    activeConflictCount,
    executiveSignOffs,
    signExecutiveRole,
    signOffQuorumMet,
    reviewQueue,
  } = useRfp();
  const { currentUser } = useCrm();

  const [signingRole, setSigningRole] = useState<ExecutiveSignOff['role'] | null>(null);
  const [signConditions, setSignConditions] = useState('');

  const handleSignConfirm = (role: ExecutiveSignOff['role']) => {
    signExecutiveRole(
      role,
      currentUser?.name || 'Executive Signer',
      signConditions.trim() || undefined
    );

    setSigningRole(null);
    setSignConditions('');
  };

  const clusters = [
    {
      id: 'cluster-gov',
      name: 'Governance, Pre-Bid & Compliance',
      sections: '6 Working Sections',
      completion: 72,
      icon: ShieldCheck,
      color: 'from-blue-600 to-indigo-700',
      badge: 'Cluster 1',
      highlights: 'PBQ auto-drafted · SoW 4/4 line items evaluated · Product QA reviews pending',
      primarySectionId: 'sow',
    },
    {
      id: 'cluster-bom',
      name: 'Technical & Architecture BOMs (X-BOM)',
      sections: '6 Working Sections',
      completion: 64,
      icon: Cpu,
      color: 'from-emerald-600 to-teal-700',
      badge: 'Cluster 2',
      highlights: 'Volume Metrics active · Infra Sizing live linked · FIPS-140-3 & ε/δ parameters verified',
      primarySectionId: 'volumeMetrics',
    },
    {
      id: 'cluster-exec',
      name: 'Execution & Support Delivery',
      sections: '4 Working Sections',
      completion: 70,
      icon: Truck,
      color: 'from-amber-600 to-orange-700',
      badge: 'Cluster 3',
      highlights: 'Project WBS 60-day pilot drafted · Named lead privacy engineers assigned',
      primarySectionId: 'projectPlan',
    },
    {
      id: 'cluster-comm',
      name: 'Commercials & Financial Governance',
      sections: '2 Working Sections',
      completion: 80,
      icon: Coins,
      color: 'from-purple-600 to-violet-700',
      badge: 'Cluster 4',
      highlights: 'Base OEM INR 14.85 Cr · TCS 65/35 margin model · PBG 5% terms reviewed',
      primarySectionId: 'commercialPlanning',
    },
  ];

  const signedCount = executiveSignOffs.filter((s) => s.signed).length;

  return (
    <div className="space-y-6">
      {/* Top Notification / Action Alerts Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Conflict Flags Widget */}
        <div
          onClick={onOpenConflictModal}
          className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between shadow-xs ${
            activeConflictCount > 0
              ? 'bg-rose-50/80 border-rose-200 hover:bg-rose-100/70 hover:border-rose-300'
              : 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/70'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg ${
                activeConflictCount > 0 ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900">
                  {activeConflictCount > 0
                    ? `${activeConflictCount} Cross-Section Conflicts Detected`
                    : 'Zero Cross-Section Conflicts'}
                </h4>
                {activeConflictCount > 0 && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {activeConflictCount > 0
                  ? 'Discrepancies found between Volume Metrics, Infra Sizing, and Corrigendum timelines.'
                  : 'All tender parameters and schedules are fully reconciled.'}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-bold text-rose-700 bg-white border border-rose-200 px-2.5 py-1 rounded-md shadow-2xs">
              Resolve Flags &rarr;
            </span>
          </div>
        </div>

        {/* Pre-Sales Review Queue Widget */}
        <div
          onClick={onOpenReviewQueue}
          className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 transition cursor-pointer flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-600 text-white">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900">
                  Pre-Sales Actionable Review Queue
                </h4>
                {reviewQueue.length > 0 && (
                  <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                    {reviewQueue.length} Pending
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Review proposed change diffs from Solution Engineers & Sales Owners.
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-bold text-indigo-700 bg-white border border-indigo-200 px-2.5 py-1 rounded-md shadow-2xs">
              Review Queue &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* 4 Functional Cluster Progress Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Functional Cluster Readiness</h3>
          </div>
          <span className="text-xs text-slate-500">18 Working Sections Total</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {clusters.map((cluster) => {
            const Icon = cluster.icon;
            return (
              <div
                key={cluster.id}
                onClick={() => onSelectSection(cluster.primarySectionId)}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-400 hover:shadow-xs transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {cluster.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-900 tabular-nums">
                      {cluster.completion}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition text-slate-700">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{cluster.name}</h4>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2.5 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${cluster.color} transition-all duration-300`}
                      style={{ width: `${cluster.completion}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                    {cluster.highlights}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-indigo-600 font-semibold group-hover:text-indigo-700">
                  <span>{cluster.sections}</span>
                  <span className="flex items-center gap-0.5">
                    Open &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Milestone Schedule & Tender Timelines */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Key Tender Milestones & Critical Cutoffs</h3>
          </div>
          <span className="text-xs font-medium text-slate-500">Tender Ref: {selectedTender.tenderNumber}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Pre-Bid Conference</div>
            <div className="text-xs font-bold text-slate-900">Completed (2026-10-18)</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">Minutes Ingested & Parsed</div>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200">
            <div className="text-[10px] text-amber-700 font-bold uppercase mb-1">PBQ Cutoff Deadline</div>
            <div className="text-xs font-bold text-amber-950">{selectedTender.pbqCutoffDate}</div>
            <div className="text-[11px] text-amber-700 font-semibold mt-1">4 Days Remaining</div>
          </div>

          <div className="p-3 bg-indigo-50/70 rounded-lg border border-indigo-200">
            <div className="text-[10px] text-indigo-700 font-bold uppercase mb-1">Final Submission Deadline</div>
            <div className="text-xs font-bold text-indigo-950">{selectedTender.submissionDeadline}</div>
            <div className="text-[11px] text-indigo-700 font-semibold mt-1">22 Days Remaining</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Technical Defense & PoC</div>
            <div className="text-xs font-bold text-slate-900">2026-11-22 (Projected)</div>
            <div className="text-[11px] text-slate-600 mt-1">Mumbai SBI Tech Center</div>
          </div>
        </div>
      </div>

      {/* Executive 2-of-3 Sign-Off Quorum Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <PenTool className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Executive Tender Freeze Sign-Off (2-of-3 Quorum)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tender submission freeze requires digital sign-off from at least 2 authorized roles: Product Manager, Leader (VP/Exec), and Delivery Manager.
            </p>
          </div>

          <div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                signOffQuorumMet
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {signOffQuorumMet
                  ? 'Quorum Met (2/3 Signed) · Ready to Seal'
                  : `Quorum Pending (${signedCount}/2 Required Signs)`}
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {executiveSignOffs.map((signOff) => (
            <div
              key={signOff.role}
              className={`p-4 rounded-xl border transition ${
                signOff.signed
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900">{signOff.role}</span>
                {signOff.signed ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3" />
                    Signed
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                    Awaiting Signature
                  </span>
                )}
              </div>

              {signOff.signed ? (
                <div className="space-y-1.5 text-xs">
                  <div className="font-semibold text-slate-800">{signOff.signerName}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {signOff.signedAt ? new Date(signOff.signedAt).toLocaleString() : ''}
                  </div>
                  {signOff.conditions && (
                    <div className="p-2 bg-white rounded border border-emerald-200 text-[11px] text-slate-700 italic">
                      &quot;{signOff.conditions}&quot;
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Review SOW compliance, financial rates, and delivery feasibility before executing sign-off.
                  </p>

                  {signingRole === signOff.role ? (
                    <div className="space-y-2 pt-1 border-t border-slate-200">
                      <input
                        type="text"
                        value={signConditions}
                        onChange={(e) => setSignConditions(e.target.value)}
                        placeholder="Optional conditions / stipulations..."
                        className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSigningRole(null)}
                          className="px-2 py-1 text-xs text-slate-600 hover:text-slate-900"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSignConfirm(signOff.role)}
                          className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700"
                        >
                          Sign Now
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSigningRole(signOff.role)}
                      className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer"
                    >
                      Sign as {signOff.role}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
