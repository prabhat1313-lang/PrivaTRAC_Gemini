import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { MatrixHierarchyLevel, AvailabilityStatus, ProductMatrixTag } from '../../types/crm';
import {
  Layers,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  MoveUp,
  MoveDown,
  Sparkles,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Info,
} from 'lucide-react';

export const ProductMatrixConfigAdminTab: React.FC = () => {
  const {
    matrixHierarchyLevels,
    updateMatrixHierarchyLevels,
    matrixAvailabilityStatuses,
    setMatrixAvailabilityStatuses,
    matrixTags,
    setMatrixTags,
    productMatrixRequirements,
  } = useCrm();

  // Hierarchy editing state
  const [hierarchyDraft, setHierarchyDraft] = useState<MatrixHierarchyLevel[]>(matrixHierarchyLevels);
  const [editingLevelId, setEditingLevelId] = useState<string | null>(null);
  const [editingLevelLabel, setEditingLevelLabel] = useState('');
  const [newLevelName, setNewLevelName] = useState('');

  // Statuses editing state
  const [newStatusInput, setNewStatusInput] = useState('');
  const [statusesSuccess, setStatusesSuccess] = useState(false);

  // Tags editing state
  const [newTagInput, setNewTagInput] = useState('');
  const [tagsSuccess, setTagsSuccess] = useState(false);

  // Hierarchy Handlers
  const handleToggleLevel = (levelId: string) => {
    const updated = hierarchyDraft.map((h) =>
      h.id === levelId ? { ...h, enabled: !h.enabled } : h
    );
    setHierarchyDraft(updated);
    updateMatrixHierarchyLevels(updated);
  };

  const handleMoveLevel = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === hierarchyDraft.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const copy = [...hierarchyDraft];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);

    const reordered = copy.map((lvl, idx) => ({ ...lvl, order: idx + 1 }));
    setHierarchyDraft(reordered);
    updateMatrixHierarchyLevels(reordered);
  };

  const handleSaveLevelLabel = (levelId: string) => {
    if (!editingLevelLabel.trim()) return;
    const updated = hierarchyDraft.map((h) =>
      h.id === levelId ? { ...h, label: editingLevelLabel.trim() } : h
    );
    setHierarchyDraft(updated);
    updateMatrixHierarchyLevels(updated);
    setEditingLevelId(null);
  };

  const handleAddHierarchyLevel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLevelName.trim()) return;
    const newLvl: MatrixHierarchyLevel = {
      id: `lvl-${Date.now()}`,
      name: newLevelName.trim().toLowerCase().replace(/\s+/g, '-'),
      label: newLevelName.trim(),
      order: hierarchyDraft.length + 1,
      enabled: true,
      description: `Custom tier level for ${newLevelName.trim()}`,
    };
    const updated = [...hierarchyDraft, newLvl];
    setHierarchyDraft(updated);
    updateMatrixHierarchyLevels(updated);
    setNewLevelName('');
  };

  // Availability Status Handlers
  const handleAddStatus = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newStatusInput.trim() as AvailabilityStatus;
    if (!trimmed || matrixAvailabilityStatuses.includes(trimmed)) return;
    const updated = [...matrixAvailabilityStatuses, trimmed];
    setMatrixAvailabilityStatuses(updated);
    setNewStatusInput('');
    setStatusesSuccess(true);
    setTimeout(() => setStatusesSuccess(false), 2000);
  };

  const handleRemoveStatus = (status: AvailabilityStatus) => {
    if (matrixAvailabilityStatuses.length <= 1) return;
    const updated = matrixAvailabilityStatuses.filter((s) => s !== status);
    setMatrixAvailabilityStatuses(updated);
  };

  // Tag Handlers
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTagInput.trim() as ProductMatrixTag;
    if (!trimmed || matrixTags.includes(trimmed)) return;
    const updated = [...matrixTags, trimmed];
    setMatrixTags(updated);
    setNewTagInput('');
    setTagsSuccess(true);
    setTimeout(() => setTagsSuccess(false), 2000);
  };

  const handleRemoveTag = (tag: ProductMatrixTag) => {
    if (matrixTags.length <= 1) return;
    const updated = matrixTags.filter((t) => t !== tag);
    setMatrixTags(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-2xs">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              Product Requirements Matrix Configuration
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize the multi-tier product grouping hierarchy, availability statuses, and capability tags consumed across tenders and product roadmap
            </p>
          </div>
        </div>

        <div className="px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-800 font-medium flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-600" />
          <span>Affects {productMatrixRequirements.length} tracked client requirements</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Configurable Multi-Tier Hierarchy */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-700" />
                Product Hierarchy Configuration
              </h4>
              <p className="text-xs text-slate-500">
                Define the grouping levels (e.g. 3-tier prototype or custom N-tier for production)
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {hierarchyDraft.map((lvl, idx) => (
              <div
                key={lvl.id}
                className={`p-3 rounded-lg border flex items-center justify-between gap-3 transition ${
                  lvl.enabled
                    ? 'bg-slate-50/70 border-slate-200'
                    : 'bg-slate-100/50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>

                  {editingLevelId === lvl.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={editingLevelLabel}
                        onChange={(e) => setEditingLevelLabel(e.target.value)}
                        className="px-2 py-1 text-xs border border-indigo-400 rounded focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveLevelLabel(lvl.id)}
                        className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        title="Save"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{lvl.label}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({lvl.name})</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{lvl.description}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleMoveLevel(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-200"
                    title="Move Up"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveLevel(idx, 'down')}
                    disabled={idx === hierarchyDraft.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-200"
                    title="Move Down"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingLevelId(lvl.id);
                      setEditingLevelLabel(lvl.label || lvl.name);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200"
                    title="Edit Name"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleToggleLevel(lvl.id)}
                    className="p-1 text-slate-500 hover:text-slate-800"
                    title={lvl.enabled ? 'Disable Level' : 'Enable Level'}
                  >
                    {lvl.enabled ? (
                      <ToggleRight className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Tier Level Form */}
          <form onSubmit={handleAddHierarchyLevel} className="pt-2 flex items-center gap-2">
            <input
              type="text"
              value={newLevelName}
              onChange={(e) => setNewLevelName(e.target.value)}
              placeholder="e.g. Sub-Module or Capability Cluster"
              className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Tier Level
            </button>
          </form>
        </div>

        {/* Section 2: Availability Statuses & Capability Tags */}
        <div className="space-y-6">
          {/* Availability Statuses */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Availability Status Options
                </h4>
                <p className="text-xs text-slate-500">
                  Configure status choices used for requirement gap identification
                </p>
              </div>
            </div>

            {statusesSuccess && (
              <div className="p-2 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-200">
                Availability status options updated.
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {matrixAvailabilityStatuses.map((status) => (
                <span
                  key={status}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                >
                  <span>{status}</span>
                  {matrixAvailabilityStatuses.length > 1 && (
                    <button
                      onClick={() => handleRemoveStatus(status)}
                      className="text-slate-400 hover:text-rose-600 transition"
                      title="Remove status"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>

            <form onSubmit={handleAddStatus} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={newStatusInput}
                onChange={(e) => setNewStatusInput(e.target.value)}
                placeholder="Add custom status (e.g. Under R&D)"
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Status
              </button>
            </form>
          </div>

          {/* Product Matrix Tags */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-indigo-600" />
                  Product Matrix Capability Tags
                </h4>
                <p className="text-xs text-slate-500">
                  Engineering and integration tags mapped to client requirements
                </p>
              </div>
            </div>

            {tagsSuccess && (
              <div className="p-2 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-200">
                Matrix tags updated.
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {matrixTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200"
                >
                  <Tag className="w-2.5 h-2.5 text-indigo-500" />
                  <span>{tag}</span>
                  {matrixTags.length > 1 && (
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-indigo-400 hover:text-rose-600 transition"
                      title="Remove tag"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>

            <form onSubmit={handleAddTag} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="Add custom tag (e.g. Partner Sourced)"
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Tag
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
