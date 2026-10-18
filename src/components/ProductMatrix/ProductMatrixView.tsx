import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  Filter,
  Download,
  Plus,
  Link as LinkIcon,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  Edit2,
  X,
  Sparkles,
  Tag,
  Building,
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import {
  ProductMatrixRequirement,
  AvailabilityStatus,
  ProductMatrixTag,
  LinkedFRD,
} from '../../types/crm';

export const ProductMatrixView: React.FC = () => {
  const {
    productMatrixRequirements,
    addProductMatrixRequirement,
    updateProductMatrixRequirement,
    linkFrdToRequirement,
    matrixHierarchyLevels,
    matrixAvailabilityStatuses,
    matrixTags,
    accounts,
  } = useCrm();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamilyFilter, setSelectedFamilyFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [editingFrdReq, setEditingFrdReq] = useState<ProductMatrixRequirement | null>(null);
  const [isAddReqOpen, setIsAddReqOpen] = useState(false);
  const [selectedCellDetail, setSelectedCellDetail] = useState<{
    reqTitle: string;
    accountName: string;
    complianceStatus: string;
    preliminaryRemarks?: string;
    finalResponse?: string;
    tenderRef?: string;
  } | null>(null);

  // Form state for editing FRD
  const [frdFormData, setFrdFormData] = useState<LinkedFRD>({
    id: '',
    title: '',
    linkUrl: '',
    status: 'Draft',
    targetRelease: '',
    owner: '',
  });

  // Form state for creating new Requirement
  const [newReqData, setNewReqData] = useState({
    productFamily: 'Privacy Enhancing Technologies (PETs)',
    product: 'PrivaSapien Anonymizer Pro & PETs Core',
    module: '',
    title: '',
    description: '',
    availabilityStatus: 'Fully Available' as AvailabilityStatus,
    tags: ['Requires Configuration'] as ProductMatrixTag[],
  });

  // Unique product families for filtering
  const families = useMemo(() => {
    return Array.from(new Set(productMatrixRequirements.map((r) => r.productFamily)));
  }, [productMatrixRequirements]);

  // Unique accounts represented in matrix columns
  const activeAccountColumns = useMemo(() => {
    const accMap = new Map<string, string>();
    productMatrixRequirements.forEach((r) => {
      Object.entries(r.accountMappings || {}).forEach(([accId, m]) => {
        accMap.set(accId, m.accountName);
      });
    });
    return Array.from(accMap.entries()).map(([id, name]) => ({ id, name }));
  }, [productMatrixRequirements]);

  // Filtered requirements
  const filteredRequirements = useMemo(() => {
    return productMatrixRequirements.filter((req) => {
      const matchesSearch =
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.productFamily.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFamily =
        selectedFamilyFilter === 'all' || req.productFamily === selectedFamilyFilter;

      const matchesStatus =
        selectedStatusFilter === 'all' || req.availabilityStatus === selectedStatusFilter;

      return matchesSearch && matchesFamily && matchesStatus;
    });
  }, [productMatrixRequirements, searchTerm, selectedFamilyFilter, selectedStatusFilter]);

  // Statistics
  const totalReqs = productMatrixRequirements.length;
  const fullyAvailableCount = productMatrixRequirements.filter(
    (r) => r.availabilityStatus === 'Fully Available'
  ).length;
  const gapCount = totalReqs - fullyAvailableCount;
  const frdLinkedCount = productMatrixRequirements.filter((r) => !!r.linkedFrd).length;

  const handleOpenFrdModal = (req: ProductMatrixRequirement) => {
    setEditingFrdReq(req);
    if (req.linkedFrd) {
      setFrdFormData(req.linkedFrd);
    } else {
      setFrdFormData({
        id: `FRD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        title: req.title,
        linkUrl: 'https://wiki.internal.privasapien.io/frd',
        status: 'In Development',
        targetRelease: 'v4.3.0',
        owner: 'Rahul Nair',
      });
    }
  };

  const handleSaveFrd = () => {
    if (!editingFrdReq) return;
    linkFrdToRequirement(editingFrdReq.id, frdFormData);
    setEditingFrdReq(null);
  };

  const handleCreateRequirement = () => {
    if (!newReqData.title.trim() || !newReqData.module.trim()) return;
    addProductMatrixRequirement({
      ...newReqData,
      accountMappings: {},
    });
    setIsAddReqOpen(false);
    setNewReqData({
      productFamily: 'Privacy Enhancing Technologies (PETs)',
      product: 'PrivaSapien Anonymizer Pro & PETs Core',
      module: '',
      title: '',
      description: '',
      availabilityStatus: 'Fully Available',
      tags: ['Requires Configuration'],
    });
  };

  const exportCsv = () => {
    const headers = [
      'ID',
      'Product Family',
      'Product',
      'Module',
      'Requirement Title',
      'Description',
      'Availability Status',
      'Tags',
      'Linked FRD ID',
      'FRD Status',
      ...activeAccountColumns.map((a) => `${a.name} Compliance`),
    ];

    const rows = filteredRequirements.map((r) => [
      r.id,
      `"${r.productFamily.replace(/"/g, '""')}"`,
      `"${r.product.replace(/"/g, '""')}"`,
      `"${r.module.replace(/"/g, '""')}"`,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.description.replace(/"/g, '""')}"`,
      r.availabilityStatus,
      `"${r.tags.join(', ')}"`,
      r.linkedFrd?.id || '',
      r.linkedFrd?.status || '',
      ...activeAccountColumns.map((a) => {
        const mapping = r.accountMappings[a.id];
        return mapping ? `"${mapping.complianceStatus} (${mapping.tenderRef || ''})"` : 'Not In Scope';
      }),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Product_Requirements_Matrix_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: AvailabilityStatus) => {
    switch (status) {
      case 'Fully Available':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Fully Available
          </span>
        );
      case 'Partially Available':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Partially Available
          </span>
        );
      case 'Not Available':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
            <XCircle className="w-3 h-3 text-rose-600" />
            Not Available
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Product Requirements Matrix
                </h1>
                <p className="text-xs text-slate-500">
                  Consolidated client tender requirements, market gap analysis & engineering roadmap linkage across accounts
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              title="Export matrix as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              onClick={() => setIsAddReqOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Requirement
            </button>
          </div>
        </div>

        {/* 4-KPI Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-100">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Total Captured Requirements</div>
            <div className="text-xl font-bold text-slate-900 tabular-nums">{totalReqs}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Fully Available Features</div>
            <div className="text-xl font-bold text-emerald-600 tabular-nums">
              {fullyAvailableCount}{' '}
              <span className="text-xs text-slate-400 font-normal">
                ({totalReqs > 0 ? Math.round((fullyAvailableCount / totalReqs) * 100) : 0}%)
              </span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Market Product Gaps</div>
            <div className="text-xl font-bold text-amber-600 tabular-nums">{gapCount}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Roadmap FRDs Mapped</div>
            <div className="text-xl font-bold text-indigo-600 tabular-nums">
              {frdLinkedCount}{' '}
              <span className="text-xs text-slate-400 font-normal">
                ({totalReqs > 0 ? Math.round((frdLinkedCount / totalReqs) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search requirements, modules, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {/* Family Filter */}
          <select
            value={selectedFamilyFilter}
            onChange={(e) => setSelectedFamilyFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="all">All Product Families</option>
            {families.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          {/* Availability Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="all">All Availability Statuses</option>
            {matrixAvailabilityStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {(searchTerm || selectedFamilyFilter !== 'all' || selectedStatusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedFamilyFilter('all');
                setSelectedStatusFilter('all');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main High-Density Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 min-w-[200px] border-r border-slate-200">
                  Hierarchy (Family &gt; Product &gt; Module)
                </th>
                <th className="py-3 px-4 min-w-[280px] border-r border-slate-200">
                  Requirement Details
                </th>
                <th className="py-3 px-4 min-w-[140px] border-r border-slate-200">
                  Availability Status
                </th>
                <th className="py-3 px-4 min-w-[150px] border-r border-slate-200">
                  Implementation Tags
                </th>
                <th className="py-3 px-4 min-w-[150px] border-r border-slate-200">
                  Linked FRD
                </th>
                {activeAccountColumns.map((col) => (
                  <th
                    key={col.id}
                    className="py-3 px-4 min-w-[150px] border-r border-slate-200 text-slate-800 bg-indigo-50/30"
                  >
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3 h-3 text-indigo-500 shrink-0" />
                      <span className="truncate max-w-[130px]" title={col.name}>
                        {col.name}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequirements.length === 0 ? (
                <tr>
                  <td
                    colSpan={5 + activeAccountColumns.length}
                    className="p-8 text-center text-slate-400"
                  >
                    No requirements match your current filters.
                  </td>
                </tr>
              ) : (
                filteredRequirements.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition">
                    {/* Hierarchy */}
                    <td className="py-3 px-4 border-r border-slate-200 align-top">
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-tight">
                          {req.productFamily}
                        </div>
                        <div className="font-medium text-slate-800 text-[11px]">
                          {req.product}
                        </div>
                        <div className="text-slate-500 text-[10px] flex items-center gap-1">
                          <ChevronRight className="w-2.5 h-2.5 text-slate-400" />
                          <span className="font-semibold text-slate-700">{req.module}</span>
                        </div>
                      </div>
                    </td>

                    {/* Requirement Details */}
                    <td className="py-3 px-4 border-r border-slate-200 align-top">
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-900 text-xs">{req.title}</div>
                        <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">
                          {req.description}
                        </p>
                      </div>
                    </td>

                    {/* Availability Status */}
                    <td className="py-3 px-4 border-r border-slate-200 align-top">
                      <div className="space-y-1.5">
                        {getStatusBadge(req.availabilityStatus)}
                        <div>
                          <select
                            value={req.availabilityStatus}
                            onChange={(e) =>
                              updateProductMatrixRequirement({
                                ...req,
                                availabilityStatus: e.target.value as AvailabilityStatus,
                              })
                            }
                            className="text-[10px] py-0.5 px-1 bg-slate-50 border border-slate-200 rounded text-slate-600 hover:border-slate-300"
                          >
                            {matrixAvailabilityStatuses.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </td>

                    {/* Tags */}
                    <td className="py-3 px-4 border-r border-slate-200 align-top">
                      <div className="flex flex-wrap gap-1">
                        {req.tags && req.tags.length > 0 ? (
                          req.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-block text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400">None</span>
                        )}
                      </div>
                    </td>

                    {/* Linked FRD */}
                    <td className="py-3 px-4 border-r border-slate-200 align-top">
                      {req.linkedFrd ? (
                        <div className="space-y-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px]">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono font-bold text-indigo-700 text-[10px]">
                              {req.linkedFrd.id}
                            </span>
                            <span
                              className={`text-[9px] font-semibold px-1 rounded ${
                                req.linkedFrd.status === 'Shipped'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : req.linkedFrd.status === 'In Development'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {req.linkedFrd.status}
                            </span>
                          </div>
                          <div className="text-slate-800 font-medium line-clamp-1" title={req.linkedFrd.title}>
                            {req.linkedFrd.title}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                            <span>Rel: {req.linkedFrd.targetRelease || 'TBD'}</span>
                            <button
                              onClick={() => handleOpenFrdModal(req)}
                              className="text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenFrdModal(req)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50/60 hover:bg-indigo-100 border border-indigo-200 px-2 py-1 rounded transition"
                        >
                          <LinkIcon className="w-3 h-3" />
                          Link FRD
                        </button>
                      )}
                    </td>

                    {/* Dynamic Account Columns */}
                    {activeAccountColumns.map((col) => {
                      const mapping = req.accountMappings[col.id];
                      return (
                        <td
                          key={col.id}
                          className="py-3 px-4 border-r border-slate-200 align-top bg-indigo-50/10 hover:bg-indigo-50/30 transition cursor-pointer"
                          onClick={() => {
                            if (mapping) {
                              setSelectedCellDetail({
                                reqTitle: req.title,
                                accountName: col.name,
                                complianceStatus: mapping.complianceStatus,
                                preliminaryRemarks: mapping.preliminaryRemarks,
                                finalResponse: mapping.finalResponse,
                                tenderRef: mapping.tenderRef,
                              });
                            }
                          }}
                        >
                          {mapping ? (
                            <div className="space-y-1">
                              <span
                                className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                                  mapping.complianceStatus === 'Fully Compliant'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : mapping.complianceStatus === 'Partially Compliant'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}
                              >
                                {mapping.complianceStatus}
                              </span>
                              {mapping.tenderRef && (
                                <div className="text-[10px] text-slate-500 font-mono">
                                  {mapping.tenderRef}
                                </div>
                              )}
                              {mapping.preliminaryRemarks && (
                                <p className="text-[10px] text-slate-600 line-clamp-1 italic">
                                  "{mapping.preliminaryRemarks}"
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-300 font-mono">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Account Requirement Mapping Detail */}
      {selectedCellDetail && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {selectedCellDetail.accountName} Commitment
                </h3>
              </div>
              <button
                onClick={() => setSelectedCellDetail(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Requirement</span>
                <p className="text-slate-800 font-medium mt-0.5">{selectedCellDetail.reqTitle}</p>
              </div>

              {selectedCellDetail.tenderRef && (
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">Tender Clause Reference</span>
                  <div className="font-mono text-slate-700 bg-slate-50 border border-slate-200 px-2 py-1 rounded mt-0.5">
                    {selectedCellDetail.tenderRef}
                  </div>
                </div>
              )}

              <div>
                <span className="text-[11px] text-slate-500 font-medium">Compliance Commitment</span>
                <div className="mt-1">
                  <span
                    className={`inline-block text-xs font-bold px-2 py-0.5 rounded border ${
                      selectedCellDetail.complianceStatus === 'Fully Compliant'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : selectedCellDetail.complianceStatus === 'Partially Compliant'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {selectedCellDetail.complianceStatus}
                  </span>
                </div>
              </div>

              {selectedCellDetail.preliminaryRemarks && (
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">Preliminary Remarks</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 mt-0.5 leading-relaxed">
                    {selectedCellDetail.preliminaryRemarks}
                  </p>
                </div>
              )}

              {selectedCellDetail.finalResponse && (
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">Final Response</span>
                  <p className="text-slate-800 bg-emerald-50/50 p-2.5 rounded border border-emerald-200 mt-0.5 leading-relaxed font-medium">
                    {selectedCellDetail.finalResponse}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCellDetail(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Link / Edit FRD */}
      {editingFrdReq && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Map Functional Requirements Document (FRD)</h3>
              </div>
              <button
                onClick={() => setEditingFrdReq(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  FRD Identifier (Jira / Wiki / PRD)
                </label>
                <input
                  type="text"
                  value={frdFormData.id}
                  onChange={(e) => setFrdFormData({ ...frdFormData, id: e.target.value })}
                  placeholder="e.g. FRD-2026-084"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  FRD Specification Title
                </label>
                <input
                  type="text"
                  value={frdFormData.title}
                  onChange={(e) => setFrdFormData({ ...frdFormData, title: e.target.value })}
                  placeholder="Feature specification title..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Engineering Status
                  </label>
                  <select
                    value={frdFormData.status}
                    onChange={(e) =>
                      setFrdFormData({
                        ...frdFormData,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Approved">Approved</option>
                    <option value="In Development">In Development</option>
                    <option value="Shipped">Shipped</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Target Release
                  </label>
                  <input
                    type="text"
                    value={frdFormData.targetRelease || ''}
                    onChange={(e) =>
                      setFrdFormData({ ...frdFormData, targetRelease: e.target.value })
                    }
                    placeholder="e.g. v4.3.0"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Engineering Lead / Owner
                </label>
                <input
                  type="text"
                  value={frdFormData.owner || ''}
                  onChange={(e) => setFrdFormData({ ...frdFormData, owner: e.target.value })}
                  placeholder="e.g. Rahul Nair"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Specification URL
                </label>
                <input
                  type="text"
                  value={frdFormData.linkUrl || ''}
                  onChange={(e) => setFrdFormData({ ...frdFormData, linkUrl: e.target.value })}
                  placeholder="https://jira.internal.privasapien.io/..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              {frdFormData.status === 'Shipped' && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] flex items-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Marking this FRD as <strong>Shipped</strong> will automatically update this requirement's availability status to <strong>Fully Available</strong> across all bidding accounts.
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingFrdReq(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFrd}
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
              >
                Save FRD Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Requirement */}
      {isAddReqOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Add New Product Requirement</h3>
              </div>
              <button
                onClick={() => setIsAddReqOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Product Family
                </label>
                <select
                  value={newReqData.productFamily}
                  onChange={(e) =>
                    setNewReqData({ ...newReqData, productFamily: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                >
                  <option value="Privacy Enhancing Technologies (PETs)">
                    Privacy Enhancing Technologies (PETs)
                  </option>
                  <option value="Responsible AI & Governance">Responsible AI & Governance</option>
                  <option value="PrivacyGRC Core Suite">PrivacyGRC Core Suite</option>
                  <option value="Data Anonymization Suite">Data Anonymization Suite</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Product
                  </label>
                  <input
                    type="text"
                    value={newReqData.product}
                    onChange={(e) => setNewReqData({ ...newReqData, product: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Module
                  </label>
                  <input
                    type="text"
                    value={newReqData.module}
                    onChange={(e) => setNewReqData({ ...newReqData, module: e.target.value })}
                    placeholder="e.g. Consent Automation"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Requirement Title
                </label>
                <input
                  type="text"
                  value={newReqData.title}
                  onChange={(e) => setNewReqData({ ...newReqData, title: e.target.value })}
                  placeholder="Short descriptive summary..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Full Technical Description
                </label>
                <textarea
                  value={newReqData.description}
                  onChange={(e) =>
                    setNewReqData({ ...newReqData, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Full clause specifications, technical bounds..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Availability Status
                  </label>
                  <select
                    value={newReqData.availabilityStatus}
                    onChange={(e) =>
                      setNewReqData({
                        ...newReqData,
                        availabilityStatus: e.target.value as AvailabilityStatus,
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                  >
                    {matrixAvailabilityStatuses.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Primary Implementation Tag
                  </label>
                  <select
                    value={newReqData.tags[0] || 'Requires Configuration'}
                    onChange={(e) =>
                      setNewReqData({
                        ...newReqData,
                        tags: [e.target.value as ProductMatrixTag],
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                  >
                    {matrixTags.map((tg) => (
                      <option key={tg} value={tg}>
                        {tg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsAddReqOpen(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRequirement}
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
              >
                Create Requirement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
