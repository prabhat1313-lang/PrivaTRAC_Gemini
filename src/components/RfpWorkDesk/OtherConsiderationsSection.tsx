import React, { useState } from 'react';
import { useRfp } from '../../context/RfpContext';
import {
  FileQuestion,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Tag,
} from 'lucide-react';
import { SectionTasksComments } from './SectionTasksComments';
import { VerbatimExcerptViewer } from './VerbatimExcerptViewer';

export const OtherConsiderationsSection: React.FC = () => {
  const { selectedTender } = useRfp();

  const [items, setItems] = useState([
    {
      id: 'oth-01',
      clauseNo: 'Section 11.3',
      page: 118,
      title: 'Green Computing & Carbon Emissions Attestation',
      verbatim: 'The bidder must provide proof of energy-efficient algorithmic optimizations, certifying that data center server utilization remains within 80% maximum TDP under peak differential privacy noise batching.',
      analysis: 'PrivaSapien C++ vectorized kernels minimize redundant CPU cycles; certified 34% energy savings over standard Python differential privacy libraries.',
      status: 'Documented & Complied',
    },
    {
      id: 'oth-02',
      clauseNo: 'Section 12.1',
      page: 122,
      title: 'State-Specific Stamp Duty & Notarization Covenants',
      verbatim: 'All consortium contract agreements, Powers of Attorney, and Bank Guarantees must be executed on non-judicial stamp paper of appropriate denomination in the State of Maharashtra.',
      analysis: 'TCS legal operations unit in Mumbai will execute the notarization on required Maharashtra stamp paper denominations.',
      status: 'Assigned to SI Partner',
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newClause, setNewClause] = useState('');
  const [newPage, setNewPage] = useState<number>(100);
  const [newVerbatim, setNewVerbatim] = useState('');
  const [newAnalysis, setNewAnalysis] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newClause.trim()) return;

    setItems([
      ...items,
      {
        id: `oth-${Date.now().toString(36)}`,
        clauseNo: newClause.trim(),
        page: newPage,
        title: newTitle.trim(),
        verbatim: newVerbatim.trim() || 'Verbatim text from unclassified tender section.',
        analysis: newAnalysis.trim(),
        status: 'Documented & Evaluated',
      },
    ]);

    setIsAdding(false);
    setNewTitle('');
    setNewClause('');
    setNewVerbatim('');
    setNewAnalysis('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileQuestion className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Other RFP Considerations & Special Stipulations
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
              Cluster 1 · Section 6
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Captures all unique tender conditions, unclassified covenants, environmental green computing requirements, and state-specific procedural rules outside the standard 16 clusters.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Consideration</span>
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {item.clauseNo}
                </span>
                <span className="text-xs font-bold text-slate-800">{item.title}</span>
              </div>
              <span className="text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded">
                {item.status}
              </span>
            </div>

            <VerbatimExcerptViewer
              clauseNumber={item.clauseNo}
              pageNumber={item.page}
              verbatimText={item.verbatim}
              aiSummary={item.analysis}
              tenderDocName={selectedTender.tenderDocName}
            />

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
              <strong className="text-slate-900">Pre-Sales Operational Strategy: </strong>
              {item.analysis}
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Add Special Tender Consideration
              </h3>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Clause Reference
                  </label>
                  <input
                    type="text"
                    value={newClause}
                    onChange={(e) => setNewClause(e.target.value)}
                    placeholder="e.g. Section 13.4"
                    className="w-full text-xs rounded border border-slate-300 p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Page No.
                  </label>
                  <input
                    type="number"
                    value={newPage}
                    onChange={(e) => setNewPage(Number(e.target.value))}
                    className="w-full text-xs rounded border border-slate-300 p-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Title / Subject
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Mandatory Escrow Account Mechanism"
                  className="w-full text-xs rounded border border-slate-300 p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Verbatim Excerpt
                </label>
                <textarea
                  value={newVerbatim}
                  onChange={(e) => setNewVerbatim(e.target.value)}
                  rows={2}
                  className="w-full text-xs rounded border border-slate-300 p-2"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Pre-Sales Strategy & Fulfillment Plan
                </label>
                <textarea
                  value={newAnalysis}
                  onChange={(e) => setNewAnalysis(e.target.value)}
                  rows={2}
                  className="w-full text-xs rounded border border-slate-300 p-2"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700"
                >
                  Save Consideration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SectionTasksComments sectionId="otherConsiderations" sectionTitle="Other Considerations" />
    </div>
  );
};
