import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Collateral } from '../../types/crm';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Edit2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  Shield,
  X,
  FileCheck,
} from 'lucide-react';

export const CollateralsAdminTab: React.FC = () => {
  const { collaterals, addCollateral, updateCollateral, deleteCollateral } = useCrm();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollateral, setEditingCollateral] = useState<Collateral | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Collateral['category']>('Product Datasheet');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [description, setDescription] = useState('');
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  const categories: Collateral['category'][] = [
    'Product Datasheet',
    'Architecture Whitepaper',
    'Security & SBOM',
    'Case Study',
    'Sample RFP Response',
  ];

  const openAdd = () => {
    setEditingCollateral(null);
    setTitle('');
    setCategory('Product Datasheet');
    setFileName('');
    setFileSize('2.4 MB');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEdit = (c: Collateral) => {
    setEditingCollateral(c);
    setTitle(c.title);
    setCategory(c.category);
    setFileName(c.fileName);
    setFileSize(c.fileSize);
    setDescription(c.description);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileName.trim()) return;

    if (editingCollateral) {
      updateCollateral({
        ...editingCollateral,
        title: title.trim(),
        category,
        fileName: fileName.trim(),
        fileSize: fileSize.trim() || '1.8 MB',
        description: description.trim(),
        updatedDate: new Date().toISOString().split('T')[0],
      });
    } else {
      addCollateral({
        title: title.trim(),
        category,
        fileName: fileName.trim(),
        fileSize: fileSize.trim() || '2.0 MB',
        description: description.trim(),
        downloadUrl: `#download-${fileName.trim()}`,
      });
    }

    setIsModalOpen(false);
  };

  const handleSimulateDownload = (col: Collateral) => {
    setDownloadSuccessMsg(`Downloaded "${col.fileName}" (${col.fileSize})`);
    setTimeout(() => setDownloadSuccessMsg(null), 3000);
  };

  const filteredCollaterals = collaterals.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' ? true : c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Marketing Collaterals Repository
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage official product datasheets, architecture whitepapers, SBOM security audits, and sample RFP responses
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-2xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload New Collateral</span>
        </button>
      </div>

      {downloadSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadSuccessMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search collaterals by title, file, or topic..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-semibold text-slate-500 mr-1 shrink-0">Category:</span>
          {['All', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Collaterals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCollaterals.map((col) => (
          <div
            key={col.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    col.category === 'Product Datasheet'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : col.category === 'Architecture Whitepaper'
                      ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      : col.category === 'Security & SBOM'
                      ? 'bg-purple-50 text-purple-800 border-purple-200'
                      : col.category === 'Case Study'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {col.category}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(col)}
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded"
                    title="Edit Collateral"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete collateral "${col.title}"?`)) {
                        deleteCollateral(col.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                    title="Delete Collateral"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h4 className="font-bold text-slate-900 text-sm leading-snug">{col.title}</h4>
              <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">{col.description}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="text-[11px] text-slate-500 font-mono">
                {col.fileName} • {col.fileSize}
              </div>

              <button
                type="button"
                onClick={() => handleSimulateDownload(col)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition"
              >
                <Download className="w-3 h-3" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCollaterals.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
          No marketing collaterals found matching the query.
        </div>
      )}

      {/* Upload/Edit Collateral Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingCollateral ? 'Edit Marketing Asset' : 'Upload New Marketing Collateral'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Collateral Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. PrivaSapien Differential Privacy Architecture Whitepaper"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Collateral['category'])}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">File Size *</label>
                  <input
                    type="text"
                    required
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    placeholder="e.g. 2.4 MB"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">File Name / Key *</label>
                <input
                  type="text"
                  required
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. privasapien_diff_privacy_v2.pdf"
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description & Scope</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize target audience, demonstrated benchmarks, or privacy certifications covered..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
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
                  {editingCollateral ? 'Save Changes' : 'Upload Collateral'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
