import React, { useState } from 'react';
import { useRfp } from '../../context/RfpContext';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Building,
  Award,
} from 'lucide-react';
import { SectionTasksComments } from './SectionTasksComments';
import { VerbatimExcerptViewer } from './VerbatimExcerptViewer';

export const EligibilityCriteriaSection: React.FC = () => {
  const { selectedTender } = useRfp();

  const [criteriaList, setCriteriaList] = useState([
    {
      id: 'crit-01',
      clauseNo: 'Section 2.1 (PQC-1)',
      page: 14,
      title: 'Annual Average Turnover Requirement',
      verbatim: 'The bidder (or consortium lead partner) must have an average annual turnover of at least INR 500 Crores over the preceding 3 audited financial years (FY 2023-24, 2024-25, 2025-26).',
      status: 'Complied via Partner',
      complianceNote: 'Satisfied through Tier-1 SI Partner Tata Consultancy Services (TCS) whose 3-year average turnover exceeds ₹2.2 Lakh Crores.',
      deviationFlag: false,
    },
    {
      id: 'crit-02',
      clauseNo: 'Section 2.3 (PQC-3)',
      page: 18,
      title: 'OEM Direct Intellectual Property & Source Code Ownership',
      verbatim: 'The bidder must be the Original Equipment Manufacturer (OEM) of the core differential privacy and synthetic data engine, owning all source code and patents without third-party relicensing restrictions.',
      status: 'Fully Complied',
      complianceNote: 'PrivaSapien holds 100% proprietary patent and source code ownership for PETs Core, Differential Privacy Sandbox, and Synthetic Data Studio.',
      deviationFlag: false,
    },
    {
      id: 'crit-03',
      clauseNo: 'Section 2.5 (PQC-5)',
      page: 22,
      title: 'Scheduled Commercial Bank Implementation References',
      verbatim: 'The OEM software must be actively operational in at least two Tier-1 Scheduled Commercial Banks in India or APAC managing customer datasets exceeding 100 Million records.',
      status: 'Fully Complied',
      complianceNote: 'Operational in ICICI Bank and DBS Singapore privacy sandbox programs.',
      deviationFlag: false,
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Pre-Qualification & Eligibility Criteria Review
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
              Cluster 1 · Section 1
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Validate mandatory technical and financial pre-qualification criteria (PQC). Tracks consortium partner turnover pass-through and OEM direct IP requirements.
          </p>
        </div>

        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>All 3 PQC Gates Cleared</span>
        </span>
      </div>

      <div className="space-y-4">
        {criteriaList.map((crit) => (
          <div
            key={crit.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {crit.clauseNo}
                </span>
                <span className="text-xs font-bold text-slate-800">{crit.title}</span>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded">
                {crit.status}
              </span>
            </div>

            <VerbatimExcerptViewer
              clauseNumber={crit.clauseNo}
              pageNumber={crit.page}
              verbatimText={crit.verbatim}
              aiSummary={crit.complianceNote}
              aiPositioningNote="Attach Audited Financials & OEM Certificate as Annexure A-1."
              tenderDocName={selectedTender.tenderDocName}
            />

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
              <strong className="text-slate-900">Compliance Response: </strong>
              {crit.complianceNote}
            </div>
          </div>
        ))}
      </div>

      <SectionTasksComments sectionId="eligibility" sectionTitle="Eligibility Criteria" />
    </div>
  );
};
