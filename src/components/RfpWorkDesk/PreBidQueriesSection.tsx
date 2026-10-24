import React, { useState } from 'react';
import { useRfp } from '../../context/RfpContext';
import { useCrm } from '../../context/CrmContext';
import {
  HelpCircle,
  Plus,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Shield,
  ArrowRight,
  Send,
  Paperclip,
} from 'lucide-react';
import { PreBidQueryItem } from '../../types/rfp';
import { VerbatimExcerptViewer } from './VerbatimExcerptViewer';
import { SectionTasksComments } from './SectionTasksComments';

export const PreBidQueriesSection: React.FC = () => {
  const {
    pbqList,
    addPreBidQuery,
    resolvePreBidQuery,
    uploadClientPbqResponse,
    selectedTender,
  } = useRfp();
  const { currentUser } = useCrm();

  // New PBQ Modal / Form
  const [isAddingQuery, setIsAddingQuery] = useState(false);
  const [newClauseNo, setNewClauseNo] = useState('');
  const [newPageNo, setNewPageNo] = useState<number>(48);
  const [newVerbatimText, setNewVerbatimText] = useState('');
  const [newQueryText, setNewQueryText] = useState('');
  const [newRationale, setNewRationale] = useState('');
  const [newCategory, setNewCategory] = useState<PreBidQueryItem['category']>('Technical');
  const [isLatePostCutoff, setIsLatePostCutoff] = useState(false);
  const [manualChannel, setManualChannel] = useState('Formal Clarification Letter via SI Partner Lead');

  // Internal Resolution Modal
  const [resolvingPbq, setResolvingPbq] = useState<PreBidQueryItem | null>(null);
  const [resolutionComment, setResolutionComment] = useState('');
  const [evidenceName, setEvidenceName] = useState('');

  // Client Response Upload Modal
  const [uploadingPbq, setUploadingPbq] = useState<PreBidQueryItem | null>(null);
  const [clientResponseText, setClientResponseText] = useState('');
  const [clientDocRef, setClientDocRef] = useState('');

  const tenderPbqs = pbqList.filter((p) => p.rfpId === selectedTender.id);

  const handleCreatePbq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClauseNo.trim() || !newQueryText.trim()) return;

    const authorName = currentUser?.name || 'Ananya Sharma';
    const authorRole = currentUser?.role || 'Pre-Sales Owner';

    addPreBidQuery(
      {
        rfpId: selectedTender.id,
        clauseNumber: newClauseNo.trim(),
        tenderPage: newPageNo,
        verbatimRfpText: newVerbatimText.trim() || 'Verbatim clause text extracted from tender document.',
        queryText: newQueryText.trim(),
        rationale: newRationale.trim() || 'Alignment with OEM standard capability and DPDP 2023 regulations.',
        category: newCategory,
        isLatePostCutoff,
        manualSubmissionChannel: isLatePostCutoff ? manualChannel : undefined,
        clientResponseStatus: 'Pending Client Response',
        internalStatus: authorRole.toLowerCase().includes('pre-sales')
          ? 'Submitted to Client'
          : 'Pending Pre-Sales Approval',
        draftedBy: authorName,
        draftedByRole: authorRole,
        impactsToSections: ['sow', 'infraSizing'],
      },
      authorName,
      authorRole
    );

    setIsAddingQuery(false);
    setNewClauseNo('');
    setNewVerbatimText('');
    setNewQueryText('');
    setNewRationale('');
  };

  const handleResolvePbq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingPbq || !resolutionComment.trim()) return;

    resolvePreBidQuery(
      resolvingPbq.id,
      resolutionComment.trim(),
      evidenceName.trim() || undefined,
      currentUser?.name || 'Ananya Sharma (Pre-Sales Lead)'
    );

    setResolvingPbq(null);
    setResolutionComment('');
    setEvidenceName('');
  };

  const handleUploadClientResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadingPbq || !clientResponseText.trim() || !clientDocRef.trim()) return;

    uploadClientPbqResponse(
      uploadingPbq.id,
      clientResponseText.trim(),
      clientDocRef.trim(),
      currentUser?.name || 'Pre-Sales Lead'
    );

    setUploadingPbq(null);
    setClientResponseText('');
    setClientDocRef('');
  };

  const exportPbqTable = () => {
    // Generate simple tabular text representation for tender dispatch
    const rows = tenderPbqs.map(
      (p, idx) =>
        `${idx + 1}. [${p.clauseNumber} · Page ${p.tenderPage}] (${p.category})\nExisting Text: "${p.verbatimRfpText}"\nQuery: ${p.queryText}\nRationale: ${p.rationale}\n`
    );
    const content = `PRE-BID CLARIFICATION SUBMISSION TABLE\nTender Ref: ${selectedTender.tenderNumber}\nClient: ${selectedTender.clientName}\nDate: ${new Date().toLocaleDateString()}\n\n` + rows.join('\n---\n\n');
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTender.tenderNumber.replace(/[/\\?%*:|"<>]/g, '_')}_PBQ_Submission_Table.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Pre-Bid Queries (PBQ) & Corrigenda Ingestion
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
              Cluster 1 · Section 5
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Auto-drafted from parent context parsing to clarify ambiguities, aggressive SLA penalties, and architectural constraints. Ingest official client corrigenda responses to trigger automated cross-section conflict checks.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={exportPbqTable}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export PBQ Table</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddingQuery(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Pre-Bid Query</span>
          </button>
        </div>
      </div>

      {/* PBQ Items List */}
      <div className="space-y-4">
        {tenderPbqs.map((pbq) => (
          <div
            key={pbq.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-slate-300 transition"
          >
            {/* Top Bar: Clause, Category, Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded">
                  {pbq.clauseNumber}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                  {pbq.category}
                </span>
                {pbq.isLatePostCutoff && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    Late / Post-Cutoff Submission
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    pbq.clientResponseStatus === 'Corrigendum Issued'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {pbq.clientResponseStatus}
                </span>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    pbq.internalStatus === 'Resolved Internally'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : pbq.internalStatus === 'Pending Pre-Sales Approval'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  Internal: {pbq.internalStatus}
                </span>
              </div>
            </div>

            {/* Verbatim Excerpt Viewer with [AI] Chip */}
            <VerbatimExcerptViewer
              clauseNumber={pbq.clauseNumber}
              pageNumber={pbq.tenderPage}
              verbatimText={pbq.verbatimRfpText}
              aiSummary={`Automated analysis: ${pbq.queryText.slice(0, 120)}...`}
              aiRiskNote={`Technical or SLA exposure: ${pbq.rationale}`}
              aiPositioningNote="Ensure alignment with OEM limitation of liability and SI delivery boundaries."
              tenderDocName={selectedTender.tenderDocName}
            />

            {/* Query & Rationale Block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg space-y-1">
                <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                  Clarification Requested from Client:
                </div>
                <p className="text-slate-800 leading-relaxed font-sans">{pbq.queryText}</p>
                {pbq.isLatePostCutoff && pbq.manualSubmissionChannel && (
                  <div className="text-[10px] text-amber-700 font-semibold pt-1 border-t border-indigo-100 mt-2">
                    Manual Submission Channel: {pbq.manualSubmissionChannel}
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Operational & Technical Justification:
                </div>
                <p className="text-slate-700 leading-relaxed font-sans">{pbq.rationale}</p>
                <div className="text-[10px] text-slate-400 pt-1">
                  Drafted by <strong>{pbq.draftedBy}</strong> ({pbq.draftedByRole})
                </div>
              </div>
            </div>

            {/* Ingested Client Response / Corrigendum Section */}
            {pbq.clientResponseText && (
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-lg text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px] uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Official Client Response & Corrigendum Clarification</span>
                  </div>
                  {pbq.clientResponseDocRef && (
                    <span className="text-[10px] font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                      Ref: {pbq.clientResponseDocRef}
                    </span>
                  )}
                </div>
                <p className="text-emerald-950 font-medium leading-relaxed italic">
                  &ldquo;{pbq.clientResponseText}&rdquo;
                </p>
              </div>
            )}

            {/* Internal Resolution Note & Evidence */}
            {pbq.internalStatus === 'Resolved Internally' && pbq.internalResolutionComment && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 text-slate-700">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <span>Internal Pre-Sales Resolution & Impact</span>
                  <span>Resolved by {pbq.resolvedBy}</span>
                </div>
                <p className="leading-relaxed">&ldquo;{pbq.internalResolutionComment}&rdquo;</p>
                {pbq.evidenceAttachmentName && (
                  <div className="text-[10px] text-indigo-600 flex items-center gap-1 pt-1">
                    <Paperclip className="w-3 h-3 text-indigo-500" />
                    <span>Evidence Attached: {pbq.evidenceAttachmentName}</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px] text-slate-400">
                Impacts: {pbq.impactsToSections?.join(', ') || 'General SOW'}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUploadingPbq(pbq);
                    setClientResponseText(pbq.clientResponseText || '');
                    setClientDocRef(pbq.clientResponseDocRef || '');
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Upload Client Response</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setResolvingPbq(pbq);
                    setResolutionComment(pbq.internalResolutionComment || '');
                    setEvidenceName(pbq.evidenceAttachmentName || '');
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Resolve Internally</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Embedded Tasks & Comments for PBQ Section */}
      <SectionTasksComments sectionId="pbq" sectionTitle="Pre-Bid Queries" />

      {/* Modal 1: Add New Pre-Bid Query Form */}
      {isAddingQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Draft New Pre-Bid Clarification Query
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingQuery(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePbq} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Tender Clause No.
                  </label>
                  <input
                    type="text"
                    value={newClauseNo}
                    onChange={(e) => setNewClauseNo(e.target.value)}
                    placeholder="e.g. Clause 4.3.2"
                    className="w-full text-xs rounded border border-slate-300 p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Tender Page No.
                  </label>
                  <input
                    type="number"
                    value={newPageNo}
                    onChange={(e) => setNewPageNo(Number(e.target.value))}
                    className="w-full text-xs rounded border border-slate-300 p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(e.target.value as PreBidQueryItem['category'])
                    }
                    className="w-full text-xs rounded border border-slate-300 p-2 bg-white"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Legal">Legal</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Eligibility">Eligibility</option>
                    <option value="SLA">SLA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Verbatim Tender Clause Text
                </label>
                <textarea
                  value={newVerbatimText}
                  onChange={(e) => setNewVerbatimText(e.target.value)}
                  placeholder="Paste verbatim excerpt from tender document..."
                  rows={2}
                  className="w-full text-xs rounded border border-slate-300 p-2"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Clarification Query Text (Formal Question for Client)
                </label>
                <textarea
                  value={newQueryText}
                  onChange={(e) => setNewQueryText(e.target.value)}
                  placeholder="Draft clear, unambiguous query proposed to client..."
                  rows={3}
                  className="w-full text-xs rounded border border-slate-300 p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Operational Justification & Rationale
                </label>
                <input
                  type="text"
                  value={newRationale}
                  onChange={(e) => setNewRationale(e.target.value)}
                  placeholder="e.g. Memory constraints on bank OLTP database..."
                  className="w-full text-xs rounded border border-slate-300 p-2"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLatePostCutoff}
                    onChange={(e) => setIsLatePostCutoff(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span className="font-bold text-amber-900 text-xs">
                    Mark as Late / Post-Cutoff Submission
                  </span>
                </label>

                {isLatePostCutoff && (
                  <div className="pt-2">
                    <label className="block text-[10px] font-bold text-amber-800 uppercase mb-1">
                      Manual Submission Channel:
                    </label>
                    <input
                      type="text"
                      value={manualChannel}
                      onChange={(e) => setManualChannel(e.target.value)}
                      placeholder="e.g. Direct letter dispatched via TCS Pre-Sales Partner..."
                      className="w-full text-xs rounded border border-amber-300 p-2 bg-white"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddingQuery(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700"
                >
                  Create Query Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Upload Client Response Form */}
      {uploadingPbq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Upload Official Client Response / Corrigendum
              </h3>
              <button
                type="button"
                onClick={() => setUploadingPbq(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadClientResponse} className="space-y-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Target Query:</div>
                <div className="font-bold text-slate-800">
                  {uploadingPbq.clauseNumber} · {uploadingPbq.queryText.slice(0, 90)}...
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Corrigendum Document Ref / Clarification Letter No.
                </label>
                <input
                  type="text"
                  value={clientDocRef}
                  onChange={(e) => setClientDocRef(e.target.value)}
                  placeholder="e.g. SBI_Corrigendum_3_Annexure_B.pdf"
                  className="w-full text-xs rounded border border-slate-300 p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Verbatim Client Clarification Response
                </label>
                <textarea
                  value={clientResponseText}
                  onChange={(e) => setClientResponseText(e.target.value)}
                  placeholder="Paste the exact clarification statement published by the client..."
                  rows={3}
                  className="w-full text-xs rounded border border-slate-300 p-2"
                  required
                />
              </div>

              <div className="text-[11px] text-slate-500 bg-indigo-50 border border-indigo-200 rounded p-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>
                  Uploading this response automatically dispatches an impact check to the RFP Conflict Flags engine.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setUploadingPbq(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700"
                >
                  Save Client Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Internal Resolution with Evidence */}
      {resolvingPbq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Internal Resolution & Technical Commit
              </h3>
              <button
                type="button"
                onClick={() => setResolvingPbq(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResolvePbq} className="space-y-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Target Query:</div>
                <div className="font-bold text-slate-800">{resolvingPbq.clauseNumber}</div>
                <div className="text-slate-600">{resolvingPbq.queryText}</div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Mandatory Resolution Notes & Mitigation Details:
                </label>
                <textarea
                  value={resolutionComment}
                  onChange={(e) => setResolutionComment(e.target.value)}
                  placeholder="Detail the operational change, e.g. Accepted Corrigendum 3 parameters, updated memory sizing in Infra Sizing..."
                  rows={3}
                  className="w-full text-xs rounded border border-slate-300 p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Optional Evidence Upload (Document Name / Ticket Ref):
                </label>
                <input
                  type="text"
                  value={evidenceName}
                  onChange={(e) => setEvidenceName(e.target.value)}
                  placeholder="e.g. SBI_Corrigendum_3_Extract_Page12.pdf"
                  className="w-full text-xs rounded border border-slate-300 p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setResolvingPbq(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800"
                >
                  Commit Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
