import React, { useState, useMemo, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  InteractionTag,
  Task,
  TaskSection,
  TaskDocument,
  User as UserType,
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
  ChevronRight,
  Mail,
  Phone,
  MessageCircle,
  Users,
  Paperclip,
  Upload,
  X,
  Tag,
  History,
  GitFork,
  CornerDownRight,
  ListTree,
  Sliders,
} from 'lucide-react';
import { ItemAuditTrailModal } from '../common/ItemAuditTrailModal';

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
    canCompleteTask,
    getSubTasks,
    currentUser,
    users,
    updateUser,
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
  const [auditTargetTask, setAuditTargetTask] = useState<Task | null>(null);
  const [isCompletedExpanded, setIsCompletedExpanded] = useState<boolean>(true);

  // User perspective for Initiative & Leadership Guidance metrics
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser.id);
  const [filterTableByUser, setFilterTableByUser] = useState<boolean>(false);

  // Threshold Configuration Modal state
  const [isThresholdConfigOpen, setIsThresholdConfigOpen] = useState(false);
  const [configTargetUser, setConfigTargetUser] = useState<UserType | null>(null);
  const [configGuidanceThreshold, setConfigGuidanceThreshold] = useState<number>(20);
  const [configInitiativeThreshold, setConfigInitiativeThreshold] = useState<number>(50);
  const [isAllUsersSummaryOpen, setIsAllUsersSummaryOpen] = useState(false);
  const [thresholdSavedToast, setThresholdSavedToast] = useState(false);

  // Sub-task expansion state (default expanded for tasks with seeded sub-tasks)
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(
    new Set(['task-1', 'task-3', 'task-5'])
  );

  // Message bubble state when completing a task with incomplete sub-tasks
  const [subTaskWarning, setSubTaskWarning] = useState<{
    taskId: string;
    incompleteSubTasks: Task[];
  } | null>(null);

  // New task form state (supports Task and Sub-Task modes)
  const [newTaskMode, setNewTaskMode] = useState<'task' | 'subtask'>('task');
  const [newParentTaskId, setNewParentTaskId] = useState<string>('');
  const [newAssigneeId, setNewAssigneeId] = useState<string>(currentUser.id);
  const [newName, setNewName] = useState('');
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

  // Inline quick add subtask state per parent
  const [inlineSubTaskParentId, setInlineSubTaskParentId] = useState<string | null>(null);
  const [inlineSubTaskName, setInlineSubTaskName] = useState<string>('');
  const [inlineSubTaskDesc, setInlineSubTaskDesc] = useState<string>('');
  const [inlineSubTaskAssignee, setInlineSubTaskAssignee] = useState<string>(currentUser.id);
  const [inlineSubTaskTct, setInlineSubTaskTct] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16)
  );
  const [inlineSubTaskPriority, setInlineSubTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

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

  // Target user for Initiative & Leadership Guidance calculations (switchable in view)
  const targetUser = users.find((u) => u.id === selectedUserId) || currentUser;
  const targetUserGuidanceThreshold = targetUser.guidanceThreshold ?? 20;
  const targetUserInitiativeThreshold = targetUser.initiativeThreshold ?? 50;

  const userTasks = visibleTasks.filter(
    (t) => t.assigneeId === targetUser.id || t.creatorId === targetUser.id
  );
  const activitiesCount = userTasks.filter((t) => t.isActivity).length;
  const assignedCount = userTasks.filter((t) => !t.isActivity).length;
  const totalUserTasks = activitiesCount + assignedCount;

  const activityPercent = totalUserTasks > 0 ? Math.round((activitiesCount / totalUserTasks) * 100) : 50;
  const assignedPercent = totalUserTasks > 0 ? Math.round((assignedCount / totalUserTasks) * 100) : 50;

  const hasHighInitiative = activityPercent >= targetUserInitiativeThreshold;
  const lacksGuidance = assignedPercent < targetUserGuidanceThreshold;

  // Live metrics map for all users (shows in dropdown and team overview matrix)
  const allUsersMetrics = useMemo(() => {
    return users.map((u) => {
      const uTasks = visibleTasks.filter((t) => t.assigneeId === u.id || t.creatorId === u.id);
      const act = uTasks.filter((t) => t.isActivity).length;
      const asg = uTasks.filter((t) => !t.isActivity).length;
      const tot = act + asg;
      const actPct = tot > 0 ? Math.round((act / tot) * 100) : 0;
      const asgPct = tot > 0 ? Math.round((asg / tot) * 100) : 0;
      const gThresh = u.guidanceThreshold ?? 20;
      const iThresh = u.initiativeThreshold ?? 50;
      const isLowGuidance = asgPct < gThresh;
      const isHighInitiative = actPct >= iThresh;
      return {
        user: u,
        totalTasks: tot,
        activitiesCount: act,
        assignedCount: asg,
        activityPercent: actPct,
        assignedPercent: asgPct,
        guidanceThreshold: gThresh,
        initiativeThreshold: iThresh,
        isLowGuidance,
        isHighInitiative,
      };
    });
  }, [users, visibleTasks]);

  const openThresholdModal = (user: UserType) => {
    setConfigTargetUser(user);
    setConfigGuidanceThreshold(user.guidanceThreshold ?? 20);
    setConfigInitiativeThreshold(user.initiativeThreshold ?? 50);
    setIsThresholdConfigOpen(true);
  };

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configTargetUser) return;
    const updated: UserType = {
      ...configTargetUser,
      guidanceThreshold: Math.max(1, Math.min(100, Number(configGuidanceThreshold) || 20)),
      initiativeThreshold: Math.max(1, Math.min(100, Number(configInitiativeThreshold) || 50)),
    };
    updateUser(updated);
    setIsThresholdConfigOpen(false);
    setThresholdSavedToast(true);
    setTimeout(() => setThresholdSavedToast(false), 3000);
  };

  // Subtasks mapped by parent task ID
  const subTasksByParent = useMemo(() => {
    const map = new Map<string, Task[]>();
    visibleTasks.forEach((t) => {
      if (t.parentTaskId) {
        const list = map.get(t.parentTaskId) || [];
        list.push(t);
        map.set(t.parentTaskId, list);
      }
    });
    return map;
  }, [visibleTasks]);

  // Top-level Tasks (Parent tasks)
  const parentTasks = useMemo(() => {
    return visibleTasks.filter((t) => !t.parentTaskId);
  }, [visibleTasks]);

  // Filtered parent tasks (including if query matches parent or any of its child sub-tasks)
  const filteredParentTasks = useMemo(() => {
    return parentTasks.filter((t) => {
      const childSubTasks = subTasksByParent.get(t.id) || [];
      if (statusFilter !== 'all') {
        const parentMatches = t.status === statusFilter;
        const subMatches = childSubTasks.some((st) => st.status === statusFilter);
        if (!parentMatches && !subMatches) return false;
      }
      if (sectionFilter !== 'all' && (t.relatedSection || 'General') !== sectionFilter) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const accName = (accountMap.get(t.accountId)?.name || '').toLowerCase();
        const parentMatches =
          (t.name?.toLowerCase().includes(q) || false) ||
          t.description.toLowerCase().includes(q) ||
          accName.includes(q);
        const subMatches = childSubTasks.some(
          (st) =>
            (st.name?.toLowerCase().includes(q) || false) ||
            st.description.toLowerCase().includes(q)
        );
        if (!parentMatches && !subMatches) return false;
      }
      if (filterTableByUser) {
        const userMatches =
          t.assigneeId === targetUser.id ||
          t.creatorId === targetUser.id ||
          childSubTasks.some((st) => st.assigneeId === targetUser.id || st.creatorId === targetUser.id);
        if (!userMatches) return false;
      }
      return true;
    });
  }, [parentTasks, subTasksByParent, statusFilter, sectionFilter, searchQuery, accountMap, filterTableByUser, targetUser.id]);

  const activeTasks = useMemo(() => {
    return filteredParentTasks.filter(
      (t) => !t.completedAt && t.status !== 'Completed' && t.status !== 'Completed Late'
    );
  }, [filteredParentTasks]);

  const completedTasks = useMemo(() => {
    return filteredParentTasks.filter(
      (t) => Boolean(t.completedAt) || t.status === 'Completed' || t.status === 'Completed Late'
    );
  }, [filteredParentTasks]);

  const toggleExpandTask = (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const openAddSubTaskModal = (parentTaskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNewTaskMode('subtask');
    setNewParentTaskId(parentTaskId);
    const parentTask = tasks.find((t) => t.id === parentTaskId);
    if (parentTask) {
      setNewAccountId(parentTask.accountId);
      if (parentTask.relatedSection) setNewSection(parentTask.relatedSection);
    }
    setIsAddTaskOpen(true);
  };

  const handleAttemptComplete = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    const check = canCompleteTask(task.id);
    if (!check.canComplete) {
      setSubTaskWarning({
        taskId: task.id,
        incompleteSubTasks: check.incompleteSubTasks,
      });
      // Automatically expand this task so user sees the sub-tasks
      setExpandedTaskIds((prev) => new Set([...prev, task.id]));
      return;
    }
    setSubTaskWarning(null);
    completeTask(task.id);
  };

  const handleAddInlineSubTask = (parentTask: Task) => {
    const taskName = inlineSubTaskName.trim() || inlineSubTaskDesc.trim();
    const taskDesc = inlineSubTaskDesc.trim() || inlineSubTaskName.trim();
    if (!taskName && !taskDesc) return;
    addTask({
      accountId: parentTask.accountId,
      parentTaskId: parentTask.id,
      relatedSection: parentTask.relatedSection,
      name: taskName,
      description: taskDesc,
      creatorId: currentUser.id,
      assigneeId: inlineSubTaskAssignee || currentUser.id,
      tct: new Date(inlineSubTaskTct).toISOString(),
      priority: inlineSubTaskPriority,
      isActivity: true,
      interactionTag: 'email',
      interactionTags: ['email'],
      partnerTag: parentTask.partnerTag,
      partnerTags: parentTask.partnerTags,
    });
    setInlineSubTaskName('');
    setInlineSubTaskDesc('');
    setInlineSubTaskParentId(null);
    setExpandedTaskIds((prev) => new Set([...prev, parentTask.id]));
  };

  const renderTaskRow = (task: Task, isCompletedSection = false) => {
    const account = accountMap.get(task.accountId);
    const isBubbleOpen = activeBubbleTaskId === task.id;
    const childSubTasks = subTasksByParent.get(task.id) || [];
    const incompleteSubTasks = childSubTasks.filter(
      (st) => !st.completedAt && st.status !== 'Completed' && st.status !== 'Completed Late'
    );
    const isExpanded = expandedTaskIds.has(task.id);

    return (
      <React.Fragment key={task.id}>
        <tr
          className={`transition cursor-pointer group ${
            isBubbleOpen
              ? 'bg-slate-100/80 border-l-4 border-l-slate-800'
              : isCompletedSection
              ? 'hover:bg-slate-50/80 bg-slate-50/25'
              : 'hover:bg-slate-50/60'
          }`}
          onClick={() => setActiveBubbleTaskId((prev) => (prev === task.id ? null : task.id))}
        >
          <td className="py-3 px-4 max-w-sm">
            <div className="flex items-start gap-2">
              <button
                type="button"
                onClick={(e) => toggleExpandTask(task.id, e)}
                className={`p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition shrink-0 mt-0.5 ${
                  childSubTasks.length === 0 ? 'opacity-40' : ''
                }`}
                title={
                  childSubTasks.length > 0
                    ? isExpanded
                      ? 'Collapse Sub-Tasks'
                      : 'Expand Sub-Tasks'
                    : 'No Sub-Tasks yet (Click + Sub-Task to add)'
                }
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div
                  className={`font-semibold leading-relaxed group-hover:text-slate-950 ${
                    isCompletedSection ? 'text-slate-700' : 'text-slate-900'
                  }`}
                >
                  {task.name || task.description}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {/* Sub-Tasks count & status pill badge */}
                  {childSubTasks.length > 0 ? (
                    <button
                      type="button"
                      onClick={(e) => toggleExpandTask(task.id, e)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition ${
                        incompleteSubTasks.length === 0
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                      }`}
                      title="Click to view Sub-Tasks"
                    >
                      <GitFork className="w-3 h-3 text-current" />
                      <span>
                        {incompleteSubTasks.length === 0
                          ? `✓ All ${childSubTasks.length} Sub-Tasks Done`
                          : `${incompleteSubTasks.length} of ${childSubTasks.length} Sub-Tasks Pending`}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => openAddSubTaskModal(task.id, e)}
                      className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-sky-700 bg-slate-100 hover:bg-sky-50 px-1.5 py-0.2 rounded border border-slate-200 font-medium transition"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>Sub-Task</span>
                    </button>
                  )}

                  {/* Comments count */}
                  {task.comments && task.comments.length > 0 && (
                    <span
                      className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-medium"
                      title={`${task.comments.length} comment${task.comments.length > 1 ? 's' : ''}`}
                    >
                      <MessageSquare className="w-3 h-3 text-slate-400" />
                      <span>{task.comments.length}</span>
                    </span>
                  )}

                  {/* Documents / Attachments count */}
                  {task.documents && task.documents.length > 0 && (
                    <span
                      className="inline-flex items-center gap-1 text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 font-medium"
                      title={`${task.documents.length} attached document${task.documents.length > 1 ? 's' : ''}`}
                    >
                      <Paperclip className="w-2.5 h-2.5 text-slate-500" />
                      <span>{task.documents.length}</span>
                    </span>
                  )}
                </div>
              </div>
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
            <div>{new Date(task.tct).toLocaleDateString()}</div>
            {isCompletedSection && task.completedAt && (
              <div className="text-[10px] text-slate-400 font-normal">
                Closed: {new Date(task.completedAt).toLocaleDateString()}
              </div>
            )}
          </td>

          {/* Status & SLA Badge */}
          <td className="py-3 px-4 whitespace-nowrap">
            {task.status === 'Completed' ? (
              <div className="flex flex-col gap-0.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Completed On-Time</span>
                </span>
                {task.completedAt && (
                  <span className="text-[10px] text-slate-400 font-medium tabular-nums pl-0.5">
                    Finished {new Date(task.completedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            ) : task.status === 'Completed Late' ? (
              <div className="flex flex-col gap-0.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs">
                  <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>Completed Late</span>
                </span>
                {task.completedAt && (
                  <span className="text-[10px] text-amber-700/80 font-medium tabular-nums pl-0.5">
                    Finished {new Date(task.completedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            ) : task.status === 'Overdue' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200/60 shadow-2xs">
                <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                <span>Overdue</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                <span>Pending</span>
              </span>
            )}
          </td>

          <td className="py-3 px-4 whitespace-nowrap text-[11px] text-slate-500">
            {task.isActivity ? 'Self' : 'Assigned'}
          </td>

          <td
            className="py-3 px-4 text-center whitespace-nowrap"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center gap-1.5">
              {/* Add Sub-Task button */}
              <button
                type="button"
                onClick={(e) => openAddSubTaskModal(task.id, e)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-medium transition"
                title="Add a Sub-Task to this Task"
              >
                <Plus className="w-3 h-3 text-sky-600" />
                <span>Sub-Task</span>
              </button>

              {/* Edit Button */}
              <button
                onClick={() =>
                  setActiveBubbleTaskId((prev) => (prev === task.id ? null : task.id))
                }
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

              {/* Audit Trail Button */}
              <button
                onClick={() => setAuditTargetTask(task)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-medium transition"
                title="View task audit trail"
              >
                <History className="w-3 h-3 text-slate-500" />
                <span>Audit ({task.fieldAuditTrail?.length || 0})</span>
              </button>

              {!task.completedAt &&
              task.status !== 'Completed' &&
              task.status !== 'Completed Late' ? (
                <button
                  onClick={(e) => handleAttemptComplete(task, e)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
                  title="Mark as completed"
                >
                  <Check className="w-3.5 h-3.5 text-slate-600" />
                  Done
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Done
                </span>
              )}
            </div>
          </td>
        </tr>

        {/* INLINE MESSAGE BUBBLE - Informing that task cannot be completed until sub-tasks are done */}
        {subTaskWarning?.taskId === task.id && (
          <tr className="bg-amber-50/80 border-y-2 border-amber-400 animate-in fade-in slide-in-from-top-1 duration-150">
            <td colSpan={7} className="p-3 sm:p-4">
              <div className="relative bg-white rounded-xl border-2 border-amber-400 p-4 shadow-xl max-w-3xl mx-auto">
                {/* Speech-bubble arrow tail pointer */}
                <div className="absolute -top-2.5 right-12 w-4 h-4 bg-white border-t-2 border-l-2 border-amber-400 transform rotate-45 z-10" />

                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Cannot Complete Task — Incomplete Sub-Tasks Remaining
                      </h4>
                      <p className="text-xs text-amber-800">
                        This Task has {subTaskWarning.incompleteSubTasks.length} incomplete Sub-Task{subTaskWarning.incompleteSubTasks.length > 1 ? 's' : ''}. A Task cannot be completed until all its Sub-Tasks are completed.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSubTaskWarning(null)}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* List of incomplete Sub-Tasks with quick Mark Done actions */}
                <div className="mt-3 space-y-1.5 bg-amber-50/60 rounded-lg p-3 border border-amber-200">
                  <div className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider mb-1">
                    Pending Sub-Tasks to Complete First:
                  </div>
                  {subTaskWarning.incompleteSubTasks.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-md bg-white border border-amber-200 text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CornerDownRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="font-bold text-[10px] text-amber-900 bg-amber-100 px-1 py-0.2 rounded border border-amber-200 uppercase tracking-wider shrink-0">
                          Sub-Task
                        </span>
                        <span className="font-semibold text-slate-900 truncate">
                          {st.name || st.description}
                        </span>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">
                          (Due: {new Date(st.tct).toLocaleDateString()})
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          completeTask(st.id);
                          const remaining = subTaskWarning.incompleteSubTasks.filter((t) => t.id !== st.id);
                          if (remaining.length === 0) {
                            setSubTaskWarning(null);
                          } else {
                            setSubTaskWarning({ ...subTaskWarning, incompleteSubTasks: remaining });
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] shrink-0 transition shadow-2xs"
                      >
                        <Check className="w-3 h-3" />
                        <span>Mark Sub-Task Done</span>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-end gap-2 text-xs">
                  <button
                    onClick={() => {
                      setExpandedTaskIds((prev) => new Set([...prev, task.id]));
                      setSubTaskWarning(null);
                    }}
                    className="px-3 py-1.5 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition"
                  >
                    View All Sub-Tasks
                  </button>
                  <button
                    onClick={() => setSubTaskWarning(null)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </td>
          </tr>
        )}

        {/* INLINE SPEECH-BUBBLE DRAWER */}
        {isBubbleOpen && (
          <tr className="bg-slate-100/60 border-b-2 border-slate-300">
            <td colSpan={7} className="p-3 sm:p-5">
              <div className="relative max-w-4xl mx-auto">
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

        {/* RENDER EXPANDED SUB-TASKS */}
        {isExpanded && (
          <>
            {childSubTasks.map((st) => {
              const isSubDone = Boolean(st.completedAt) || st.status === 'Completed' || st.status === 'Completed Late';
              const isSubBubbleOpen = activeBubbleTaskId === st.id;
              const subAssignee = (users || []).find((u) => u.id === st.assigneeId);
              return (
                <React.Fragment key={st.id}>
                  <tr
                    className={`transition cursor-pointer text-xs ${
                      isSubBubbleOpen
                        ? 'bg-slate-100/90 border-l-4 border-l-slate-800'
                        : isSubDone
                        ? 'bg-slate-50/40 hover:bg-slate-100/50'
                        : 'bg-slate-50/70 hover:bg-sky-50/50'
                    }`}
                    onClick={() => setActiveBubbleTaskId((prev) => (prev === st.id ? null : st.id))}
                  >
                    <td className="py-2.5 px-4 pl-9 max-w-sm">
                      <div className="flex items-start gap-2">
                        <CornerDownRight className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-sky-800 bg-sky-100 px-1.5 py-0.2 rounded border border-sky-200 uppercase tracking-wider">
                              Sub-Task
                            </span>
                            <span
                              className={`font-medium ${
                                isSubDone ? 'line-through text-slate-400' : 'text-slate-800'
                              }`}
                            >
                              {st.name || st.description}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-4 text-slate-600 font-normal">
                      {account?.name || 'Unassigned'}
                    </td>

                    <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                      {st.relatedSection || 'General'}
                    </td>

                    <td className="py-2.5 px-4 whitespace-nowrap text-slate-600 tabular-nums text-[11px]">
                      <div>{new Date(st.tct).toLocaleDateString()}</div>
                      {st.completedAt && (
                        <div className="text-[10px] text-slate-400">
                          Closed: {new Date(st.completedAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-4 whitespace-nowrap">
                      {st.status === 'Completed' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Done</span>
                        </span>
                      ) : st.status === 'Completed Late' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Done Late</span>
                        </span>
                      ) : st.status === 'Overdue' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>Overdue</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-4 whitespace-nowrap text-[11px] text-slate-500">
                      {subAssignee?.name || 'Assigned'}
                    </td>

                    <td
                      className="py-2.5 px-4 text-center whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() =>
                            setActiveBubbleTaskId((prev) => (prev === st.id ? null : st.id))
                          }
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => setAuditTargetTask(st)}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                        >
                          <History className="w-2.5 h-2.5 text-slate-500" />
                        </button>

                        {!isSubDone ? (
                          <button
                            onClick={() => {
                              completeTask(st.id);
                              if (subTaskWarning) {
                                const remaining = subTaskWarning.incompleteSubTasks.filter(
                                  (t) => t.id !== st.id
                                );
                                if (remaining.length === 0) setSubTaskWarning(null);
                                else setSubTaskWarning({ ...subTaskWarning, incompleteSubTasks: remaining });
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-[11px] font-medium transition"
                          >
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Done</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Done</span>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Inline drawer if sub-task bubble open */}
                  {isSubBubbleOpen && (
                    <tr className="bg-slate-100/60 border-b-2 border-slate-300">
                      <td colSpan={7} className="p-3 sm:p-5">
                        <div className="relative max-w-4xl mx-auto">
                          <div className="absolute -top-3 left-10 w-5 h-5 bg-white border-t border-l border-slate-300 transform rotate-45 z-10" />
                          <TaskBubbleEditor
                            task={st}
                            isInline={true}
                            onClose={() => setActiveBubbleTaskId(null)}
                            onPopOut={() => {
                              setEditingTask(st);
                              setActiveBubbleTaskId(null);
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {/* Quick inline "+ Add Sub-Task" row */}
            <tr className="bg-sky-50/20 border-b border-slate-200">
              <td colSpan={7} className="py-2 px-4 pl-9">
                {inlineSubTaskParentId === task.id ? (
                  <div
                    className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-white border border-sky-300 shadow-2xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <CornerDownRight className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-1 py-0.2 rounded border border-sky-200 uppercase tracking-wider">
                      New Sub-Task
                    </span>
                    <input
                      type="text"
                      placeholder="Sub-Task Name (in list)..."
                      value={inlineSubTaskName}
                      onChange={(e) => setInlineSubTaskName(e.target.value)}
                      className="w-48 p-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
                      autoFocus
                    />
                    <input
                      type="text"
                      placeholder="Description (inside bubble)..."
                      value={inlineSubTaskDesc}
                      onChange={(e) => setInlineSubTaskDesc(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddInlineSubTask(task);
                        }
                      }}
                      className="flex-1 min-w-[160px] p-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    <select
                      value={inlineSubTaskAssignee}
                      onChange={(e) => setInlineSubTaskAssignee(e.target.value)}
                      className="p-1.5 border border-slate-300 rounded text-xs bg-white text-slate-700"
                    >
                      {(users || []).map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="datetime-local"
                      value={inlineSubTaskTct}
                      onChange={(e) => setInlineSubTaskTct(e.target.value)}
                      className="p-1 border border-slate-300 rounded text-xs bg-white text-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddInlineSubTask(task)}
                      disabled={!inlineSubTaskName.trim() && !inlineSubTaskDesc.trim()}
                      className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white font-medium text-xs rounded transition"
                    >
                      + Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setInlineSubTaskParentId(null)}
                      className="px-2 py-1 text-slate-500 hover:text-slate-800 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInlineSubTaskParentId(task.id);
                      setInlineSubTaskDesc('');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-sky-700 hover:text-sky-900 font-medium py-1 px-2 rounded hover:bg-sky-100/60 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add another Sub-Task to this Task</span>
                  </button>
                )}
              </td>
            </tr>
          </>
        )}
      </React.Fragment>
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const isSub = newTaskMode === 'subtask' && Boolean(newParentTaskId);
    const parentTask = isSub ? tasks.find((t) => t.id === newParentTaskId) : undefined;
    const taskName = newName.trim() || newDesc.trim();
    const taskDesc = newDesc.trim() || newName.trim();

    addTask({
      accountId: isSub && parentTask ? parentTask.accountId : (scopedAccountId || newAccountId),
      parentTaskId: isSub ? newParentTaskId : undefined,
      relatedSection: isSub && parentTask ? parentTask.relatedSection : newSection,
      name: taskName,
      description: taskDesc,
      creatorId: currentUser.id,
      assigneeId: newAssigneeId || currentUser.id,
      tct: new Date(newTct).toISOString(),
      priority: newPriority,
      isActivity: true,
      interactionTag: newTaskTags[0] || undefined,
      interactionTags: newTaskTags,
      partnerTag: newPartnerTag ? newPartnerTag : undefined,
      partnerTags: newPartnerTag ? [newPartnerTag] : undefined,
      documents: newTaskDocs,
    });

    if (isSub && newParentTaskId) {
      setExpandedTaskIds((prev) => new Set([...prev, newParentTaskId]));
    }

    setIsAddTaskOpen(false);
    setNewName('');
    setNewDesc('');
    setNewPartnerTag('');
    setNewTaskTags(['email']);
    setNewTaskDocs([]);
    setNewTaskMode('task');
    setNewParentTaskId('');
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
            <span className="text-slate-500">· Showing {filteredParentTasks.length} tagged tasks</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Confidential isolated partner view
          </span>
        </div>
      )}
      {/* Initiative & Guidance Scoreboard - Subtle Tonal Palette */}
      {!scopedAccountId && !hideHeaderStats && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Initiative Gauge Card */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  Self-Initiative Ratio · {targetUser.name}
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
                    {hasHighInitiative
                      ? `High Initiative (≥${targetUserInitiativeThreshold}%)`
                      : `Needs Proactivity (<${targetUserInitiativeThreshold}%)`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {activitiesCount} self-activities · {assignedCount} manager assigned
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-slate-400 shrink-0" />
            </div>

            {/* Guidance Gauge Card */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="flex-1 mr-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider truncate">
                    Leader Guidance Ratio · {targetUser.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => openThresholdModal(targetUser)}
                    className="text-[10px] font-semibold text-sky-600 hover:text-sky-800 inline-flex items-center gap-1 cursor-pointer shrink-0"
                    title={`Configure guidance deficit threshold for ${targetUser.name}`}
                  >
                    <Sliders className="w-2.5 h-2.5" />
                    <span>Config (&lt;{targetUserGuidanceThreshold}%)</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xl font-bold text-slate-900 tabular-nums">{assignedPercent}%</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                      lacksGuidance
                        ? 'bg-rose-50 text-rose-800 border-rose-200/60 font-semibold'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200/60'
                    }`}
                  >
                    {lacksGuidance
                      ? `Guidance Deficit (<${targetUserGuidanceThreshold}%)`
                      : `Healthy Guidance (≥${targetUserGuidanceThreshold}%)`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {assignedCount} of {totalUserTasks} tasks assigned by leadership · Threshold: &lt;{targetUserGuidanceThreshold}% is deficit
                </p>
              </div>
              <User className="w-6 h-6 text-slate-400 shrink-0" />
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
                  className="mt-2 px-2.5 py-1 text-xs rounded bg-white text-slate-700 border border-slate-300 font-medium cursor-pointer"
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
              <FileText className="w-6 h-6 text-slate-400 shrink-0" />
            </div>
          </div>

          {/* Expandable All-Users Guidance & Initiative Matrix */}
          {isAllUsersSummaryOpen && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 text-xs flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-700" />
                    <span>Team Leadership Guidance & Initiative Matrix</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Individual thresholds configured per user determining guidance deficit flags
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAllUsersSummaryOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {allUsersMetrics.map(({ user, totalTasks: uTot, activitiesCount: uAct, assignedCount: uAsg, activityPercent: uActPct, assignedPercent: uAsgPct, guidanceThreshold: uGThresh, initiativeThreshold: uIThresh, isLowGuidance: uLowG, isHighInitiative: uHighI }) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition ${
                      selectedUserId === user.id
                        ? 'bg-white border-slate-900 shadow-2xs ring-1 ring-slate-900'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="font-semibold text-slate-900 truncate">{user.name}</div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                        {user.role}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Guidance:</span>
                        <div className="flex items-center gap-1 font-semibold tabular-nums">
                          <span>{uAsgPct}%</span>
                          <span
                            className={`px-1 rounded text-[9px] font-bold ${
                              uLowG
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {uLowG ? `Low (<${uGThresh}%)` : `Healthy (≥${uGThresh}%)`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Initiative:</span>
                        <div className="flex items-center gap-1 font-semibold tabular-nums">
                          <span>{uActPct}%</span>
                          <span
                            className={`px-1 rounded text-[9px] font-medium ${
                              uHighI
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {uHighI ? `High (≥${uIThresh}%)` : `Low`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">
                        Threshold: &lt;{uGThresh}% / &ge;{uIThresh}%
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openThresholdModal(user);
                        }}
                        className="text-sky-600 hover:text-sky-800 font-bold"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Tasks and Sub-Tasks by description or account..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* User Perspective Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-300">
            <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="text-[11px] font-semibold text-slate-600 shrink-0">User:</span>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              {allUsersMetrics.map(({ user, isLowGuidance, assignedPercent: uAsgPct, guidanceThreshold: uGThresh }) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role}) — {isLowGuidance ? `⚠️ Low Guidance (${uAsgPct}% < ${uGThresh}%)` : `Guidance: ${uAsgPct}%`}
                </option>
              ))}
            </select>
          </div>

          {/* User Threshold Configuration Badge & Action in this view */}
          <button
            type="button"
            onClick={() => openThresholdModal(targetUser)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition cursor-pointer"
            title={`Configure Guidance (<${targetUserGuidanceThreshold}%) and Initiative (≥${targetUserInitiativeThreshold}%) thresholds for ${targetUser.name}`}
          >
            <Sliders className="w-3 h-3 text-slate-500" />
            <span className="hidden xl:inline text-slate-500">Threshold:</span>
            <span className="font-semibold text-slate-800">
              Guidance &lt;{targetUserGuidanceThreshold}%
            </span>
            <span className="text-slate-300">|</span>
            <span className="font-semibold text-slate-800">
              Initiative &ge;{targetUserInitiativeThreshold}%
            </span>
            <span className="text-[10px] text-sky-700 bg-sky-100 px-1.5 py-0.2 rounded font-semibold ml-0.5">
              Edit
            </span>
          </button>

          {/* Toggle All Users Guidance Matrix */}
          <button
            type="button"
            onClick={() => setIsAllUsersSummaryOpen(!isAllUsersSummaryOpen)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
              isAllUsersSummaryOpen
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title="Toggle leadership guidance matrix for all team members"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">All Users Matrix</span>
          </button>

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
              onClick={() => {
                setNewTaskMode('task');
                setNewParentTaskId('');
                setIsAddTaskOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Tasks Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="font-semibold text-slate-900 text-xs">Active Tasks</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
              {activeTasks.length} Tasks
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Pending deliverables and SLA tracking
          </span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-medium uppercase text-[10px] tracking-wider bg-slate-50/30">
              <th className="py-2.5 px-4">Task Name</th>
              <th className="py-2.5 px-4">Account</th>
              <th className="py-2.5 px-4">Section</th>
              <th className="py-2.5 px-4">Target TCT</th>
              <th className="py-2.5 px-4">Status & SLA</th>
              <th className="py-2.5 px-4">Type</th>
              <th className="py-2.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activeTasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  {statusFilter === 'Completed' || statusFilter === 'Completed Late'
                    ? 'Completed status filter applied. See completed tasks below.'
                    : 'No active tasks found matching filter criteria.'}
                </td>
              </tr>
            ) : (
              activeTasks.map((task) => renderTaskRow(task, false))
            )}
          </tbody>
        </table>
      </div>

      {/* Completed Tasks Separate Section at the Bottom */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Section Header with toggle */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/80 cursor-pointer select-none hover:bg-slate-100/70 transition"
          onClick={() => setIsCompletedExpanded((prev) => !prev)}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 text-xs">Completed Tasks</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {completedTasks.length} Tasks
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Archive of resolved deliverables, milestones, and SLA compliance records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsCompletedExpanded((prev) => !prev);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-2xs"
            >
              <span>{isCompletedExpanded ? 'Hide Completed' : 'Show Completed'} ({completedTasks.length})</span>
              {isCompletedExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>
          </div>
        </div>

        {isCompletedExpanded && (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-medium uppercase text-[10px] tracking-wider bg-slate-50/30">
                <th className="py-2.5 px-4">Task Name</th>
                <th className="py-2.5 px-4">Account</th>
                <th className="py-2.5 px-4">Section</th>
                <th className="py-2.5 px-4">Target TCT</th>
                <th className="py-2.5 px-4">Status & SLA</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {completedTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No completed tasks found matching filter criteria.
                  </td>
                </tr>
              ) : (
                completedTasks.map((task) => renderTaskRow(task, true))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Task Edit Pop-up Bubble Modal */}
      {editingTask && (
        <TaskEditBubbleModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}

      {/* Task Audit Trail Modal */}
      {auditTargetTask && (
        <ItemAuditTrailModal
          title="Task Field Audit Trail"
          subtitle={`Audit log for task: ${auditTargetTask.description.slice(0, 45)}...`}
          entityType="Task"
          entries={auditTargetTask.fieldAuditTrail || []}
          onClose={() => setAuditTargetTask(null)}
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
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 text-base">
                {newTaskMode === 'subtask' ? 'Create New Sub-Task' : 'Create New Task'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddTaskOpen(false);
                  setNewTaskMode('task');
                  setNewParentTaskId('');
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Task vs Sub-Task Mode Selector */}
            <div className="flex items-center gap-2 mb-3 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setNewTaskMode('task');
                  setNewParentTaskId('');
                }}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition ${
                  newTaskMode === 'task'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Task (Parent Task)
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewTaskMode('subtask');
                  if (!newParentTaskId && parentTasks.length > 0) {
                    setNewParentTaskId(parentTasks[0].id);
                  }
                }}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                  newTaskMode === 'subtask'
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>Sub-Task (Child Task)</span>
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              {/* Parent Task Selector if in Sub-Task Mode */}
              {newTaskMode === 'subtask' && (
                <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg">
                  <label className="font-semibold text-sky-950 block mb-1 flex items-center gap-1">
                    <GitFork className="w-3.5 h-3.5 text-sky-700" />
                    <span>Designate Parent Task *</span>
                  </label>
                  <select
                    required
                    value={newParentTaskId}
                    onChange={(e) => {
                      const pid = e.target.value;
                      setNewParentTaskId(pid);
                      const p = parentTasks.find((t) => t.id === pid);
                      if (p) {
                        setNewAccountId(p.accountId);
                        if (p.relatedSection) setNewSection(p.relatedSection);
                      }
                    }}
                    className="w-full p-2 border border-sky-300 rounded font-medium bg-white text-slate-800 text-xs"
                  >
                    <option value="">-- Choose Parent Task --</option>
                    {parentTasks.map((pt) => {
                      const accName = accountMap.get(pt.accountId)?.name || 'Account';
                      return (
                        <option key={pt.id} value={pt.id}>
                          [{accName}] {pt.name || pt.description.slice(0, 50)}...
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-[10px] text-sky-800 mt-1">
                    A Task that has incomplete sub-tasks cannot be completed until all its sub-tasks are marked Done.
                  </p>
                </div>
              )}

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
                    disabled={newTaskMode === 'subtask' && Boolean(newParentTaskId)}
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
                <label className="font-semibold text-slate-800 block mb-1">
                  {newTaskMode === 'subtask' ? 'Sub-Task Name *' : 'Task Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    newTaskMode === 'subtask'
                      ? 'e.g. Volume Discount Slabs Calculation'
                      : 'e.g. Submit Revised SBI PETs Rate Card'
                  }
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-medium text-slate-900 bg-white"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Displayed as the primary component in the Tasks List.
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  {newTaskMode === 'subtask' ? 'Sub-Task Description *' : 'Task Description *'}
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder={
                    newTaskMode === 'subtask'
                      ? 'Specific sub-task outcome, calculation, or review item...'
                      : 'Specific task outcome, deliverable details, and scope...'
                  }
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-slate-800"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Visible inside the Task bubble when opened.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Assignee</label>
                  <select
                    value={newAssigneeId}
                    onChange={(e) => setNewAssigneeId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    {(users || []).map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

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

      {/* Threshold Configuration Modal for Setting User Guidance & Initiative Thresholds */}
      {isThresholdConfigOpen && configTargetUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  <Sliders className="w-4 h-4 text-slate-200" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Configure Thresholds · {configTargetUser.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Role: <strong>{configTargetUser.role}</strong> · Team: {configTargetUser.team}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsThresholdConfigOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveThresholds} className="p-5 space-y-4 text-xs">
              {/* Guidance Deficit Threshold */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-600" />
                    <span>Leadership Guidance Deficit Threshold (%)</span>
                  </label>
                  <span className="font-bold text-rose-700 text-sm tabular-nums bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    &lt; {configGuidanceThreshold}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  If manager-assigned tasks drop below this percentage of total tasks, leadership guidance will show as <strong className="text-rose-700">Low / Guidance Deficit</strong> in the tasks scoreboard and reports for {configTargetUser.name}.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={configGuidanceThreshold}
                    onChange={(e) => setConfigGuidanceThreshold(Number(e.target.value))}
                    className="flex-1 accent-slate-900 cursor-pointer"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={configGuidanceThreshold}
                      onChange={(e) => setConfigGuidanceThreshold(Number(e.target.value))}
                      className="w-16 p-1.5 border border-slate-300 rounded-lg text-center font-bold text-xs bg-white text-slate-900"
                    />
                    <span className="font-semibold text-slate-600">%</span>
                  </div>
                </div>
              </div>

              {/* Initiative Threshold */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
                    <span>Self-Initiative Target Threshold (%)</span>
                  </label>
                  <span className="font-bold text-slate-900 text-sm tabular-nums bg-white px-2 py-0.5 rounded border border-slate-200">
                    &ge; {configInitiativeThreshold}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  If self-created activities meet or exceed this percentage, {configTargetUser.name} is recognized as having <strong>High Initiative</strong>.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="20"
                    max="80"
                    step="5"
                    value={configInitiativeThreshold}
                    onChange={(e) => setConfigInitiativeThreshold(Number(e.target.value))}
                    className="flex-1 accent-slate-900 cursor-pointer"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={configInitiativeThreshold}
                      onChange={(e) => setConfigInitiativeThreshold(Number(e.target.value))}
                      className="w-16 p-1.5 border border-slate-300 rounded-lg text-center font-bold text-xs bg-white text-slate-900"
                    />
                    <span className="font-semibold text-slate-600">%</span>
                  </div>
                </div>
              </div>

              {/* Presets */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5 text-[11px]">
                  Threshold Presets
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setConfigGuidanceThreshold(20);
                      setConfigInitiativeThreshold(50);
                    }}
                    className={`p-2 text-left rounded-lg border transition ${
                      configGuidanceThreshold === 20 && configInitiativeThreshold === 50
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="font-semibold text-[11px]">Standard</div>
                    <div className={configGuidanceThreshold === 20 && configInitiativeThreshold === 50 ? 'text-slate-300 text-[10px]' : 'text-slate-500 text-[10px]'}>
                      Guidance &lt;20%
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfigGuidanceThreshold(30);
                      setConfigInitiativeThreshold(40);
                    }}
                    className={`p-2 text-left rounded-lg border transition ${
                      configGuidanceThreshold === 30 && configInitiativeThreshold === 40
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="font-semibold text-[11px]">High Support</div>
                    <div className={configGuidanceThreshold === 30 && configInitiativeThreshold === 40 ? 'text-slate-300 text-[10px]' : 'text-slate-500 text-[10px]'}>
                      Guidance &lt;30%
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfigGuidanceThreshold(15);
                      setConfigInitiativeThreshold(60);
                    }}
                    className={`p-2 text-left rounded-lg border transition ${
                      configGuidanceThreshold === 15 && configInitiativeThreshold === 60
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="font-semibold text-[11px]">Autonomous</div>
                    <div className={configGuidanceThreshold === 15 && configInitiativeThreshold === 60 ? 'text-slate-300 text-[10px]' : 'text-slate-500 text-[10px]'}>
                      Guidance &lt;15%
                    </div>
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsThresholdConfigOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 shadow-2xs transition"
                >
                  Save User Thresholds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {thresholdSavedToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Thresholds successfully updated and reflected in this view.</span>
        </div>
      )}
    </div>
  );
};
