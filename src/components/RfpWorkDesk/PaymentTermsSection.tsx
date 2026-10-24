import React from 'react';
import { useRfp } from '../../context/RfpContext';
import {
  CreditCard,
  Shield,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { SectionTasksComments } from './SectionTasksComments';

export const PaymentTermsSection: React.FC = () => {
  const paymentSchedules = [
    {
      milestone: 'Milestone 1: Contract Signing & Mobilization',
      percentage: '20%',
      condition: 'Upon submission of 5% Performance Bank Guarantee (PBG) and kickoff sign-off',
      status: 'Approved',
    },
    {
      milestone: 'Milestone 2: Hardware Delivery & Air-Gapped Software Installation',
      percentage: '30%',
      condition: 'Upon verified physical installation at Navi Mumbai DC and baseline self-test pass',
      status: 'Approved',
    },
    {
      milestone: 'Milestone 3: Successful UAT & Security Audit Certification',
      percentage: '30%',
      condition: 'Upon formal UAT sign-off and CERT-In auditor security certificate issuance',
      status: 'Approved',
    },
    {
      milestone: 'Milestone 4: Commercial Go-Live & 30-Day Stabilization',
      percentage: '20%',
      condition: 'Upon successful 30 days uninterrupted production transaction processing',
      status: 'Approved',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Payment Terms & Bank Guarantee Review
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
              Cluster 4 · Section 18
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Review milestone disbursement triggers, Performance Bank Guarantee (PBG) covenants, retention money clauses, and forex escalation provisions.
          </p>
        </div>

        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Terms Compliant with OEM Cash Flow Policy</span>
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Milestone Disbursement Schedule
          </h4>
          <span className="text-xs text-slate-500">100% Contract Value Distribution</span>
        </div>

        <div className="divide-y divide-slate-100">
          {paymentSchedules.map((p) => (
            <div key={p.milestone} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-indigo-600 font-mono tabular-nums">{p.percentage}</span>
                  <h5 className="text-xs font-bold text-slate-900">{p.milestone}</h5>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{p.condition}</p>
              </div>

              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded shrink-0">
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <SectionTasksComments sectionId="paymentTerms" sectionTitle="Payment Terms Review" />
    </div>
  );
};
