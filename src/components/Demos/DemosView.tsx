import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Demo } from '../../types/crm';
import { Presentation, Plus, CheckCircle2, AlertTriangle, Calendar, Users, X } from 'lucide-react';

export const DemosView: React.FC = () => {
  const { demos, accounts, contacts, addDemo, currentUser } = useCrm();
  const [isAddDemoOpen, setIsAddDemoOpen] = useState(false);

  // New Demo State
  const [title, setTitle] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16)
  );
  const [attendeeIds, setAttendeeIds] = useState<string[]>([]);
  const [mom, setMom] = useState('');
  const [gaps, setGaps] = useState('');

  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const contactMap = new Map(contacts.map((c) => [c.id, c]));

  const handleCreateDemo = (e: React.FormEvent) => {
    e.preventDefault();
    addDemo({
      accountId,
      title: title.trim(),
      scheduledDate: new Date(scheduledDate).toISOString(),
      status: 'Scheduled',
      attendeeContactIds: attendeeIds,
      solutionEngineerId: currentUser.id,
      minutesOfMeeting: mom || 'Session scheduled. Pre-demo infrastructure verified.',
      gapsIdentified: gaps || 'Gaps to be analyzed during live run.',
    });
    setIsAddDemoOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Solution Engineering Demos & Gap Tracker</h3>
          <p className="text-xs text-slate-500">
            Track technical deep dives, customer architecture board reviews, and feature gaps (DEMO-01 to DEMO-03)
          </p>
        </div>

        {currentUser.role !== 'Partner' && (
          <button
            onClick={() => setIsAddDemoOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Demo</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {demos.map((demo) => {
          const account = accountMap.get(demo.accountId);
          return (
            <div
              key={demo.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{demo.title}</h4>
                  <div className="text-xs font-semibold text-blue-700 mt-0.5">
                    Account: {account?.name || 'Unassigned'}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                    demo.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {demo.status}
                </span>
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Scheduled: {new Date(demo.scheduledDate).toLocaleString()}</span>
              </div>

              {/* Attendees */}
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700 block mb-1">
                  Confirmed Attendees (Contacts):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {demo.attendeeContactIds.map((cid) => {
                    const c = contactMap.get(cid);
                    return (
                      <span
                        key={cid}
                        className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-medium text-slate-800"
                      >
                        {c ? `${c.firstName} ${c.lastName} (${c.designation})` : cid}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Minutes of Meeting */}
              <div className="text-xs space-y-1">
                <span className="font-bold text-slate-800">Minutes of Meeting (MoM):</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
                  {demo.minutesOfMeeting}
                </p>
              </div>

              {/* Identified Gaps */}
              <div className="text-xs space-y-1">
                <span className="font-bold text-amber-900 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Identified Technical Gaps:
                </span>
                <p className="text-amber-900 bg-amber-50 p-2.5 rounded border border-amber-200 leading-relaxed">
                  {demo.gapsIdentified}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Demo Modal */}
      {isAddDemoOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5">
            <h3 className="font-bold text-slate-900 text-base mb-3">Schedule Technical Demo</h3>
            <form onSubmit={handleCreateDemo} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Demo Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Differential Privacy Epsilon Benchmark Session"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Account *</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
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
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Attendee Contacts</label>
                <div className="max-h-28 overflow-y-auto border border-slate-200 p-2 rounded bg-slate-50 space-y-1">
                  {contacts
                    .filter((c) => c.accountId === accountId)
                    .map((c) => (
                      <label key={c.id} className="flex items-center gap-2 text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={attendeeIds.includes(c.id)}
                          onChange={() => {
                            setAttendeeIds((prev) =>
                              prev.includes(c.id) ? prev.filter((id) => id !== c.id) : [...prev, c.id]
                            );
                          }}
                        />
                        <span>
                          {c.firstName} {c.lastName} ({c.designation})
                        </span>
                      </label>
                    ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Minutes / Agenda</label>
                <textarea
                  rows={2}
                  placeholder="Agenda and test benchmarks..."
                  value={mom}
                  onChange={(e) => setMom(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddDemoOpen(false)}
                  className="px-3 py-1.5 rounded text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-blue-600 text-white font-bold hover:bg-blue-700"
                >
                  Save Demo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
