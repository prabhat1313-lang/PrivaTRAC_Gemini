import React, { useState } from 'react';
import { useRfp } from '../../context/RfpContext';
import { useCrm } from '../../context/CrmContext';
import {
  CheckSquare,
  MessageSquare,
  Plus,
  Send,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  GitPullRequest,
} from 'lucide-react';
import { RfpSectionTask } from '../../types/rfp';

interface SectionTasksCommentsProps {
  sectionId: string;
  sectionTitle: string;
}

export const SectionTasksComments: React.FC<SectionTasksCommentsProps> = ({
  sectionId,
  sectionTitle,
}) => {
  const { tasks, addTask, updateTaskStatus, comments, addComment, selectedTenderId } = useRfp();
  const { currentUser } = useCrm();

  const [activeTab, setActiveTab] = useState<'tasks' | 'comments'>('tasks');

  // Task Creation Form
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<RfpSectionTask['priority']>('Medium');
  const [newTaskAssignee, setNewTaskAssignee] = useState(currentUser?.name || 'Ananya Sharma');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // Comment Input Form
  const [newCommentText, setNewCommentText] = useState('');

  const sectionTasks = tasks.filter(
    (t) => t.rfpId === selectedTenderId && t.sectionId === sectionId
  );
  const sectionComments = comments.filter(
    (c) => c.rfpId === selectedTenderId && c.sectionId === sectionId
  );

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      rfpId: selectedTenderId,
      sectionId,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      priority: newTaskPriority,
      status: 'Pending',
      assignee: newTaskAssignee,
      createdBy: currentUser?.name || 'Pre-Sales Contributor',
      createdRole: currentUser?.role || 'Contributor',
      dueDate: newTaskDueDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    });

    setNewTaskTitle('');
    setNewTaskDesc('');
    setIsAddingTask(false);
  };

  const handleCreateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    addComment({
      rfpId: selectedTenderId,
      sectionId,
      author: currentUser?.name || 'Pre-Sales Reviewer',
      authorRole: currentUser?.role || 'Reviewer',
      avatar:
        currentUser?.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      text: newCommentText.trim(),
    });

    setNewCommentText('');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden mt-6">
      <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {sectionTitle} Collaboration & Audit
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tasks'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks</span>
            <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
              {sectionTasks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('comments')}
            className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'comments'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Threaded Notes</span>
            <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
              {sectionComments.length}
            </span>
          </button>
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'tasks' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Action items assigned across Pre-Sales, Engineering, QA, and Delivery.
              </span>
              <button
                type="button"
                onClick={() => setIsAddingTask(!isAddingTask)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingTask ? 'Cancel' : 'New Section Task'}</span>
              </button>
            </div>

            {isAddingTask && (
              <form
                onSubmit={handleCreateTask}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3"
              >
                <div>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Task title (e.g. Verify FIPS certificate expiry date)..."
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-1.5 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    required
                  />
                </div>
                <div>
                  <textarea
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    placeholder="Provide operational context or specific clause instructions..."
                    rows={2}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Priority
                    </label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) =>
                        setNewTaskPriority(e.target.value as RfpSectionTask['priority'])
                      }
                      className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white"
                    >
                      <option value="Urgent">Urgent</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Assignee
                    </label>
                    <input
                      type="text"
                      value={newTaskAssignee}
                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                      className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 shadow-2xs"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            )}

            {/* Task List */}
            <div className="space-y-2">
              {sectionTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3 bg-white border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          t.priority === 'Urgent'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : t.priority === 'High'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {t.priority}
                      </span>
                      <h5 className="text-xs font-bold text-slate-900">{t.title}</h5>
                      {t.status === 'Pending Approval' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded">
                          <GitPullRequest className="w-3 h-3" />
                          Pending Pre-Sales Review
                        </span>
                      )}
                    </div>
                    {t.description && (
                      <p className="text-xs text-slate-600 line-clamp-2">{t.description}</p>
                    )}
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Assigned to <strong className="text-slate-700">{t.assignee}</strong></span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Due {t.dueDate}
                      </span>
                      <span>·</span>
                      <span>Created by {t.createdBy}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={t.status}
                      onChange={(e) =>
                        updateTaskStatus(
                          t.id,
                          e.target.value as RfpSectionTask['status'],
                          currentUser?.name || 'Pre-Sales'
                        )
                      }
                      className="text-xs border border-slate-300 rounded px-2 py-1 bg-slate-50 focus:outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}

              {sectionTasks.length === 0 && !isAddingTask && (
                <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                  No active tasks for this section. Click &quot;New Section Task&quot; above to assign one.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-4">
            {/* Comment Thread List */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {sectionComments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5 text-xs">
                  <img
                    src={c.avatar}
                    alt={c.author}
                    className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5 border border-slate-200"
                  />
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{c.author}</span>
                        <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.2 rounded font-medium">
                          {c.authorRole}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(c.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}

              {sectionComments.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                  No comments or advisory notes yet. Leave a note below for the Pre-Sales lead.
                </div>
              )}
            </div>

            {/* Comment Input */}
            <form onSubmit={handleCreateComment} className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Write an advisory note or mention @PreSales..."
                className="flex-1 text-xs rounded-lg border border-slate-300 px-3 py-2 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
