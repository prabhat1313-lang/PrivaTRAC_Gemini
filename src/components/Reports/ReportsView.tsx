import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  BarChart3,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  Calendar,
  User,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Search,
  History,
} from 'lucide-react';
import {
  calculateAccountValue,
  calculateDealValue,
  formatCurrencyValue,
} from '../../utils/calculations';

export const ReportsView: React.FC = () => {
  const { accounts, tasks, users, globalAuditTrail } = useCrm();

  const [activeReport, setActiveReport] = useState<
    'performance' | 'tat' | 'initiative' | 'backdated' | 'reminders' | 'master'
  >('performance');

  const [reminderDate, setReminderDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [auditActorFilter, setAuditActorFilter] = useState<string>('all');
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');
  const [auditEntityFilter, setAuditEntityFilter] = useState<'all' | 'Account' | 'Contact' | 'Task' | 'Admin'>('all');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');

  // Back-dated vs Real-time entry counts per user & SalesOps Copilot (REP-07)
  const backDatedStats = useMemo(() => {
    const stats: Record<
      string,
      { realtime: number; backdated: number; onBehalfCount: number }
    > = {};
    users.forEach((u) => {
      stats[u.name] = { realtime: 0, backdated: 0, onBehalfCount: 0 };
    });

    globalAuditTrail.forEach((aud) => {
      if (!stats[aud.actor]) {
        stats[aud.actor] = { realtime: 0, backdated: 0, onBehalfCount: 0 };
      }
      if (aud.isBackDated) {
        stats[aud.actor].backdated += 1;
      } else {
        stats[aud.actor].realtime += 1;
      }
      if (aud.actingOnBehalfOf) {
        stats[aud.actor].onBehalfCount += 1;
      }
    });

    return stats;
  }, [globalAuditTrail, users]);

  // Filtered global audit trail
  const filteredAuditTrail = useMemo(() => {
    return globalAuditTrail.filter((entry) => {
      // Entity filter
      if (auditEntityFilter !== 'all') {
        if (entry.entityType !== auditEntityFilter) return false;
      }

      if (auditActorFilter === 'copilot') {
        if (entry.actor !== 'SalesOps Copilot') return false;
      } else if (auditActorFilter !== 'all') {
        if (entry.actor !== auditActorFilter && entry.actingOnBehalfOf !== auditActorFilter)
          return false;
      }

      if (auditSearchQuery.trim()) {
        const q = auditSearchQuery.toLowerCase();
        const matchesField = entry.field.toLowerCase().includes(q);
        const matchesActor = entry.actor.toLowerCase().includes(q);
        const matchesBehalf = (entry.actingOnBehalfOf || '').toLowerCase().includes(q);
        const matchesOld = entry.oldValue.toLowerCase().includes(q);
        const matchesNew = entry.newValue.toLowerCase().includes(q);
        if (!matchesField && !matchesActor && !matchesBehalf && !matchesOld && !matchesNew) {
          return false;
        }
      }

      return true;
    });
  }, [globalAuditTrail, auditEntityFilter, auditActorFilter, auditSearchQuery]);

  // Turnaround Time (TAT) metrics
  const tatStats = useMemo(() => {
    const completedTasks = tasks.filter((t) => t.completedAt);
    const onTime = completedTasks.filter((t) => t.status === 'Completed').length;
    const late = completedTasks.filter((t) => t.status === 'Completed Late').length;
    const overdue = tasks.filter((t) => t.status === 'Overdue').length;
    const pending = tasks.filter((t) => t.status === 'Pending').length;

    return { onTime, late, overdue, pending, total: tasks.length };
  }, [tasks]);

  // Initiative per user with custom leadership guidance and initiative thresholds
  const initiativeStats = useMemo(() => {
    return users
      .filter((u) => u.role === 'Sales Owner' || u.role === 'Pre-Sales Owner' || u.role === 'Solution Engineer')
      .map((u) => {
        const uTasks = tasks.filter((t) => t.assigneeId === u.id || t.creatorId === u.id);
        const activities = uTasks.filter((t) => t.isActivity).length;
        const assigned = uTasks.filter((t) => !t.isActivity).length;
        const total = activities + assigned;
        const actPct = total > 0 ? Math.round((activities / total) * 100) : 50;
        const asgPct = total > 0 ? Math.round((assigned / total) * 100) : 50;
        const guidanceThreshold = u.guidanceThreshold ?? 20;
        const initiativeThreshold = u.initiativeThreshold ?? 50;
        const lacksGuidance = asgPct < guidanceThreshold;
        const hasInitiative = actPct >= initiativeThreshold;

        return {
          user: u,
          activities,
          assigned,
          total,
          actPct,
          asgPct,
          guidanceThreshold,
          initiativeThreshold,
          lacksGuidance,
          hasInitiative,
        };
      });
  }, [users, tasks]);

  // Daily Reminders
  const dailyReminders = useMemo(() => {
    return tasks.filter((t) => {
      const taskDate = t.tct.split('T')[0];
      const matchDate = taskDate === reminderDate;
      const matchUser = selectedUserFilter === 'all' || t.assigneeId === selectedUserFilter;
      return matchDate && matchUser;
    });
  }, [tasks, reminderDate, selectedUserFilter]);

  return (
    <div className="space-y-6">
      {/* Report Selection Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-wrap gap-1.5 text-xs font-medium">
        <button
          onClick={() => setActiveReport('performance')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeReport === 'performance'
              ? 'bg-slate-900 text-white font-semibold'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
          }`}
        >
          Performance
        </button>
        <button
          onClick={() => setActiveReport('tat')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeReport === 'tat'
              ? 'bg-slate-900 text-white font-semibold'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
          }`}
        >
          TAT SLA
        </button>
        <button
          onClick={() => setActiveReport('initiative')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeReport === 'initiative'
              ? 'bg-slate-900 text-white font-semibold'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
          }`}
        >
          Initiative Ratio
        </button>
        <button
          onClick={() => setActiveReport('backdated')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeReport === 'backdated'
              ? 'bg-slate-900 text-white font-semibold'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
          }`}
        >
          Back-Dated Entries
        </button>
        <button
          onClick={() => setActiveReport('reminders')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeReport === 'reminders'
              ? 'bg-slate-900 text-white font-semibold'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
          }`}
        >
          Daily Reminders
        </button>
        <button
          onClick={() => setActiveReport('master')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeReport === 'master'
              ? 'bg-slate-900 text-white font-semibold'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
          }`}
        >
          Master Export
        </button>
      </div>

      {/* Active Report Rendering */}

      {/* 1. Performance Report */}
      {activeReport === 'performance' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Pipeline Performance & Conversion</h3>
              <p className="text-xs text-slate-500">
                Accounts breakdown by sector, adoption multiplier, and revenue distribution
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">
              REP-01 Standard
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {accounts.map((acc) => {
              const dv = calculateDealValue(acc.annualRevenue, acc.dealValueOverride);
              const av = calculateAccountValue(dv, acc.winningStance, acc.adoptionCategory);
              return (
                <div key={acc.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="font-bold text-slate-900 text-sm truncate">{acc.name}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {acc.sector} • {acc.stage}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-slate-500">Account Value:</span>
                    <span className="font-extrabold text-emerald-700">
                      {formatCurrencyValue(av, acc.revenueCurrency, acc.geography)}
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                    <span>Stance: {acc.winningStance}</span>
                    <span>Adoption: {acc.adoptionCategory}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Turnaround Time (TAT) */}
      {activeReport === 'tat' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Turnaround Time (TAT) & SLA Resolution Report
              </h3>
              <p className="text-xs text-slate-500">
                Resolution performance evaluated against mandatory Target Completion Time (TCT)
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
              REP-02 Standard
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="text-emerald-800 font-bold">Completed On-Time</div>
              <div className="text-2xl font-black text-emerald-900 mt-1">{tatStats.onTime}</div>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div className="text-amber-800 font-bold">Completed Late</div>
              <div className="text-2xl font-black text-amber-900 mt-1">{tatStats.late}</div>
            </div>
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <div className="text-red-800 font-bold">Currently Overdue</div>
              <div className="text-2xl font-black text-red-900 mt-1">{tatStats.overdue}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-slate-700 font-bold">Pending Within TCT</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{tatStats.pending}</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Initiative & Guidance Report (REP-03) */}
      {activeReport === 'initiative' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Initiative & Guidance Ratio Matrix (REP-03)
              </h3>
              <p className="text-xs text-slate-500">
                Activities &gt;50% indicates proactivity; Assigned &lt;20% indicates lack of leadership guidance
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800">
              Rule TASK-04
            </span>
          </div>

          <div className="space-y-3">
            {initiativeStats.map((item) => (
              <div
                key={item.user.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {item.user.name} ({item.user.role})
                  </div>
                  <div className="text-slate-500 mt-0.5">{item.user.team}</div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <span className="text-slate-500 text-[11px]">Self Activities:</span>
                    <div className="font-bold text-slate-900 tabular-nums">
                      {item.activities} ({item.actPct}%)
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[11px]">Manager Assigned:</span>
                    <div className="font-bold text-slate-900 tabular-nums">
                      {item.assigned} ({item.asgPct}%)
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[11px]">Guidance Threshold:</span>
                    <div className="font-bold text-slate-800 text-[11px]">
                      &lt;{item.guidanceThreshold}% (Deficit)
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-bold border ${
                        item.lacksGuidance
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {item.lacksGuidance ? `Low Guidance (<${item.guidanceThreshold}%)` : 'Healthy Guidance'}
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded text-xs font-bold border ${
                        item.hasInitiative
                          ? 'bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {item.hasInitiative ? `Strong Initiative (≥${item.initiativeThreshold}%)` : 'Low Initiative'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Back-Dated Entries & Enterprise Audit Register (REP-07) */}
      {activeReport === 'backdated' && (
        <div className="space-y-6">
          {/* Summary Compliance Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Audit Integrity & Actor Attribution (REP-07)
                </h3>
                <p className="text-xs text-slate-500">
                  Tracks system-recorded timestamps vs business-effective dates, including SalesOps Copilot delegated updates
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 self-start sm:self-auto border border-amber-200">
                Audit Integrity Verified
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] bg-slate-50">
                    <th className="py-2.5 px-4">User / System Actor</th>
                    <th className="py-2.5 px-4">Real-Time Entries</th>
                    <th className="py-2.5 px-4">Back-Dated Entries</th>
                    <th className="py-2.5 px-4">Delegated Actions (On Behalf)</th>
                    <th className="py-2.5 px-4">Attribution Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(backDatedStats).map(([userName, stats]) => (
                    <tr key={userName} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                        {userName === 'SalesOps Copilot' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                            SalesOps Copilot
                          </span>
                        ) : (
                          <span>{userName}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-emerald-700 font-semibold">{stats.realtime}</td>
                      <td className="py-3 px-4 text-amber-700 font-semibold">{stats.backdated}</td>
                      <td className="py-3 px-4 text-indigo-700 font-semibold">
                        {stats.onBehalfCount > 0 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {stats.onBehalfCount} on behalf
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {stats.backdated > 0 ? 'Audited with Timestamp' : 'Clean Timeline'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Enterprise Audit Trail Register */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-200 gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600" />
                  <span>Enterprise Audit Trail Register</span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-semibold">
                    {filteredAuditTrail.length} Records
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed timeline of modifications with explicit actor and &quot;On behalf of [User]&quot; provenance
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    placeholder="Search account, field, actor..."
                    value={auditSearchQuery}
                    onChange={(e) => setAuditSearchQuery(e.target.value)}
                    className="pl-8 pr-2.5 py-1 border border-slate-300 rounded text-xs bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Entity Type Filter */}
                <select
                  value={auditEntityFilter}
                  onChange={(e) => setAuditEntityFilter(e.target.value as any)}
                  className="px-2.5 py-1 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                >
                  <option value="all">All Editable Entities</option>
                  <option value="Account">Accounts Only</option>
                  <option value="Contact">Contacts Only</option>
                  <option value="Task">Tasks Only</option>
                  <option value="Admin">Admin Controls Only</option>
                </select>

                <select
                  value={auditActorFilter}
                  onChange={(e) => setAuditActorFilter(e.target.value)}
                  className="px-2.5 py-1 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="all">All Actors</option>
                  <option value="copilot">SalesOps Copilot Only</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Audit Trail Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] bg-slate-50">
                    <th className="py-2.5 px-3">Timestamp / Date</th>
                    <th className="py-2.5 px-3">Entity</th>
                    <th className="py-2.5 px-3">Target & Field</th>
                    <th className="py-2.5 px-3">Actor</th>
                    <th className="py-2.5 px-3">On Behalf Of</th>
                    <th className="py-2.5 px-3">Change Transition</th>
                    <th className="py-2.5 px-3">Provenance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAuditTrail.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        No audit records match the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditTrail.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-800">
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              entry.entityType === 'Contact'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : entry.entityType === 'Task'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : entry.entityType === 'Admin'
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}
                          >
                            {entry.entityType || 'Account'}
                          </span>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{entry.field}</div>
                          {entry.effectiveDate && (
                            <div className="text-[10px] text-slate-400">
                              Effective: {entry.effectiveDate}
                            </div>
                          )}
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {entry.actor === 'SalesOps Copilot' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[10px]">
                              <Sparkles className="w-3 h-3 text-indigo-500" />
                              SalesOps Copilot
                            </span>
                          ) : (
                            <span className="font-semibold text-slate-800">{entry.actor}</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {entry.actingOnBehalfOf ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 font-semibold text-[10px]">
                              <User className="w-3 h-3 text-amber-600" />
                              <span>{entry.actingOnBehalfOf}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Direct Action</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 max-w-xs">
                          <div className="text-[11px] truncate text-slate-500">
                            <span className="line-through text-slate-400 mr-1">{entry.oldValue}</span>
                            <span className="font-bold text-slate-900">{entry.newValue}</span>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              entry.provenance === 'Human-confirmed'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : entry.provenance === 'AI-suggested'
                                ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                : 'bg-blue-50 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {entry.provenance}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. Daily Reminders (REP-05) */}
      {activeReport === 'reminders' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Daily Reminders & Scheduled Follow-ups
              </h3>
              <p className="text-xs text-slate-500">Filter reminders by target date and assignee</p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="px-2.5 py-1 border border-slate-300 rounded text-xs bg-white"
              />
              <select
                value={selectedUserFilter}
                onChange={(e) => setSelectedUserFilter(e.target.value)}
                className="px-2.5 py-1 border border-slate-300 rounded text-xs bg-white"
              >
                <option value="all">All Assignees</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {dailyReminders.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                No reminders due on {reminderDate} for selected user.
              </div>
            ) : (
              dailyReminders.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900">{r.description}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Priority: {r.priority} • Section: {r.relatedSection}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                    {r.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 6. Master Report (REP-04) */}
      {activeReport === 'master' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Master Opportunity & Account Export Table
              </h3>
              <p className="text-xs text-slate-500">
                Comprehensive data register for business intelligence and executive reporting
              </p>
            </div>
            <button
              onClick={() => alert('Simulated CSV export ready for download!')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-xs flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export to CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] bg-slate-50">
                  <th className="py-2.5 px-3">Account</th>
                  <th className="py-2.5 px-3">Sector</th>
                  <th className="py-2.5 px-3">Geography</th>
                  <th className="py-2.5 px-3">Stage</th>
                  <th className="py-2.5 px-3">Sales Owner</th>
                  <th className="py-2.5 px-3">Procurement</th>
                  <th className="py-2.5 px-3 text-right">Account Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((a) => {
                  const dv = calculateDealValue(a.annualRevenue, a.dealValueOverride);
                  const av = calculateAccountValue(dv, a.winningStance, a.adoptionCategory);
                  return (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{a.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{a.sector}</td>
                      <td className="py-2.5 px-3 text-slate-600">{a.geography}</td>
                      <td className="py-2.5 px-3">{a.stage}</td>
                      <td className="py-2.5 px-3 text-slate-700">{a.owners.sales}</td>
                      <td className="py-2.5 px-3 text-slate-700">{a.procurementType}</td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900">
                        {formatCurrencyValue(av, a.revenueCurrency, a.geography)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
