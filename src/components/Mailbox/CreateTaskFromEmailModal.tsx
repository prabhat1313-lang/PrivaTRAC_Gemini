import React, { useState } from 'react';
import { EmailMessage, TaskCreationDraft } from '../../types/mailbox';
import { useMailbox } from '../../context/MailboxContext';
import { useRfp } from '../../context/RfpContext';
import { useCrm } from '../../context/CrmContext';
import {
  X,
  CheckCircle2,
  Calendar,
  User,
  Tag,
  FileSpreadsheet,
  Building,
  ArrowRight,
  Sparkles,
  Layers,
  ArrowLeftRight,
} from 'lucide-react';

interface CreateTaskFromEmailModalProps {
  email: EmailMessage;
  onClose: () => void;
  onTaskCreated?: (destination: 'rfp_workdesk' | 'account_workspace', sectionOrAccountId?: string) => void;
}

export const CreateTaskFromEmailModal: React.FC<CreateTaskFromEmailModalProps> = ({
  email,
  onClose,
  onTaskCreated,
}) => {
  const { createTaskFromEmail } = useMailbox();
  const { tenders } = useRfp();
  const { accounts, users } = useCrm();

  // Determine if this email matches an active tender deal
  const matchingTender = tenders.find(
    (t) => t.id === email.matchedTenderId || t.accountId === email.matchedAccountId
  );
  const isAutoRfp = Boolean(matchingTender || email.matchedTenderId);

  const matchedAccount = accounts.find((a) => a.id === email.matchedAccountId);

  // Initial destination based on automatic detection
  const [routingDestination, setRoutingDestination] = useState<'rfp_workdesk' | 'account_workspace'>(
    isAutoRfp ? 'rfp_workdesk' : 'account_workspace'
  );

  // Section options
  const rfpSections = [
    { id: 'sow', label: 'Scope of Work (SoW) Review' },
    { id: 'integrations', label: 'Integrations Scope Review' },
    { id: 'pbq', label: 'Pre-Bid Queries (PBQ)' },
    { id: 'legal', label: 'Legal & Risk Review' },
    { id: 'infraSizing', label: 'Infra Sizing & Hardware BOM' },
    { id: 'projectPlan', label: 'Project Plan & Timelines' },
    { id: 'commercialPlanning', label: 'Commercial Planning' },
  ];

  const crmSections = [
    { id: 'Technical Proposal', label: 'Technical Proposal' },
    { id: 'Demo', label: 'Demonstration / PoC' },
    { id: 'Commercial Proposal', label: 'Commercial Proposal' },
    { id: 'Infra & SBOM', label: 'Infra & SBOM' },
    { id: 'General', label: 'General Account Follow-up' },
  ];

  // Default target section
  const initialRfpSection = email.detectedClauseRef?.toLowerCase().includes('6')
    ? 'integrations'
    : 'sow';

  const [targetSection, setTargetSection] = useState(
    routingDestination === 'rfp_workdesk' ? initialRfpSection : 'Technical Proposal'
  );

  const [title, setTitle] = useState(email.subject);
  const [description, setDescription] = useState(
    `Action required from client correspondence:\n"${email.bodyPreview}"\n\nSource Email: ${email.from.name} <${email.from.email}> on ${email.receivedDateTime}`
  );
  const [priority, setPriority] = useState<TaskCreationDraft['priority']>('High');
  const [assigneeName, setAssigneeName] = useState(
    routingDestination === 'rfp_workdesk'
      ? matchingTender?.solutionEngineer || 'Vikram Malhotra (Solution Engineer)'
      : matchedAccount?.owners.preSales || 'Ananya Sharma (Pre-Sales Owner)'
  );

  // 3 business days from now
  const defaultDueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [dueDate, setDueDate] = useState(defaultDueDate);

  const handleToggleDestination = () => {
    if (routingDestination === 'rfp_workdesk') {
      setRoutingDestination('account_workspace');
      setTargetSection('Technical Proposal');
      setAssigneeName(matchedAccount?.owners.sales || 'Rajesh Kumar (Sales Owner)');
    } else {
      setRoutingDestination('rfp_workdesk');
      setTargetSection(initialRfpSection);
      setAssigneeName(matchingTender?.solutionEngineer || 'Vikram Malhotra (Solution Engineer)');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTaskFromEmail({
      emailId: email.id,
      sourceSubject: email.subject,
      sourceSender: email.from.name,
      matchedAccountId: email.matchedAccountId,
      matchedAccountName: email.matchedAccountName || matchedAccount?.name,
      matchedTenderId: matchingTender?.id || email.matchedTenderId,
      matchedTenderNumber: matchingTender?.tenderNumber || email.matchedTenderNumber,
      isRfpDeal: routingDestination === 'rfp_workdesk',
      routingDestination,
      targetSection,
      title: title.trim(),
      description: description.trim(),
      priority,
      assigneeName,
      dueDate,
    });

    onClose();

    if (onTaskCreated) {
      onTaskCreated(
        routingDestination,
        routingDestination === 'rfp_workdesk' ? targetSection : email.matchedAccountId
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 text-xs">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Create Actionable Task from Email
              </h3>
              <p className="text-[11px] text-slate-500">
                Context-aware dual routing: RFP Work Desk vs. Account Workspace
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Intelligent Routing Destination Banner */}
        <div className="p-3 rounded-lg border bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {routingDestination === 'rfp_workdesk' ? (
              <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0">
                <Building className="w-4 h-4" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900">
                  {routingDestination === 'rfp_workdesk'
                    ? 'Target: RFP Work Desk Section'
                    : 'Target: Account CRM Workspace'}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                  {isAutoRfp && routingDestination === 'rfp_workdesk'
                    ? 'Auto-Detected (Tender Account)'
                    : 'Configured'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {routingDestination === 'rfp_workdesk'
                  ? `Task will be logged under ${matchingTender?.clientName || email.matchedAccountName || 'Tender'} active review clusters.`
                  : `Task will be logged under ${matchedAccount?.name || email.matchedAccountName || 'Account'} 360° workspace.`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleDestination}
            className="px-2.5 py-1.5 rounded-md border border-slate-300 hover:bg-white text-[11px] font-semibold text-slate-700 transition flex items-center gap-1 cursor-pointer shrink-0"
          >
            <ArrowLeftRight className="w-3 h-3 text-slate-400" />
            <span>Switch Destination</span>
          </button>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Task Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Provide Thales Luna HSM firmware validation report"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-semibold"
            />
          </div>

          {/* Section & Priority Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                {routingDestination === 'rfp_workdesk' ? 'RFP Work Desk Section' : 'Account Section'}
              </label>
              <select
                value={targetSection}
                onChange={(e) => setTargetSection(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              >
                {routingDestination === 'rfp_workdesk'
                  ? rfpSections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.label}
                      </option>
                    ))
                  : crmSections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.label}
                      </option>
                    ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskCreationDraft['priority'])}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              >
                <option value="Urgent">Urgent (SLA &lt; 24h)</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Assignee & Due Date Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Assigned Team Member
              </label>
              <input
                type="text"
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                placeholder="Assignee name..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Target Due Date (TCT)
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none text-xs"
              />
            </div>
          </div>

          {/* Description & Extracted Snippet */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Description & Email Snippet Justification
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none text-xs font-sans leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <span className="text-[11px] text-slate-400">
              Auto-links email reference: {email.internetMessageId.slice(0, 24)}...
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {routingDestination === 'rfp_workdesk'
                    ? 'Dispatch to RFP Work Desk'
                    : 'Log in Account Workspace'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
