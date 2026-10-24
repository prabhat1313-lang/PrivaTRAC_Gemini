import React, { useState } from 'react';
import { useRfp } from '../../context/RfpContext';
import { useCrm } from '../../context/CrmContext';
import {
  Database,
  Sparkles,
  Upload,
  BookOpen,
  History,
  Tag,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  FileText,
  Search,
  ExternalLink,
  Shield,
  Layers,
  Info,
  FileCode,
  Plus,
  Check,
} from 'lucide-react';
import { ParentContextDimension, ParentContextChunk, FrdItem } from '../../types/rfp';

export const ParentContextStudioAdminTab: React.FC = () => {
  const {
    parentContextChunks,
    parentContextVersions,
    addParentContextPrompt,
    uploadParentContextDoc,
    deleteParentContextChunk,
    frdList,
    addFrd,
  } = useRfp();
  const { currentUser } = useCrm();

  const [promptInput, setPromptInput] = useState('');
  const [isProcessingPrompt, setIsProcessingPrompt] = useState(false);
  const [promptSuccessMessage, setPromptSuccessMessage] = useState<string | null>(null);

  // Document Upload States
  const [selectedFileName, setSelectedFileName] = useState('');
  const [docDimension, setDocDimension] = useState<ParentContextDimension>('certifications');
  const [docSummary, setDocSummary] = useState('');
  const [docTagsInput, setDocTagsInput] = useState('Security, FIPS, Attestation');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  // Filter & Search
  const [activeDimensionFilter, setActiveDimensionFilter] = useState<'all' | ParentContextDimension>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // FRD Catalog Admin State
  const [frdModuleFilter, setFrdModuleFilter] = useState<string>('all');
  const [frdSearch, setFrdSearch] = useState('');
  const [isAddFrdModalOpen, setIsAddFrdModalOpen] = useState(false);
  const [adminFrdTitle, setAdminFrdTitle] = useState('');
  const [adminFrdModule, setAdminFrdModule] = useState<FrdItem['module']>('Differential Privacy');
  const [adminFrdProductFamily, setAdminFrdProductFamily] = useState<FrdItem['productFamily']>('PETs Core');
  const [adminFrdStatus, setAdminFrdStatus] = useState<FrdItem['status']>('GA');
  const [adminFrdTargetRelease, setAdminFrdTargetRelease] = useState('v4.2 (GA)');
  const [adminFrdSpec, setAdminFrdSpec] = useState('');
  const [adminFrdCriteria, setAdminFrdCriteria] = useState('');

  const handlePromptIngest = () => {
    if (!promptInput.trim()) return;
    setIsProcessingPrompt(true);

    setTimeout(() => {
      const authorName = currentUser?.name || 'Administrator';
      addParentContextPrompt(promptInput.trim(), authorName);

      setPromptSuccessMessage('Successfully parsed and indexed new organization capability into parent context.');
      setPromptInput('');
      setIsProcessingPrompt(false);

      setTimeout(() => setPromptSuccessMessage(null), 4000);
    }, 600);
  };

  const handleDocUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFileName.trim() || !docSummary.trim()) return;
    setIsUploading(true);

    setTimeout(() => {
      const authorName = currentUser?.name || 'Administrator';
      const tags = docTagsInput.split(',').map((t) => t.trim()).filter(Boolean);

      uploadParentContextDoc(selectedFileName.trim(), docDimension, docSummary.trim(), tags, authorName);

      setUploadSuccessMessage(`Document "${selectedFileName}" ingested and vectorized into parent context.`);
      setSelectedFileName('');
      setDocSummary('');
      setIsUploading(false);

      setTimeout(() => setUploadSuccessMessage(null), 4000);
    }, 700);
  };

  const handleDeleteChunk = (chunk: ParentContextChunk) => {
    deleteParentContextChunk(chunk.id, currentUser?.name || 'Administrator');
  };

  const filteredChunks = parentContextChunks.filter((chunk) => {
    const matchesDimension = activeDimensionFilter === 'all' || chunk.dimension === activeDimensionFilter;
    const matchesSearch =
      chunk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chunk.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chunk.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDimension && matchesSearch;
  });

  const activeVersion = parentContextVersions.find((v) => v.isActive) || parentContextVersions[0];

  return (
    <div className="space-y-6">
      {/* Top Banner & Architecture Blueprint */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-5 shadow-sm border border-slate-700/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
              <Database className="w-3.5 h-3.5" />
              <span>Hierarchical Context Architecture · NotebookLM Model</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              RFP Parent Context Studio
            </h2>
            <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
              Curate the master organization-level intelligence store. These verified capabilities, compliance frameworks, rate cards, and partner agreements automatically propagate into child RFP workspaces and power real-time cross-section conflict checks.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-lg border border-white/15">
            <div>
              <div className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Active Version</div>
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{activeVersion?.version || 'v1.2'}</span>
              </div>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div>
              <div className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Indexed Chunks</div>
              <div className="text-sm font-bold text-white tabular-nums">{parentContextChunks.length} fragments</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Guided Prompt Ingestion + Multi-Doc Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Interactive Prompt Ingestion */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Guided Prompt Ingestion</span>
              </div>
              <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                Entity Auto-Extractor
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Describe new product features, updated differential privacy parameters, roadmap milestones, or partnership updates in plain English.
            </p>

            <div className="space-y-2">
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Example: Ingest our Q4 2026 Differential Privacy roadmap updates: Added localized (ε <= 0.5, δ <= 10^-5) accounting in federated queries. TCS consortium margin model finalized at 65% OEM / 35% SI."
                rows={4}
                className="w-full text-xs rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50"
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-medium">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() =>
                    setPromptInput(
                      'Certified ISO/IEC 42001:2023 Artificial Intelligence Management System compliance for Synthetic Data Studio and PETs Core differential privacy modules.'
                    )
                  }
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded transition"
                >
                  + ISO 42001 Attestation
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPromptInput(
                      'Infosys BFSI Partner Update: Established dedicated 24x7 joint delivery unit in Pune for Differential Privacy Sandbox implementation tenders.'
                    )
                  }
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded transition"
                >
                  + Infosys Partner Unit
                </button>
              </div>
            </div>

            {promptSuccessMessage && (
              <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{promptSuccessMessage}</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Creates an atomic parent context snapshot</span>
            <button
              type="button"
              disabled={isProcessingPrompt || !promptInput.trim()}
              onClick={handlePromptIngest}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isProcessingPrompt ? 'Vectorizing...' : 'Ingest into Parent Context'}</span>
            </button>
          </div>
        </div>

        {/* Card 2: Multi-Format Document Upload */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <form onSubmit={handleDocUpload}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Multi-Document Ingestion</span>
              </div>
              <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                PDF, DOCX, MD, JSON
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Upload formal capability whitepapers, cryptographic audit reports, rate cards, or legal master service agreements.
            </p>

            <div className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Document Filename
                  </label>
                  <input
                    type="text"
                    value={selectedFileName}
                    onChange={(e) => setSelectedFileName(e.target.value)}
                    placeholder="e.g. PrivaSapien_FIPS140_3_Audit.pdf"
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-slate-50/50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Knowledge Dimension
                  </label>
                  <select
                    value={docDimension}
                    onChange={(e) => setDocDimension(e.target.value as ParentContextDimension)}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-slate-50/50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  >
                    <option value="capabilities">Product Capabilities & PETs</option>
                    <option value="certifications">Security & Cryptographic Attestations</option>
                    <option value="compliance">Regulatory Compliance (DPDP, FEAT)</option>
                    <option value="partners">SI Partner Matrix & Margins</option>
                    <option value="pricing">Commercial Rate Cards & SLAs</option>
                    <option value="legal">Legal Covenants & Indemnity</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Executive Excerpt / Technical Summary
                </label>
                <textarea
                  value={docSummary}
                  onChange={(e) => setDocSummary(e.target.value)}
                  placeholder="Paste or summarize key operative clauses, benchmark metrics, or contractual boundaries..."
                  rows={2}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-slate-50/50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Context Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={docTagsInput}
                  onChange={(e) => setDocTagsInput(e.target.value)}
                  placeholder="e.g. FIPS-140-3, Level 3, AES-256-GCM"
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-1.5 bg-slate-50/50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              {uploadSuccessMessage && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{uploadSuccessMessage}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Indexed for Child RFP conflict engine</span>
              <button
                type="submit"
                disabled={isUploading || !selectedFileName.trim() || !docSummary.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Parsing...' : 'Upload & Parse Document'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Knowledge Explorer & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Parent Context Knowledge Explorer</h3>
            <span className="text-xs text-slate-500">({filteredChunks.length} fragments)</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search capabilities, tags, standards..."
                className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 w-56 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Dimension Filter Tabs */}
        <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-200/60 flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All Dimensions' },
            { id: 'capabilities', label: 'PETs & Products' },
            { id: 'certifications', label: 'Security & Attestations' },
            { id: 'compliance', label: 'Regulatory Frameworks' },
            { id: 'partners', label: 'SI Partner Matrix' },
            { id: 'pricing', label: 'Pricing & SLAs' },
            { id: 'legal', label: 'Legal Covenants' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveDimensionFilter(tab.id as 'all' | ParentContextDimension)}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                activeDimensionFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Chunk Fragment Cards */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredChunks.map((chunk) => (
            <div
              key={chunk.id}
              className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:shadow-xs transition bg-white flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                        chunk.dimension === 'capabilities'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                          : chunk.dimension === 'certifications'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : chunk.dimension === 'compliance'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                          : chunk.dimension === 'partners'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : 'bg-purple-50 text-purple-700 border border-purple-200/60'
                      }`}
                    >
                      {chunk.dimension}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Source: {chunk.source}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteChunk(chunk)}
                    title="Remove fragment from parent context"
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="text-xs font-bold text-slate-900 mb-1.5 leading-snug">{chunk.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-3">{chunk.content}</p>

                {chunk.sourceFileName && (
                  <div className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200 rounded px-2 py-1 mb-2.5 flex items-center gap-1.5">
                    <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{chunk.sourceFileName}</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-wrap gap-1 mb-2.5">
                  {chunk.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                  <span>Updated {chunk.lastUpdated} by {chunk.updatedBy}</span>
                  <span className="font-semibold text-emerald-600">
                    Confidence {(chunk.confidenceScore * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredChunks.length === 0 && (
            <div className="col-span-2 text-center py-8 text-slate-400 text-xs">
              No context fragments match your filter.
            </div>
          )}
        </div>
      </div>

      {/* Master FRD Specifications & Product Roadmap Catalog */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded">
                Parent Context Module
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">Informs Roadmap & Pre-fills RFP SoW Reviews</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-indigo-600" />
              <span>Functional Requirements Documents (FRD) Master Catalog</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddFrdModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Parent FRD</span>
            </button>
          </div>
        </div>

        {/* FRD Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Module:</span>
            {[
              'all',
              'Differential Privacy',
              'Synthetic Data Studio',
              'Cryptographic Sandbox',
              'Integration Bus',
              'Audit & Compliance',
            ].map((mod) => (
              <button
                key={mod}
                type="button"
                onClick={() => setFrdModuleFilter(mod)}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  frdModuleFilter === mod
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {mod === 'all' ? 'All Modules' : mod.replace(' Differential Privacy', ' DP')}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={frdSearch}
              onChange={(e) => setFrdSearch(e.target.value)}
              placeholder="Search FRD ID, title, or criteria..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* FRD Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {frdList
            .filter((frd) => {
              const matchModule = frdModuleFilter === 'all' || frd.module === frdModuleFilter;
              const matchSearch =
                frd.id.toLowerCase().includes(frdSearch.toLowerCase()) ||
                frd.title.toLowerCase().includes(frdSearch.toLowerCase()) ||
                frd.specSummary.toLowerCase().includes(frdSearch.toLowerCase());
              return matchModule && matchSearch;
            })
            .map((frd) => (
              <div
                key={frd.id}
                className="bg-slate-50/70 rounded-xl border border-slate-200/90 p-4 space-y-3 hover:border-slate-300 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-[11px]">
                        {frd.id}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {frd.module}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        {frd.productFamily}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 pt-0.5">{frd.title}</h4>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                      frd.status === 'GA'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : frd.status === 'In Development'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-purple-100 text-purple-800 border border-purple-200'
                    }`}
                  >
                    {frd.status} ({frd.targetRelease})
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                  {frd.specSummary}
                </p>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">
                    Technical Acceptance Criteria ({frd.technicalAcceptanceCriteria.length})
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                    {frd.technicalAcceptanceCriteria.slice(0, 2).map((crit, idx) => (
                      <li key={idx} className="truncate">
                        {crit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200/70">
                  <span>Created by {frd.createdBy}</span>
                  <span className="font-bold text-indigo-600">
                    {frd.mappedSowClauses.length > 0
                      ? `Mapped to ${frd.mappedSowClauses.length} RFP Clauses`
                      : 'Available for SoW Mapping'}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* In-Place Add FRD Modal */}
      {isAddFrdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-600" />
                <span>Register New Parent Context FRD</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddFrdModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!adminFrdTitle.trim()) return;
                const criteria = adminFrdCriteria
                  .split('\n')
                  .map((c) => c.trim())
                  .filter(Boolean);
                addFrd({
                  title: adminFrdTitle.trim(),
                  module: adminFrdModule,
                  productFamily: adminFrdProductFamily,
                  status: adminFrdStatus,
                  targetRelease: adminFrdTargetRelease,
                  specSummary: adminFrdSpec.trim() || 'Parent roadmap functional requirement specification.',
                  technicalAcceptanceCriteria:
                    criteria.length > 0 ? criteria : ['Sandbox harness execution test pass'],
                  mappedSowClauses: [],
                  createdBy: currentUser?.name || 'Administrator',
                });
                setAdminFrdTitle('');
                setAdminFrdSpec('');
                setIsAddFrdModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  FRD Title / Specification Name
                </label>
                <input
                  type="text"
                  required
                  value={adminFrdTitle}
                  onChange={(e) => setAdminFrdTitle(e.target.value)}
                  placeholder="e.g. Renyi Differential Privacy Budget Composition Engine"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Module
                  </label>
                  <select
                    value={adminFrdModule}
                    onChange={(e) => setAdminFrdModule(e.target.value as FrdItem['module'])}
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
                    value={adminFrdProductFamily}
                    onChange={(e) =>
                      setAdminFrdProductFamily(e.target.value as FrdItem['productFamily'])
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
                    Status
                  </label>
                  <select
                    value={adminFrdStatus}
                    onChange={(e) => setAdminFrdStatus(e.target.value as FrdItem['status'])}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none"
                  >
                    <option value="GA">GA</option>
                    <option value="In Development">In Development</option>
                    <option value="Roadmap Backlog">Roadmap Backlog</option>
                    <option value="Under Review">Under Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Target Release
                  </label>
                  <input
                    type="text"
                    value={adminFrdTargetRelease}
                    onChange={(e) => setAdminFrdTargetRelease(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Specification Summary
                </label>
                <textarea
                  rows={2}
                  value={adminFrdSpec}
                  onChange={(e) => setAdminFrdSpec(e.target.value)}
                  placeholder="Functional capabilities, APIs, and boundary constraints..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Acceptance Criteria (One per line)
                </label>
                <textarea
                  rows={2}
                  value={adminFrdCriteria}
                  onChange={(e) => setAdminFrdCriteria(e.target.value)}
                  placeholder="Criteria 1&#10;Criteria 2"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none resize-none font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddFrdModalOpen(false)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 cursor-pointer"
                >
                  Save Parent FRD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Snapshot Version History Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Parent Context Snapshot Versions</h3>
          </div>
          <span className="text-xs text-slate-500">Immutable Ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Version</th>
                <th className="py-2.5 px-3">Author</th>
                <th className="py-2.5 px-3">Summary of Changes</th>
                <th className="py-2.5 px-3 text-center">Chunks</th>
                <th className="py-2.5 px-3">Committed Timestamp</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {parentContextVersions.map((v) => (
                <tr key={v.version} className={v.isActive ? 'bg-indigo-50/30' : ''}>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{v.version}</td>
                  <td className="py-2.5 px-3 text-slate-600">{v.author}</td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium">{v.summary}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-600 tabular-nums">
                    {v.chunksCount}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                    {new Date(v.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {v.isActive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" />
                        Active Baseline
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-500">Archived</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
