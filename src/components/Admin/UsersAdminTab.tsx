import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { User, UserRole } from '../../types/crm';
import { UserTeam } from '../../types/admin';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Shield,
  Layers,
  Search,
  CheckCircle2,
  Plus,
  X,
  Mail,
  Building,
  UserCheck,
  Briefcase,
} from 'lucide-react';

export const UsersAdminTab: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, teams, addTeam, updateTeam, deleteTeam, currentUser, roles } = useCrm();

  const [activeSubTab, setActiveSubTab] = useState<'users' | 'teams'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');

  // Add/Edit User Modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('Sales Owner');
  const [userTeam, setUserTeam] = useState(teams[0]?.name || 'Enterprise Revenue Pod');
  const [userPartnerOrg, setUserPartnerOrg] = useState('');
  const [userOnBehalfOf, setUserOnBehalfOf] = useState('');
  const [userGuidanceThreshold, setUserGuidanceThreshold] = useState<number>(20);
  const [userInitiativeThreshold, setUserInitiativeThreshold] = useState<number>(50);

  // Add/Edit Team Modal
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<UserTeam | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamDepartment, setTeamDepartment] = useState('Sales & Expansion');
  const [teamDesc, setTeamDesc] = useState('');
  const [teamLeadId, setTeamLeadId] = useState('');

  const openAddUser = () => {
    setEditingUser(null);
    setUserName('');
    setUserEmail('');
    setUserRole('Sales Owner');
    setUserTeam(teams[0]?.name || 'Enterprise Revenue Pod');
    setUserPartnerOrg('');
    setUserOnBehalfOf('');
    setUserGuidanceThreshold(20);
    setUserInitiativeThreshold(50);
    setIsUserModalOpen(true);
  };

  const openEditUser = (u: User) => {
    setEditingUser(u);
    setUserName(u.name);
    setUserEmail(u.email);
    setUserRole(u.role);
    setUserTeam(u.team);
    setUserPartnerOrg(u.partnerOrganization || '');
    setUserOnBehalfOf(u.onBehalfOf || '');
    setUserGuidanceThreshold(u.guidanceThreshold ?? 20);
    setUserInitiativeThreshold(u.initiativeThreshold ?? 50);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;

    if (editingUser) {
      updateUser({
        ...editingUser,
        name: userName.trim(),
        email: userEmail.trim(),
        role: userRole,
        team: userTeam,
        partnerOrganization: userRole === 'Partner' ? userPartnerOrg : undefined,
        onBehalfOf: userRole === 'SalesOps' ? userOnBehalfOf : undefined,
        guidanceThreshold: Number(userGuidanceThreshold) || 20,
        initiativeThreshold: Number(userInitiativeThreshold) || 50,
      });
    } else {
      addUser({
        name: userName.trim(),
        email: userEmail.trim(),
        role: userRole,
        team: userTeam,
        avatar: `https://images.unsplash.com/photo-${1534528741775 + users.length * 1000}?w=120&auto=format&fit=crop&q=80`,
        partnerOrganization: userRole === 'Partner' ? userPartnerOrg : undefined,
        onBehalfOf: userRole === 'SalesOps' ? userOnBehalfOf : undefined,
        guidanceThreshold: Number(userGuidanceThreshold) || 20,
        initiativeThreshold: Number(userInitiativeThreshold) || 50,
      });
    }

    setIsUserModalOpen(false);
  };

  const openAddTeam = () => {
    setEditingTeam(null);
    setTeamName('');
    setTeamDepartment('Sales & Expansion');
    setTeamDesc('');
    setTeamLeadId(users[0]?.id || '');
    setIsTeamModalOpen(true);
  };

  const openEditTeam = (t: UserTeam) => {
    setEditingTeam(t);
    setTeamName(t.name);
    setTeamDepartment(t.department);
    setTeamDesc(t.description);
    setTeamLeadId(t.leadUserId || '');
    setIsTeamModalOpen(true);
  };

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    if (editingTeam) {
      updateTeam({
        ...editingTeam,
        name: teamName.trim(),
        department: teamDepartment.trim(),
        description: teamDesc.trim(),
        leadUserId: teamLeadId || undefined,
      });
    } else {
      addTeam({
        name: teamName.trim(),
        department: teamDepartment.trim(),
        description: teamDesc.trim(),
        leadUserId: teamLeadId || undefined,
        memberCount: 1,
      });
    }

    setIsTeamModalOpen(false);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.team.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' ? true : u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-5">
      {/* Sub Header & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveSubTab('users')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeSubTab === 'users'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Users Directory ({users.length})
            </button>
            <button
              onClick={() => setActiveSubTab('teams')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeSubTab === 'teams'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Group & Team Configuration ({teams.length})
            </button>
          </div>
        </div>

        <div>
          {activeSubTab === 'users' ? (
            <button
              onClick={openAddUser}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add User</span>
            </button>
          ) : (
            <button
              onClick={openAddTeam}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Team / Group</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: USERS DIRECTORY */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user name, email, or team..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-semibold text-slate-500 mr-1 shrink-0">Role:</span>
              {['All', 'Sales Owner', 'Pre-Sales Owner', 'Solution Engineer', 'Leader', 'SalesOps', 'Partner', 'Administrator'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition ${
                    roleFilter === r
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Team / Group</th>
                  <th className="py-3 px-4">Special Attribution</th>
                  <th className="py-3 px-4">Thresholds</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isCurrentUser = u.id === currentUser.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              u.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrentUser && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-100 text-blue-800 font-semibold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            u.role === 'Sales Owner'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : u.role === 'Pre-Sales Owner'
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : u.role === 'Solution Engineer'
                              ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                              : u.role === 'Leader'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : u.role === 'SalesOps'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : u.role === 'Partner'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-800 border-slate-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">{u.team}</div>
                        {u.partnerOrganization && (
                          <div className="text-[10px] text-emerald-700 font-semibold">
                            Org: {u.partnerOrganization}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {u.role === 'SalesOps' ? (
                          <div className="text-[11px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block font-medium">
                            Delegated On-behalf-of: {u.onBehalfOf || 'Vikram Malhotra'}
                          </div>
                        ) : u.role === 'Leader' ? (
                          <span className="text-[11px] text-purple-700 font-medium">
                            Enterprise Pipeline Oversight
                          </span>
                        ) : u.role === 'Partner' ? (
                          <span className="text-[11px] text-emerald-700 font-medium">
                            Scoped Ecosystem Access
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Standard User</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5 text-[11px]">
                          <span className="font-semibold text-slate-800">
                            Guidance &lt;{u.guidanceThreshold ?? 20}%
                          </span>
                          <span className="text-slate-500">
                            Initiative &ge;{u.initiativeThreshold ?? 50}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditUser(u)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Edit User Info"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {!isCurrentUser && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete user ${u.name}?`)) {
                                  deleteUser(u.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: TEAMS & GROUPS CONFIGURATION */}
      {activeSubTab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => {
            const teamMembers = users.filter((u) => u.team === team.name);
            const leadUser = users.find((u) => u.id === team.leadUserId);

            return (
              <div
                key={team.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{team.name}</h4>
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {team.department}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditTeam(team)}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded"
                        title="Edit Team"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete team ${team.name}?`)) deleteTeam(team.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                        title="Delete Team"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed">{team.description}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  {leadUser && (
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-500">Pod Lead:</span>
                      <span className="font-bold text-slate-800">{leadUser.name}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-500">Configured Members:</span>
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full">
                      {teamMembers.length} Users
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {teamMembers.map((m) => (
                      <span
                        key={m.id}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-700"
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* USER MODAL */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingUser ? 'Edit User Information' : 'Add New CRM User'}
              </h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Meera Krishnan"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="e.g. meera.k@privasapien.io"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assigned Role *</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as UserRole)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Team / Group *</label>
                  <select
                    value={userTeam}
                    onChange={(e) => setUserTeam(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conditional Field: On Behalf Of for SalesOps */}
              {userRole === 'SalesOps' && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-1.5">
                  <label className="font-bold text-amber-900 block text-xs">
                    Delegated Stakeholder ("On behalf of" Field)
                  </label>
                  <p className="text-[11px] text-amber-800">
                    Allows SalesOps to perform entries on behalf of senior stakeholders with full audit attribution.
                  </p>
                  <select
                    value={userOnBehalfOf}
                    onChange={(e) => setUserOnBehalfOf(e.target.value)}
                    className="w-full p-2 border border-amber-300 rounded-lg bg-white"
                  >
                    <option value="">Select Default Stakeholder</option>
                    {users
                      .filter((u) => u.role === 'Sales Owner' || u.role === 'Leader')
                      .map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Conditional Field: Partner Organization for Partner Role */}
              {userRole === 'Partner' && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1.5">
                  <label className="font-bold text-emerald-900 block text-xs">
                    Partner Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={userPartnerOrg}
                    onChange={(e) => setUserPartnerOrg(e.target.value)}
                    placeholder="e.g. Wipro Technologies"
                    className="w-full p-2 border border-emerald-300 rounded-lg bg-white"
                  />
                </div>
              )}
              {/* Guidance & Initiative Thresholds Configuration */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-xs">
                    Guidance & Initiative Threshold Configuration
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">Per-User Thresholds</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 block mb-1">
                      Guidance Deficit Threshold (%)
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={userGuidanceThreshold}
                        onChange={(e) => setUserGuidanceThreshold(Number(e.target.value))}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs font-semibold text-slate-900"
                      />
                      <span className="text-xs text-slate-500 font-medium">%</span>
                    </div>
                    <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                      Assigned &lt; threshold flags low guidance deficit
                    </span>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 block mb-1">
                      Initiative Target Threshold (%)
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="10"
                        max="100"
                        value={userInitiativeThreshold}
                        onChange={(e) => setUserInitiativeThreshold(Number(e.target.value))}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs font-semibold text-slate-900"
                      />
                      <span className="text-xs text-slate-500 font-medium">%</span>
                    </div>
                    <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                      Activities &ge; threshold flags high initiative
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-slate-600 font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs"
                >
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEAM MODAL */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingTeam ? 'Edit Group / Team' : 'Add New Team / Pod'}
              </h3>
              <button
                onClick={() => setIsTeamModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTeam} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Team / Pod Name *</label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. BFSI Strategic Accounts Pod"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Department *</label>
                <input
                  type="text"
                  required
                  value={teamDepartment}
                  onChange={(e) => setTeamDepartment(e.target.value)}
                  placeholder="e.g. Sales, Solution Architecture, Operations"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Designated Pod Lead</label>
                <select
                  value={teamLeadId}
                  onChange={(e) => setTeamLeadId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Select Team Lead (Optional)</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description & Scope</label>
                <textarea
                  rows={3}
                  value={teamDesc}
                  onChange={(e) => setTeamDesc(e.target.value)}
                  placeholder="Explain the coverage area, responsibilities, or target accounts..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-slate-600 font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs"
                >
                  {editingTeam ? 'Save Team' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
