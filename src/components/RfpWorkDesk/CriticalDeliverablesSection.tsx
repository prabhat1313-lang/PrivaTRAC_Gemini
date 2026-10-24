import React, { useState } from 'react';
import { useRfp } from '../../context/RfpContext';
import {
  FileCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  Shield,
} from 'lucide-react';
import { SectionTasksComments } from './SectionTasksComments';

export const CriticalDeliverablesSection: React.FC = () => {
  const deliverables = [
    {
      id: 'del-01',
      name: 'Differential Privacy Mathematical Attestation & Epsilon Accounting Report',
      targetPhase: 'Phase 3 (Pilot Completion)',
      dueDate: '2027-01-28',
      criteria: 'Proof of ε <= 0.5 under 50,000 TPS; zero privacy leakage on re-identification audits',
      status: 'Prepared (Template Ready)',
      signOffRole: 'Chief Privacy Architect',
    },
    {
      id: 'del-02',
      name: 'Data Protection Impact Assessment (DPIA) & DPDP 2023 Consent Audit Trail',
      targetPhase: 'Phase 4 (UAT)',
      dueDate: '2027-02-10',
      criteria: 'Formal compliance report detailing consent management and data principal rights',
      status: 'In Progress',
      signOffRole: 'VP Legal & Regulatory',
    },
    {
      id: 'del-03',
      name: 'Source Code Escrow Deposit & Master Build Artifact Attestation',
      targetPhase: 'Phase 5 (Go-Live)',
      dueDate: '2027-02-28',
      criteria: 'CycloneDX SBOM v1.4, CBOM FIPS-140-3 certificates, and Escrow agreement',
      status: 'Standard OEM Baseline',
      signOffRole: 'General Counsel',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Critical Tender Deliverables & Proof of Concept Gates
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
              Cluster 3 · Section 14
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            High-stakes contractual deliverables, technical gate reviews, mathematical privacy certificates, and escrow commitments required for payment milestone release.
          </p>
        </div>

        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md">
          3 Milestone Gates Defined
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {deliverables.map((del) => (
          <div
            key={del.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  {del.targetPhase}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Due {del.dueDate}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 leading-snug">{del.name}</h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                <strong className="text-slate-800">Pass Criteria: </strong>
                {del.criteria}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Sign-Off: {del.signOffRole}</span>
              <span className="font-bold text-emerald-700">{del.status}</span>
            </div>
          </div>
        ))}
      </div>

      <SectionTasksComments sectionId="criticalDeliverables" sectionTitle="Critical Deliverables" />
    </div>
  );
};
