import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { CustomFieldConfig, EntityType, CustomFieldType } from '../../types/admin';
import {
  Sliders,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Building2,
  Users2,
  CheckSquare2,
  Presentation,
  X,
  HelpCircle,
  Tag,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export const FieldConfigsAdminTab: React.FC = () => {
  const { customFields, addCustomField, updateCustomField, deleteCustomField } = useCrm();

  const [activeEntity, setActiveEntity] = useState<EntityType>('Account');

  // Add Field Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fieldName, setFieldName] = useState('');
  const [fieldKey, setFieldKey] = useState('');
  const [fieldType, setFieldType] = useState<CustomFieldType>('text');
  const [fieldOptions, setFieldOptions] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [isAuditTracked, setIsAuditTracked] = useState(true);
  const [description, setDescription] = useState('');
  const [defaultValue, setDefaultValue] = useState('');

  const entityFields = customFields.filter((f) => f.entity === activeEntity);

  const openAdd = () => {
    setFieldName('');
    setFieldKey('');
    setFieldType('text');
    setFieldOptions('');
    setIsRequired(false);
    setIsAuditTracked(true);
    setDescription('');
    setDefaultValue('');
    setIsModalOpen(true);
  };

  const handleFieldNameChange = (val: string) => {
    setFieldName(val);
    const generatedKey = val
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .trim()
      .replace(/\s+(.)/g, (_, c) => c.toUpperCase());
    setFieldKey(generatedKey);
  };

  const handleSaveField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName.trim() || !fieldKey.trim()) return;

    const parsedOptions =
      fieldType === 'select' || fieldType === 'multiselect'
        ? fieldOptions
            .split(',')
            .map((o) => o.trim())
            .filter(Boolean)
        : undefined;

    addCustomField({
      entity: activeEntity,
      fieldName: fieldName.trim(),
      fieldKey: fieldKey.trim(),
      fieldType,
      options: parsedOptions,
      required: isRequired,
      isCustom: true,
      active: true,
      description: description.trim(),
      defaultValue: defaultValue.trim(),
      auditTracked: isAuditTracked,
    });

    setIsModalOpen(false);
  };

  const toggleFieldActive = (field: CustomFieldConfig) => {
    updateCustomField({
      ...field,
      active: !field.active,
    });
  };

  const toggleFieldAudit = (field: CustomFieldConfig) => {
    updateCustomField({
      ...field,
      auditTracked: !field.auditTracked,
    });
  };

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Entity Field Configurations & Schema Manager
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure standard attributes, add custom enterprise metadata fields, and enforce field-level audit trails
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-2xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Field ({activeEntity})</span>
        </button>
      </div>

      {/* Entity Selector Pills */}
      <div className="flex bg-white p-2 rounded-xl border border-slate-200 shadow-2xs gap-1.5 overflow-x-auto">
        {(
          [
            { id: 'Account' as EntityType, label: 'Accounts', icon: Building2 },
            { id: 'Contact' as EntityType, label: 'Contacts', icon: Users2 },
            { id: 'Task' as EntityType, label: 'Tasks & RFPs', icon: CheckSquare2 },
            { id: 'Demo' as EntityType, label: 'Demos & Gaps', icon: Presentation },
          ] as const
        ).map((ent) => {
          const Icon = ent.icon;
          const isActive = activeEntity === ent.id;
          const count = customFields.filter((f) => f.entity === ent.id).length;

          return (
            <button
              key={ent.id}
              onClick={() => setActiveEntity(ent.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{ent.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fields Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px]">
              <th className="py-3 px-4">Field Name & Key</th>
              <th className="py-3 px-4">Data Type</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Mandatory</th>
              <th className="py-3 px-4">Audit Trail</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entityFields.map((field) => (
              <tr key={field.id} className="hover:bg-slate-50/70 transition">
                <td className="py-3 px-4">
                  <div>
                    <div className="font-bold text-slate-900">{field.fieldName}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      key: {field.fieldKey}
                    </div>
                    {field.description && (
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{field.description}</p>
                    )}
                  </div>
                </td>

                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-800 border border-slate-200">
                    {field.fieldType}
                  </span>
                  {field.options && field.options.length > 0 && (
                    <div className="text-[10px] text-slate-400 mt-1 line-clamp-1 max-w-xs">
                      Options: {field.options.join(', ')}
                    </div>
                  )}
                </td>

                <td className="py-3 px-4">
                  {field.isCustom ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      Custom Field
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      System Core
                    </span>
                  )}
                </td>

                <td className="py-3 px-4">
                  {field.required ? (
                    <span className="text-rose-700 font-bold text-[11px]">Required *</span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Optional</span>
                  )}
                </td>

                <td className="py-3 px-4">
                  <button
                    onClick={() => toggleFieldAudit(field)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition ${
                      field.auditTracked
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                    }`}
                    title="Toggle Audit Trail Logging"
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>{field.auditTracked ? 'Tracked' : 'Excluded'}</span>
                  </button>
                </td>

                <td className="py-3 px-4">
                  <button
                    onClick={() => toggleFieldActive(field)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition ${
                      field.active
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {field.active ? 'Active' : 'Disabled'}
                  </button>
                </td>

                <td className="py-3 px-4 text-right">
                  {field.isCustom ? (
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete custom field "${field.fieldName}"?`)) {
                          deleteCustomField(field.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Custom Field"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-300 italic">Locked</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Custom Field Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Add Custom Field to {activeEntity}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveField} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Field Label *</label>
                <input
                  type="text"
                  required
                  value={fieldName}
                  onChange={(e) => handleFieldNameChange(e.target.value)}
                  placeholder="e.g. Data Governance Board Lead"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">System Key (API / DB) *</label>
                  <input
                    type="text"
                    required
                    value={fieldKey}
                    onChange={(e) => setFieldKey(e.target.value)}
                    placeholder="e.g. dataGovernanceBoardLead"
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Field Type *</label>
                  <select
                    value={fieldType}
                    onChange={(e) => setFieldType(e.target.value as CustomFieldType)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="text">Single Line Text</option>
                    <option value="number">Numeric</option>
                    <option value="currency">Currency Amount</option>
                    <option value="select">Single Select (Dropdown)</option>
                    <option value="multiselect">Multi-Select Pills</option>
                    <option value="date">Date Picker</option>
                    <option value="boolean">Boolean Switch (Yes/No)</option>
                    <option value="textarea">Multi-line Textarea</option>
                  </select>
                </div>
              </div>

              {(fieldType === 'select' || fieldType === 'multiselect') && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Options (Comma-separated) *
                  </label>
                  <input
                    type="text"
                    required
                    value={fieldOptions}
                    onChange={(e) => setFieldOptions(e.target.value)}
                    placeholder="e.g. Tier-1 Sovereign, Hybrid Cloud, On-Premises Airgap"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Default Value (Optional)</label>
                <input
                  type="text"
                  value={defaultValue}
                  onChange={(e) => setDefaultValue(e.target.value)}
                  placeholder="e.g. Unassigned"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Help / Description Text</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain when and how this field should be filled..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRequired}
                    onChange={(e) => setIsRequired(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-bold text-slate-800">Mandatory / Required</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAuditTracked}
                    onChange={(e) => setIsAuditTracked(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-bold text-slate-800">Field-Level Audit Trail</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-slate-600 font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs"
                >
                  Add Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
