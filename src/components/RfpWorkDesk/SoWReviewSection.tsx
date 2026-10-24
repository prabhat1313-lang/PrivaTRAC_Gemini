import React, { useState } from 'react';
import { useRfp } from '../../context/RfpContext';
import { useCrm } from '../../context/CrmContext';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Sparkles,
  Search,
  ExternalLink,
  Shield,
  Layers,
  Wrench,
  UserCheck,
  Edit3,
  Plus,
  FileCode,
  Check,
  BookOpen,
  Tag,
  X,
} from 'lucide-react';
import { SowLineItem, ThirdPartyCategory, FrdItem } from '../../types/rfp';
import { VerbatimExcerptViewer } from './VerbatimExcerptViewer';
import { SectionTasksComments } from './SectionTasksComments';

export const SoWReviewSection: React.FC = () => {
  const {
    sowList,
    updateSowCompliance,
    addSowQaReview,
    suggestAlternateToolForSow,
    selectedTender,
    frdList,
    mapFrdToSowClause,
    unmapFrdFromSowClause,
    addFrd,
  } = useRfp();
  const { currentUser } = useCrm();

  // Search & Filter
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing Compliance Response
  const [editingSowId, setEditingSowId] = useState<string | null>(null);
  const [editComplianceStatus, setEditComplianceStatus] =
    useState<SowLineItem['complianceStatus']>('Complied');
  const [editResponseText, setEditResponseText] = useState('');

  // Product QA Review Modal
  const [qaReviewSowId, setQaReviewSowId] = useState<string | null>(null);
  const [qaStatus, setQaStatus] = useState<'Approved' | 'Requires Clarification' | 'Flagged'>(
    'Approved'
  );
  const [qaComment, setQaComment] = useState('');

  // 3P Alternate Tool Engine Modal
  const [suggestingToolSowId, setSuggestingToolSowId] = useState<string | null>(null);
  const [selectedToolCategory, setSelectedToolCategory] = useState<ThirdPartyCategory>('DSPM');
  const [customToolName, setCustomToolName] = useState('Sentra / Cyera DSPM Enterprise');
  const [customVendor, setCustomVendor] = useState('Sentra');
  const [customRationale, setCustomRationale] = useState(
    'Specialized data security posture management for multi-cloud and on-prem shadow data classification.'
  );

  // FRD Mapping & Creation Modal State
  const [frdModalSowId, setFrdModalSowId] = useState<string | null>(null);
  const [frdActiveTab, setFrdActiveTab] = useState<'map' | 'draft'>('map');
  const [frdSearch, setFrdSearch] = useState('');
  const [newFrdTitle, setNewFrdTitle] = useState('');
  const [newFrdModule, setNewFrdModule] = useState<FrdItem['module']>('Differential Privacy');
  const [newFrdProductFamily, setNewFrdProductFamily] = useState<FrdItem['productFamily']>('PETs Core');
  const [newFrdStatus, setNewFrdStatus] = useState<FrdItem['status']>('In Development');
  const [newFrdTargetRelease, setNewFrdTargetRelease] = useState('v4.3 (Q1 2027)');
  const [newFrdSpecSummary, setNewFrdSpecSummary] = useState('');
  const [newFrdCriteria, setNewFrdCriteria] = useState('Sub-millisecond query evaluation\nZero raw data exposure audit');

  const tenderSowItems = sowList.filter((s) => s.rfpId === selectedTender.id);

  const filteredItems = tenderSowItems.filter((item) => {
    const matchesStatus = filterStatus === 'all' || item.complianceStatus === filterStatus;
    const matchesSearch =
      item.clauseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.verbatimText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.complianceResponseText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleSaveCompliance = (sowId: string) => {
    updateSowCompliance(
      sowId,
      editComplianceStatus,
      editResponseText.trim(),
      currentUser?.name || 'Ananya Sharma (Pre-Sales Lead)'
    );

    setEditingSowId(null);
  };

  const handleSaveQaReview = (sowId: string) => {
    if (!qaComment.trim()) return;

    addSowQaReview(
      sowId,
      qaStatus,
      qaComment.trim(),
      currentUser?.name || 'Product Team QA'
    );

    setQaReviewSowId(null);
    setQaComment('');
  };

  const handleApply3pTool = (sowId: string) => {
    suggestAlternateToolForSow(
      sowId,
      selectedToolCategory,
      customToolName.trim(),
      customVendor.trim(),
      customRationale.trim()
    );

    setSuggestingToolSowId(null);
  };

  const handleDraftNewFrd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFrdTitle.trim() || !frdModalSowId) return;

    const criteriaList = newFrdCriteria
      .split('\n')
      .map((c) => c.trim())
      .filter(Boolean);

    const createdId = addFrd({
      title: newFrdTitle.trim(),
      module: newFrdModule,
      productFamily: newFrdProductFamily,
      status: newFrdStatus,
      targetRelease: newFrdTargetRelease,
      specSummary: newFrdSpecSummary.trim() || 'Specification drafted from RFP tender requirement.',
      technicalAcceptanceCriteria: criteriaList.length > 0 ? criteriaList : ['Verification in sandbox harness'],
      mappedSowClauses: [],
      createdBy: currentUser?.name || 'Pre-Sales Architect',
    });

    mapFrdToSowClause(frdModalSowId, createdId);

    setNewFrdTitle('');
    setNewFrdSpecSummary('');
    setFrdModalSowId(null);
  };

  const toolCategories: ThirdPartyCategory[] = [
    'DSPM',
    'DLP',
    'EDR',
    'XDR',
    'DAG',
    'DAM',
    'HSM',
    'KMS',
    'SIEM',
    'SOAR',
    'UEBA',
    'IAM',
    'PAM',
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Scope of Work (SoW) Compliance & 3P Ecosystem Engine
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
              Cluster 1 · Section 3
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Clause-by-clause compliance auto-fill using PrivaSapien native IP and roadmap capabilities. Out-of-scope requirements auto-classify into cybersecurity tool types (DSPM, DLP, HSM, IAM, etc.) with targeted tool recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Compliance Coverage:</span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
            100% Evaluated
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All Clauses' },
            { id: 'Complied', label: 'Complied' },
            { id: 'Partially Complied', label: 'Partially Complied' },
            { id: 'Exception / Deviation', label: 'Deviations' },
            { id: 'Not Complied', label: 'Not Complied' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clause text, product, response..."
            className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 w-64 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* SoW Clauses List */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-slate-300 transition"
          >
            {/* Header: Clause Number, Category, Compliance Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded">
                  {item.clauseNumber}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs font-bold text-slate-700">{item.category}</span>
                {item.isPrivasapienNative ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    PrivaSapien Native IP
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
                    <Wrench className="w-3 h-3" />
                    3P Ecosystem Extension ({item.thirdPartyCategory || 'Tool'})
                  </span>
                )}

                {/* Mapped FRD Badges & +FRD Button */}
                <span className="text-slate-300">·</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(item.mappedFrdIds || []).map((frdId) => {
                    const frdObj = frdList.find((f) => f.id === frdId);
                    return (
                      <span
                        key={frdId}
                        title={
                          frdObj
                            ? `${frdObj.title} (${frdObj.status} · ${frdObj.targetRelease})`
                            : frdId
                        }
                        className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded shadow-2xs"
                      >
                        <FileCode className="w-2.5 h-2.5 text-indigo-600" />
                        <span>{frdId}</span>
                        {frdObj && (
                          <span className="text-[9px] font-sans font-normal text-slate-500">
                            · {frdObj.status}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => unmapFrdFromSowClause(item.id, frdId)}
                          title="Unmap FRD from this clause"
                          className="hover:text-rose-600 ml-0.5 cursor-pointer font-bold text-slate-400"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setFrdModalSowId(item.id);
                      setFrdActiveTab('map');
                      setFrdSearch('');
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-300 px-2 py-0.5 rounded transition cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>+FRD</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded ${
                    item.complianceStatus === 'Complied'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : item.complianceStatus === 'Partially Complied'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {item.complianceStatus}
                </span>
              </div>
            </div>

            {/* Verbatim Excerpt Viewer with [AI] Chip */}
            <VerbatimExcerptViewer
              clauseNumber={item.clauseNumber}
              pageNumber={item.pageNumber}
              verbatimText={item.verbatimText}
              aiSummary={`Evaluated against PrivaSapien capability: ${item.privasapienProductMatch}`}
              aiRiskNote={
                item.requiresThirdPartyTool
                  ? `Requires external ${item.thirdPartyCategory} component integration.`
                  : undefined
              }
              aiPositioningNote={item.preSalesLeadNotes}
              tenderDocName={selectedTender.tenderDocName}
            />

            {/* Compliance Response Block */}
            {editingSowId === item.id ? (
              <div className="p-3.5 bg-slate-50 border border-indigo-300 rounded-lg space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900">
                    Edit Final Tender Compliance Statement
                  </span>
                  <select
                    value={editComplianceStatus}
                    onChange={(e) =>
                      setEditComplianceStatus(e.target.value as SowLineItem['complianceStatus'])
                    }
                    className="text-xs border border-slate-300 rounded p-1 bg-white font-bold"
                  >
                    <option value="Complied">Complied</option>
                    <option value="Partially Complied">Partially Complied</option>
                    <option value="Exception / Deviation">Exception / Deviation</option>
                    <option value="Not Complied">Not Complied</option>
                  </select>
                </div>

                <textarea
                  value={editResponseText}
                  onChange={(e) => setEditResponseText(e.target.value)}
                  rows={3}
                  className="w-full text-xs rounded border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSowId(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveCompliance(item.id)}
                    className="px-4 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 shadow-2xs"
                  >
                    Save Compliance Response
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-lg text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Official Tender Compliance Response:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSowId(item.id);
                      setEditComplianceStatus(item.complianceStatus);
                      setEditResponseText(item.complianceResponseText);
                    }}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Response</span>
                  </button>
                </div>
                <p className="text-slate-800 leading-relaxed font-sans">{item.complianceResponseText}</p>
                {item.preSalesLeadNotes && (
                  <div className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                    Lead Note: {item.preSalesLeadNotes}
                  </div>
                )}
              </div>
            )}

            {/* 3P Alternate Tool Suggestion Card (if applicable) */}
            {item.requiresThirdPartyTool && item.suggestedThirdPartyTool && (
              <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-lg text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px] uppercase tracking-wider">
                    <Wrench className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      Recommended Ecosystem Partner Tool ({item.suggestedThirdPartyTool.category})
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-white border border-amber-300 px-2 py-0.5 rounded">
                    Fit Score {item.suggestedThirdPartyTool.fitScore}%
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h5 className="font-bold text-slate-900">
                      {item.suggestedThirdPartyTool.toolName} (Vendor: {item.suggestedThirdPartyTool.vendor})
                    </h5>
                    <p className="text-slate-600 leading-relaxed text-[11px] mt-0.5">
                      {item.suggestedThirdPartyTool.rationale}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] text-slate-500">Commercial Envelope:</div>
                    <div className="text-xs font-bold text-slate-800">
                      {item.suggestedThirdPartyTool.estimatedCostNote}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 text-[10px]">
                  <a
                    href={item.suggestedThirdPartyTool.webRef}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>View Partner Specification / Web Search</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setSuggestingToolSowId(item.id);
                      setSelectedToolCategory(item.suggestedThirdPartyTool?.category || 'DSPM');
                      setCustomToolName(item.suggestedThirdPartyTool?.toolName || '');
                      setCustomVendor(item.suggestedThirdPartyTool?.vendor || '');
                      setCustomRationale(item.suggestedThirdPartyTool?.rationale || '');
                    }}
                    className="text-amber-800 font-semibold hover:underline"
                  >
                    Change / Re-classify Tool &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* Product QA Review Card */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[10px] uppercase tracking-wider">
                  <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Product Team QA Attestation</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                      item.productQaReview.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : item.productQaReview.status === 'Requires Clarification'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    QA: {item.productQaReview.status}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setQaReviewSowId(item.id);
                      setQaStatus(item.productQaReview.status);
                      setQaComment(item.productQaReview.comments);
                    }}
                    className="text-[11px] text-indigo-600 font-semibold hover:underline"
                  >
                    Submit QA Note
                  </button>
                </div>
              </div>

              <p className="text-slate-600 text-[11px] leading-relaxed italic">
                &quot;{item.productQaReview.comments}&quot; — {item.productQaReview.reviewedBy} (
                {new Date(item.productQaReview.reviewedAt).toLocaleDateString()})
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Embedded Tasks & Comments for SoW Section */}
      <SectionTasksComments sectionId="sow" sectionTitle="Scope of Work Review" />

      {/* Modal: Product QA Review Form */}
      {qaReviewSowId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Product Team QA Review Sign-Off
              </h3>
              <button
                type="button"
                onClick={() => setQaReviewSowId(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  QA Evaluation Verdict:
                </label>
                <select
                  value={qaStatus}
                  onChange={(e) =>
                    setQaStatus(e.target.value as 'Approved' | 'Requires Clarification' | 'Flagged')
                  }
                  className="w-full text-xs rounded border border-slate-300 p-2 bg-white"
                >
                  <option value="Approved">Approved (Technical capability confirmed)</option>
                  <option value="Requires Clarification">Requires Clarification</option>
                  <option value="Flagged">Flagged (Risk / Capability gap)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  QA Verification Comments & Test Results:
                </label>
                <textarea
                  value={qaComment}
                  onChange={(e) => setQaComment(e.target.value)}
                  placeholder="Detail test validation, lab benchmarks, or integration constraints..."
                  rows={3}
                  className="w-full text-xs rounded border border-slate-300 p-2"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setQaReviewSowId(null)}
                  className="px-4 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveQaReview(qaReviewSowId)}
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700"
                >
                  Submit QA Verdict
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: 3P Alternate Tool Suggester */}
      {suggestingToolSowId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Classify & Match 3P Cybersecurity/Privacy Tool
              </h3>
              <button
                type="button"
                onClick={() => setSuggestingToolSowId(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Select Tool Domain Category:
                </label>
                <select
                  value={selectedToolCategory}
                  onChange={(e) => setSelectedToolCategory(e.target.value as ThirdPartyCategory)}
                  className="w-full text-xs rounded border border-slate-300 p-2 bg-white font-bold"
                >
                  {toolCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat} ({cat === 'DSPM' ? 'Data Security Posture Management' : cat === 'DLP' ? 'Data Loss Prevention' : cat === 'HSM' ? 'Hardware Security Module' : cat === 'IAM' ? 'Identity & Access Management' : `${cat} Platform`})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Tool Product Name:
                  </label>
                  <input
                    type="text"
                    value={customToolName}
                    onChange={(e) => setCustomToolName(e.target.value)}
                    placeholder="e.g. Sentra DSPM / Thales Luna"
                    className="w-full text-xs rounded border border-slate-300 p-2"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Vendor:
                  </label>
                  <input
                    type="text"
                    value={customVendor}
                    onChange={(e) => setCustomVendor(e.target.value)}
                    placeholder="e.g. Sentra / Thales"
                    className="w-full text-xs rounded border border-slate-300 p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Integration Rationale:
                </label>
                <textarea
                  value={customRationale}
                  onChange={(e) => setCustomRationale(e.target.value)}
                  rows={2}
                  className="w-full text-xs rounded border border-slate-300 p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSuggestingToolSowId(null)}
                  className="px-4 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleApply3pTool(suggestingToolSowId)}
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700"
                >
                  Confirm Tool Matching
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Map or Draft FRD for SoW Clause */}
      {frdModalSowId &&
        (() => {
          const targetSow = sowList.find((s) => s.id === frdModalSowId);
          const mappedIds = targetSow?.mappedFrdIds || [];

          const filteredCatalogFrds = frdList.filter((f) => {
            const matchQuery =
              f.id.toLowerCase().includes(frdSearch.toLowerCase()) ||
              f.title.toLowerCase().includes(frdSearch.toLowerCase()) ||
              f.module.toLowerCase().includes(frdSearch.toLowerCase()) ||
              f.specSummary.toLowerCase().includes(frdSearch.toLowerCase());
            return matchQuery;
          });

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-sm font-bold text-slate-900">
                        FRD Specification & Roadmap Mapping
                      </h3>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Clause:{' '}
                      <span className="font-mono font-bold text-slate-700">
                        {targetSow?.clauseNumber}
                      </span>{' '}
                      · {targetSow?.category}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFrdModalSowId(null)}
                    className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Tabs: Map Existing vs Draft New */}
                <div className="flex items-center border-b border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setFrdActiveTab('map')}
                    className={`py-2 px-4 border-b-2 font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      frdActiveTab === 'map'
                        ? 'border-indigo-600 text-indigo-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Map Existing Parent Context FRD ({frdList.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFrdActiveTab('draft')}
                    className={`py-2 px-4 border-b-2 font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      frdActiveTab === 'draft'
                        ? 'border-indigo-600 text-indigo-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Draft New Roadmap FRD</span>
                  </button>
                </div>

                {/* Tab 1: Map Existing FRD */}
                {frdActiveTab === 'map' && (
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={frdSearch}
                        onChange={(e) => setFrdSearch(e.target.value)}
                        placeholder="Search FRD ID, title, module, or acceptance criteria..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-2">
                      {filteredCatalogFrds.map((frd) => {
                        const isMapped = mappedIds.includes(frd.id);
                        return (
                          <div
                            key={frd.id}
                            className={`p-3 rounded-lg border transition ${
                              isMapped
                                ? 'bg-indigo-50/50 border-indigo-200'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded text-[11px]">
                                    {frd.id}
                                  </span>
                                  <span className="text-slate-300">·</span>
                                  <span className="text-[10px] font-semibold text-slate-500 uppercase">
                                    {frd.module}
                                  </span>
                                  <span className="text-slate-300">·</span>
                                  <span
                                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                      frd.status === 'GA'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {frd.status} ({frd.targetRelease})
                                  </span>
                                </div>
                                <h4 className="font-bold text-slate-900">{frd.title}</h4>
                                <p className="text-slate-600 leading-relaxed text-[11px] line-clamp-2">
                                  {frd.specSummary}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  if (isMapped) {
                                    unmapFrdFromSowClause(targetSow!.id, frd.id);
                                  } else {
                                    mapFrdToSowClause(targetSow!.id, frd.id);
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-lg font-semibold text-xs whitespace-nowrap cursor-pointer transition flex items-center gap-1 ${
                                  isMapped
                                    ? 'bg-emerald-600 text-white hover:bg-rose-600'
                                    : 'bg-slate-900 text-white hover:bg-indigo-600'
                                }`}
                              >
                                {isMapped ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Mapped</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3" />
                                    <span>Map to Clause</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tab 2: Draft New Roadmap FRD Form */}
                {frdActiveTab === 'draft' && (
                  <form
                    onSubmit={handleDraftNewFrd}
                    className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs"
                  >
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        FRD Title / Functional Feature
                      </label>
                      <input
                        type="text"
                        required
                        value={newFrdTitle}
                        onChange={(e) => setNewFrdTitle(e.target.value)}
                        placeholder="e.g. Distributed Kafka Streaming Privacy Proxy & Anonymizer"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Architecture Module
                        </label>
                        <select
                          value={newFrdModule}
                          onChange={(e) => setNewFrdModule(e.target.value as FrdItem['module'])}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none"
                        >
                          <option value="Differential Privacy">Differential Privacy</option>
                          <option value="Synthetic Data Studio">Synthetic Data Studio</option>
                          <option value="Privacy Engine">Privacy Engine</option>
                          <option value="Cryptographic Sandbox">Cryptographic Sandbox</option>
                          <option value="Integration Bus">Integration Bus</option>
                          <option value="Audit & Compliance">Audit & Compliance</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Product Family
                        </label>
                        <select
                          value={newFrdProductFamily}
                          onChange={(e) =>
                            setNewFrdProductFamily(e.target.value as FrdItem['productFamily'])
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none"
                        >
                          <option value="PETs Core">PETs Core</option>
                          <option value="Synthetic Studio">Synthetic Studio</option>
                          <option value="ZK Studio">ZK Studio</option>
                          <option value="Governance Suite">Governance Suite</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Lifecycle Status
                        </label>
                        <select
                          value={newFrdStatus}
                          onChange={(e) => setNewFrdStatus(e.target.value as FrdItem['status'])}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none"
                        >
                          <option value="In Development">In Development</option>
                          <option value="Roadmap Backlog">Roadmap Backlog</option>
                          <option value="Under Review">Under Review</option>
                          <option value="GA">General Availability (GA)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Target Release / Sprint
                        </label>
                        <input
                          type="text"
                          value={newFrdTargetRelease}
                          onChange={(e) => setNewFrdTargetRelease(e.target.value)}
                          placeholder="e.g. v4.3 (Q1 2027)"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Functional Specification Summary
                      </label>
                      <textarea
                        rows={2}
                        value={newFrdSpecSummary}
                        onChange={(e) => setNewFrdSpecSummary(e.target.value)}
                        placeholder="Outline core algorithmic guarantees, APIs, and boundary constraints..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Technical Acceptance Criteria (One per line)
                      </label>
                      <textarea
                        rows={2}
                        value={newFrdCriteria}
                        onChange={(e) => setNewFrdCriteria(e.target.value)}
                        placeholder="Sub-millisecond query evaluation overhead&#10;FIPS-140-3 boundary validation test pass"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none resize-none font-mono text-[11px]"
                      />
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setFrdModalSowId(null)}
                        className="px-4 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700 cursor-pointer shadow-2xs"
                      >
                        Save to Roadmap & Map Clause
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          );
        })()}
    </div>
  );
};
