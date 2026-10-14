import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  History,
  Shield,
  Search,
  User,
  Calendar,
  CheckCircle2,
  Coins,
  ShieldCheck,
  Sliders,
  GitBranch,
  Users,
  Handshake,
  FileText,
  Sparkles,
} from 'lucide-react';

export const AdminAuditTab: React.FC = () => {
  const { adminAuditTrail, users } = useCrm();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [actorFilter, setActorFilter] = useState('all');

  const filteredEntries = useMemo(() => {
    return (adminAuditTrail || []).filter((entry) => {
      // Category filter
      if (categoryFilter !== 'all') {
        const f = entry.field.toLowerCase();
        if (categoryFilter === 'rates' && !f.includes('exchange rate')) return false;
        if (categoryFilter === 'roles' && !f.includes('role')) return false;
        if (categoryFilter === 'users' && !f.includes('user') && !f.includes('team')) return false;
        if (categoryFilter === 'fields' && !f.includes('field configuration')) return false;
        if (categoryFilter === 'workflows' && !f.includes('workflow')) return false;
        if (categoryFilter === 'partners' && !f.includes('partner')) return false;
        if (categoryFilter === 'collaterals' && !f.includes('collateral')) return false;
      }

      // Actor filter
      if (actorFilter !== 'all') {
        if (entry.actor !== actorFilter) return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matches =
          entry.field.toLowerCase().includes(q) ||
          entry.actor.toLowerCase().includes(q) ||
          (entry.actingOnBehalfOf || '').toLowerCase().includes(q) ||
          entry.oldValue.toLowerCase().includes(q) ||
          entry.newValue.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [adminAuditTrail, searchQuery, categoryFilter, actorFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = adminAuditTrail.length;
    const rateChanges = adminAuditTrail.filter((e) => e.field.toLowerCase().includes('exchange rate')).length;
    const roleChanges = adminAuditTrail.filter((e) => e.field.toLowerCase().includes('role')).length;
    const userChanges = adminAuditTrail.filter((e) => e.field.toLowerCase().includes('user') || e.field.toLowerCase().includes('team')).length;
    const workflowChanges = adminAuditTrail.filter((e) => e.field.toLowerCase().includes('workflow')).length;

    return { total, rateChanges, roleChanges, userChanges, workflowChanges };
  }, [adminAuditTrail]);

  const getCategoryBadge = (field: string) => {
    const f = field.toLowerCase();
    if (f.includes('exchange rate')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <Coins className="w-3 h-3" />
          <span>Exchange Rates</span>
        </span>
      );
    }
    if (f.includes('role')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
          <ShieldCheck className="w-3 h-3" />
          <span>Roles & RBAC</span>
        </span>
      );
    }
    if (f.includes('user') || f.includes('team')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
          <Users className="w-3 h-3" />
          <span>Users & Teams</span>
        </span>
      );
    }
    if (f.includes('field configuration')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <Sliders className="w-3 h-3" />
          <span>Field Config</span>
        </span>
      );
    }
    if (f.includes('workflow')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
          <GitBranch className="w-3 h-3" />
          <span>Workflows</span>
        </span>
      );
    }
    if (f.includes('partner')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
          <Handshake className="w-3 h-3" />
          <span>Partners</span>
        </span>
      );
    }
    if (f.includes('collateral')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <FileText className="w-3 h-3" />
          <span>Collaterals</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <Shield className="w-3 h-3" />
        <span>Governance</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Admin Controls & System Configuration Audit Trail
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable chronicle of all admin settings, currency baselines, RBAC adjustments, user changes, and governance policies
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg font-bold">
            {adminAuditTrail.length} Recorded Adjustments
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">Total Admin Events</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{stats.total}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Audit-tracked actions</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">Exchange Rate Events</div>
          <div className="text-xl font-bold text-emerald-700 mt-1">{stats.rateChanges}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Multi-currency shifts</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">Roles & Access Shifts</div>
          <div className="text-xl font-bold text-purple-700 mt-1">{stats.roleChanges}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">RBAC permissions modified</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">User & Directory Events</div>
          <div className="text-xl font-bold text-blue-700 mt-1">{stats.userChanges}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Users & teams configured</div>
        </div>
      </div>

      {/* Audit Log Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-200 gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search admin change, actor, or value..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-medium bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Admin Categories</option>
              <option value="rates">Currency Exchange Rates</option>
              <option value="roles">Roles & Permissions</option>
              <option value="users">Users & Teams</option>
              <option value="fields">Field Configurations</option>
              <option value="workflows">Workflows & SLAs</option>
              <option value="partners">Partner Ecosystem</option>
              <option value="collaterals">Marketing Collaterals</option>
            </select>

            {/* Actor Filter */}
            <select
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-medium bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Actors</option>
              {users.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Audit Log Entries List */}
        {filteredEntries.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold">No admin audit events match the active search/filters.</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Changes to any admin settings will automatically populate here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getCategoryBadge(entry.field)}
                    <span className="font-bold text-slate-900 text-xs">{entry.field}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        entry.provenance === 'Human-confirmed'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-blue-100 text-blue-900'
                      }`}
                    >
                      {entry.provenance}
                    </span>
                    {entry.isBackDated && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                        Back-Dated
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>

                {/* Values diff */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Previous State</span>
                    <div className="font-medium text-slate-700 break-words mt-0.5">
                      {entry.oldValue || 'None'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">New Configuration</span>
                    <div className="font-bold text-slate-900 break-words mt-0.5">
                      {entry.newValue || 'None'}
                    </div>
                  </div>
                </div>

                {/* Attribution footer */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Actor: <strong className="text-slate-800">{entry.actor}</strong></span>
                    {entry.actingOnBehalfOf && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 font-semibold text-[10px]">
                        On behalf of: <strong>{entry.actingOnBehalfOf}</strong>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Effective Date: <strong>{entry.effectiveDate}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
