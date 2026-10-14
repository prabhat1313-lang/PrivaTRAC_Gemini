import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { RoleDefinition, RolePermissions, PermissionLevel, SectionPermissionLevel, FieldPermissionLevel } from '../../types/admin';
import {
  Shield,
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Check,
  Save,
  CheckCircle2,
  Sliders,
  Sparkles,
  Info,
  X,
  HelpCircle,
} from 'lucide-react';

export const RolesAdminTab: React.FC = () => {
  const { roles, addRole, updateRole, deleteRole, updateRolePermissions, users } = useCrm();

  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id || 'role-sales-owner');
  const [activePermissionTier, setActivePermissionTier] = useState<'modules' | 'sections' | 'actions' | 'fields'>('modules');

  // Add/Edit Role Modal
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleFocusArea, setRoleFocusArea] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [roleAllowsOnBehalf, setRoleAllowsOnBehalf] = useState(false);

  // Success indicator for saving permissions
  const [saveSuccess, setSaveSuccess] = useState(false);

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  const openAddRole = () => {
    setEditingRole(null);
    setRoleName('');
    setRoleFocusArea('');
    setRoleDesc('');
    setRoleAllowsOnBehalf(false);
    setIsRoleModalOpen(true);
  };

  const openEditRole = (r: RoleDefinition) => {
    setEditingRole(r);
    setRoleName(r.name);
    setRoleFocusArea(r.focusArea);
    setRoleDesc(r.description);
    setRoleAllowsOnBehalf(r.allowsOnBehalfOf);
    setIsRoleModalOpen(true);
  };

  const handleSaveRoleInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    if (editingRole) {
      updateRole({
        ...editingRole,
        name: roleName.trim(),
        focusArea: roleFocusArea.trim(),
        description: roleDesc.trim(),
        allowsOnBehalfOf: roleAllowsOnBehalf,
      });
    } else {
      addRole({
        name: roleName.trim(),
        focusArea: roleFocusArea.trim(),
        description: roleDesc.trim(),
        isStartingRole: false,
        allowsOnBehalfOf: roleAllowsOnBehalf,
        permissions: {
          modules: {
            dashboard: 'Full Access',
            accounts: 'Full Access',
            contacts: 'Full Access',
            tasks: 'Full Access',
            demos: 'Full Access',
            partners: 'Scoped',
            mailbox: 'Full Access',
            reports: 'Read Only',
            admin: 'Hidden',
          },
          sections: {
            financialOverview: 'Full',
            pipelineFunnel: 'Full',
            aiAdvice: 'Full',
            cbacIntelligence: 'Full',
            technicalGaps: 'Full',
            partnerSwot: 'Read Only',
            collaterals: 'Full',
            auditLogs: 'Read Only',
          },
          actions: {
            addAccount: true,
            deleteAccount: false,
            overrideDealValue: false,
            completeTask: true,
            scheduleDemo: true,
            exportReports: true,
            manageUsers: false,
            delegateOnBehalfOf: roleAllowsOnBehalf,
          },
          fields: {
            dealValue: 'View',
            revenueCurrency: 'View',
            winningStance: 'Edit',
            procurementType: 'Edit',
            contactDirectPii: 'Masked',
            internalStrategyNotes: 'Edit',
          },
        },
      });
    }

    setIsRoleModalOpen(false);
  };

  const handleModulePermissionChange = (moduleKey: keyof RolePermissions['modules'], level: PermissionLevel) => {
    if (!selectedRole) return;
    const newPerms: RolePermissions = {
      ...selectedRole.permissions,
      modules: {
        ...selectedRole.permissions.modules,
        [moduleKey]: level,
      },
    };
    updateRolePermissions(selectedRole.id, newPerms);
    triggerSaveNotify();
  };

  const handleSectionPermissionChange = (sectionKey: keyof RolePermissions['sections'], level: SectionPermissionLevel) => {
    if (!selectedRole) return;
    const newPerms: RolePermissions = {
      ...selectedRole.permissions,
      sections: {
        ...selectedRole.permissions.sections,
        [sectionKey]: level,
      },
    };
    updateRolePermissions(selectedRole.id, newPerms);
    triggerSaveNotify();
  };

  const handleActionPermissionChange = (actionKey: keyof RolePermissions['actions'], enabled: boolean) => {
    if (!selectedRole) return;
    const newPerms: RolePermissions = {
      ...selectedRole.permissions,
      actions: {
        ...selectedRole.permissions.actions,
        [actionKey]: enabled,
      },
    };
    updateRolePermissions(selectedRole.id, newPerms);
    triggerSaveNotify();
  };

  const handleFieldPermissionChange = (fieldKey: keyof RolePermissions['fields'], level: FieldPermissionLevel) => {
    if (!selectedRole) return;
    const newPerms: RolePermissions = {
      ...selectedRole.permissions,
      fields: {
        ...selectedRole.permissions.fields,
        [fieldKey]: level,
      },
    };
    updateRolePermissions(selectedRole.id, newPerms);
    triggerSaveNotify();
  };

  const triggerSaveNotify = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Starting Roles Grid Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>Roles & Access Control Governance</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard starting roles from PrivaTRAC specification, customizable roles, and granular multi-level permissions
            </p>
          </div>

          <button
            onClick={openAddRole}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-2xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Role</span>
          </button>
        </div>

        {/* Roles Carousel / Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {roles.map((r) => {
            const isSelected = r.id === selectedRole?.id;
            const assignedUsers = users.filter((u) => u.role === r.name);

            return (
              <div
                key={r.id}
                onClick={() => setSelectedRoleId(r.id)}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition flex flex-col justify-between relative group ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-1.5">
                    <div>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                        <span>{r.name}</span>
                        {r.isStartingRole && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" title="Starting Standard Role" />
                        )}
                      </div>
                      <div className="text-[10px] text-blue-700 font-medium line-clamp-1 mt-0.5">
                        {r.focusArea}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditRole(r);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded"
                        title="Configure Role Metadata"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      {!r.isStartingRole && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete custom role ${r.name}?`)) {
                              deleteRole(r.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Delete Role"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                    {r.description}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-100/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">
                    {assignedUsers.length} Assigned User{assignedUsers.length === 1 ? '' : 's'}
                  </span>
                  {r.allowsOnBehalfOf && (
                    <span className="text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded font-semibold border border-amber-200">
                      "On behalf of" Enabled
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Granular Permissions Inspector for Selected Role */}
      {selectedRole && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Configuring Permissions:
                </span>
                <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {selectedRole.name}
                </span>
                {saveSuccess && (
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 animate-in fade-in flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" />
                    Updated Live
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Focus Area: {selectedRole.focusArea}
              </p>
            </div>

            {/* Permission Level Switcher Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg self-start sm:self-auto overflow-x-auto">
              <button
                onClick={() => setActivePermissionTier('modules')}
                className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                  activePermissionTier === 'modules'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Module Level
              </button>
              <button
                onClick={() => setActivePermissionTier('sections')}
                className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                  activePermissionTier === 'sections'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Section Level
              </button>
              <button
                onClick={() => setActivePermissionTier('actions')}
                className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                  activePermissionTier === 'actions'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3. Button / Action Level
              </button>
              <button
                onClick={() => setActivePermissionTier('fields')}
                className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                  activePermissionTier === 'fields'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                4. Field Level
              </button>
            </div>
          </div>

          {/* TIER 1: MODULE LEVEL PERMISSIONS */}
          {activePermissionTier === 'modules' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-50 text-xs text-slate-600 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Module-level permissions determine whether navigation items appear in the global app bar and their base browsing access mode.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { key: 'dashboard', label: 'Executive Dashboard & Funnel' },
                  { key: 'accounts', label: 'Accounts & Kanban Board' },
                  { key: 'contacts', label: 'Contacts & CBAC Access' },
                  { key: 'tasks', label: 'Tasks & RFP Subtask Deliverables' },
                  { key: 'demos', label: 'Demos & Architecture Gaps' },
                  { key: 'partners', label: 'Partner Ecosystem & Portal' },
                  { key: 'mailbox', label: 'Mailbox & Marketing Collaterals' },
                  { key: 'reports', label: 'Reports & Field Audit Trail' },
                  { key: 'admin', label: 'Admin Settings & Configurations' },
                ].map(({ key, label }) => {
                  const currentLevel =
                    selectedRole.permissions.modules[key as keyof RolePermissions['modules']] || 'Full Access';
                  return (
                    <div
                      key={key}
                      className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs shadow-2xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{label}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{key} Module</div>
                      </div>

                      <select
                        value={currentLevel}
                        onChange={(e) =>
                          handleModulePermissionChange(
                            key as keyof RolePermissions['modules'],
                            e.target.value as PermissionLevel
                          )
                        }
                        className={`text-xs font-bold px-2 py-1 rounded border focus:outline-none ${
                          currentLevel === 'Full Access'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : currentLevel === 'Read Only'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : currentLevel === 'Scoped'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        <option value="Full Access">Full Access</option>
                        <option value="Read Only">Read Only</option>
                        <option value="Scoped">Scoped (Assigned)</option>
                        <option value="Hidden">Hidden</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TIER 2: SECTION LEVEL PERMISSIONS */}
          {activePermissionTier === 'sections' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-50 text-xs text-slate-600 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Section-level permissions govern granular widgets and panes within views (e.g. pipeline calculations, AI insights, MoM gaps).
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { key: 'financialOverview', label: 'Financial Deal Value & Weighted Math' },
                  { key: 'pipelineFunnel', label: 'Sales Funnel Stage Distribution' },
                  { key: 'aiAdvice', label: 'PrivaSapien AI Action Recommendations' },
                  { key: 'cbacIntelligence', label: 'CBAC Consent Intelligence Data' },
                  { key: 'technicalGaps', label: 'MoM Technical Gaps & Logs' },
                  { key: 'partnerSwot', label: 'Partner SWOT Matrix & Co-sell Data' },
                  { key: 'collaterals', label: 'Product Collateral Repository' },
                  { key: 'auditLogs', label: 'Field-level Audit Trail Logs' },
                ].map(({ key, label }) => {
                  const currentLevel =
                    selectedRole.permissions.sections[key as keyof RolePermissions['sections']] || 'Full';
                  return (
                    <div
                      key={key}
                      className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs shadow-2xs"
                    >
                      <div className="pr-2">
                        <div className="font-bold text-slate-900">{label}</div>
                      </div>

                      <select
                        value={currentLevel}
                        onChange={(e) =>
                          handleSectionPermissionChange(
                            key as keyof RolePermissions['sections'],
                            e.target.value as SectionPermissionLevel
                          )
                        }
                        className={`text-xs font-bold px-2 py-1 rounded border focus:outline-none ${
                          currentLevel === 'Full'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : currentLevel === 'Read Only'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        <option value="Full">Full Access</option>
                        <option value="Read Only">Read Only</option>
                        <option value="Hidden">Hidden</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TIER 3: BUTTON / ACTION LEVEL PERMISSIONS */}
          {activePermissionTier === 'actions' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-50 text-xs text-slate-600 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Action-level permissions enable or disable specific operational buttons across the CRM.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { key: 'addAccount', label: 'Add Account / Org' },
                  { key: 'deleteAccount', label: 'Delete Account' },
                  { key: 'overrideDealValue', label: 'Override Deal Value' },
                  { key: 'completeTask', label: 'Complete Task & Subtask' },
                  { key: 'scheduleDemo', label: 'Schedule Technical Demo' },
                  { key: 'exportReports', label: 'Export Reports (CSV/Excel)' },
                  { key: 'manageUsers', label: 'Manage Admin Users' },
                  { key: 'delegateOnBehalfOf', label: 'Delegate "On behalf of"' },
                ].map(({ key, label }) => {
                  const isEnabled =
                    selectedRole.permissions.actions[key as keyof RolePermissions['actions']] ?? true;
                  return (
                    <div
                      key={key}
                      onClick={() =>
                        handleActionPermissionChange(
                          key as keyof RolePermissions['actions'],
                          !isEnabled
                        )
                      }
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between ${
                        isEnabled
                          ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900 font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-400 font-medium'
                      }`}
                    >
                      <span>{label}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isEnabled
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TIER 4: FIELD LEVEL PERMISSIONS */}
          {activePermissionTier === 'fields' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-50 text-xs text-slate-600 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Field-level permissions configure Edit, View, CBAC Masking, or Hidden privacy controls for specific account data attributes.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { key: 'dealValue', label: 'Deal Value (Amount)' },
                  { key: 'revenueCurrency', label: 'Revenue Currency' },
                  { key: 'winningStance', label: 'Winning Stance & Factor' },
                  { key: 'procurementType', label: 'Procurement Process' },
                  { key: 'contactDirectPii', label: 'Contact Phone & Direct Email (CBAC)' },
                  { key: 'internalStrategyNotes', label: 'Internal Account Notes & Strategy' },
                ].map(({ key, label }) => {
                  const currentLevel =
                    selectedRole.permissions.fields[key as keyof RolePermissions['fields']] || 'Edit';
                  return (
                    <div
                      key={key}
                      className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs shadow-2xs"
                    >
                      <div className="pr-2">
                        <div className="font-bold text-slate-900">{label}</div>
                      </div>

                      <select
                        value={currentLevel}
                        onChange={(e) =>
                          handleFieldPermissionChange(
                            key as keyof RolePermissions['fields'],
                            e.target.value as FieldPermissionLevel
                          )
                        }
                        className={`text-xs font-bold px-2 py-1 rounded border focus:outline-none ${
                          currentLevel === 'Edit'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : currentLevel === 'View'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : currentLevel === 'Masked'
                            ? 'bg-purple-50 text-purple-800 border-purple-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        <option value="Edit">Can Edit</option>
                        <option value="View">View Only</option>
                        <option value="Masked">Masked (CBAC)</option>
                        <option value="Hidden">Hidden</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ROLE MODAL */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingRole ? 'Configure Role' : 'Create Custom Role'}
              </h3>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRoleInfo} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Role Name *</label>
                <input
                  type="text"
                  required
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g. Regional Deal Architect"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Focus Area & Persona Scope *</label>
                <input
                  type="text"
                  required
                  value={roleFocusArea}
                  onChange={(e) => setRoleFocusArea(e.target.value)}
                  placeholder="e.g. strategic alliance / commercial pricing focus"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                  placeholder="Specify primary responsibilities, authorization boundary, and reporting lines..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="allowsOnBehalf"
                  checked={roleAllowsOnBehalf}
                  onChange={(e) => setRoleAllowsOnBehalf(e.target.checked)}
                  className="mt-0.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="allowsOnBehalf" className="text-amber-950 font-semibold cursor-pointer">
                  Allow "On behalf of" Delegated Actions (SalesOps behavior)
                  <p className="text-[11px] font-normal text-amber-800 mt-0.5">
                    Permits users with this role to manage CRM data on behalf of stakeholders with logged delegation attribution.
                  </p>
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-slate-600 font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs"
                >
                  {editingRole ? 'Save Role Configuration' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
