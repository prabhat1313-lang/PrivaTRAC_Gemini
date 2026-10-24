import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  FileText,
  ExternalLink,
  X,
  Pin,
  CheckCircle2,
  AlertTriangle,
  Search,
} from 'lucide-react';

interface VerbatimExcerptViewerProps {
  clauseNumber: string;
  pageNumber: number;
  verbatimText: string;
  aiSummary: string;
  aiRiskNote?: string;
  aiPositioningNote?: string;
  tenderDocName?: string;
}

export const VerbatimExcerptViewer: React.FC<VerbatimExcerptViewerProps> = ({
  clauseNumber,
  pageNumber,
  verbatimText,
  aiSummary,
  aiRiskNote,
  aiPositioningNote,
  tenderDocName = 'SBI_RFP_IT_2026_04_Tender_and_Corrigendum_3.pdf',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Toggle locked state on click
  const handleAiButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLocked((prev) => !prev);
  };

  const showPopover = isHovered || isLocked;

  // Click outside to dismiss if locked
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsLocked(false);
      }
    };
    if (isLocked) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLocked]);

  return (
    <div className="space-y-2">
      {/* Verbatim Box */}
      <div className="relative p-3.5 bg-slate-50/80 border border-slate-200/90 rounded-lg text-slate-800 text-xs leading-relaxed font-sans group">
        <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-200/60">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 font-mono text-[11px]">{clauseNumber}</span>
            <span className="text-slate-300">·</span>
            {/* Clickable Citation Badge */}
            <button
              type="button"
              onClick={() => setIsDocViewerOpen(true)}
              title="Click to view exact page in tender document"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50/90 hover:bg-indigo-100 hover:text-indigo-900 border border-indigo-200/70 px-2 py-0.5 rounded transition cursor-pointer"
            >
              <FileText className="w-3 h-3 text-indigo-600" />
              <span>Page {pageNumber}</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </button>
          </div>

          {/* AI Interactive Button with Hover & Click-to-Lock */}
          <div className="relative" ref={popoverRef}>
            <button
              type="button"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={handleAiButtonClick}
              title={isLocked ? 'Pinned open. Click to close.' : 'Hover for quick AI summary or click to pin open.'}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition shadow-2xs cursor-pointer ${
                isLocked
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/40'
                  : 'bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>AI</span>
              {isLocked && <Pin className="w-2.5 h-2.5 ml-0.5 fill-white" />}
            </button>

            {/* AI Floating Popover */}
            {showPopover && (
              <div
                className="absolute right-0 top-full mt-1.5 z-40 w-80 sm:w-96 p-3.5 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700/80 text-xs space-y-2.5 animate-in fade-in zoom-in-95 duration-150"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div className="flex items-center justify-between border-b border-slate-700/70 pb-2">
                  <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[11px] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>PrivaSapien Intelligence Extract</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isLocked && (
                      <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-950 px-1.5 py-0.2 rounded border border-indigo-800">
                        Pinned
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsLocked(false)}
                      className="text-slate-400 hover:text-white p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Summary & Scope Impact
                  </div>
                  <p className="text-slate-200 leading-relaxed text-xs">{aiSummary}</p>
                </div>

                {aiRiskNote && (
                  <div className="p-2 bg-amber-950/40 border border-amber-800/60 rounded-lg text-amber-200 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-relaxed">
                      <strong className="text-amber-300">Tender Risk: </strong>
                      {aiRiskNote}
                    </div>
                  </div>
                )}

                {aiPositioningNote && (
                  <div className="p-2 bg-indigo-950/40 border border-indigo-800/60 rounded-lg text-indigo-200 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-relaxed">
                      <strong className="text-indigo-300">Recommended OEM Stance: </strong>
                      {aiPositioningNote}
                    </div>
                  </div>
                )}

                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
                  <span>Grounded in Parent Organization Context</span>
                  <span>Click AI button to close</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Verbatim Text ad verbatim */}
        <p className="text-slate-800 font-serif italic text-xs leading-relaxed select-text">
          &ldquo;{verbatimText}&rdquo;
        </p>
      </div>

      {/* Embedded Tender Source Document Viewer Modal */}
      {isDocViewerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <div>
                  <h4 className="text-xs font-bold">{tenderDocName}</h4>
                  <div className="text-[10px] text-slate-300">
                    Exact Citation: Page {pageNumber} · {clauseNumber}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDocViewerOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Page Content with Highlight */}
            <div className="p-6 overflow-y-auto space-y-4 bg-slate-100 flex-1">
              <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow-sm border border-slate-300 min-h-[500px] text-slate-800 font-serif text-xs leading-relaxed space-y-4 relative">
                <div className="text-center pb-4 border-b border-slate-200 text-[10px] text-slate-400 uppercase tracking-widest font-sans">
                  CONFIDENTIAL · TENDER DOCUMENT · PAGE {pageNumber} OF 124
                </div>

                <p className="text-slate-400 select-none">
                  [...Preceding tender clauses on data ingestion architecture, network segmentation, and hardware isolation standards...]
                </p>

                {/* Highlighted Exact Clause */}
                <div className="p-4 bg-amber-50/90 border-l-4 border-indigo-600 rounded-r shadow-xs space-y-1">
                  <div className="font-sans font-bold text-slate-900 text-[11px] flex items-center justify-between">
                    <span>{clauseNumber} (OPERATIVE REQUIREMENT)</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-mono">
                      Target Excerpt
                    </span>
                  </div>
                  <p className="text-slate-900 font-medium leading-relaxed">&ldquo;{verbatimText}&rdquo;</p>
                </div>

                <p className="text-slate-400 select-none">
                  [...Subsequent sections governing technical penalty calculations, liquidated damages escalation schedules, and technical scoring guidelines...]
                </p>

                <div className="pt-8 border-t border-slate-200 text-center text-[10px] text-slate-400 font-sans">
                  Official Sealed Tender Document · Tender Ref: RFP/SBI/IT/2026/04
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                100% Verbatim Traceability · Verified against original client PDF
              </span>
              <button
                type="button"
                onClick={() => setIsDocViewerOpen(false)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
