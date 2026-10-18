import React, { useState } from 'react';
import {
  Task,
  TaskSection,
  TaskStatus,
  InteractionTag,
  TaskDocument,
  ChecklistOwnerType,
  SubmissionChecklistItem,
  ReviewScheduleItem,
} from '../../types/crm';
import { useCrm } from '../../context/CrmContext';
import { deriveTaskStatus } from '../../utils/calculations';
import {
  X,
  MessageSquare,
  Handshake,
  Calendar,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  User,
  Tag,
  Building,
  Check,
  Maximize2,
  Minimize2,
  Sparkles,
  ShieldCheck,
  Plus,
  Mail,
  Phone,
  MessageCircle,
  Users,
  Paperclip,
  Upload,
  Trash2,
  FileText,
  Download,
  History,
  GitFork,
  CornerDownRight,
  CheckSquare,
  Square,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';
import { ItemAuditTrailModal } from '../common/ItemAuditTrailModal';

interface TaskBubbleEditorProps {
  task: Task;
  onClose: () => void;
  onPopOut?: () => void;
  isInline?: boolean;
}

export const TaskBubbleEditor: React.FC<TaskBubbleEditorProps> = ({
  task,
  onClose,
  onPopOut,
  isInline = false,
}) => {
  const {
    tasks,
    updateTask,
    completeTask,
    canCompleteTask,
    addTask,
    addCommentToTask,
    accounts,
    currentUser,
    users,
  } = useCrm();

  const liveTask = tasks.find((t) => t.id === task.id) || task;
  const account = accounts.find((a) => a.id === task.accountId);
  const isPartnerUser = currentUser.role === 'Partner';

  // Sub-tasks for this task
  const childSubTasks = tasks.filter((t) => t.parentTaskId === liveTask.id);
  const incompleteChildSubTasks = childSubTasks.filter(
    (t) => !t.completedAt && t.status !== 'Completed' && t.status !== 'Completed Late'
  );
  const completedChildSubTasks = childSubTasks.filter(
    (t) => Boolean(t.completedAt) || t.status === 'Completed' || t.status === 'Completed Late'
  );

  const [subTaskWarning, setSubTaskWarning] = useState<{
    incompleteSubTasks: Task[];
  } | null>(null);

  // New sub-task input inside editor
  const [isAddingSubTask, setIsAddingSubTask] = useState(false);
  const [newSubTaskName, setNewSubTaskName] = useState('');
  const [newSubTaskDesc, setNewSubTaskDesc] = useState('');
  const [newSubTaskAssignee, setNewSubTaskAssignee] = useState(currentUser.id);
  const [newSubTaskPriority, setNewSubTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newSubTaskTct, setNewSubTaskTct] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16)
  );

  const handleAddSubTask = (e: React.FormEvent) => {
    e.preventDefault();
    const taskName = newSubTaskName.trim() || newSubTaskDesc.trim();
    const taskDesc = newSubTaskDesc.trim() || newSubTaskName.trim();
    if (!taskName && !taskDesc) return;
    addTask({
      accountId: liveTask.accountId,
      parentTaskId: liveTask.id,
      relatedSection: liveTask.relatedSection,
      name: taskName,
      description: taskDesc,
      creatorId: currentUser.id,
      assigneeId: newSubTaskAssignee,
      tct: new Date(newSubTaskTct).toISOString(),
      priority: newSubTaskPriority,
      isActivity: true,
      interactionTag: 'email',
      interactionTags: ['email'],
      partnerTag: liveTask.partnerTag,
      partnerTags: liveTask.partnerTags,
    });
    setNewSubTaskName('');
    setNewSubTaskDesc('');
    setIsAddingSubTask(false);
  };

  // RFP Submission Checklist & Review Schedule Editing Handlers
  const handleUpdateChecklistItem = (itemId: string, updates: Partial<SubmissionChecklistItem>) => {
    if (!liveTask.submissionChecklist) return;
    const updatedList = liveTask.submissionChecklist.map((item) =>
      item.id === itemId ? { ...item, ...updates } : item
    );
    updateTask({
      ...liveTask,
      submissionChecklist: updatedList,
    });
  };

  const handleUpdateReviewScheduleItem = (itemId: string, updates: Partial<ReviewScheduleItem>) => {
    if (!liveTask.reviewSchedule) return;
    const updatedSchedule = liveTask.reviewSchedule.map((item) =>
      item.id === itemId ? { ...item, ...updates } : item
    );
    updateTask({
      ...liveTask,
      reviewSchedule: updatedSchedule,
    });
  };

  const handleExportChecklistCsv = () => {
    if (!liveTask.submissionChecklist) return;
    const headers = ['Document Name', 'Description', 'Mandatory', 'Owner', 'Assigned SI Partner', 'Status', 'Notes'];
    const rows = liveTask.submissionChecklist.map((item) => [
      `"${item.documentName.replace(/"/g, '""')}"`,
      `"${(item.description || '').replace(/"/g, '""')}"`,
      item.mandatory ? 'Yes' : 'No',
      item.owner,
      `"${(item.assignedPartnerName || '').replace(/"/g, '""')}"`,
      item.status,
      `"${(item.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${liveTask.name || 'Submission_Checklist'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportReviewScheduleCsv = () => {
    if (!liveTask.reviewSchedule) return;
    const headers = ['Clause Ref', 'Category', 'Title', 'Description', 'Owner / Role', 'Risk / Impact', 'Status', 'Notes'];
    const rows = liveTask.reviewSchedule.map((item) => [
      `"${(item.clauseRef || '').replace(/"/g, '""')}"`,
      `"${(item.category || '').replace(/"/g, '""')}"`,
      `"${item.title.replace(/"/g, '""')}"`,
      `"${(item.description || '').replace(/"/g, '""')}"`,
      `"${(item.ownerOrRole || '').replace(/"/g, '""')}"`,
      item.riskOrImpact,
      item.status,
      `"${(item.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${liveTask.name || 'Review_Schedule'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Safe defaults for all state
  const [name, setName] = useState(task.name || '');
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>(task.priority || 'Medium');
  const [completedAt, setCompletedAt] = useState<string | undefined>(task.completedAt);
  const [section, setSection] = useState<TaskSection>(task.relatedSection || 'General');

  const safeTct = task.tct
    ? (() => {
        try {
          return new Date(task.tct).toISOString().slice(0, 16);
        } catch {
          return new Date().toISOString().slice(0, 16);
        }
      })()
    : new Date().toISOString().slice(0, 16);

  const [tct, setTct] = useState(safeTct);

  // Status is automatically calculated and is NOT an editable field
  // Only the complete button leads to a change in status
  const status: TaskStatus = deriveTaskStatus(tct, completedAt);

  // Multi interaction tags at Task level (explicit + auto-aggregated from comments)
  const initialTaskTags: InteractionTag[] = Array.from(
    new Set([
      ...(task.interactionTags || []),
      ...(task.interactionTag ? [task.interactionTag] : []),
      ...((task.comments || []).map((c) => c.interactionTag).filter(Boolean) as InteractionTag[]),
    ])
  );

  const [interactionTags, setInteractionTags] = useState<InteractionTag[]>(initialTaskTags);
  const [newCommentTag, setNewCommentTag] = useState<InteractionTag | undefined>(undefined);

  const handleToggleTaskTag = (tag: InteractionTag) => {
    setInteractionTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Multi-partner tags
  const initialPartnerTags = Array.from(
    new Set([
      ...(task.partnerTags || []),
      ...(task.partnerTag ? [task.partnerTag] : []),
    ])
  ).filter(Boolean);

  const [partnerTags, setPartnerTags] = useState<string[]>(initialPartnerTags);
  const [customPartnerInput, setCustomPartnerInput] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  // Comment state
  const [newCommentText, setNewCommentText] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // List of available partners across system
  const systemPartners = [
    'Wipro Technologies',
    'Tata Consultancy Services',
    'Accenture APAC',
    'Cognizant US',
    'Infosys Responsible AI Unit',
  ];

  const availablePartners = Array.from(
    new Set([
      ...systemPartners,
      ...(account ? account.partners || [] : []),
    ])
  ).filter(Boolean);

  const handleTogglePartner = (partnerName: string) => {
    setPartnerTags((prev) =>
      prev.includes(partnerName)
        ? prev.filter((p) => p !== partnerName)
        : [...prev, partnerName]
    );
  };

  const handleAddCustomPartner = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customPartnerInput.trim();
    if (trimmed && !partnerTags.includes(trimmed)) {
      setPartnerTags((prev) => [...prev, trimmed]);
      setCustomPartnerInput('');
      setIsAddingCustom(false);
    }
  };

  const handleRemovePartner = (partnerName: string) => {
    setPartnerTags((prev) => prev.filter((p) => p !== partnerName));
  };

  const handleCompleteTask = () => {
    const nowIso = new Date().toISOString();
    setCompletedAt(nowIso);
  };

  const handleReopenTask = () => {
    setCompletedAt(undefined);
  };

  // Documents / File uploads state
  const [documents, setDocuments] = useState<TaskDocument[]>(task.documents || []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newDocs: TaskDocument[] = Array.from(files).map((file) => {
      let sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      if (file.size > 1024 * 1024) {
        sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      }
      return {
        id: `tdoc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        size: sizeStr,
        uploadedBy: currentUser.name,
        timestamp: new Date().toISOString(),
        type: file.type || 'application/octet-stream',
      };
    });

    const updatedDocs = [...documents, ...newDocs];
    setDocuments(updatedDocs);
    updateTask({
      ...liveTask,
      documents: updatedDocs,
    });
    e.target.value = '';
  };

  const handleAddSampleDoc = (name: string, size: string) => {
    const sampleDoc: TaskDocument = {
      id: `tdoc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      size,
      uploadedBy: currentUser.name,
      timestamp: new Date().toISOString(),
      type: 'application/pdf',
    };
    const updatedDocs = [...documents, sampleDoc];
    setDocuments(updatedDocs);
    updateTask({
      ...liveTask,
      documents: updatedDocs,
    });
  };

  const handleRemoveDoc = (docId: string) => {
    const updatedDocs = documents.filter((d) => d.id !== docId);
    setDocuments(updatedDocs);
    updateTask({
      ...liveTask,
      documents: updatedDocs,
    });
  };

  const commentsList = liveTask.comments || task.comments || [];

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const calculatedStatus = deriveTaskStatus(tct, completedAt);

    // Aggregate all interaction tags: Task-level tags + all comment tags
    const allInteractionTags = Array.from(
      new Set([
        ...interactionTags,
        ...(commentsList.map((c) => c.interactionTag).filter(Boolean) as InteractionTag[]),
      ])
    );

    const updatedTask: Task = {
      ...liveTask,
      name: name.trim() || undefined,
      description: description.trim(),
      priority,
      status: calculatedStatus,
      relatedSection: section,
      tct: new Date(tct).toISOString(),
      interactionTag: allInteractionTags[0] || undefined,
      interactionTags: allInteractionTags,
      partnerTag: partnerTags[0] || undefined,
      partnerTags: partnerTags,
      comments: commentsList,
      documents: documents,
      completedAt: completedAt,
    };

    updateTask(updatedTask);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 500);
  };

  const handleAddComment = (e?: React.FormEvent, presetText?: string, presetTag?: InteractionTag) => {
    if (e) e.preventDefault();
    const textToAdd = presetText || newCommentText.trim();
    if (!textToAdd) return;

    const tagToApply = presetTag !== undefined ? presetTag : newCommentTag;

    addCommentToTask(task.id, textToAdd, tagToApply);

    // A Comment level tag gets automatically added to the Task as well!
    if (tagToApply) {
      setInteractionTags((prev) =>
        prev.includes(tagToApply) ? prev : [...prev, tagToApply]
      );
    }

    setNewCommentText('');
    setNewCommentTag(undefined);
  };

  const quickNotes: { text: string; tag: InteractionTag }[] = [
    { text: 'Sent proposal response email with rate card to committee.', tag: 'email' },
    { text: 'Held technical alignment call with delivery team.', tag: 'call' },
    { text: 'Shared instant SLA confirmation on WhatsApp with VP.', tag: 'whatsapp' },
    { text: 'Conducted in-person executive review at client office.', tag: 'in-person' },
  ];

  // Aggregated list of all comment-level interaction tags + task level interaction tags
  const allActiveInteractionTags: InteractionTag[] = Array.from(
    new Set([
      ...interactionTags,
      ...(liveTask.interactionTags || []),
      ...(liveTask.interactionTag ? [liveTask.interactionTag] : []),
      ...(commentsList.map((c) => c.interactionTag).filter(Boolean) as InteractionTag[]),
    ])
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden text-xs">
      {/* Speech Bubble Header */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
            <MessageSquare className="w-4 h-4 text-slate-200" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-900 text-sm">
                {liveTask.name || name || 'Task Bubble Editor'}
              </h3>
              {!isPartnerUser && partnerTags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {partnerTags.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-medium bg-slate-200 text-slate-800 border border-slate-300"
                      title={`Partner SI: ${p}`}
                    >
                      <Handshake className="w-2.5 h-2.5 text-slate-600" />
                      <span>Partner: {p}</span>
                    </span>
                  ))}
                </div>
              )}
              {allActiveInteractionTags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {allActiveInteractionTags.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1 text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded border ${
                        tag === 'whatsapp'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : tag === 'email'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : tag === 'call'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                      title={`Interaction channel: ${tag}`}
                    >
                      {tag === 'whatsapp' && <MessageCircle className="w-2.5 h-2.5 text-emerald-600" />}
                      {tag === 'email' && <Mail className="w-2.5 h-2.5 text-sky-600" />}
                      {tag === 'call' && <Phone className="w-2.5 h-2.5 text-indigo-600" />}
                      {tag === 'in-person' && <Users className="w-2.5 h-2.5 text-amber-600" />}
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Account: <strong>{account?.name || 'Unassigned'}</strong> · Pop-up Task Bubble
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsAuditModalOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-medium text-xs transition"
            title="View immutable audit trail of changes for this task"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Audit Trail ({liveTask.fieldAuditTrail?.length || 0})</span>
          </button>
          {onPopOut && isInline && (
            <button
              onClick={onPopOut}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition"
              title="Pop out to floating window"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bubble Body */}
      <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
        {/* Main Task Form */}
        <form id={`task-bubble-form-${task.id}`} onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="font-semibold text-slate-800 block mb-1 text-xs">
              Task Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Submit Revised SBI PETs Rate Card"
              className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
            />
          </div>

          {/* Task Description Component - Dedicated Component Visible Inside Task Bubble */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>Task Description</span>
              </label>
              <span className="text-[10px] text-slate-500 font-medium">
                Scope & Requirements (Visible inside bubble)
              </span>
            </div>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of task deliverables, technical requirements, and context..."
              className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white shadow-2xs leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Target TCT */}
            <div>
              <label className="font-medium text-slate-700 block mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Target TCT *</span>
              </label>
              <input
                type="datetime-local"
                required
                value={tct}
                onChange={(e) => setTct(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 font-medium text-xs bg-white"
              />
            </div>

            {/* Status & SLA - Calculated automatically, not an editable field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-slate-700 block text-xs">
                  Status & SLA
                </label>
                <span className="text-[10px] text-slate-400 font-normal">
                  Auto-calculated
                </span>
              </div>
              <div
                className={`p-2 border rounded-lg min-h-[38px] flex flex-col justify-between ${
                  status === 'Completed'
                    ? 'bg-slate-100/90 border-slate-300 text-slate-800'
                    : status === 'Completed Late'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : status === 'Overdue'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-xs flex items-center gap-1.5">
                    {status === 'Completed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
                    ) : status === 'Completed Late' ? (
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                    ) : status === 'Overdue' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span>{status}</span>
                  </span>
                  <span className="text-[10px] font-medium opacity-80">
                    {status === 'Completed'
                      ? 'On-Time'
                      : status === 'Completed Late'
                      ? 'Late SLA'
                      : status === 'Overdue'
                      ? 'Past TCT'
                      : 'Within TCT'}
                  </span>
                </div>

                <div className="mt-1.5 pt-1.5 border-t border-slate-200/80 flex items-center justify-between">
                  {!completedAt ? (
                    <button
                      type="button"
                      onClick={handleCompleteTask}
                      className="w-full inline-flex items-center justify-center gap-1 py-1 px-2 rounded bg-slate-900 text-white font-medium text-[11px] hover:bg-slate-800 transition shadow-2xs"
                      title="Only the complete button will lead to a change in status"
                    >
                      <Check className="w-3 h-3 text-slate-200" />
                      <span>Complete Task</span>
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 truncate">
                        Finished: {new Date(completedAt).toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        onClick={handleReopenTask}
                        className="text-[10px] text-slate-600 hover:text-slate-900 underline font-medium"
                        title="Reopen task to recalculate SLA against TCT"
                      >
                        Reopen
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="font-medium text-slate-700 block mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 font-medium text-xs bg-white"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Sub-Section */}
            <div className={isPartnerUser ? "sm:col-span-2" : ""}>
              <label className="font-medium text-slate-700 block mb-1">
                Sub-Section
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value as TaskSection)}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 text-xs bg-white"
              >
                <option value="General">General</option>
                <option value="Technical Proposal">Technical Proposal</option>
                <option value="Commercial Proposal">Commercial Proposal</option>
                <option value="Infra & SBOM">Infra & SBOM</option>
                <option value="Demo">Demo</option>
                <option value="Contact">Contact</option>
              </select>
            </div>

            {/* Tag Partner to Task (Multi-Partner SI Tagging) */}
            <div className={isPartnerUser ? "hidden" : "space-y-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200"}>
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Handshake className="w-3.5 h-3.5 text-slate-600" />
                  <span>Partner SIs (Multi-SI Bids)</span>
                </label>
                <span className="text-[10px] text-slate-500 font-medium bg-slate-200/70 px-1.5 py-0.5 rounded border border-slate-300/80">
                  Internal Item · Hidden from Partners
                </span>
              </div>

              {/* Active Tagged Partners */}
              <div className="min-h-[34px] p-2 bg-white rounded-lg border border-slate-300 flex flex-wrap items-center gap-1.5">
                {partnerTags.length === 0 ? (
                  <span className="text-[11px] text-slate-400 italic">
                    No partner tagged (Internal PrivaSapien only)
                  </span>
                ) : (
                  partnerTags.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-300 shadow-2xs"
                    >
                      <Handshake className="w-3 h-3 text-slate-500" />
                      <span>{p}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePartner(p)}
                        className="text-slate-400 hover:text-slate-700 ml-0.5 hover:bg-slate-200 rounded p-0.5"
                        title={`Remove ${p}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Quick Select Partner SIs */}
              <div>
                <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Available System Integrators:</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingCustom(!isAddingCustom)}
                    className="text-slate-600 hover:text-slate-900 underline text-[10px]"
                  >
                    {isAddingCustom ? 'Cancel custom' : '+ Add custom partner'}
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {availablePartners.map((p) => {
                    const isSelected = partnerTags.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleTogglePartner(p)}
                        className={`text-[10px] px-2 py-1 rounded-md font-medium transition flex items-center gap-1 border ${
                          isSelected
                            ? 'bg-slate-800 text-white border-slate-900 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-3 h-3 text-slate-200" />
                        ) : (
                          <Plus className="w-3 h-3 text-slate-400" />
                        )}
                        <span>{p}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Partner Input */}
                {isAddingCustom && (
                  <div className="mt-2 flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Enter partner name (e.g. Tech Mahindra, HCL)..."
                      value={customPartnerInput}
                      onChange={(e) => setCustomPartnerInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomPartner();
                        }
                      }}
                      className="flex-1 p-1.5 border border-slate-300 rounded-lg text-slate-800 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomPartner}
                      disabled={!customPartnerInput.trim()}
                      className="px-2.5 py-1.5 bg-slate-800 text-white font-medium rounded-lg text-xs hover:bg-slate-700 disabled:opacity-40"
                    >
                      Add
                    </button>
                  </div>
                )}

                <p className="text-[10px] text-slate-500 mt-1.5 leading-normal">
                  Especially for RFPs, multiple System Integrators can be partnered. Partner users only see tasks assigned to them; other partner tags remain confidential and strictly hidden.
                </p>
              </div>
            </div>
          </div>

          {/* Task-Level Interaction Channel Tags */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-medium text-slate-800 text-xs flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span>Interaction Channel Tags (Task Level)</span>
              </label>
              <span className="text-[10px] text-slate-400">
                Multi-channel taggable · Syncs with comments
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'email', label: 'Email', icon: Mail, activeClass: 'bg-sky-100 text-sky-900 border-sky-300' },
                  { id: 'call', label: 'Call', icon: Phone, activeClass: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
                  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, activeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
                  { id: 'in-person', label: 'In-Person', icon: Users, activeClass: 'bg-amber-100 text-amber-900 border-amber-300' },
                ] as const
              ).map(({ id, label, icon: Icon, activeClass }) => {
                const isSelected = interactionTags.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleToggleTaskTag(id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                      isSelected
                        ? `${activeClass} shadow-2xs`
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{label}</span>
                    {isSelected && <Check className="w-3 h-3 text-slate-700" />}
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] text-slate-500 leading-normal">
              Tag submission, response email, calls, or messaging. Any channel used in a comment is automatically added here as well.
            </p>
          </div>
        </form>

        {/* Specialized RFP Review Tables: Submission Checklist or Clause Schedule */}
        {liveTask.submissionChecklist && liveTask.submissionChecklist.length > 0 && (
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Submission Documents Checklist ({liveTask.submissionChecklist.length} Required Items)
                  </h4>
                  {liveTask.sourceDocumentName && (
                    <p className="text-[11px] text-slate-500">
                      Auto-extracted from RFP tender document: <strong>{liveTask.sourceDocumentName}</strong>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportChecklistCsv}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-300 shadow-2xs transition"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export to Excel / CSV</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <th className="py-2.5 px-3">Required Document</th>
                    <th className="py-2.5 px-3">Mandatory</th>
                    <th className="py-2.5 px-3">Responsibility Owner</th>
                    <th className="py-2.5 px-3">Assigned SI Partner</th>
                    <th className="py-2.5 px-3">Fulfillment Status</th>
                    <th className="py-2.5 px-3">Review Notes / Attestation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {liveTask.submissionChecklist.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-3 max-w-xs">
                        <div className="font-semibold text-slate-900 text-xs">{item.documentName}</div>
                        {item.description && (
                          <div className="text-[11px] text-slate-500 line-clamp-1">{item.description}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {item.mandatory ? (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Mandatory
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            Optional
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <select
                          value={item.owner}
                          onChange={(e) =>
                            handleUpdateChecklistItem(item.id, {
                              owner: e.target.value as ChecklistOwnerType,
                            })
                          }
                          className="px-2 py-1 text-xs border border-slate-300 rounded font-medium bg-white"
                        >
                          <option value="OEM">OEM Only</option>
                          <option value="SI Partner">SI Partner</option>
                          <option value="Both">Both (Joint Consortium)</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {item.owner === 'OEM' ? (
                          <span className="text-[11px] text-slate-400 italic">PrivaSapien (OEM)</span>
                        ) : (
                          <select
                            value={item.assignedPartnerName || ''}
                            onChange={(e) =>
                              handleUpdateChecklistItem(item.id, {
                                assignedPartnerName: e.target.value,
                              })
                            }
                            className="px-2 py-1 text-xs border border-indigo-300 rounded text-indigo-900 bg-indigo-50/30 font-medium"
                          >
                            <option value="">Select Account Partner...</option>
                            {(account?.partners || ['Wipro Technologies', 'Infosys', 'TCS']).map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <select
                          value={item.status}
                          onChange={(e) =>
                            handleUpdateChecklistItem(item.id, {
                              status: e.target.value as any,
                            })
                          }
                          className={`px-2 py-1 text-xs border rounded font-semibold ${
                            item.status === 'Ready'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : item.status === 'Submitted'
                              ? 'bg-sky-50 text-sky-800 border-sky-300'
                              : item.status === 'In Progress'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-slate-50 text-slate-700 border-slate-300'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Ready">Ready / Packaged</option>
                          <option value="Submitted">Submitted</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3 max-w-xs">
                        <input
                          type="text"
                          value={item.notes || ''}
                          onChange={(e) =>
                            handleUpdateChecklistItem(item.id, {
                              notes: e.target.value,
                            })
                          }
                          placeholder="Add attestation note or signed file ref..."
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {liveTask.reviewSchedule && liveTask.reviewSchedule.length > 0 && (
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Tender Review Schedule ({liveTask.reviewSchedule.length} Tracked Clauses)
                  </h4>
                  {liveTask.sourceDocumentName && (
                    <p className="text-[11px] text-slate-500">
                      RFP Source Document: <strong>{liveTask.sourceDocumentName}</strong>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportReviewScheduleCsv}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-300 shadow-2xs transition"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export to Excel / CSV</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <th className="py-2.5 px-3">Clause Ref</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Title & Requirement Scope</th>
                    <th className="py-2.5 px-3">Responsible Role</th>
                    <th className="py-2.5 px-3">Risk Level</th>
                    <th className="py-2.5 px-3">Review Status</th>
                    <th className="py-2.5 px-3">Legal / Delivery Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {liveTask.reviewSchedule.map((clause) => (
                    <tr key={clause.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-700 whitespace-nowrap">
                        {clause.clauseRef}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {clause.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 max-w-sm">
                        <div className="font-semibold text-slate-900 text-xs">{clause.title}</div>
                        {clause.description && (
                          <div className="text-[11px] text-slate-500 line-clamp-1">{clause.description}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-700">
                        {clause.ownerOrRole}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            clause.riskOrImpact === 'High'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : clause.riskOrImpact === 'Medium'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-50 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {clause.riskOrImpact} Risk
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <select
                          value={clause.status}
                          onChange={(e) =>
                            handleUpdateReviewScheduleItem(clause.id, {
                              status: e.target.value as any,
                            })
                          }
                          className={`px-2 py-1 text-xs border rounded font-semibold ${
                            clause.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : clause.status === 'Flagged'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : clause.status === 'Reviewed'
                              ? 'bg-sky-50 text-sky-800 border-sky-300'
                              : 'bg-slate-50 text-slate-700 border-slate-300'
                          }`}
                        >
                          <option value="Pending">Pending Review</option>
                          <option value="Flagged">Flagged / Deviation</option>
                          <option value="Reviewed">Reviewed</option>
                          <option value="Approved">Approved</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3 max-w-xs">
                        <input
                          type="text"
                          value={clause.notes || ''}
                          onChange={(e) =>
                            handleUpdateReviewScheduleItem(clause.id, {
                              notes: e.target.value,
                            })
                          }
                          placeholder="Add comments or pre-bid query draft..."
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tasks & Sub-Tasks Capability Section */}
        <div className="pt-3.5 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <GitFork className="w-4 h-4 text-sky-600" />
              <h4 className="font-semibold text-slate-900 text-xs">
                Sub-Tasks ({childSubTasks.length})
              </h4>
              {childSubTasks.length > 0 && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    incompleteChildSubTasks.length === 0
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {incompleteChildSubTasks.length === 0
                    ? `✓ All ${childSubTasks.length} Completed`
                    : `${completedChildSubTasks.length}/${childSubTasks.length} Completed`}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsAddingSubTask(!isAddingSubTask)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 font-medium text-[11px] transition shadow-2xs"
            >
              <Plus className="w-3 h-3" />
              <span>{isAddingSubTask ? 'Cancel' : 'Add Sub-Task'}</span>
            </button>
          </div>

          {/* Sub-Task info notice */}
          <div className="text-[10px] text-slate-500 mb-2 bg-slate-50 p-2 rounded border border-slate-200">
            A Task cannot be completed until all its Sub-Tasks are marked Done. A task can have as many sub-tasks as required.
          </div>

          {/* Inline Add Sub-Task Form */}
          {isAddingSubTask && (
            <form onSubmit={handleAddSubTask} className="mb-3 p-3 bg-sky-50/50 rounded-lg border border-sky-200 space-y-2 text-xs">
              <div className="font-semibold text-sky-900 text-xs">New Sub-Task</div>
              <div>
                <input
                  type="text"
                  required
                  placeholder="Sub-Task Name (displayed in list)..."
                  value={newSubTaskName}
                  onChange={(e) => setNewSubTaskName(e.target.value)}
                  className="w-full p-2 border border-sky-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 mb-1.5"
                />
                <input
                  type="text"
                  placeholder="Sub-Task Description (visible inside task bubble)..."
                  value={newSubTaskDesc}
                  onChange={(e) => setNewSubTaskDesc(e.target.value)}
                  className="w-full p-2 border border-sky-200 rounded text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-slate-600 block mb-0.5">Assignee</label>
                  <select
                    value={newSubTaskAssignee}
                    onChange={(e) => setNewSubTaskAssignee(e.target.value)}
                    className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800"
                  >
                    {(users || []).map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-slate-600 block mb-0.5">Target TCT</label>
                  <input
                    type="datetime-local"
                    value={newSubTaskTct}
                    onChange={(e) => setNewSubTaskTct(e.target.value)}
                    className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-slate-600 block mb-0.5">Priority</label>
                  <select
                    value={newSubTaskPriority}
                    onChange={(e) => setNewSubTaskPriority(e.target.value as any)}
                    className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingSubTask(false)}
                  className="px-2.5 py-1 text-slate-600 text-xs hover:bg-slate-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs rounded transition"
                >
                  Create Sub-Task
                </button>
              </div>
            </form>
          )}

          {/* Sub-Tasks List */}
          {childSubTasks.length === 0 ? (
            <div className="py-2.5 text-center text-slate-400 text-xs bg-slate-50 rounded-lg border border-slate-200">
              No sub-tasks yet for this task. Click "+ Add Sub-Task" to add children.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {childSubTasks.map((st) => {
                const isSubDone = Boolean(st.completedAt) || st.status === 'Completed' || st.status === 'Completed Late';
                const assigneeUser = users?.find((u) => u.id === st.assigneeId);
                return (
                  <div
                    key={st.id}
                    className={`flex items-center justify-between gap-2 p-2 rounded-lg border transition text-xs ${
                      isSubDone
                        ? 'bg-emerald-50/30 border-emerald-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <CornerDownRight className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-1 py-0.2 rounded border border-sky-200 uppercase tracking-wider shrink-0">
                        Sub-Task
                      </span>
                      <div className="min-w-0">
                        <div
                          className={`truncate ${
                            isSubDone ? 'line-through text-slate-400 font-normal' : 'font-medium text-slate-800'
                          }`}
                        >
                          {st.name || st.description}
                        </div>
                        {st.name && st.description && st.description !== st.name && (
                          <div className="text-[10px] text-slate-500 truncate">
                            {st.description}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        · {assigneeUser?.name || 'Assignee'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                          st.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : st.status === 'Completed Late'
                            ? 'bg-amber-100 text-amber-800'
                            : st.status === 'Overdue'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {st.status}
                      </span>

                      {!isSubDone ? (
                        <button
                          type="button"
                          onClick={() => {
                            completeTask(st.id);
                            if (subTaskWarning) {
                              const remaining = subTaskWarning.incompleteSubTasks.filter((t) => t.id !== st.id);
                              if (remaining.length === 0) setSubTaskWarning(null);
                              else setSubTaskWarning({ incompleteSubTasks: remaining });
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-[11px] font-medium transition"
                          title="Complete this sub-task"
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Done</span>
                        </button>
                      ) : (
                        <span className="text-emerald-700 text-[11px] font-medium flex items-center gap-0.5">
                          <Check className="w-3 h-3 text-emerald-600" /> Done
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Task Documents & Attachments Section */}
        <div className="pt-3.5 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-slate-500" />
              <h4 className="font-semibold text-slate-900 text-xs">
                Task Documents & Deliverables ({documents.length})
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor={`task-file-upload-${task.id}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-[11px] cursor-pointer transition shadow-2xs"
              >
                <Upload className="w-3 h-3" />
                <span>Upload Multiple Files</span>
              </label>
              <input
                id={`task-file-upload-${task.id}`}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Quick sample attachments */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
            <span className="text-[10px] text-slate-400 font-medium">Quick attachments:</span>
            <button
              type="button"
              onClick={() => handleAddSampleDoc('SBI_RFP_Technical_Submission_v4.pdf', '2.8 MB')}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
            >
              + Technical Submission PDF
            </button>
            <button
              type="button"
              onClick={() => handleAddSampleDoc('Commercial_Rate_Card_Signed.xlsx', '850 KB')}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
            >
              + Signed Rate Card
            </button>
            <button
              type="button"
              onClick={() => handleAddSampleDoc('FIPS_Security_Attestation_Cert.pdf', '1.4 MB')}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
            >
              + Security Cert
            </button>
          </div>

          {/* Document list */}
          {documents.length === 0 ? (
            <div className="py-4 text-center text-slate-400 text-xs bg-slate-50 rounded-lg border border-slate-200 flex flex-col items-center justify-center gap-1">
              <Paperclip className="w-5 h-5 text-slate-300" />
              <span>No documents uploaded for this task yet.</span>
              <span className="text-[10px] text-slate-400">Click &quot;Upload Multiple Files&quot; above to attach RFP proposals, spreadsheets, or certificates.</span>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-600">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate text-xs" title={doc.name}>
                        {doc.name}
                      </p>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2">
                        <span>{doc.size}</span>
                        <span>·</span>
                        <span>{doc.uploadedBy}</span>
                        <span>·</span>
                        <span>{new Date(doc.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const blob = new Blob([`Sample document content for ${doc.name}`], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = doc.name;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition"
                      title="Download file"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(doc.id)}
                      className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                      title="Delete file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Unlimited Comments Section */}
        <div className="pt-3.5 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-500" />
              <h4 className="font-semibold text-slate-900 text-xs">
                Task Discussion & Comments ({commentsList.length})
              </h4>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Add unlimited channel-tagged updates
            </span>
          </div>

          {/* Quick Note Presets */}
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {quickNotes.map((note, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddComment(undefined, note.text, note.tag)}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition inline-flex items-center gap-1"
                title={`Log comment with channel: ${note.tag}`}
              >
                {note.tag === 'email' && <Mail className="w-2.5 h-2.5 text-sky-600" />}
                {note.tag === 'call' && <Phone className="w-2.5 h-2.5 text-indigo-600" />}
                {note.tag === 'whatsapp' && <MessageCircle className="w-2.5 h-2.5 text-emerald-600" />}
                {note.tag === 'in-person' && <Users className="w-2.5 h-2.5 text-amber-600" />}
                <span>+ {note.text.slice(0, 34)}...</span>
              </button>
            ))}
          </div>

          {/* Comments List */}
          <div className="space-y-2 mb-3 max-h-40 overflow-y-auto pr-1">
            {commentsList.length === 0 ? (
              <div className="py-3 text-center text-slate-400 text-xs bg-slate-50 rounded-lg border border-slate-200">
                No comments logged yet. Use the field below to add an update.
              </div>
            ) : (
              commentsList.map((comment) => (
                <div
                  key={comment.id}
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {comment.author}
                      </span>
                      {comment.interactionTag && (
                        <span
                          className={`inline-flex items-center gap-1 text-[9px] uppercase font-semibold px-1.5 py-0.2 rounded border ${
                            comment.interactionTag === 'whatsapp'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : comment.interactionTag === 'email'
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : comment.interactionTag === 'call'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {comment.interactionTag === 'whatsapp' && <MessageCircle className="w-2.5 h-2.5 text-emerald-600" />}
                          {comment.interactionTag === 'email' && <Mail className="w-2.5 h-2.5 text-sky-600" />}
                          {comment.interactionTag === 'call' && <Phone className="w-2.5 h-2.5 text-indigo-600" />}
                          {comment.interactionTag === 'in-person' && <Users className="w-2.5 h-2.5 text-amber-600" />}
                          <span>{comment.interactionTag}</span>
                        </span>
                      )}
                    </div>
                    <span>
                      {new Date(comment.timestamp).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed pl-4">{comment.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Add New Comment Input */}
          <form onSubmit={(e) => handleAddComment(e)} className="space-y-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-500 font-medium">Channel tag:</span>
              {(
                [
                  { id: 'email', label: 'Email', icon: Mail },
                  { id: 'call', label: 'Call', icon: Phone },
                  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
                  { id: 'in-person', label: 'In-Person', icon: Users },
                ] as const
              ).map(({ id, label, icon: Icon }) => {
                const isSelected = newCommentTag === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setNewCommentTag((prev) => (prev === id ? undefined : id))}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border transition ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-2.5 h-2.5" />
                    <span>{label}</span>
                  </button>
                );
              })}
              {newCommentTag && (
                <button
                  type="button"
                  onClick={() => setNewCommentTag(undefined)}
                  className="text-[10px] text-slate-400 hover:text-slate-600 underline ml-1"
                >
                  Clear tag
                </button>
              )}
            </div>

            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder={
                  newCommentTag
                    ? `Log ${newCommentTag} update, response note, or decision...`
                    : 'Write a comment, meeting note, or status update...'
                }
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="flex-1 p-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
              >
                <Send className="w-3 h-3" />
                <span>Post Comment</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bubble Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <div>
          {saveSuccess && (
            <span className="text-emerald-700 font-medium text-xs flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Task updated successfully!
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-200/60 font-medium text-xs"
          >
            Cancel
          </button>
          {!completedAt && (
            <div className="relative">
              {subTaskWarning && (
                <div className="absolute bottom-full right-0 mb-3 w-80 bg-white rounded-xl border-2 border-amber-400 p-3 shadow-xl z-30 animate-in fade-in slide-in-from-bottom-2">
                  {/* Pointer arrow pointing down to the button */}
                  <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-b-2 border-r-2 border-amber-400 transform rotate-45" />
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Cannot Complete Task</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSubTaskWarning(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-snug mb-2">
                    This Task has {subTaskWarning.incompleteSubTasks.length} incomplete Sub-Task(s). A Task cannot be completed until all its Sub-Tasks are completed.
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    {subTaskWarning.incompleteSubTasks.map((st) => (
                      <div
                        key={st.id}
                        className="flex items-center justify-between gap-1.5 p-1.5 rounded bg-amber-50 border border-amber-200 text-[11px]"
                      >
                        <span className="font-medium text-slate-800 truncate">{st.description}</span>
                        <button
                          type="button"
                          onClick={() => {
                            completeTask(st.id);
                            const remaining = subTaskWarning.incompleteSubTasks.filter((t) => t.id !== st.id);
                            if (remaining.length === 0) setSubTaskWarning(null);
                            else setSubTaskWarning({ incompleteSubTasks: remaining });
                          }}
                          className="px-2 py-0.5 rounded bg-emerald-600 text-white font-medium text-[10px] hover:bg-emerald-700 shrink-0 transition"
                        >
                          Mark Done
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  const check = canCompleteTask(liveTask.id);
                  if (!check.canComplete) {
                    setSubTaskWarning({ incompleteSubTasks: check.incompleteSubTasks });
                    return;
                  }
                  setSubTaskWarning(null);
                  const nowIso = new Date().toISOString();
                  setCompletedAt(nowIso);
                  const updatedStatus = deriveTaskStatus(tct, nowIso);
                  const allInteractionTags = Array.from(
                    new Set([
                      ...interactionTags,
                      ...((task.comments || []).map((c) => c.interactionTag).filter(Boolean) as InteractionTag[]),
                    ])
                  );
                  updateTask({
                    ...task,
                    description: description.trim(),
                    priority,
                    status: updatedStatus,
                    relatedSection: section,
                    tct: new Date(tct).toISOString(),
                    interactionTag: allInteractionTags[0] || undefined,
                    interactionTags: allInteractionTags,
                    partnerTag: partnerTags[0] || undefined,
                    partnerTags: partnerTags,
                    comments: task.comments || [],
                    documents: documents,
                    completedAt: nowIso,
                  });
                  setSaveSuccess(true);
                  setTimeout(() => {
                    setSaveSuccess(false);
                    onClose();
                  }, 400);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 font-medium text-xs inline-flex items-center gap-1 transition"
                title="Mark task completed and close editor"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Complete & Close</span>
              </button>
            </div>
          )}
          <button
            type="submit"
            form={`task-bubble-form-${task.id}`}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-medium text-xs transition"
          >
            Save Changes
          </button>
        </div>
      </div>

      {isAuditModalOpen && (
        <ItemAuditTrailModal
          title="Task Field Audit Trail"
          subtitle={`Audit log for task: ${liveTask.description.slice(0, 45)}...`}
          entityType="Task"
          entries={liveTask.fieldAuditTrail || []}
          onClose={() => setIsAuditModalOpen(false)}
        />
      )}
    </div>
  );
};
