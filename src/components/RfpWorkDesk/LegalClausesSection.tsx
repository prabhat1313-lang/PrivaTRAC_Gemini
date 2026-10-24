import React, { useState } from 'react';
import { useRfp } from '../../context/RfpContext';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
  FileText,
} from 'lucide-react';
import { SectionTasksComments } from './SectionTasksComments';
import { VerbatimExcerptViewer } from './VerbatimExcerptViewer';

export const LegalClausesSection: React.FC = () => {
  const { selectedTender } = useRfp();

  const legalClauses = [
    {
      id: 'leg-01',
      clauseNo: 'Section 7.1',
      page: 82,
      topic: 'Limitation of Liability & Indemnity',
      verbatim: 'The bidder shall agree to uncapped indemnification for any third-party claims arising out of data privacy non-compliance.',
      verdict: 'Non-Standard Deviation Required',
      mitigation: 'PBQ-002 dispatched requesting cap at 100% of aggregate license fees. Annexure-D deviation list prepared for General Counsel sign-off.',
      risk: 'High',
    },
    {
      id: 'leg-02',
      clauseNo: 'Section 7.4',
      page: 86,
      topic: 'Liquidated Damages (LD) Ceiling',
      verbatim: 'A penalty of 0.5% per week of delay subject to a maximum ceiling of 5% of total contract value shall be levied on milestones not completed by target dates.',
      verdict: 'Standard & Complied',
      mitigation: 'Within standard 5% OEM threshold. Delivery schedule buffered to guarantee milestone dates.',
      risk: 'Low',
    },
    {
      id: 'leg-03',
      clauseNo: 'Section 8.2',
      page: 92,
      topic: 'Intellectual Property Rights (IPR) & Source Code Escrow',
      verbatim: 'All pre-existing intellectual property of the OEM remains with the OEM. The Bank shall receive a perpetual, non-exclusive enterprise license.',
      verdict: 'Fully Complied',
      mitigation: 'Standard enterprise software OEM licensing model.',
      risk: 'Low',
    },
    {
      id: 'leg-04',
      clauseNo: 'Section 9.1',
      page: 98,
      topic: 'Data Sovereignty & Cross-Border Telemetry Prohibition',
      verbatim: 'Under no circumstances shall any customer data, telemetry, or diagnostic log leave the sovereign geographical boundaries of India.',
      verdict: 'Fully Complied',
      mitigation: 'PrivaSapien architecture is 100% air-gapped on-premises with zero outbound cloud calls.',
      risk: 'Low',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Legal Clauses, Covenants & Risk Review
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
              Cluster 1 · Section 4
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Rigorous legal review of indemnity caps, liquidated damages (LD), SLA penalties, IPR preservation, and sovereign data residency clauses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
            1 Mandatory Deviation Flagged (Indemnity)
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {legalClauses.map((clause) => (
          <div
            key={clause.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {clause.clauseNo}
                </span>
                <span className="text-xs font-bold text-slate-800">{clause.topic}</span>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                  clause.risk === 'High'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {clause.verdict}
              </span>
            </div>

            <VerbatimExcerptViewer
              clauseNumber={clause.clauseNo}
              pageNumber={clause.page}
              verbatimText={clause.verbatim}
              aiSummary={clause.mitigation}
              aiRiskNote={clause.risk === 'High' ? 'Uncapped liability clause conflicts with OEM terms.' : undefined}
              aiPositioningNote="Standard Annexure-D deviation clause applied."
              tenderDocName={selectedTender.tenderDocName}
            />

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
              <strong className="text-slate-900">Legal Mitigation Strategy: </strong>
              {clause.mitigation}
            </div>
          </div>
        ))}
      </div>

      <SectionTasksComments sectionId="legal" sectionTitle="Legal Clauses Review" />
    </div>
  );
};
