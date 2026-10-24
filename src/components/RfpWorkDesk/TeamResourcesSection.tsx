import React from 'react';
import { useRfp } from '../../context/RfpContext';
import {
  Users,
  Award,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { SectionTasksComments } from './SectionTasksComments';

export const TeamResourcesSection: React.FC = () => {
  const teamStaffing = [
    {
      name: 'Dr. Sameer Joshi',
      role: 'Lead Differential Privacy & AI Architect',
      experience: '14 Years (Ex-IBM Research)',
      certifications: 'Ph.D. Cryptography, CDPSE, Fellow in Privacy Tech',
      allocation: '100% Dedicated (Phase 1–3)',
      status: 'CV Locked & Attested',
    },
    {
      name: 'Ananya Sharma',
      role: 'Pre-Sales Bid Lead & Privacy Solutions Consultant',
      experience: '9 Years (BFSI Advisory)',
      certifications: 'CIPP/E, ISO 42001 Lead Auditor, MBA',
      allocation: '100% Dedicated (Full Tender)',
      status: 'CV Locked & Attested',
    },
    {
      name: 'Vikram Malhotra',
      role: 'Lead Solution Engineer & Infrastructure Specialist',
      experience: '8 Years (Bare-Metal & HSM Integration)',
      certifications: 'Thales Certified HSM Engineer, CISA, AWS Solutions Architect',
      allocation: '100% Dedicated (Full Tender)',
      status: 'CV Locked & Attested',
    },
    {
      name: 'Dr. Aruna Pillai',
      role: 'Lead Regulatory & DPDP Compliance Auditor',
      experience: '12 Years (Ex-Data Protection Advisory Board)',
      certifications: 'LL.M., CIPM, Data Governance Fellow',
      allocation: '50% Part-Time Advisory',
      status: 'CV Locked & Attested',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Project Team & Key Named Personnel
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
              Cluster 3 · Section 15
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Named key personnel submitted for tender scoring evaluation. Includes verified credentials, academic qualifications, and professional certifications (CIPP, CDPSE, ISO 42001).
          </p>
        </div>

        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>All 4 Named Personnel Meet Tender Cutoffs</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teamStaffing.map((person) => (
          <div
            key={person.name}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900">{person.name}</h4>
                <div className="text-xs font-semibold text-indigo-600 mt-0.5">{person.role}</div>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                {person.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200/60">
              <div className="text-slate-600">
                <strong>Experience: </strong>{person.experience}
              </div>
              <div className="text-slate-600">
                <strong>Certifications: </strong>{person.certifications}
              </div>
              <div className="text-indigo-900 font-medium">
                <strong>Committed Allocation: </strong>{person.allocation}
              </div>
            </div>
          </div>
        ))}
      </div>

      <SectionTasksComments sectionId="projectTeam" sectionTitle="Project Team & Key Resources" />
    </div>
  );
};
