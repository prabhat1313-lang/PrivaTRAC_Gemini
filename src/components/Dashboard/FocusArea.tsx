import React, { useMemo, useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Task, TaskStatus } from '../../types/crm';
import {
  calculateAccountValue,
  calculateDealValue,
  calculateTask7030Score,
  formatCurrencyValue,
} from '../../utils/calculations';
import { TaskEditBubbleModal } from '../Tasks/TaskEditBubbleModal';
import { TaskBubbleEditor } from '../Tasks/TaskBubbleEditor';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Check,
  Edit2,
  MessageSquare,
  Handshake,
  ChevronDown,
  ChevronUp,
  GitFork,
  CornerDownRight,
  X,
} from 'lucide-react';

export const FocusArea: React.FC = () => {
  const { tasks, accounts, completeTask, canCompleteTask, isPartnerMode, activePartnerName } = useCrm();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'7030' | 'tct' | 'priority'>('7030');
  const [activeBubbleTaskId, setActiveBubbleTaskId] = useState<string | null>(null);
  const [floatingBubbleTask, setFloatingBubbleTask] = useState<Task | null>(null);
  const [subTaskWarning, setSubTaskWarning] = useState<{
    taskId: string;
    incompleteSubTasks: Task[];
  } | null>(null);

  // Account map for fast lookup
  const accountMap = useMemo(() => {
    const map = new Map();
    accounts.forEach((a) => map.set(a.id, a));
    return map;
  }, [accounts]);

  // If in Partner role, show tasks tagged for this partner
  const visibleTasks = useMemo(() => {
    if (isPartnerMode) {
      return tasks.filter((t) => {
        const acc = accountMap.get(t.accountId);
        return (
          t.partnerTag === activePartnerName ||
          (t.partnerTags && t.partnerTags.includes(activePartnerName)) ||
          (acc && acc.partners && acc.partners.includes(activePartnerName))
        );
      });
    }
    return tasks;
  }, [tasks, isPartnerMode, activePartnerName, accountMap]);

  // Rolling 7-day Weekly Summary
  const weeklySummary = useMemo(() => {
    const totalOpen = visibleTasks.filter((t) => !t.completedAt).length;
    const overdue = visibleTasks.filter((t) => t.status === 'Overdue').length;
    const completedThisWeek = visibleTasks.filter((t) => t.completedAt).length;
    const highPriority = visibleTasks.filter((t) => t.priority === 'High' && !t.completedAt).length;

    return { totalOpen, overdue, completedThisWeek, highPriority };
  }, [visibleTasks]);

  // Scored and ordered tasks
  const prioritizedTasks = useMemo(() => {
    let list = visibleTasks.map((task) => {
      const account = accountMap.get(task.accountId);
      const score = calculateTask7030Score(task, account);
      return { task, account, score };
    });

    if (statusFilter !== 'all') {
      list = list.filter((item) => item.task.status === statusFilter);
    }

    if (accountFilter !== 'all') {
      list = list.filter((item) => item.task.accountId === accountFilter);
    }

    if (sortBy === '7030') {
      list.sort((a, b) => b.score - a.score);
    } else if (sortBy === 'tct') {
      list.sort((a, b) => new Date(a.task.tct).getTime() - new Date(b.task.tct).getTime());
    } else if (sortBy === 'priority') {
      const pWeights = { High: 3, Medium: 2, Low: 1 };
      list.sort((a, b) => pWeights[b.task.priority] - pWeights[a.task.priority]);
    }

    return list;
  }, [visibleTasks, accountMap, statusFilter, accountFilter, sortBy]);

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <CheckCircle2 className="w-3 h-3 text-slate-500" />
            Completed
          </span>
        );
      case 'Completed Late':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/70">
            <Clock className="w-3 h-3 text-amber-600" />
            Completed Late
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-800 border border-rose-200/70">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Overdue
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
            <Clock className="w-3 h-3 text-slate-400" />
            Pending
          </span>
        );
    }
  };

  const toggleTaskBubble = (taskId: string) => {
    setActiveBubbleTaskId((prev) => (prev === taskId ? null : taskId));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      {/* 7-Day Performance Banner - Subtle Neutral Theme */}
      <div className="mb-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-200/80 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Workload & Weekly Focus
              </h3>
              {isPartnerMode && (
                <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-slate-200 text-slate-700 border border-slate-300">
                  Partner Scope: {activePartnerName}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Task urgency evaluated against target completion times
            </p>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Formula: 70% TCT Urgency + 30% Account Priority
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          <div className="p-3 rounded-lg bg-white border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Open Tasks</div>
            <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
              {weeklySummary.totalOpen}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-white border border-slate-200">
            <div className="text-[11px] text-rose-700 font-medium">Overdue Tasks</div>
            <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
              {weeklySummary.overdue}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-white border border-slate-200">
            <div className="text-[11px] text-amber-700 font-medium">High Priority</div>
            <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
              {weeklySummary.highPriority}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-white border border-slate-200">
            <div className="text-[11px] text-slate-600 font-medium">Completed This Week</div>
            <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
              {weeklySummary.completedThisWeek}
            </div>
          </div>
        </div>
      </div>

      {/* Focus Area Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-3 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-slate-900 text-sm">Action Queue</h4>
          <span className="text-xs text-slate-500">
            ({prioritizedTasks.length} items)
          </span>
          <span className="text-[11px] text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Click any task to open its collaborative edit bubble
          </span>
        </div>

        {/* Filters and Order Reset */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending Only</option>
            <option value="Overdue">Overdue Only</option>
            <option value="Completed">Completed On-Time</option>
            <option value="Completed Late">Completed Late</option>
          </select>

          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white max-w-[150px] truncate"
          >
            <option value="all">All Accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white font-medium"
          >
            <option value="7030">Recommended (70/30 Rule)</option>
            <option value="tct">Target Completion Time</option>
            <option value="priority">Priority</option>
          </select>

          <button
            onClick={() => {
              setSortBy('7030');
              setStatusFilter('all');
              setAccountFilter('all');
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium border border-slate-200 transition"
            title="Restore default 70% TCT Urgency & 30% Account Priority ordering"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset 70/30</span>
          </button>
        </div>
      </div>

      {/* Task Queue Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px] tracking-wider bg-slate-50/50">
              <th className="py-2.5 px-3">Score & Bubble</th>
              <th className="py-2.5 px-3">Account</th>
              <th className="py-2.5 px-3">Task Name & Meta</th>
              <th className="py-2.5 px-3">Channel</th>
              <th className="py-2.5 px-3">Target Time</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Account Value</th>
              <th className="py-2.5 px-3 text-center">Edit Bubble</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {prioritizedTasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No tasks match the selected criteria.
                </td>
              </tr>
            ) : (
              prioritizedTasks.map(({ task, account, score }) => {
                const dealVal = account
                  ? calculateDealValue(account.annualRevenue, account.dealValueOverride)
                  : 0;
                const accVal = account
                  ? calculateAccountValue(dealVal, account.winningStance, account.adoptionCategory)
                  : 0;

                const tctFormatted = new Date(task.tct).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                const isBubbleOpen = activeBubbleTaskId === task.id;

                return (
                  <React.Fragment key={task.id}>
                    {/* Main Task Row */}
                    <tr
                      className={`transition cursor-pointer group ${
                        isBubbleOpen
                          ? 'bg-slate-100/80 border-l-4 border-l-slate-800'
                          : 'hover:bg-slate-50/80'
                      }`}
                      onClick={() => toggleTaskBubble(task.id)}
                    >
                      {/* Column 1: Score & Bubble Button */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded tabular-nums border border-slate-200">
                            {score}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border transition ${
                              isBubbleOpen
                                ? 'bg-slate-800 text-white border-slate-800 shadow-2xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 group-hover:bg-slate-200/80'
                            }`}
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>{isBubbleOpen ? 'Hide' : 'Bubble'}</span>
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{account?.name || 'Unassigned'}</div>
                        <div className="text-[10px] text-slate-500">
                          {account?.stage} · {task.priority} Priority
                        </div>
                      </td>

                      <td className="py-3 px-3 max-w-xs">
                        <div className="text-slate-800 leading-relaxed font-semibold group-hover:text-slate-950">
                          {task.name || task.description}
                        </div>

                        {/* Meta badges: Partner tag, Comments count, RFP stage */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {task.rfpSubtask && (
                            <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                              RFP Stage {task.rfpSubtask.stepIndex}
                            </span>
                          )}

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
                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 font-medium">
                                <Handshake className="w-2.5 h-2.5 text-slate-500" />
                                <span>{task.partnerTag}</span>
                              </span>
                            ) : null
                          )}

                          {task.comments && task.comments.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                              <MessageSquare className="w-3 h-3 text-slate-400" />
                              {task.comments.length}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {(() => {
                          const tags = Array.from(
                            new Set([
                              ...(task.interactionTags || []),
                              ...(task.interactionTag ? [task.interactionTag] : []),
                              ...((task.comments || []).map((c) => c.interactionTag).filter(Boolean)),
                            ])
                          );
                          if (tags.length === 0) {
                            return <span className="text-slate-400 text-[10px]">Internal</span>;
                          }
                          return (
                            <div className="flex flex-wrap gap-1">
                              {tags.map((t) => (
                                <span
                                  key={t}
                                  className="text-[10px] font-semibold text-slate-700 uppercase bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          );
                        })()}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-medium">
                        {tctFormatted}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">{getStatusBadge(task.status)}</td>

                      <td className="py-3 px-3 text-right whitespace-nowrap font-semibold text-slate-800 tabular-nums">
                        {account ? formatCurrencyValue(accVal, account.revenueCurrency, account.geography) : '—'}
                      </td>

                      {/* Column 8: Actions */}
                      <td
                        className="py-3 px-3 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Toggle Bubble Button */}
                          <button
                            onClick={() => toggleTaskBubble(task.id)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition ${
                              isBubbleOpen
                                ? 'bg-slate-800 text-white border-slate-800'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                            }`}
                            title="Toggle in-place Speech Bubble editor"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Bubble</span>
                            {isBubbleOpen ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>

                          {/* Done Button */}
                          {!task.completedAt ? (
                            <button
                              onClick={() => {
                                const check = canCompleteTask(task.id);
                                if (!check.canComplete) {
                                  setSubTaskWarning({
                                    taskId: task.id,
                                    incompleteSubTasks: check.incompleteSubTasks,
                                  });
                                  return;
                                }
                                setSubTaskWarning(null);
                                completeTask(task.id);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
                              title="Mark as completed"
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

                    {/* INLINE MESSAGE BUBBLE - Informing that task cannot be completed until sub-tasks are done */}
                    {subTaskWarning?.taskId === task.id && (
                      <tr className="bg-amber-50/80 border-y-2 border-amber-400 animate-in fade-in slide-in-from-top-1 duration-150">
                        <td colSpan={8} className="p-3 sm:p-4">
                          <div className="relative bg-white rounded-xl border-2 border-amber-400 p-4 shadow-xl max-w-2xl mx-auto">
                            {/* Speech-bubble arrow tail pointer */}
                            <div className="absolute -top-2.5 right-12 w-4 h-4 bg-white border-t-2 border-l-2 border-amber-400 transform rotate-45 z-10" />

                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-900 text-xs">
                                    Cannot Complete Task — Incomplete Sub-Tasks
                                  </h4>
                                  <p className="text-[11px] text-amber-800">
                                    This Task has {subTaskWarning.incompleteSubTasks.length} incomplete Sub-Task(s). A Task cannot be completed until all its Sub-Tasks are completed.
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => setSubTaskWarning(null)}
                                className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition"
                                title="Dismiss"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Incomplete sub-tasks list */}
                            <div className="mt-2 space-y-1.5 bg-amber-50/60 rounded-lg p-2.5 border border-amber-200">
                              <div className="text-[10px] font-semibold text-amber-900 uppercase tracking-wider">
                                Pending Sub-Tasks:
                              </div>
                              {subTaskWarning.incompleteSubTasks.map((st) => (
                                <div
                                  key={st.id}
                                  className="flex items-center justify-between gap-2 p-1.5 rounded bg-white border border-amber-200 text-xs shadow-2xs"
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <CornerDownRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <span className="font-semibold text-[10px] text-amber-900 bg-amber-100 px-1 py-0.2 rounded border border-amber-200 uppercase tracking-wider shrink-0">
                                      Sub-Task
                                    </span>
                                    <span className="font-medium text-slate-800 truncate">
                                      {st.description}
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
                                    className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[10px] shrink-0 transition"
                                  >
                                    Mark Done
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* INLINE SPEECH-BUBBLE CALLOUT TRAY (Appears directly beneath the task!) */}
                    {isBubbleOpen && (
                      <tr className="bg-slate-100/60 border-b-2 border-slate-300">
                        <td colSpan={8} className="p-3 sm:p-5">
                          <div className="relative max-w-4xl mx-auto">
                            {/* Speech Bubble Arrow pointing up to clicked row */}
                            <div className="absolute -top-3 left-10 w-5 h-5 bg-white border-t border-l border-slate-300 transform rotate-45 z-10" />
                            <TaskBubbleEditor
                              task={task}
                              isInline={true}
                              onClose={() => setActiveBubbleTaskId(null)}
                              onPopOut={() => {
                                setFloatingBubbleTask(task);
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

      {/* Floating Pop-up Bubble Modal (when popped out) */}
      {floatingBubbleTask && (
        <TaskEditBubbleModal
          task={floatingBubbleTask}
          onClose={() => setFloatingBubbleTask(null)}
        />
      )}
    </div>
  );
};
