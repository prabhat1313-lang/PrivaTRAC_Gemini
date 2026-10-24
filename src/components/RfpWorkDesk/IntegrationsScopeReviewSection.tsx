import React, { useState } from 'react';
import { useRfp } from '../../context/RfpContext';
import { useCrm } from '../../context/CrmContext';
import {
  Network,
  Cpu,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  ArrowRightLeft,
  ArrowRight,
  ArrowLeft,
  Search,
  ExternalLink,
  Server,
  Lock,
  X,
  Sparkles,
  GitPullRequest,
  Check,
  Filter,
  FileText,
  Building,
} from 'lucide-react';
import { IntegrationConnector } from '../../types/rfp';
import { SectionTasksComments } from './SectionTasksComments';

export const IntegrationsScopeReviewSection: React.FC = () => {
  const {
    integrationsList,
    addIntegrationConnector,
    updateIntegrationConnector,
    deleteIntegrationConnector,
    toggleIntegrationApproval,
    selectedTender,
    sowList,
  } = useRfp();
  const { currentUser } = useCrm();

  const [activeViewMode, setActiveViewMode] = useState<'architecture' | 'delivery'>('architecture');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'rfp' | 'inferred' | 'pending'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Connector Form state
  const [newConnectorName, setNewConnectorName] = useState('');
  const [newOrigin, setNewOrigin] = useState<'RFP Requirement' | 'Inferred from SoW'>('RFP Requirement');
  const [newInferredClause, setNewInferredClause] = useState('');
  const [newInferredRationale, setNewInferredRationale] = useState('');
  const [newSuggestedTool, setNewSuggestedTool] = useState('');
  const [newCategory, setNewCategory] = useState<IntegrationConnector['category']>('Core Banking / OLTP');
  const [newProtocol, setNewProtocol] = useState<IntegrationConnector['protocol']>('gRPC');
  const [newDirection, setNewDirection] = useState<IntegrationConnector['direction']>('Inbound');
  const [newThroughput, setNewThroughput] = useState('25,000 eps');
  const [newLatency, setNewLatency] = useState('< 10 ms');
  const [newAuthMethod, setNewAuthMethod] = useState<IntegrationConnector['authMethod']>('mTLS');
  const [newNotes, setNewNotes] = useState('');
  const [newWeeks, setNewWeeks] = useState(4);

  // Scoped connectors for current tender
  const tenderConnectors = integrationsList.filter(
    (conn) => conn.rfpId === selectedTender.id || !conn.rfpId
  );

  // Counts for metric indicators
  const totalCount = tenderConnectors.length;
  const rfpReqCount = tenderConnectors.filter((c) => c.origin !== 'Inferred from SoW').length;
  const inferredCount = tenderConnectors.filter((c) => c.origin === 'Inferred from SoW').length;
  const pendingApprovalCount = tenderConnectors.filter(
    (c) => c.origin === 'Inferred from SoW' && !c.isScopeApproved
  ).length;

  const filteredConnectors = tenderConnectors.filter((conn) => {
    // Source filter
    if (sourceFilter === 'rfp' && conn.origin === 'Inferred from SoW') return false;
    if (sourceFilter === 'inferred' && conn.origin !== 'Inferred from SoW') return false;
    if (sourceFilter === 'pending' && !(conn.origin === 'Inferred from SoW' && !conn.isScopeApproved))
      return false;

    // Category filter
    if (filterCategory !== 'all' && conn.category !== filterCategory) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = conn.name.toLowerCase().includes(q);
      const matchesNotes = conn.architectureNotes.toLowerCase().includes(q);
      const matchesProtocol = conn.protocol.toLowerCase().includes(q);
      const matchesRationale = (conn.inferredRationale || '').toLowerCase().includes(q);
      const matchesClause = (conn.inferredFromClauseNumber || '').toLowerCase().includes(q);
      if (!matchesName && !matchesNotes && !matchesProtocol && !matchesRationale && !matchesClause) {
        return false;
      }
    }

    return true;
  });

  const handleCreateConnector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConnectorName.trim()) return;

    addIntegrationConnector({
      rfpId: selectedTender.id,
      name: newConnectorName.trim(),
      category: newCategory,
      protocol: newProtocol,
      direction: newDirection,
      throughputSla: newThroughput,
      latencySla: newLatency,
      authMethod: newAuthMethod,
      clusterScope: 'Architecture & Delivery',
      architectureNotes:
        newNotes.trim() ||
        'Configured under high-availability active-active failover with TLS 1.3 encryption.',
      deliveryTimelineWeeks: Number(newWeeks) || 3,
      status: newOrigin === 'Inferred from SoW' ? 'Pending Scope Review' : 'Validated',
      origin: newOrigin,
      inferredFromClauseNumber: newOrigin === 'Inferred from SoW' ? newInferredClause : undefined,
      inferredRationale: newOrigin === 'Inferred from SoW' ? newInferredRationale : undefined,
      suggestedToolName: newOrigin === 'Inferred from SoW' ? newSuggestedTool : undefined,
      isScopeApproved: newOrigin !== 'Inferred from SoW',
      approvedBy: newOrigin !== 'Inferred from SoW' ? currentUser.name : undefined,
      approvedAt: newOrigin !== 'Inferred from SoW' ? new Date().toISOString() : undefined,
    });

    setNewConnectorName('');
    setNewNotes('');
    setNewInferredClause('');
    setNewInferredRationale('');
    setNewSuggestedTool('');
    setIsAddModalOpen(false);
  };

  const getDirectionIcon = (dir: IntegrationConnector['direction']) => {
    switch (dir) {
      case 'Inbound':
        return <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />;
      case 'Outbound':
        return <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Bidirectional':
        return <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />;
    }
  };

  const getStatusBadge = (status: IntegrationConnector['status']) => {
    switch (status) {
      case 'Validated':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/70">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Validated Scope
          </span>
        );
      case 'Requires Custom Connector':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/70">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Custom Adapter Required
          </span>
        );
      case 'Pending Scope Review':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/70">
            <Clock className="w-3 h-3 text-purple-500" />
            Pending Scope Review
          </span>
        );
      case 'Pending Client Spec':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            <Clock className="w-3 h-3 text-slate-500" />
            Pending Client Spec
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded">
                Cross-Cluster Sub-Section · Architecture & Delivery
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-600 font-medium">
                {totalCount} Total Connectors
              </span>
              <span className="text-xs text-slate-300">·</span>
              <span className="text-xs text-slate-500">
                {rfpReqCount} RFP Explicit
              </span>
              <span className="text-xs text-slate-300">·</span>
              <span className="text-xs text-purple-700 font-medium">
                {inferredCount} Inferred from SoW
              </span>
              {pendingApprovalCount > 0 && (
                <>
                  <span className="text-xs text-slate-300">·</span>
                  <span className="text-xs text-amber-700 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    {pendingApprovalCount} Awaiting Scope Approval
                  </span>
                </>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Network className="w-5 h-5 text-indigo-600" />
              <span>Integrations Scope Review</span>
            </h2>
            <p className="text-xs text-slate-500 max-w-3xl">
              Captures mandatory interfaces stipulated in the RFP client specification alongside integrations inferred from Scope of Work (SoW) deviations, third-party tool suggestions (e.g. Cyera DSPM, Thales HSM, SIEM forwarders), and partner ecosystem deliverables.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="bg-slate-100 p-1 rounded-lg border border-slate-200/80 flex items-center text-xs">
              <button
                type="button"
                onClick={() => setActiveViewMode('architecture')}
                className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeViewMode === 'architecture'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                <span>Technical Architecture</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveViewMode('delivery')}
                className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeViewMode === 'delivery'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Project Delivery & Milestones</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Connector</span>
            </button>
          </div>
        </div>

        {/* Source Filter Segmented Controls */}
        <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80">
            <button
              type="button"
              onClick={() => setSourceFilter('all')}
              className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                sourceFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Connectors ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter('rfp')}
              className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                sourceFilter === 'rfp'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              RFP Requirements ({rfpReqCount})
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter('inferred')}
              className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                sourceFilter === 'inferred'
                  ? 'bg-white text-purple-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inferred from SoW ({inferredCount})
            </button>
            {pendingApprovalCount > 0 && (
              <button
                type="button"
                onClick={() => setSourceFilter('pending')}
                className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                  sourceFilter === 'pending'
                    ? 'bg-white text-amber-900 shadow-2xs font-semibold'
                    : 'text-amber-700 hover:text-amber-900'
                }`}
              >
                Pending Review ({pendingApprovalCount})
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search interface, protocol, or clause..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase mr-1">Category:</span>
          {[
            'all',
            'Core Banking / OLTP',
            'Data Lake / Storage',
            'SIEM & SOC',
            'HSM / KMS',
            'IAM / Identity',
            'DSPM / Data Security',
          ].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`px-2 py-0.5 rounded text-[11px] transition cursor-pointer ${
                filterCategory === cat
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Connectors Grid / Card View */}
      <div className="grid grid-cols-1 gap-4">
        {filteredConnectors.map((conn) => {
          const isInferred = conn.origin === 'Inferred from SoW';
          return (
            <div
              key={conn.id}
              className={`bg-white rounded-xl border p-5 shadow-xs transition hover:shadow-sm space-y-4 ${
                isInferred
                  ? conn.isScopeApproved
                    ? 'border-purple-200/90 bg-gradient-to-r from-purple-50/20 via-white to-white'
                    : 'border-amber-300 bg-amber-50/10'
                  : 'border-slate-200'
              }`}
            >
              {/* Connector Header & Origin Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    {/* Origin Tag */}
                    {isInferred ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        <Sparkles className="w-3 h-3 text-purple-600" />
                        Inferred from SoW {conn.inferredFromClauseNumber ? `· ${conn.inferredFromClauseNumber}` : ''}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        <FileText className="w-3 h-3 text-slate-500" />
                        RFP Explicit Requirement
                      </span>
                    )}

                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500 font-medium">{conn.category}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500 flex items-center gap-1">
                      {getDirectionIcon(conn.direction)}
                      {conn.direction}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>{conn.name}</span>
                    {getStatusBadge(conn.status)}
                  </h3>
                </div>

                {/* Scope Review Action Area */}
                <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                  {isInferred && (
                    <div className="flex items-center gap-2">
                      {conn.isScopeApproved ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Scope Confirmed</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleIntegrationApproval(conn.id, currentUser.name)}
                            title="Click to toggle approval state"
                            className="text-[11px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                          >
                            Revise
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleIntegrationApproval(conn.id, currentUser.name)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve Scope</span>
                        </button>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteIntegrationConnector(conn.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition cursor-pointer"
                    title="Remove connector"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Inferred Context / SoW Rationale Banner */}
              {isInferred && (
                <div className="p-3 bg-purple-50/60 rounded-lg border border-purple-100 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-purple-800">
                    <span className="flex items-center gap-1">
                      <GitPullRequest className="w-3.5 h-3.5 text-purple-600" />
                      Inferred via SoW Alternate Solution / Exception Review
                    </span>
                    {conn.suggestedToolName && (
                      <span className="text-purple-700 font-bold">
                        Target Product: {conn.suggestedToolName}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600">
                    {conn.inferredRationale ||
                      'This interface was inferred because an external solution partner or third-party tool was planned to fulfill tender requirements.'}
                  </p>
                  {conn.isScopeApproved && conn.approvedBy && (
                    <div className="text-[10px] text-emerald-700 pt-1 flex items-center gap-1">
                      <span>✓ Approved by <strong>{conn.approvedBy}</strong></span>
                      {conn.approvedAt && (
                        <span>on {new Date(conn.approvedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* View Mode 1: Technical Architecture */}
              {activeViewMode === 'architecture' ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3.5 bg-slate-50/80 rounded-lg border border-slate-100 text-xs">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Wire Protocol</div>
                    <div className="font-bold text-slate-800 mt-0.5">{conn.protocol}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Throughput SLA</div>
                    <div className="font-semibold text-slate-700 mt-0.5">{conn.throughputSla}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Latency Target</div>
                    <div className="font-semibold text-indigo-700 font-mono mt-0.5">{conn.latencySla}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Auth & Crypto</div>
                    <div className="font-semibold text-slate-700 mt-0.5 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>{conn.authMethod}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* View Mode 2: Project Delivery & Milestones */
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3.5 bg-indigo-50/30 rounded-lg border border-indigo-100/60 text-xs">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Delivery Window</div>
                    <div className="font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{conn.deliveryTimelineWeeks} Weeks</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Integration Lead</div>
                    <div className="font-semibold text-slate-700 mt-0.5">
                      {selectedTender.solutionEngineer} (Pre-Sales)
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">SIT / UAT Readiness</div>
                    <div className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Mock Feed Ready</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">SI Partner Ownership</div>
                    <div className="font-semibold text-slate-700 mt-0.5">
                      {selectedTender.primarySiPartner.split(' ')[0]} Field Team
                    </div>
                  </div>
                </div>
              )}

              {/* Architecture / Design Notes */}
              <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 flex items-start gap-2.5">
                <Server className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800">Interface Architecture Notes: </span>
                  <span>{conn.architectureNotes}</span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredConnectors.length === 0 && (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs space-y-2">
            <Network className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-medium text-slate-700">No integration connectors found matching filter criteria.</p>
            <p className="text-slate-400">
              Click &quot;Add Connector&quot; to register an explicit RFP requirement or capture an inferred third-party interface.
            </p>
          </div>
        )}
      </div>

      {/* Embedded Section Tasks & Comments */}
      <SectionTasksComments sectionId="integrations" sectionTitle="Integrations Scope Review" />

      {/* Add Connector Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Network className="w-4 h-4 text-indigo-600" />
                <span>Register Integration Connector</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateConnector} className="space-y-4 text-xs">
              {/* Origin Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Connector Origin
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewOrigin('RFP Requirement')}
                    className={`p-2 rounded-lg border text-left cursor-pointer transition ${
                      newOrigin === 'RFP Requirement'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="text-[11px] font-bold">RFP Explicit Requirement</div>
                    <div className="text-[10px] text-slate-500">Stipulated in client tender doc</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewOrigin('Inferred from SoW')}
                    className={`p-2 rounded-lg border text-left cursor-pointer transition ${
                      newOrigin === 'Inferred from SoW'
                        ? 'border-purple-600 bg-purple-50/50 text-purple-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="text-[11px] font-bold">Inferred from SoW Clause</div>
                    <div className="text-[10px] text-slate-500">Third-party tool or deviation</div>
                  </button>
                </div>
              </div>

              {/* Inferred Context inputs */}
              {newOrigin === 'Inferred from SoW' && (
                <div className="p-3 bg-purple-50/70 rounded-lg border border-purple-200/80 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-purple-900 uppercase mb-1">
                        SoW Clause Ref
                      </label>
                      <input
                        type="text"
                        value={newInferredClause}
                        onChange={(e) => setNewInferredClause(e.target.value)}
                        placeholder="e.g. Section 5.4.2"
                        className="w-full px-2.5 py-1.5 bg-white rounded border border-purple-300 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-purple-900 uppercase mb-1">
                        Partner / 3P Tool Name
                      </label>
                      <input
                        type="text"
                        value={newSuggestedTool}
                        onChange={(e) => setNewSuggestedTool(e.target.value)}
                        placeholder="e.g. Cyera DSPM"
                        className="w-full px-2.5 py-1.5 bg-white rounded border border-purple-300 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-purple-900 uppercase mb-1">
                      Inference Rationale / Justification
                    </label>
                    <input
                      type="text"
                      value={newInferredRationale}
                      onChange={(e) => setNewInferredRationale(e.target.value)}
                      placeholder="e.g. Alternate solution planned for shadow data classification"
                      className="w-full px-2.5 py-1.5 bg-white rounded border border-purple-300 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Connector / Interface Name
                </label>
                <input
                  type="text"
                  required
                  value={newConnectorName}
                  onChange={(e) => setNewConnectorName(e.target.value)}
                  placeholder="e.g. Core Banking Finacle 11e OLTP Stream"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    System Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as IntegrationConnector['category'])}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Core Banking / OLTP">Core Banking / OLTP</option>
                    <option value="Data Lake / Storage">Data Lake / Storage</option>
                    <option value="SIEM & SOC">SIEM & SOC</option>
                    <option value="HSM / KMS">HSM / KMS</option>
                    <option value="IAM / Identity">IAM / Identity</option>
                    <option value="DSPM / Data Security">DSPM / Data Security</option>
                    <option value="Pipeline / ETL">Pipeline / ETL</option>
                    <option value="Other Ecosystem">Other Ecosystem</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Protocol & Wire Standard
                  </label>
                  <select
                    value={newProtocol}
                    onChange={(e) => setNewProtocol(e.target.value as IntegrationConnector['protocol'])}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="gRPC">gRPC</option>
                    <option value="REST / HTTPS">REST / HTTPS</option>
                    <option value="Kafka">Kafka Event Bus</option>
                    <option value="PKCS#11">PKCS#11 (HSM)</option>
                    <option value="ODBC / JDBC">ODBC / JDBC</option>
                    <option value="Syslog TLS">Syslog TLS</option>
                    <option value="Agent / SDK">Agent / SDK</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Direction
                  </label>
                  <select
                    value={newDirection}
                    onChange={(e) => setNewDirection(e.target.value as IntegrationConnector['direction'])}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Inbound">Inbound</option>
                    <option value="Outbound">Outbound</option>
                    <option value="Bidirectional">Bidirectional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Throughput SLA
                  </label>
                  <input
                    type="text"
                    value={newThroughput}
                    onChange={(e) => setNewThroughput(e.target.value)}
                    placeholder="e.g. 50,000 eps"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Latency Target
                  </label>
                  <input
                    type="text"
                    value={newLatency}
                    onChange={(e) => setNewLatency(e.target.value)}
                    placeholder="e.g. < 8ms"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Auth & Cryptographic Mechanism
                  </label>
                  <select
                    value={newAuthMethod}
                    onChange={(e) => setNewAuthMethod(e.target.value as IntegrationConnector['authMethod'])}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="mTLS">mTLS (Mutual TLS 1.3)</option>
                    <option value="OAuth 2.0 / JWT">OAuth 2.0 / JWT Bearer</option>
                    <option value="Hardware Token / PKI">Hardware Token / PKI</option>
                    <option value="API Key">HMAC / API Key</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Delivery Window (Weeks)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={newWeeks}
                    onChange={(e) => setNewWeeks(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Interface Architecture Notes
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Detail high-availability clustering, failover behavior, encryption ciphers..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs transition"
                >
                  Register Connector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const IntegrationsSection = IntegrationsScopeReviewSection;
