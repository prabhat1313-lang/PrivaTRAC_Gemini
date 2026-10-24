import React from 'react';
import { useRfp } from '../../context/RfpContext';
import {
  Clock,
  Headphones,
  Shield,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { SectionTasksComments } from './SectionTasksComments';

export const SupportManpowerSection: React.FC = () => {
  const supportTiers = [
    {
      tier: 'Tier 1: On-Site Resident Operations (24x7x365)',
      staffing: '4 Resident Engineers (3 Shifts + 1 Reliever)',
      location: 'Navi Mumbai Bank DC',
      resellerSiScope: 'Tata Consultancy Services (TCS) SI Scope',
      slaResponse: '< 15 mins acknowledgment',
    },
    {
      tier: 'Tier 2: Escalated Privacy & DB Integration Specialists',
      staffing: '2 Specialized DB Privacy Engineers',
      location: 'Hybrid On-Site / Remote',
      resellerSiScope: 'Joint OEM / SI Support Desk',
      slaResponse: '< 30 mins triage',
    },
    {
      tier: 'Tier 3 / Tier 4: Core Software OEM Engineering',
      staffing: 'Direct PrivaSapien Engineering Core Team',
      location: 'Bangalore OEM HQ',
      resellerSiScope: 'PrivaSapien OEM Scope',
      slaResponse: '< 2 hrs hotfix / bug triage',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Support Manpower Planning & 24x7 SLA Matrix
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
              Cluster 3 · Section 16
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Multi-tier 24x7 support desk sizing. Distributes on-site physical resident engineer staffing to Tier-1 SI Partner while PrivaSapien guarantees L3/L4 core software SLA response.
          </p>
        </div>

        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-md">
          P1 Incident SLA: &lt; 15 Mins
        </span>
      </div>

      <div className="space-y-3">
        {supportTiers.map((t) => (
          <div
            key={t.tier}
            className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900">{t.tier}</h4>
              <div className="text-xs text-slate-600">
                Staffing: <strong className="text-slate-800">{t.staffing}</strong> · Base: {t.location}
              </div>
              <div className="text-[11px] text-indigo-600 font-medium">{t.resellerSiScope}</div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                {t.slaResponse}
              </span>
            </div>
          </div>
        ))}
      </div>

      <SectionTasksComments sectionId="supportManpower" sectionTitle="Support Manpower Planning" />
    </div>
  );
};
