import React, { useState } from 'react';
import { Demo } from '../../types/crm';
import { useCrm } from '../../context/CrmContext';
import {
  X,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  FileText,
  Send,
  Building2,
  ChevronRight,
  Shield,
  Sparkles,
  Edit3,
  Save,
  Check,
} from 'lucide-react';

interface DemoDetailBalloonProps {
  demo: Demo;
  onClose: () => void;
}

export const DemoDetailBalloon: React.FC<DemoDetailBalloonProps> = ({ demo, onClose }) => {
  const { demos, accounts, contacts, updateDemo, addCommentToDemo, currentUser } = useCrm();

  const liveDemo = demos.find((d) => d.id === demo.id) || demo;
  const account = accounts.find((a) => a.id === liveDemo.accountId);
  const attendees = contacts.filter((c) => liveDemo.attendeeContactIds.includes(c.id));

  // Editable fields
  const [status, setStatus] = useState(liveDemo.status);
  const [agenda, setAgenda] = useState(liveDemo.agenda || '');
  const [isEditingAgenda, setIsEditingAgenda] = useState(false);

  const [mom, setMom] = useState(liveDemo.minutesOfMeeting || '');
  const [isEditingMinutes, setIsEditingMinutes] = useState(liveDemo.status === 'Completed' && !liveDemo.minutesOfMeeting);

  const [gaps, setGaps] = useState(liveDemo.gapsIdentified || '');
  const [isEditingGaps, setIsEditingGaps] = useState(false);

  // Sync state if liveDemo changes
  React.useEffect(() => {
    setStatus(liveDemo.status);
    setAgenda(liveDemo.agenda || '');
    setMom(liveDemo.minutesOfMeeting || '');
    setGaps(liveDemo.gapsIdentified || '');
  }, [liveDemo]);

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // New comment input
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Quick feedback
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleStatusChange = (newStatus: Demo['status']) => {
    setStatus(newStatus);
    const updatedDemo: Demo = {
      ...liveDemo,
      status: newStatus,
      timeline: [
        ...(liveDemo.timeline || []),
        {
          date: new Date().toISOString().split('T')[0],
          note: `Status updated to ${newStatus} by ${currentUser.name}`,
        },
      ],
    };
    updateDemo(updatedDemo);

    if (newStatus === 'Completed' && !isEditingMinutes) {
      setIsEditingMinutes(true);
    }
  };

  const handleSaveAgenda = () => {
    const updatedDemo: Demo = {
      ...liveDemo,
      agenda: agenda.trim(),
      timeline: [
        ...(liveDemo.timeline || []),
        {
          date: new Date().toISOString().split('T')[0],
          note: `Agenda updated by ${currentUser.name}`,
        },
      ],
    };
    updateDemo(updatedDemo);
    setIsEditingAgenda(false);
    triggerSaveSuccess();
  };

  const handleSaveMinutes = () => {
    const updatedDemo: Demo = {
      ...liveDemo,
      status: 'Completed',
      minutesOfMeeting: mom.trim(),
      timeline: [
        ...(liveDemo.timeline || []),
        {
          date: new Date().toISOString().split('T')[0],
          note: `Minutes of Meeting documented by ${currentUser.name}`,
        },
      ],
    };
    setStatus('Completed');
    updateDemo(updatedDemo);
    setIsEditingMinutes(false);
    triggerSaveSuccess();
  };

  const handleSaveGaps = () => {
    const updatedDemo: Demo = {
      ...liveDemo,
      gapsIdentified: gaps.trim(),
      timeline: [
        ...(liveDemo.timeline || []),
        {
          date: new Date().toISOString().split('T')[0],
          note: `Gaps noted during demo updated by ${currentUser.name}`,
        },
      ],
    };
    updateDemo(updatedDemo);
    setIsEditingGaps(false);
    triggerSaveSuccess();
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setIsSubmittingComment(true);
    addCommentToDemo(liveDemo.id, newCommentText.trim());
    setNewCommentText('');
    setIsSubmittingComment(false);
  };

  const triggerSaveSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Balloon Dialog Box */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-150">
        {/* Top Decorative Balloon Indicator */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/60">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200/70 px-2 py-0.5 rounded-full">
                Demo Details Balloon
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                  status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : status === 'Scheduled'
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {status === 'Completed' ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Clock className="w-3 h-3 text-blue-600" />
                )}
                <span>{status}</span>
              </span>

              {saveSuccess && (
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 animate-in fade-in">
                  <Check className="w-3 h-3 text-emerald-600" />
                  Changes Saved
                </span>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {liveDemo.title}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-0.5">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{account?.name || 'Unassigned Account'}</span>
                {account?.sector && (
                  <span className="text-slate-400 font-normal">({account.sector})</span>
                )}
              </div>

              <span className="text-slate-300">•</span>

              <div className="flex items-center gap-1.5 text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(liveDemo.scheduledDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition flex items-center justify-center shrink-0"
            title="Close Balloon (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Quick Status Control Bar */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Lifecycle Status:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                {(['Scheduled', 'Completed', 'Rescheduled', 'Cancelled'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleStatusChange(s)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                      status === s
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {status !== 'Completed' && (
              <button
                type="button"
                onClick={() => handleStatusChange('Completed')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Completed & Log Minutes</span>
              </button>
            )}
          </div>

          {/* Attendee Contacts */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Users className="w-3.5 h-3.5 text-slate-600" />
                <span>Confirmed Stakeholders & Attendees ({attendees.length})</span>
              </span>
            </div>

            {attendees.length === 0 ? (
              <p className="text-slate-400 italic text-[11px]">No contacts specifically tagged for this demo session.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {attendees.map((c) => (
                  <div
                    key={c.id}
                    className="p-2 bg-white rounded-lg border border-slate-200 flex items-center gap-2 shadow-2xs"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                      {c.firstName[0]}
                      {c.lastName[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-[11px]">
                        {c.firstName} {c.lastName}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {c.designation} {c.email ? `• ${c.email}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* SECTION 1: DEMO AGENDA (Documented at Scheduling Time)          */}
          {/* ============================================================== */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Demo Agenda & Objectives</h4>
                  <p className="text-[10px] text-slate-500">
                    Documented during initial scheduling to set customer expectations and benchmark flows
                  </p>
                </div>
              </div>

              {!isEditingAgenda ? (
                <button
                  type="button"
                  onClick={() => setIsEditingAgenda(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-md"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Agenda</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setAgenda(liveDemo.agenda || '');
                      setIsEditingAgenda(false);
                    }}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 px-2 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAgenda}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1 rounded-md"
                  >
                    <Save className="w-3 h-3" />
                    <span>Save</span>
                  </button>
                </div>
              )}
            </div>

            {isEditingAgenda ? (
              <textarea
                rows={4}
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                placeholder="List the demo agenda items, flow, architecture items, and benchmarks to be validated..."
                className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-sans leading-relaxed text-xs"
              />
            ) : (
              <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-200/80 text-slate-700 whitespace-pre-wrap leading-relaxed text-xs">
                {agenda.trim() ? (
                  agenda
                ) : (
                  <span className="text-slate-400 italic">No formal agenda was documented for this demo session.</span>
                )}
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* SECTION 2: MINUTES OF MEETING (MoM) (Captured upon Completion) */}
          {/* ============================================================== */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Minutes of Meeting (MoM)
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Captured once the demo is completed to document attendee feedback, demonstrated flows, and agreements
                  </p>
                </div>
              </div>

              {status === 'Completed' && !isEditingMinutes && (
                <button
                  type="button"
                  onClick={() => setIsEditingMinutes(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-1 rounded-md"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Minutes</span>
                </button>
              )}
            </div>

            {status !== 'Completed' ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Minutes will be captured once this demo is completed.</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Per the standard engineering workflow, Minutes of Meeting (MoM) are documented following live execution with customer stakeholders.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStatus('Completed');
                      setIsEditingMinutes(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete Demo Now & Document Minutes</span>
                  </button>
                </div>
              </div>
            ) : isEditingMinutes ? (
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1 text-xs">
                    Minutes of Meeting (MoM) *
                  </label>
                  <textarea
                    rows={4}
                    value={mom}
                    onChange={(e) => setMom(e.target.value)}
                    placeholder="Document attendees, demonstrated capabilities, benchmark metrics, customer feedback, and next steps..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 leading-relaxed text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMom(liveDemo.minutesOfMeeting || '');
                      setIsEditingMinutes(false);
                    }}
                    className="px-3 py-1.5 rounded-lg text-slate-600 font-semibold hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveMinutes}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-2xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Minutes</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1 text-[11px] uppercase tracking-wider">
                  Documented Minutes of Meeting:
                </span>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-xs">
                  {mom.trim() ? mom : <span className="text-slate-400 italic">No minutes recorded yet.</span>}
                </p>
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* SECTION 3: GAPS NOTED DURING DEMO (Technical & Architecture)   */}
          {/* ============================================================== */}
          <div className="p-4 rounded-xl border border-amber-200/90 bg-amber-50/20 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-amber-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Gaps Noted During Demo</span>
                  </h4>
                  <p className="text-[10px] text-amber-800/80">
                    Captures technical limitations, missing database connectors, latency SLAs, or product gaps identified during the live demo
                  </p>
                </div>
              </div>

              {!isEditingGaps ? (
                <button
                  type="button"
                  onClick={() => setIsEditingGaps(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:text-amber-950 bg-amber-100/70 hover:bg-amber-200/70 px-2.5 py-1 rounded-md transition"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{gaps.trim() ? 'Edit Gaps' : 'Log Demo Gaps'}</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setGaps(liveDemo.gapsIdentified || '');
                      setIsEditingGaps(false);
                    }}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 px-2 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveGaps}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-700 px-2.5 py-1 rounded-md shadow-2xs"
                  >
                    <Save className="w-3 h-3" />
                    <span>Save Gaps</span>
                  </button>
                </div>
              )}
            </div>

            {isEditingGaps ? (
              <div className="space-y-2.5">
                <div>
                  <label className="font-bold text-amber-900 block mb-1 text-xs">
                    Identified Gaps & Engineering Requirements *
                  </label>
                  <textarea
                    rows={4}
                    value={gaps}
                    onChange={(e) => setGaps(e.target.value)}
                    placeholder="Document missing connectors, performance/latency thresholds, custom security requirements, or feature requests noted during the demo..."
                    className="w-full p-2.5 border border-amber-300 bg-white rounded-lg text-amber-950 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 leading-relaxed text-xs"
                  />
                </div>

                {/* Quick gap template chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-semibold text-amber-800 mr-1">Quick Add Tags:</span>
                  {[
                    'Oracle Exadata JDBC Connector Required',
                    'Throughput SLA (<5ms @ 50k TPS)',
                    'Private Cloud Kubernetes Terraform Provider',
                    'On-prem Hardware Security Module (HSM) Support',
                    'ISO 42001 Algorithmic Bias Audit Export',
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setGaps((prev) => (prev.trim() ? `${prev.trim()}\n• ${tag}` : `• ${tag}`));
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300/60 transition cursor-pointer"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-white border border-amber-200/90 shadow-2xs">
                {gaps.trim() ? (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                      Documented Technical Gaps:
                    </span>
                    <p className="text-amber-950 whitespace-pre-wrap leading-relaxed text-xs">
                      {gaps}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs text-amber-800/80">
                    <span className="italic">
                      No technical gaps noted during this demo session. All customer requirements were satisfied by demonstrated features.
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingGaps(true)}
                      className="text-[11px] font-bold text-amber-700 hover:text-amber-900 ml-2 underline shrink-0 cursor-pointer"
                    >
                      + Log a Gap
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* SECTION 4: COMMENTS & COLLABORATION                            */}
          {/* ============================================================== */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Comments & Internal Notes</h4>
                  <p className="text-[10px] text-slate-500">
                    Discussion thread for Solution Engineers, Sales Owners, and Pre-Sales prep
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                {(liveDemo.comments || []).length} Comments
              </span>
            </div>

            {/* Comments Thread */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {(!liveDemo.comments || liveDemo.comments.length === 0) ? (
                <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-lg italic text-[11px]">
                  No comments yet. Add preparation notes, customer remarks, or post-demo action items below.
                </div>
              ) : (
                liveDemo.comments.map((comm) => (
                  <div
                    key={comm.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-[11px]">{comm.author}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(comm.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{comm.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="pt-2 flex gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Type a comment, prep note, or stakeholder follow-up..."
                className="flex-1 p-2 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim() || isSubmittingComment}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition shrink-0"
              >
                <Send className="w-3 h-3" />
                <span>Post</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span>PrivaTRAC Solution Engineering Tracker</span>
            <span>•</span>
            <span className="text-slate-400">DEMO-01 to DEMO-03</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
