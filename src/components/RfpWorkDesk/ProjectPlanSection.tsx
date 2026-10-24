import React, { useState } from 'react';
import { useRfp } from '../../context/RfpContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { SectionTasksComments } from './SectionTasksComments';

export const ProjectPlanSection: React.FC = () => {
  const { conflictFlags, selectedTender } = useRfp();

  const [milestones, setMilestones] = useState([
    {
      id: 'm-01',
      phase: 'Phase 1: Mobilization & Environment Setup',
      duration: 'T + 15 Days',
      startDate: '2026-12-01',
      endDate: '2026-12-15',
      deliverable: 'Hardware racking in Navi Mumbai DC, OS hardening, HSM integration',
      status: 'Ready',
      owner: 'TCS Infrastructure Lead',
    },
    {
      id: 'm-02',
      phase: 'Phase 2: PETs Core & DP Sandbox Deployment',
      duration: 'T + 35 Days',
      startDate: '2026-12-16',
      endDate: '2027-01-05',
      deliverable: 'Air-gapped installation of PrivaSapien Differential Privacy Sandbox v4.2',
      status: 'Planned',
      owner: 'Vikram Malhotra (SE)',
    },
    {
      id: 'm-03',
      phase: 'Phase 3: Synthetic Data Studio Pilot Benchmark',
      duration: 'T + 60 Days',
      startDate: '2027-01-06',
      endDate: '2027-01-30',
      deliverable: '10M synthetic credit records generated; Wasserstein distance < 0.02 certified',
      status: 'Planned',
      owner: 'Dr. Sameer Joshi (Product)',
    },
    {
      id: 'm-04',
      phase: 'Phase 4: User Acceptance Testing (UAT) & Security Audit',
      duration: 'T + 75 Days',
      startDate: '2027-02-01',
      endDate: '2027-02-15',
      deliverable: 'CERT-In empaneled auditor penetration testing & DPDP compliance sign-off',
      status: 'Pending Corrigendum Reconciliation',
      owner: 'Chief InfoSec Officer',
    },
    {
      id: 'm-05',
      phase: 'Phase 5: Commercial Go-Live & 24x7 Support Handover',
      duration: 'T + 90 Days',
      startDate: '2027-02-16',
      endDate: '2027-03-01',
      deliverable: 'Production transaction traffic routed; 24x7 SOC team operational',
      status: 'Planned',
      owner: 'Kavita Sundaram (Delivery)',
    },
  ]);

  const activeConflicts = conflictFlags.filter(
    (c) =>
      c.rfpId === selectedTender.id &&
      c.status === 'Active' &&
      (c.sourceSection.includes('Timelines') || c.targetSection.includes('Timelines'))
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Project Plan, WBS & Implementation Timelines
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
              Cluster 3 · Section 13
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            End-to-end work breakdown structure (WBS) from contract award (T0) to commercial go-live. Integrates milestone buffer margins against Liquidated Damages (LD).
          </p>
        </div>

        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-md">
          Total Duration: 90 Days to Go-Live
        </span>
      </div>

      {activeConflicts.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Timeline Conflict Detected: </strong>
              {activeConflicts[0].description}
            </span>
          </div>
          <span className="font-bold text-amber-800 underline shrink-0 cursor-pointer">
            Reconcile with PBQ Corrigendum &rarr;
          </span>
        </div>
      )}

      {/* Timeline Gantt Preview Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider bg-slate-50/70">
                <th className="py-2.5 px-3">Milestone Phase</th>
                <th className="py-2.5 px-3">Timeline Target</th>
                <th className="py-2.5 px-3">Key Deliverable</th>
                <th className="py-2.5 px-3">Assigned Owner</th>
                <th className="py-2.5 px-3 text-right">Readiness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {milestones.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-3 font-bold text-slate-900">{m.phase}</td>
                  <td className="py-3 px-3 font-mono text-indigo-700 font-semibold">
                    {m.duration} ({m.startDate} &rarr; {m.endDate})
                  </td>
                  <td className="py-3 px-3 text-slate-700 max-w-xs">{m.deliverable}</td>
                  <td className="py-3 px-3 text-slate-600 font-medium">{m.owner}</td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        m.status === 'Ready'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : m.status === 'Pending Corrigendum Reconciliation'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SectionTasksComments sectionId="projectPlan" sectionTitle="Project Plan & Timelines" />
    </div>
  );
};
