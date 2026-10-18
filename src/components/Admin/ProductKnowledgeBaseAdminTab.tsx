import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { ProductContextVersion } from '../../types/crm';
import {
  FileText,
  History,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  GitBranch,
  Save,
  Check,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Search,
  Eye,
  Columns,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { COMPLEMENTARY_PARTNER_TOOLS } from '../../data/productMatrixData';

export const ProductKnowledgeBaseAdminTab: React.FC = () => {
  const {
    productContextVersions,
    activeContextVersion,
    createContextVersion,
    revertContextVersion,
    updateDraftContextVersion,
    commitDraftContextVersion,
    currentUser,
  } = useCrm();

  const [selectedVersionId, setSelectedVersionId] = useState<string>(activeContextVersion.id);
  const [isEditing, setIsEditing] = useState(false);
  const [editorContent, setEditorContent] = useState(activeContextVersion.content);
  const [changeSummaryInput, setChangeSummaryInput] = useState('');
  const [viewMode, setViewMode] = useState<'content' | 'diff' | 'partners'>('content');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const selectedVersion =
    productContextVersions.find((v) => v.id === selectedVersionId) || activeContextVersion;

  const handleSelectVersion = (v: ProductContextVersion) => {
    setSelectedVersionId(v.id);
    setEditorContent(v.content);
    setIsEditing(false);
  };

  const handleSaveDraftChanges = () => {
    if (!editorContent.trim()) return;
    updateDraftContextVersion(
      selectedVersion.id,
      editorContent,
      changeSummaryInput || 'Updated context content via Admin editor'
    );
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
    setIsEditing(false);
  };

  const handleCreateNewVersion = () => {
    if (!editorContent.trim()) return;
    const currentVerParts = activeContextVersion.version.replace('-draft', '').split('.');
    const minor = parseInt(currentVerParts[1] || '0', 10) + 1;
    const newVersionName = `${currentVerParts[0]}.${minor}.0`;

    createContextVersion({
      version: newVersionName,
      createdBy: currentUser.name,
      changeSummary: changeSummaryInput || `Manual update created by ${currentUser.name}`,
      content: editorContent,
      isActive: true,
      isDraft: false,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
    setIsEditing(false);
    setChangeSummaryInput('');
  };

  // Simple line-by-line diff calculator
  const calculateDiff = () => {
    const baseLines = activeContextVersion.content.split('\n');
    const targetLines = selectedVersion.content.split('\n');
    const maxLen = Math.max(baseLines.length, targetLines.length);
    const diffs: { type: 'same' | 'added' | 'removed' | 'changed'; base?: string; target?: string }[] = [];

    for (let i = 0; i < maxLen; i++) {
      const b = baseLines[i];
      const t = targetLines[i];
      if (b === t) {
        diffs.push({ type: 'same', base: b, target: t });
      } else if (b === undefined) {
        diffs.push({ type: 'added', target: t });
      } else if (t === undefined) {
        diffs.push({ type: 'removed', base: b });
      } else {
        diffs.push({ type: 'changed', base: b, target: t });
      }
    }
    return diffs;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Product Knowledge Base & Context Engine
              </h3>
              <p className="text-xs text-slate-500">
                Maintain product specifications, certified architecture boundaries, and preliminary response rules with version history & rollback
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setViewMode('content')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
              viewMode === 'content'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Context Document</span>
          </button>
          <button
            onClick={() => setViewMode('diff')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
              viewMode === 'diff'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5 text-slate-500" />
            <span>Version Diff</span>
          </button>
          <button
            onClick={() => setViewMode('partners')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
              viewMode === 'partners'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Partner Gap Matrix</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Timeline / Version List, Right Document / Editor / Diff */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Version History Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-600" />
                <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Version History
                </span>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                {productContextVersions.length} versions
              </span>
            </div>

            <div className="space-y-2">
              {productContextVersions.map((v) => {
                const isSelected = v.id === selectedVersion.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => handleSelectVersion(v)}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition ${
                      isSelected
                        ? 'bg-indigo-50/60 border-indigo-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900">
                          v{v.version}
                        </span>
                        {v.isActive && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Active
                          </span>
                        )}
                        {v.isDraft && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Draft
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(v.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 mb-1.5">
                      {v.changeSummary}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100/80">
                      <span>By: {v.createdBy}</span>
                      {v.sourceSoWAccountName && (
                        <span className="text-indigo-600 font-medium truncate max-w-[110px]" title={v.sourceSoWAccountName}>
                          {v.sourceSoWAccountName}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content / Editor / Diff Main Panel */}
        <div className="lg:col-span-3 space-y-4">
          {viewMode === 'partners' ? (
            /* Complementary Partner Matrix Reference */
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Curated Enterprise Complementary Tools & Partner Mapping
                  </h4>
                  <p className="text-xs text-slate-500">
                    When customer SoWs request perimeter, endpoint, or media isolation controls outside PrivaSapien's native PETs kernel, preliminary AI automatically recommends these verified enterprise tools.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                  {Object.keys(COMPLEMENTARY_PARTNER_TOOLS).length} Tool Categories
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Domain Category</th>
                      <th className="py-2.5 px-3">Top Enterprise Solution</th>
                      <th className="py-2.5 px-3">Primary Vendor</th>
                      <th className="py-2.5 px-3">Verified Integration & Rationale</th>
                      <th className="py-2.5 px-3">Alternative Tools</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(COMPLEMENTARY_PARTNER_TOOLS).map(([category, info]) => (
                      <tr key={category} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                          {category}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {info.solutionName}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-800">
                          {info.topVendor}
                        </td>
                        <td className="py-3 px-3 text-slate-600 max-w-sm">
                          {info.rationale}
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px]">
                          {info.alternativeVendors.join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : viewMode === 'diff' ? (
            /* Diff View */
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Comparing v{selectedVersion.version} with Active Baseline (v{activeContextVersion.version})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Review clause modifications, additions, and approved scope updates before committing to active context.
                  </p>
                </div>
                {selectedVersion.id !== activeContextVersion.id && (
                  <button
                    onClick={() => revertContextVersion(selectedVersion.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-700 transition shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore & Set v{selectedVersion.version} Active
                  </button>
                )}
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-950 font-mono text-[11px] p-4 max-h-[550px] overflow-y-auto space-y-0.5">
                {calculateDiff().map((d, idx) => {
                  if (d.type === 'same') {
                    return (
                      <div key={idx} className="text-slate-400 pl-4 py-0.5 hover:bg-slate-900">
                        {d.target || d.base}
                      </div>
                    );
                  }
                  if (d.type === 'added') {
                    return (
                      <div key={idx} className="bg-emerald-950/70 text-emerald-300 pl-4 py-0.5 border-l-2 border-emerald-500">
                        + {d.target}
                      </div>
                    );
                  }
                  if (d.type === 'removed') {
                    return (
                      <div key={idx} className="bg-rose-950/70 text-rose-300 pl-4 py-0.5 border-l-2 border-rose-500 line-through">
                        - {d.base}
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="bg-amber-950/70 text-amber-300 pl-4 py-0.5 border-l-2 border-amber-500">
                      ~ {d.target}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Document Content / Editor View */
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
              {/* Context Actions Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    Product Context Specification v{selectedVersion.version}
                  </span>
                  {selectedVersion.isActive ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Active Backend Baseline
                    </span>
                  ) : (
                    <button
                      onClick={() => revertContextVersion(selectedVersion.id)}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition inline-flex items-center gap-1"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      Set as Active
                    </button>
                  )}
                  {selectedVersion.isDraft && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Pending Draft
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {selectedVersion.isDraft && (
                    <button
                      onClick={() => commitDraftContextVersion(selectedVersion.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-700 transition shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Commit Draft to Active v1.1.0
                    </button>
                  )}

                  {!isEditing ? (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditorContent(selectedVersion.content);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Edit Context Text
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium text-xs hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={selectedVersion.isDraft ? handleSaveDraftChanges : handleCreateNewVersion}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-700 transition shadow-xs"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {selectedVersion.isDraft ? 'Save Draft Updates' : 'Publish New Version'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {savedSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Product context specifications updated successfully.</span>
                </div>
              )}

              {/* Version Metadata Summary */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-slate-600">
                  <span>Author: <strong>{selectedVersion.createdBy}</strong></span>
                  <span>•</span>
                  <span>Published: <strong>{new Date(selectedVersion.createdAt).toLocaleString()}</strong></span>
                  {selectedVersion.sourceSoWAccountName && (
                    <>
                      <span>•</span>
                      <span>Source SoW: <strong className="text-indigo-700">{selectedVersion.sourceSoWAccountName}</strong></span>
                    </>
                  )}
                </div>
                <div className="text-slate-500 italic text-[11px]">
                  "{selectedVersion.changeSummary}"
                </div>
              </div>

              {/* Document Text or Textarea */}
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Change Summary Note
                    </label>
                    <input
                      type="text"
                      value={changeSummaryInput}
                      onChange={(e) => setChangeSummaryInput(e.target.value)}
                      placeholder="e.g. Added Section 6 with approved compliance commitments from SBI RFP"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Context Document Content (Markdown)
                    </label>
                    <textarea
                      rows={18}
                      value={editorContent}
                      onChange={(e) => setEditorContent(e.target.value)}
                      className="w-full p-4 border border-slate-300 rounded-lg text-xs font-mono bg-slate-900 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-5 border border-slate-200 rounded-lg bg-slate-50/50 max-h-[600px] overflow-y-auto">
                  <pre className="text-xs font-mono whitespace-pre-wrap text-slate-800 leading-relaxed">
                    {selectedVersion.content}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
