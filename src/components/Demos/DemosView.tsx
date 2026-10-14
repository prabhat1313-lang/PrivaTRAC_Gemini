import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Demo } from '../../types/crm';
import { DemoDetailBalloon } from './DemoDetailBalloon';
import {
  Presentation,
  Plus,
  CheckCircle2,
  Clock,
  Calendar,
  Users,
  Building2,
  MessageSquare,
  FileText,
  AlertTriangle,
  ChevronRight,
  Search,
  Sparkles,
  Info,
  X,
} from 'lucide-react';

export const DemosView: React.FC = () => {
  const { demos, accounts, contacts, addDemo, currentUser } = useCrm();
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null);
  const [isAddDemoOpen, setIsAddDemoOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Scheduled' | 'Completed'>('All');

  // New Demo Scheduling Form State - ONLY Agenda is documented at scheduling time
  const [title, setTitle] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16)
  );
  const [attendeeIds, setAttendeeIds] = useState<string[]>([]);
  const [agenda, setAgenda] = useState('');

  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const contactMap = new Map(contacts.map((c) => [c.id, c]));

  const selectedDemo = demos.find((d) => d.id === selectedDemoId);

  const handleCreateDemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !accountId) return;

    // Per requirements: only Agenda is documented during scheduling
    // Minutes and Technical Gaps are captured once demo is completed in the detail balloon
    addDemo({
      accountId,
      title: title.trim(),
      scheduledDate: new Date(scheduledDate).toISOString(),
      status: 'Scheduled',
      attendeeContactIds: attendeeIds,
      solutionEngineerId: currentUser.id,
      agenda: agenda.trim() || 'Session agenda to be finalized with customer stakeholders.',
      minutesOfMeeting: '',
      gapsIdentified: '',
      comments: [],
    });

    setIsAddDemoOpen(false);
    setTitle('');
    setAgenda('');
    setAttendeeIds([]);
  };

  // Filter demos by search and status
  const filteredDemos = demos.filter((demo) => {
    const account = accountMap.get(demo.accountId);
    const matchesStatus =
      statusFilter === 'All' ? true : demo.status === statusFilter;
    const matchesSearch =
      demo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (account?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (demo.agenda || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Presentation className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Solution Engineering Demos & Gap Tracker
              </h3>
              <p className="text-xs text-slate-500">
                Click any demo card below to open its detailed balloon (Agenda, Minutes upon completion, and Comments)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {currentUser.role !== 'Partner' && (
            <button
              onClick={() => setIsAddDemoOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Technical Demo</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search demos by title, account, or agenda..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          <span className="text-[11px] font-semibold text-slate-500 mr-1">Status:</span>
          {(['All', 'Scheduled', 'Completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
          <span className="text-xs text-slate-400 ml-2 font-medium">
            ({filteredDemos.length} demo{filteredDemos.length === 1 ? '' : 's'})
          </span>
        </div>
      </div>

      {/* Brief Summary Demo Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDemos.map((demo) => {
          const account = accountMap.get(demo.accountId);
          const attendees = demo.attendeeContactIds
            .map((id) => contactMap.get(id))
            .filter(Boolean);

          const isCompleted = demo.status === 'Completed';
          const commentsCount = (demo.comments || []).length;

          // Brief snippet of agenda
          const agendaSnippet = demo.agenda
            ? demo.agenda.split('\n')[0].replace(/^[0-9]+[.)]\s*/, '').trim()
            : 'Pre-demo agenda documented';

          return (
            <div
              key={demo.id}
              onClick={() => setSelectedDemoId(demo.id)}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all duration-150 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
              title="Click to open detailed Demo Balloon"
            >
              {/* Subtle top indicator bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  isCompleted ? 'bg-emerald-500' : 'bg-blue-500'
                }`}
              />

              <div className="space-y-3">
                {/* Header: Title and Status Badge */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition truncate">
                      {demo.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">
                        {account?.name || 'Unassigned Account'}
                      </span>
                      {account?.sector && (
                        <span className="text-[10px] text-slate-500 px-1.5 py-0.2 bg-slate-100 rounded border border-slate-200 shrink-0">
                          {account.sector}
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 border ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Clock className="w-3 h-3 text-blue-600" />
                    )}
                    <span>{demo.status}</span>
                  </span>
                </div>

                {/* Date & Attendees Brief Info */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {new Date(demo.scheduledDate).toLocaleString([], {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {attendees.length > 0
                        ? `${attendees.length} Attendee${attendees.length === 1 ? '' : 's'}`
                        : 'No tagged contacts'}
                    </span>
                  </div>
                </div>

                {/* Brief Summary Box */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3 text-blue-600" />
                      Brief Summary / Agenda:
                    </span>
                    <span className="text-[10px] font-normal text-slate-400">
                      Click card for details
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">
                    {agendaSnippet}
                  </p>
                </div>

                {/* Four Separate Sections Status Indicators */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  {/* Section 1: Agenda */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Agenda Documented
                  </span>

                  {/* Section 2: Minutes */}
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Minutes Recorded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Minutes: Upon Completion
                    </span>
                  )}

                  {/* Section 3: Gaps Noted */}
                  {demo.gapsIdentified && demo.gapsIdentified.trim() ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200/80 font-medium">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      Gaps Noted
                    </span>
                  ) : isCompleted ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200 font-medium">
                      No Gaps Noted
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50/50 text-amber-800/80 border border-amber-200/50 font-medium">
                      Gaps: Live Capture
                    </span>
                  )}

                  {/* Section 4: Comments */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200/60 font-medium">
                    <MessageSquare className="w-3 h-3 text-purple-600" />
                    {commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}
                  </span>
                </div>
              </div>

              {/* Bottom Card Footer Action */}
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  PrivaSapien Technical Demonstration
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-blue-600 group-hover:text-blue-800 group-hover:translate-x-0.5 transition">
                  <span>View Details Balloon</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDemos.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-2">
          <Presentation className="w-8 h-8 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-800 text-sm">No demos found matching criteria</h4>
          <p className="text-xs text-slate-500">
            Try adjusting your search query or schedule a new technical demo.
          </p>
        </div>
      )}

      {/* Pop-up Balloon Dialog for Demo Details */}
      {selectedDemo && (
        <DemoDetailBalloon
          demo={selectedDemo}
          onClose={() => setSelectedDemoId(null)}
        />
      )}

      {/* Schedule Demo Modal: ONLY Agenda is documented at scheduling time */}
      {isAddDemoOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Schedule Technical Demo</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Document the session details and agenda. Minutes will be captured in the balloon once completed.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddDemoOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDemo} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Demo Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Differential Privacy Epsilon Benchmark Session"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Account *</label>
                  <select
                    value={accountId}
                    onChange={(e) => {
                      setAccountId(e.target.value);
                      setAttendeeIds([]);
                    }}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Confirmed Customer Attendees
                </label>
                <div className="max-h-28 overflow-y-auto border border-slate-200 p-2.5 rounded-lg bg-slate-50 space-y-1.5">
                  {contacts.filter((c) => c.accountId === accountId).length === 0 ? (
                    <div className="text-[11px] text-slate-400 italic">
                      No contacts found for this account. You can proceed without tagging contacts.
                    </div>
                  ) : (
                    contacts
                      .filter((c) => c.accountId === accountId)
                      .map((c) => (
                        <label
                          key={c.id}
                          className="flex items-center gap-2 text-slate-700 cursor-pointer hover:text-slate-900"
                        >
                          <input
                            type="checkbox"
                            checked={attendeeIds.includes(c.id)}
                            onChange={() => {
                              setAttendeeIds((prev) =>
                                prev.includes(c.id)
                                  ? prev.filter((id) => id !== c.id)
                                  : [...prev, c.id]
                              );
                            }}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-[11px]">
                            {c.firstName} {c.lastName} ({c.designation})
                          </span>
                        </label>
                      ))
                  )}
                </div>
              </div>

              {/* Requirement: While creating/scheduling a demo, only Agenda will be documented */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 block text-xs">
                    Demo Agenda & Objectives *
                  </label>
                  <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                    Documented at Scheduling
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Document agenda items, demonstrated features, test fixtures, and benchmarks to be validated..."
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Informational callout confirming separation of concerns */}
              <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Workflow Notice:</strong> Minutes of Meeting and Technical Gaps are documented in the pop-up balloon once the demo is completed. Internal comments can also be added anytime.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddDemoOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-slate-600 font-semibold hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs transition"
                >
                  Save & Schedule Demo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
