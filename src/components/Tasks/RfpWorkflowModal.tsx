import React, { useState } from 'react';
import { Account, Task } from '../../types/crm';
import { useCrm } from '../../context/CrmContext';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  X,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface RfpWorkflowModalProps {
  account: Account;
  onClose: () => void;
}

export const RfpWorkflowModal: React.FC<RfpWorkflowModalProps> = ({ account, onClose }) => {
  const { tasks, updateTask, currentUser } = useCrm();

  const rfpTasks = tasks
    .filter((t) => t.accountId === account.id && t.rfpSubtask)
    .sort((a, b) => (a.rfpSubtask?.stepIndex || 0) - (b.rfpSubtask?.stepIndex || 0));

  const [activeStep, setActiveStep] = useState<number>(1);
  const [sowRequirementText, setSowRequirementText] = useState(
    'RFP Clause 4.3: Provider must guarantee zero-knowledge proof verification without decrypting confidential customer databases.'
  );
  const [sowGeneratedResponse, setSowGeneratedResponse] = useState<string | null>(null);
  const [qaReviewed, setQaReviewed] = useState(false);
  const [jointSignOff, setJointSignOff] = useState(false);

  // Simulated AI RFP Scan Page suggestions for roles
  const rfpScanPages = [
    {
      role: 'Sales Owner',
      pages: 'Pages 3–8, 42–46',
      sections: 'Commercial Milestones, Penalty Clauses, Billing Schedules',
      rationale: 'Critical pricing terms, SLA penalties, and invoice sign-off gates.',
    },
    {
      role: 'Pre-Sales Owner',
      pages: 'Pages 12–28',
      sections: 'Scope of Work, Mandatory Technical Requirements, Functional Compliance',
      rationale: 'Primary qualification matrix and compliance response drafting.',
    },
    {
      role: 'Solution Engineer',
      pages: 'Pages 29–38, Annexure C',
      sections: 'Infra Architecture, Docker Containers, SBOM, Cryptographic Standards',
      rationale: 'FIPS-140-3 validation, API bandwidth latency, and deployment topology.',
    },
    {
      role: 'Leader',
      pages: 'Pages 1–4, 52–54',
      sections: 'Executive Summary, Legal Attestation, Risk Warranty',
      rationale: 'Binding corporate representation and executive indemnity coverage.',
    },
  ];

  const handleSimulateSowGeneration = () => {
    setSowGeneratedResponse(
      `PrivaSapien Technical Response: Compliant. PrivaSapien PETs Core utilizes elliptic curve zero-knowledge SNARK proofs (zk-SNARKs) to mathematically attest compliance with query boundaries without exposing plaintext data to the compute runtime. Certified under ISO/IEC 27701 and DPDP 2023 technical safeguards.`
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">
                RFP Sub-Workflow & Document Scanner · {account.name}
              </h3>
              <p className="text-xs text-slate-500">
                Procurement Model: <strong>{account.procurementType}</strong> · Bid Desk Execution
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* Mock AI RFP Document Scan Section (TASK-09) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h4 className="font-semibold text-slate-900 text-sm">
                  Document Scan Page Recommendations
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-800 border border-purple-200/60">
                  AI Suggestion
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Synthetic Sample RFP (58 pages)
              </span>
            </div>

            <p className="text-slate-600 text-[11px]">
              Tender document partitions mandatory reading assignments by stakeholder role:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {rfpScanPages.map((scan) => (
                <div key={scan.role} className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div className="font-semibold text-slate-900 text-xs">{scan.role}</div>
                  <div className="text-slate-800 font-bold text-xs tabular-nums">{scan.pages}</div>
                  <div className="text-slate-600 text-[10px] font-medium leading-tight">
                    {scan.sections}
                  </div>
                  <div className="text-slate-400 text-[10px] pt-1 border-t border-slate-100">
                    {scan.rationale}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5 Sequential Sub-tasks Tracker (TASK-10) */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3">
              Bid Desk Execution Sequence (5 Standard Stages)
            </h4>

            <div className="space-y-2">
              {rfpTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-4 ${
                    task.completedAt
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        task.completedAt
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {task.rfpSubtask?.stepIndex}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{task.name || task.description}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        TCT: {new Date(task.tct).toLocaleDateString()} • Assigned:{' '}
                        {task.rfpSubtask?.requiredRole}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        task.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : task.status === 'Completed Late'
                          ? 'bg-amber-100 text-amber-800'
                          : task.status === 'Overdue'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {task.status}
                    </span>

                    {!task.completedAt && (
                      <button
                        onClick={() => {
                          updateTask({
                            ...task,
                            completedAt: new Date().toISOString(),
                            status: 'Completed',
                          });
                        }}
                        className="px-2.5 py-1 rounded bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700"
                      >
                        Sign Off Stage
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scope of Work (SoW) Response Prep Flow (TASK-11) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm">
                SoW Response Synthesis & Joint Review Workflow (Task-11)
              </h4>
              <span className="text-[11px] text-slate-500 font-semibold">
                Excel Requirement → Context Match → QA Review → Joint Sign-off
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Extracted Excel Tender Requirement Clause:
              </label>
              <textarea
                rows={2}
                value={sowRequirementText}
                onChange={(e) => setSowRequirementText(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
              />
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={handleSimulateSowGeneration}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>Generate Context-Matched Response</span>
              </button>
              <span className="text-[10px] text-slate-400 font-medium">
                Using synthetic local context file (zero external transfer)
              </span>
            </div>

            {sowGeneratedResponse && (
              <div className="p-3 bg-[#faf8fd] border border-purple-200/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 text-xs">
                    Synthesized Technical Response
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-50 text-purple-800 font-medium border border-purple-200/60">
                    Generated by AI
                  </span>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed">{sowGeneratedResponse}</p>

                {/* Review Checkboxes */}
                <div className="pt-2 border-t border-purple-200 flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={qaReviewed}
                      onChange={(e) => setQaReviewed(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    Pre-Sales QA Review Passed
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={jointSignOff}
                      onChange={(e) => setJointSignOff(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    Solution Engineer + Pre-Sales Joint Sign-off
                  </label>
                </div>

                {qaReviewed && jointSignOff && (
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded font-bold text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Response approved & appended to master tender context repository!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-900 text-xs"
          >
            Close RFP Desk
          </button>
        </div>
      </div>
    </div>
  );
};
