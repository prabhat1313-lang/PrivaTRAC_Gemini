import React, { useState, useMemo, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  InteractionTag,
  Task,
  TaskSection,
  TaskDocument,
} from '../../types/crm';
import { RfpWorkflowModal } from './RfpWorkflowModal';
import { TaskEditBubbleModal } from './TaskEditBubbleModal';
import { TaskBubbleEditor } from './TaskBubbleEditor';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  TrendingUp,
  FileText,
  User,
  Check,
  Edit2,
  Handshake,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MessageCircle,
  Users,
  Paperclip,
  Upload,
  X,
  Tag,
} from 'lucide-react';

interface TasksViewProps {
  scopedAccountId?: string;
  hideHeaderStats?: boolean;
}

export const TasksView: React.FC<TasksViewProps> = ({
  scopedAccountId,
  hideHeaderStats = false,
}) => {
  const {
    tasks,
    accounts,
    addTask,
    completeTask,
    currentUser,
    isPartnerMode,
    activePartnerName,
  } = useCrm();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [selectedRfpAccount, setSelectedRfpAccount] = useState<any | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeBubbleTaskId, setActiveBubbleTaskId] = useState<string | null>(null);

  // New task form state
  const [newDesc, setNewDesc] = useState('');
  const [newAccountId, setNewAccountId] = useState(scopedAccountId || accounts[0]?.id || '');
  const [newSection, setNewSection] = useState<TaskSection>('General');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newTct, setNewTct] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16)
  );
  const [newTaskTags, setNewTaskTags] = useState<InteractionTag[]>(['email']);
  const [newPartnerTag, setNewPartnerTag] = useState<string>('');
  const [newTaskDocs, setNewTaskDocs] = useState<TaskDocument[]>([]);

  useEffect(() => {
    if (scopedAccountId) {
      setNewAccountId(scopedAccountId);
    }
  }, [scopedAccountId]);

  const handleToggleNewTaskTag = (tag: InteractionTag) => {
    setNewTaskTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleNewTaskFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const docs: TaskDocument[] = Array.from(files).map((f) => {
      let sizeStr = `${(f.size / 1024).toFixed(1)} KB`;
      if (f.size > 1024 * 1024) {
        sizeStr = `${(f.size / (1024 * 1024)).toFixed(1)} MB`;
      }
      return {
        id: `tdoc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: f.name,
        size: sizeStr,
        uploadedBy: currentUser.name,
        timestamp: new Date().toISOString(),
        type: f.type || 'application/octet-stream',
      };
    });
    setNewTaskDocs((prev) => [...prev, ...docs]);
    e.target.value = '';
  };

  const handleAddSampleTaskDoc = (name: string, size: string) => {
    const sample: TaskDocument = {
      id: `tdoc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      size,
      uploadedBy: currentUser.name,
      timestamp: new Date().toISOString(),
      type: 'application/pdf',
    };
    setNewTaskDocs((prev) => [...prev, sample]);
  };

  const accountMap = useMemo(() => {
    const map = new Map();
    accounts.forEach((a) => map.set(a.id, a));
    return map;
  }, [accounts]);

  // If in Partner role, show tasks tagged for this partner
  // If scoped to a specific account, filter exclusively for that account
  const visibleTasks = useMemo(() => {
    let pool = tasks;
    if (scopedAccountId) {
      pool = pool.filter((t) => t.accountId === scopedAccountId);
    }
    if (isPartnerMode) {
      return pool.filter((t) => {
        const acc = accountMap.get(t.accountId);
        return (
          t.partnerTag === activePartnerName ||
          (t.partnerTags && t.partnerTags.includes(activePartnerName)) ||
          (acc && acc.partners && acc.partners.includes(activePartnerName))
        );
      });
    }
    return pool;
  }, [tasks, scopedAccountId, isPartnerMode, activePartnerName, accountMap]);

  const userTasks = visibleTasks.filter(
    (t) => t.assigneeId === currentUser.id || t.creatorId === currentUser.id
  );
  const activitiesCount = userTasks.filter((t) => t.isActivity).length;
  const assignedCount = userTasks.filter((t) => !t.isActivity).length;
  const totalUserTasks = activitiesCount + assignedCount;

  const activityPercent = totalUserTasks > 0 ? Math.round((activitiesCount / totalUserTasks) * 100) : 50;
  const assignedPercent = totalUserTasks > 0 ? Math.round((assignedCount / totalUserTasks) * 100) : 50;

  const hasHighInitiative = activityPercent >= 50;
  const lacksGuidance = assignedPercent < 20;

  const filteredTasks = useMemo(() => {
    return visibleTasks.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (sectionFilter !== 'all' && (t.relatedSection || 'General') !== sectionFilter)
        return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const accName = (accountMap.get(t.accountId)?.name || '').toLowerCase();
        return t.description.toLowerCase().includes(q) || accName.includes(q);
      }
      return true;
    });
  }, [visibleTasks, statusFilter, sectionFilter, searchQuery, accountMap]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    addTask({
      accountId: scopedAccountId || newAccountId,
      relatedSection: newSection,
      description: newDesc.trim(),
      creatorId: currentUser.id,
      assigneeId: currentUser.id,
      tct: new Date(newTct).toISOString(),
      priority: newPriority,
      isActivity: true,
      interactionTag: newTaskTags[0] || undefined,
      interactionTags: newTaskTags,
      partnerTag: newPartnerTag ? newPartnerTag : undefined,
      partnerTags: newPartnerTag ? [newPartnerTag] : undefined,
      documents: newTaskDocs,
    });
    setIsAddTaskOpen(false);
    setNewDesc('');
    setNewPartnerTag('');
    setNewTaskTags(['email']);
    setNewTaskDocs([]);
  };

  return (
    <div className="space-y-5">
      {/* Partner Scoping Notice if in Partner Mode */}
      {isPartnerMode && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Handshake className="w-4 h-4 text-slate-600" />
            <span className="font-semibold text-slate-900">
              Partner Workspace: {activePartnerName}
            </span>
            <span className="text-slate-500">· Showing {filteredTasks.length} tagged tasks</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Confidential isolated partner view
          </span>
        </div>
      )}
      {/* Initiative & Guidance Scoreboard - Subtle Tonal Palette */}
      {!scopedAccountId && !hideHeaderStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Initiative Gauge Card */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                Self-Initiative Ratio
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold text-slate-900 tabular-nums">{activityPercent}%</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                    hasHighInitiative
                      ? 'bg-slate-100 text-slate-700 border-slate-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200/60'
                  }`}
                >
                  {hasHighInitiative ? 'High Initiative (≥50%)' : 'Needs Proactivity'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {activitiesCount} self-activities · {assignedCount} manager assigned
              </p>
            </div>
            <TrendingUp className="w-6 h-6 text-slate-400" />
          </div>

          {/* Guidance Gauge Card */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                Leader Guidance Ratio
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold text-slate-900 tabular-nums">{assignedPercent}%</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                    lacksGuidance
                      ? 'bg-rose-50 text-rose-800 border-rose-200/60'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {lacksGuidance ? 'Guidance Deficit (<20%)' : 'Healthy Guidance'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Tasks assigned by leadership to steer focus
              </p>
            </div>
            <User className="w-6 h-6 text-slate-400" />
          </div>

          {/* RFP Desk Launcher Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                RFP Tenders Desk
              </div>
              <div className="text-xs font-semibold text-slate-900 mt-1">
                Multi-Stage Bid Sub-Workflows
              </div>
              <select
                onChange={(e) => {
                  const target = accounts.find((a) => a.id === e.target.value);
                  if (target) setSelectedRfpAccount(target);
                }}
                value=""
                className="mt-2 px-2.5 py-1 text-xs rounded bg-white text-slate-700 border border-slate-300 font-medium"
              >
                <option value="">Launch RFP Tender Desk...</option>
                {accounts
                  .filter(
                    (a) => a.procurementType === 'Open RFP' || a.procurementType === 'Closed RFP'
                  )
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.procurementType})
                    </option>
                  ))}
              </select>
            </div>
            <FileText className="w-6 h-6 text-slate-400" />
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks by description or account name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="all">All Statuses ({tasks.length})</option>
            <option value="Pending">Pending (Within TCT)</option>
            <option value="Overdue">Overdue (Past TCT)</option>
            <option value="Completed">Completed On-Time</option>
            <option value="Completed Late">Completed Late</option>
          </select>

          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="all">All Sections</option>
            <option value="Technical Proposal">Technical Proposal</option>
            <option value="Commercial Proposal">Commercial Proposal</option>
            <option value="Infra & SBOM">Infra & SBOM</option>
            <option value="Demo">Demo</option>
            <option value="Contact">Contact</option>
            <option value="General">General</option>
          </select>

          {currentUser.role !== 'Partner' && (
            <button
              onClick={() => setIsAddTaskOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-medium uppercase text-[10px] tracking-wider bg-slate-50/50">
              <th className="py-2.5 px-4">Task Description</th>
              <th className="py-2.5 px-4">Account</th>
              <th className="py-2.5 px-4">Section</th>
              <th className="py-2.5 px-4">Target TCT</th>
              <th className="py-2.5 px-4">Status & SLA</th>
              <th className="py-2.5 px-4">Type</th>
              <th className="py-2.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400">
                  No tasks found matching filter criteria.
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => {
                const account = accountMap.get(task.accountId);
                const isBubbleOpen = activeBubbleTaskId === task.id;

                // All task-level and comment-level interaction channel tags
                const taskInteractionTags: InteractionTag[] = Array.from(
                  new Set([
                    ...(task.interactionTags || []),
                    ...(task.interactionTag ? [task.interactionTag] : []),
                    ...((task.comments || []).map((c) => c.interactionTag).filter(Boolean) as InteractionTag[]),
                  ])
                );

                return (
                  <React.Fragment key={task.id}>
                    <tr
                      className={`transition cursor-pointer group ${
                        isBubbleOpen
                          ? 'bg-slate-100/80 border-l-4 border-l-slate-800'
                          : 'hover:bg-slate-50/60'
                      }`}
                      onClick={() => setActiveBubbleTaskId((prev) => (prev === task.id ? null : task.id))}
                    >
                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-medium text-slate-900 leading-relaxed group-hover:text-slate-950">
                          {task.description}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {taskInteractionTags.map((tag) => (
                            <span
                              key={tag}
                              className={`inline-flex items-center gap-1 text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded border ${
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

                          {/* Partner tags: internal PrivaSapien frontend item, hidden for partner users */}
                          {!isPartnerMode && (
                            task.partnerTags && task.partnerTags.length > 0 ? (
                              task.partnerTags.map((p) => (
                                <span
                                  key={p}
                                  className="inline-flex items-center gap-1 text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 font-medium"
                                  title={`Partner SI: ${p}`}
                                >
                                  <Handshake className="w-2.5 h-2.5 text-slate-500" />
                                  <span>{p}</span>
                                </span>
                              ))
                            ) : task.partnerTag ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                <Handshake className="w-3 h-3 text-slate-500" />
                                {task.partnerTag}
                              </span>
                            ) : null
                          )}

                          {task.comments && task.comments.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                              <MessageSquare className="w-3 h-3 text-slate-400" />
                              {task.comments.length}
                            </span>
                          )}

                          {task.documents && task.documents.length > 0 && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 font-medium"
                              title={`${task.documents.length} attached documents`}
                            >
                              <Paperclip className="w-2.5 h-2.5 text-slate-500" />
                              {task.documents.length}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-800">
                        {account?.name || 'Unassigned'}
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[11px] text-slate-600">
                          {task.relatedSection || 'General'}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium tabular-nums">
                        {new Date(task.tct).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                            task.status === 'Completed'
                              ? 'bg-slate-100 text-slate-700 border-slate-200'
                              : task.status === 'Completed Late'
                              ? 'bg-amber-50 text-amber-800 border-amber-200/60'
                              : task.status === 'Overdue'
                              ? 'bg-rose-50 text-rose-800 border-rose-200/60'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-[11px] text-slate-500">
                        {task.isActivity ? 'Self' : 'Assigned'}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit Button */}
                          <button
                            onClick={() => setActiveBubbleTaskId((prev) => (prev === task.id ? null : task.id))}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                              isBubbleOpen
                                ? 'bg-slate-800 text-white border-slate-800'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                            }`}
                            title="Edit task"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          {!task.completedAt ? (
                            <button
                              onClick={() => completeTask(task.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
                            >
                              <Check className="w-3.5 h-3.5 text-slate-600" />
                              Done
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Completed</span>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* INLINE SPEECH-BUBBLE DRAWER */}
                    {isBubbleOpen && (
                      <tr className="bg-slate-100/60 border-b-2 border-slate-300">
                        <td colSpan={7} className="p-3 sm:p-5">
                          <div className="relative max-w-4xl mx-auto">
                            {/* Speech Bubble Arrow pointing up */}
                            <div className="absolute -top-3 left-10 w-5 h-5 bg-white border-t border-l border-slate-300 transform rotate-45 z-10" />
                            <TaskBubbleEditor
                              task={task}
                              isInline={true}
                              onClose={() => setActiveBubbleTaskId(null)}
                              onPopOut={() => {
                                setEditingTask(task);
                                setActiveBubbleTaskId(null);
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Task Edit Pop-up Bubble Modal */}
      {editingTask && (
        <TaskEditBubbleModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}

      {/* RFP Modal */}
      {selectedRfpAccount && (
        <RfpWorkflowModal
          account={selectedRfpAccount}
          onClose={() => setSelectedRfpAccount(null)}
        />
      )}

      {/* Add Task Modal */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg p-5">
            <h3 className="font-semibold text-slate-900 text-base mb-3">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Target Account *</label>
                {scopedAccountId ? (
                  <div className="p-2 border border-slate-200 bg-slate-50 rounded font-semibold text-slate-800 text-xs">
                    {accounts.find((a) => a.id === scopedAccountId)?.name || 'Current Account'}
                  </div>
                ) : (
                  <select
                    value={newAccountId}
                    onChange={(e) => setNewAccountId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-medium"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Task Description *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Specific task outcome and deliverable..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Sub-Section</label>
                  <select
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value as TaskSection)}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    <option value="General">General</option>
                    <option value="Technical Proposal">Technical Proposal</option>
                    <option value="Commercial Proposal">Commercial Proposal</option>
                    <option value="Infra & SBOM">Infra & SBOM</option>
                    <option value="Demo">Demo</option>
                    <option value="Contact">Contact</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    Target Completion Time (TCT) *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newTct}
                    onChange={(e) => setNewTct(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-medium"
                  />
                </div>

                {!isPartnerMode ? (
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Tag Partner SI</label>
                    <select
                      value={newPartnerTag}
                      onChange={(e) => setNewPartnerTag(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded font-medium text-slate-800"
                    >
                      <option value="">No Partner (Internal PrivaSapien)</option>
                      <option value="Wipro Technologies">Wipro Technologies</option>
                      <option value="Tata Consultancy Services">Tata Consultancy Services</option>
                      <option value="Accenture APAC">Accenture APAC</option>
                      <option value="Cognizant US">Cognizant US</option>
                      <option value="Infosys Responsible AI Unit">Infosys Responsible AI Unit</option>
                    </select>
                  </div>
                ) : null}
              </div>

              {/* Multi-Channel Interaction Tags */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-500" />
                    <span>Interaction Channel Tags (Task Level)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Multi-channel taggable
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
                    const isSelected = newTaskTags.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleToggleNewTaskTag(id)}
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
                  Tag submission, response email, calls, or messaging. Any channel tag logged in comments is automatically added to this task as well.
                </p>
              </div>

              {/* Task Documents & Deliverables (Multiple Uploads) */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                    <span>Attach Task Documents ({newTaskDocs.length})</span>
                  </label>
                  <label
                    htmlFor="create-task-file-upload"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-medium text-[11px] cursor-pointer transition shadow-2xs"
                  >
                    <Upload className="w-2.5 h-2.5" />
                    <span>Upload Multiple Files</span>
                  </label>
                  <input
                    id="create-task-file-upload"
                    type="file"
                    multiple
                    onChange={handleNewTaskFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Quick Samples */}
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[10px] text-slate-400">Quick attachments:</span>
                  <button
                    type="button"
                    onClick={() => handleAddSampleTaskDoc('Technical_Response_Annexure_B.pdf', '1.6 MB')}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
                  >
                    + Annexure PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSampleTaskDoc('Commercial_Rate_Card_Matrix.xlsx', '780 KB')}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
                  >
                    + Rate Card
                  </button>
                </div>

                {newTaskDocs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {newTaskDocs.map((doc) => (
                      <span
                        key={doc.id}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white border border-slate-200 text-[11px] text-slate-800 shadow-2xs"
                      >
                        <FileText className="w-3 h-3 text-slate-500" />
                        <span className="truncate max-w-[140px] font-medium">{doc.name}</span>
                        <span className="text-[10px] text-slate-400">({doc.size})</span>
                        <button
                          type="button"
                          onClick={() => setNewTaskDocs((prev) => prev.filter((d) => d.id !== doc.id))}
                          className="text-slate-400 hover:text-rose-600 ml-0.5"
                          title="Remove file"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 shadow-2xs"
                >
                  Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
