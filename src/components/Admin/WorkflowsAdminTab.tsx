import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { WorkflowDefinition, WorkflowStep } from '../../types/admin';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Clock,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  GitBranch,
  ShieldAlert,
  X,
  FileCheck2,
} from 'lucide-react';

export const WorkflowsAdminTab: React.FC = () => {
  const { workflows, addWorkflow, updateWorkflow, deleteWorkflow, addWorkflowStep, deleteWorkflowStep, roles } = useCrm();

  const [selectedWfId, setSelectedWfId] = useState<string>(workflows[0]?.id || 'wf-rfp-standard');

  // Add Workflow Modal
  const [isWfModalOpen, setIsWfModalOpen] = useState(false);
  const [editingWf, setEditingWf] = useState<WorkflowDefinition | null>(null);
  const [wfName, setWfName] = useState('');
  const [wfCategory, setWfCategory] = useState<WorkflowDefinition['category']>('RFP Proposal');
  const [wfDesc, setWfDesc] = useState('');
  const [wfTrigger, setWfTrigger] = useState('');

  // Add Step Modal
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [stepName, setStepName] = useState('');
  const [stepDesc, setStepDesc] = useState('');
  const [stepRole, setStepRole] = useState(roles[0]?.name || 'Pre-Sales Owner');
  const [stepSla, setStepSla] = useState(3);
  const [stepDeliverable, setStepDeliverable] = useState('');

  const selectedWf = workflows.find((w) => w.id === selectedWfId) || workflows[0];

  const openAddWf = () => {
    setEditingWf(null);
    setWfName('');
    setWfCategory('RFP Proposal');
    setWfDesc('');
    setWfTrigger('Triggered on account state change');
    setIsWfModalOpen(true);
  };

  const openEditWf = (wf: WorkflowDefinition) => {
    setEditingWf(wf);
    setWfName(wf.name);
    setWfCategory(wf.category);
    setWfDesc(wf.description);
    setWfTrigger(wf.triggerEvent);
    setIsWfModalOpen(true);
  };

  const handleSaveWf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wfName.trim()) return;

    if (editingWf) {
      updateWorkflow({
        ...editingWf,
        name: wfName.trim(),
        category: wfCategory,
        description: wfDesc.trim(),
        triggerEvent: wfTrigger.trim(),
      });
    } else {
      addWorkflow({
        name: wfName.trim(),
        category: wfCategory,
        description: wfDesc.trim(),
        triggerEvent: wfTrigger.trim(),
        active: true,
        steps: [
          {
            id: `wf-step-init-${Date.now()}`,
            stepNumber: 1,
            name: 'Initial Review & Triage',
            description: 'Evaluate input scope and assign required subject matter experts.',
            requiredRole: 'Pre-Sales Owner',
            slaDays: 2,
            deliverable: 'Scope Assessment Sheet',
          },
        ],
      });
    }

    setIsWfModalOpen(false);
  };

  const openAddStep = () => {
    setStepName('');
    setStepDesc('');
    setStepRole(roles[0]?.name || 'Pre-Sales Owner');
    setStepSla(3);
    setStepDeliverable('');
    setIsStepModalOpen(true);
  };

  const handleSaveStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWf || !stepName.trim()) return;

    const nextStepNum = (selectedWf.steps.length || 0) + 1;
    addWorkflowStep(selectedWf.id, {
      stepNumber: nextStepNum,
      name: stepName.trim(),
      description: stepDesc.trim(),
      requiredRole: stepRole,
      slaDays: Number(stepSla) || 2,
      deliverable: stepDeliverable.trim() || 'Stage Signoff Document',
    });

    setIsStepModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Sub-task Workflows & Delivery Lifecycles
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure multi-stage proposal workflows, required persona handoffs, and SLA turnaround benchmarks
          </p>
        </div>

        <button
          onClick={openAddWf}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-2xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Workflow Definition</span>
        </button>
      </div>

      {/* Workflows Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workflows.map((wf) => {
          const isSelected = wf.id === selectedWf?.id;
          const totalSla = wf.steps.reduce((acc, s) => acc + s.slaDays, 0);

          return (
            <div
              key={wf.id}
              onClick={() => setSelectedWfId(wf.id)}
              className={`p-4 rounded-xl border text-xs cursor-pointer transition space-y-3 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{wf.name}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      {wf.category}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Trigger: <span className="text-slate-700 font-medium">{wf.triggerEvent}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditWf(wf);
                    }}
                    className="p-1 text-slate-400 hover:text-blue-600 rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {workflows.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete workflow "${wf.name}"?`)) {
                          deleteWorkflow(wf.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed text-xs">{wf.description}</p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>{wf.steps.length} Sequenced Stages</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Total SLA: {totalSla} Business Days
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Workflow Detailed Steps Pipeline */}
      {selectedWf && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  Workflow Execution Sequence: {selectedWf.name}
                </span>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {selectedWf.steps.length} Steps
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Each stage generates tracked subtasks assigned to the designated persona role.
              </p>
            </div>

            <button
              onClick={openAddStep}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-2xs shrink-0"
            >
              <Plus className="w-3 h-3" />
              <span>Add Stage / Step</span>
            </button>
          </div>

          {/* Stepper Timeline */}
          <div className="space-y-3">
            {selectedWf.steps.map((step, idx) => (
              <div
                key={step.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                    {step.stepNumber || idx + 1}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm">{step.name}</h5>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                        <UserCheck className="w-3 h-3 text-indigo-600" />
                        Required: {step.requiredRole}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        <Clock className="w-3 h-3 text-slate-500" />
                        SLA: {step.slaDays} Days
                      </span>
                    </div>

                    <p className="text-slate-600 leading-relaxed text-xs">{step.description}</p>

                    <div className="text-[11px] text-blue-700 font-medium flex items-center gap-1 pt-0.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Deliverable: {step.deliverable}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                  {selectedWf.steps.length > 1 && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete step "${step.name}"?`)) {
                          deleteWorkflowStep(selectedWf.id, step.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Remove Step"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Workflow Modal */}
      {isWfModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingWf ? 'Configure Workflow' : 'Create New Sub-task Workflow'}
              </h3>
              <button
                onClick={() => setIsWfModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveWf} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Workflow Name *</label>
                <input
                  type="text"
                  required
                  value={wfName}
                  onChange={(e) => setWfName(e.target.value)}
                  placeholder="e.g. Strategic Multi-Cloud RFP Bid Sequence"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Workflow Category *</label>
                <select
                  value={wfCategory}
                  onChange={(e) => setWfCategory(e.target.value as WorkflowDefinition['category'])}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                >
                  <option value="RFP Proposal">RFP Proposal</option>
                  <option value="Technical PoC">Technical PoC</option>
                  <option value="Architecture Review">Architecture Review</option>
                  <option value="Security Due Diligence">Security Due Diligence</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Triggering Event / Rule *</label>
                <input
                  type="text"
                  required
                  value={wfTrigger}
                  onChange={(e) => setWfTrigger(e.target.value)}
                  placeholder="e.g. Account stage moved to Critical with RFP tender flag"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Workflow Overview & Objectives</label>
                <textarea
                  rows={3}
                  value={wfDesc}
                  onChange={(e) => setWfDesc(e.target.value)}
                  placeholder="Explain scope, deliverables, and expectations across stages..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWfModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-slate-600 font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs"
                >
                  {editingWf ? 'Save Workflow' : 'Create Workflow'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Step Modal */}
      {isStepModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add Sequenced Step</h3>
              <button
                onClick={() => setIsStepModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStep} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Stage / Step Name *</label>
                <input
                  type="text"
                  required
                  value={stepName}
                  onChange={(e) => setStepName(e.target.value)}
                  placeholder="e.g. Legal Disclaimer & Export Control Audit"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Required Persona Role *</label>
                  <select
                    value={stepRole}
                    onChange={(e) => setStepRole(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Turnaround SLA (Days) *</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    value={stepSla}
                    onChange={(e) => setStepSla(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mandatory Deliverable *</label>
                <input
                  type="text"
                  required
                  value={stepDeliverable}
                  onChange={(e) => setStepDeliverable(e.target.value)}
                  placeholder="e.g. Signed Compliance Matrix PDF / Architecture Topology"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Step Guidance & Checklist</label>
                <textarea
                  rows={3}
                  value={stepDesc}
                  onChange={(e) => setStepDesc(e.target.value)}
                  placeholder="Detail instructions for the assignee executing this step..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStepModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-slate-600 font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs"
                >
                  Add Step
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
