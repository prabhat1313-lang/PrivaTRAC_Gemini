import React, { useState } from 'react';
import { useRfp, PendingReviewItem } from '../../context/RfpContext';
import { useCrm } from '../../context/CrmContext';
import {
  CheckCircle2,
  XCircle,
  MessageSquare,
  GitPullRequest,
  ArrowRight,
  ShieldCheck,
  X,
  AlertCircle,
  Clock,
  User,
} from 'lucide-react';

interface PreSalesReviewQueueModalProps {
  onClose: () => void;
}

export const PreSalesReviewQueueModal: React.FC<PreSalesReviewQueueModalProps> = ({ onClose }) => {
  const { reviewQueue, approveReviewItem, rejectReviewItem, addComment } = useRfp();
  const { currentUser } = useCrm();

  const [activeItem, setActiveItem] = useState<PendingReviewItem | null>(reviewQueue[0] || null);
  const [rejectNote, setRejectNote] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [deviationComment, setDeviationComment] = useState('');
  const [isDeviating, setIsDeviating] = useState(false);

  const handleApprove = (item: PendingReviewItem) => {
    approveReviewItem(item.id, currentUser?.name || 'Ananya Sharma (Pre-Sales Lead)');
    const remaining = reviewQueue.filter((i) => i.id !== item.id);
    setActiveItem(remaining[0] || null);
  };

  const handleReject = (item: PendingReviewItem) => {
    if (!rejectNote.trim()) return;
    rejectReviewItem(item.id, rejectNote.trim(), currentUser?.name || 'Ananya Sharma (Pre-Sales Lead)');
    setRejectNote('');
    setIsRejecting(false);
    const remaining = reviewQueue.filter((i) => i.id !== item.id);
    setActiveItem(remaining[0] || null);
  };

  const handleDeviate = (item: PendingReviewItem) => {
    if (!deviationComment.trim()) return;
    addComment({
      rfpId: 'rfp-sbi-01',
      sectionId: item.sectionId,
      author: currentUser?.name || 'Ananya Sharma (Pre-Sales Lead)',
      authorRole: 'Pre-Sales Lead',
      avatar:
        currentUser?.avatar ||
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces',
      text: `[Pre-Sales Review Deviation] @${item.author}: ${deviationComment.trim()}`,
      isTaskDeviation: true,
    });
    setIsDeviating(false);
    setDeviationComment('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold tracking-tight">Pre-Sales Lead Actionable Review Queue</h3>
              <p className="text-[11px] text-slate-300">
                PrivaTRAC Governance: Review & approve operational drafts from Solution Engineers & Sales Owners.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Left Column: Queue List */}
          <div className="w-full md:w-80 bg-slate-50/70 p-3 overflow-y-auto space-y-2 shrink-0">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
              <span>Pending Drafts</span>
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                {reviewQueue.length}
              </span>
            </div>

            {reviewQueue.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveItem(item);
                  setIsRejecting(false);
                  setIsDeviating(false);
                }}
                className={`w-full text-left p-3 rounded-lg border transition cursor-pointer ${
                  activeItem?.id === item.id
                    ? 'bg-white border-indigo-500 shadow-xs ring-1 ring-indigo-500/30'
                    : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200/60 uppercase">
                    {item.sourceType}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(item.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">{item.title}</h4>
                <div className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>{item.author} ({item.authorRole})</span>
                </div>
              </button>
            ))}

            {reviewQueue.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                <span>All SE & Sales Owner drafts have been reviewed.</span>
              </div>
            )}
          </div>

          {/* Right Column: Active Diff & Actions */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {activeItem ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Target Section: {activeItem.sectionId.toUpperCase()}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500">Field: <strong>{activeItem.field}</strong></span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{activeItem.title}</h3>
                    <div className="text-xs text-slate-500 mt-1">
                      Submitted by <strong className="text-slate-700">{activeItem.author}</strong> ({activeItem.authorRole}) on {new Date(activeItem.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Visual Before vs. After Diff */}
                <div>
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Visual Change Diff
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg">
                      <div className="text-[10px] font-bold text-rose-700 uppercase mb-1">Current Baseline</div>
                      <div className="text-xs font-mono text-rose-950 bg-white/70 p-2 rounded border border-rose-200/60">
                        {activeItem.oldValue}
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                      <div className="text-[10px] font-bold text-emerald-700 uppercase mb-1 flex items-center gap-1">
                        <span>Proposed Value</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                      <div className="text-xs font-mono text-emerald-950 bg-white/70 p-2 rounded border border-emerald-200/60 font-semibold">
                        {activeItem.newValue}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Justification */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Contributor Justification / Engineering Rationale
                  </div>
                  <p className="text-slate-800 leading-relaxed font-sans">{activeItem.justification}</p>
                </div>

                {/* Rejection Note Form (Conditional) */}
                {isRejecting && (
                  <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg space-y-2 animate-in fade-in duration-150">
                    <label className="block text-[11px] font-bold text-rose-900">
                      Reason for Rejection (Visible to Contributor):
                    </label>
                    <input
                      type="text"
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      placeholder="e.g. Uncapped LD is unacceptable; request 5% cap amendment instead..."
                      className="w-full text-xs rounded border border-rose-300 p-2 bg-white"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsRejecting(false)}
                        className="px-3 py-1 text-xs text-slate-600 hover:text-slate-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(activeItem)}
                        className="px-3 py-1 bg-rose-600 text-white rounded text-xs font-semibold hover:bg-rose-700"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                )}

                {/* Deviation into Threaded Comment Form (Conditional) */}
                {isDeviating && (
                  <div className="p-3 bg-indigo-50 border border-indigo-300 rounded-lg space-y-2 animate-in fade-in duration-150">
                    <label className="block text-[11px] font-bold text-indigo-900">
                      Deviate to Threaded Discussion / Request Revision:
                    </label>
                    <textarea
                      value={deviationComment}
                      onChange={(e) => setDeviationComment(e.target.value)}
                      placeholder="Post a clarification question back to the contributor..."
                      rows={2}
                      className="w-full text-xs rounded border border-indigo-300 p-2 bg-white"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsDeviating(false)}
                        className="px-3 py-1 text-xs text-slate-600 hover:text-slate-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeviate(activeItem)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700"
                      >
                        Post Discussion Note
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDeviating(!isDeviating);
                      setIsRejecting(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                    <span>Deviate into Threaded Discussion</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRejecting(!isRejecting);
                        setIsDeviating(false);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject with Note</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApprove(activeItem)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Apply to RFP Baseline</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                Select an item on the left to review proposed diffs.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            PrivaTRAC Attribution: All operational commits record <strong className="text-slate-700">Pre-Sales Lead</strong> as actor with ISO timestamp.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
