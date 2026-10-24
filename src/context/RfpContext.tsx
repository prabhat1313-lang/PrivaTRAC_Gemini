import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  ParentContextChunk,
  ParentContextVersion,
  RfpTender,
  PreBidQueryItem,
  SowLineItem,
  VolumeMetricItem,
  InfraSizingSpec,
  RfpConflictFlag,
  RfpSectionTask,
  RfpSectionComment,
  ExecutiveSignOff,
  ThirdPartyCategory,
  FrdItem,
  IntegrationConnector,
} from '../types/rfp';
import {
  initialParentContextChunks,
  initialParentContextVersions,
  initialRfpTenders,
  initialPreBidQueries,
  initialSowLineItems,
  initialVolumeMetrics,
  initialInfraSizing,
  initialConflictFlags,
  initialRfpTasks,
  initialRfpComments,
  initialExecutiveSignOffs,
  initialFrdList,
  initialIntegrationConnectors,
} from '../data/rfpSeedData';

export interface PendingReviewItem {
  id: string;
  sourceType: 'PBQ' | 'Task' | 'SOW' | 'Volume';
  title: string;
  sectionId: string;
  author: string;
  authorRole: string;
  createdAt: string;
  field: string;
  oldValue: string;
  newValue: string;
  justification: string;
}

interface RfpContextType {
  // Parent Context
  parentContextChunks: ParentContextChunk[];
  parentContextVersions: ParentContextVersion[];
  addParentContextPrompt: (promptText: string, author: string) => void;
  uploadParentContextDoc: (
    fileName: string,
    dimension: ParentContextChunk['dimension'],
    summaryText: string,
    tags: string[],
    author: string
  ) => void;
  deleteParentContextChunk: (id: string, author: string) => void;

  // Tender Selection & Management
  tenders: RfpTender[];
  selectedTenderId: string;
  setSelectedTenderId: (id: string) => void;
  selectedTender: RfpTender;
  updateTenderActiveSections: (sections: string[]) => void;

  // Conflict Flags
  conflictFlags: RfpConflictFlag[];
  resolveConflictFlag: (flagId: string, notes: string, author: string) => void;
  activeConflictCount: number;

  // Pre-Bid Queries
  pbqList: PreBidQueryItem[];
  addPreBidQuery: (item: Omit<PreBidQueryItem, 'id'>, author: string, authorRole: string) => void;
  resolvePreBidQuery: (
    pbqId: string,
    resolutionComment: string,
    evidenceDocName?: string,
    author?: string
  ) => void;
  uploadClientPbqResponse: (
    pbqId: string,
    responseText: string,
    docRef: string,
    author: string
  ) => void;

  // Scope of Work & 3P Tools
  sowList: SowLineItem[];
  updateSowCompliance: (
    sowId: string,
    status: SowLineItem['complianceStatus'],
    responseText: string,
    author: string
  ) => void;
  addSowQaReview: (
    sowId: string,
    status: 'Approved' | 'Requires Clarification' | 'Flagged',
    comments: string,
    author: string
  ) => void;
  suggestAlternateToolForSow: (
    sowId: string,
    category: ThirdPartyCategory,
    toolName: string,
    vendor: string,
    rationale: string
  ) => void;

  // Volume Metrics & Infra Sizing
  volumeMetrics: VolumeMetricItem[];
  updateVolumeMetric: (volId: string, newValue: number, author: string) => void;
  infraSizing: InfraSizingSpec;
  pendingInfraDiff: {
    vCpuDiff: number;
    ramDiff: number;
    storageDiff: number;
    costDiffInr: number;
  } | null;
  applyPendingInfraRecalculation: (author: string) => void;
  discardPendingInfraRecalculation: () => void;

  // Tasks & Comments
  tasks: RfpSectionTask[];
  addTask: (task: Omit<RfpSectionTask, 'id' | 'createdAt'>) => void;
  updateTaskStatus: (taskId: string, status: RfpSectionTask['status'], author: string) => void;
  comments: RfpSectionComment[];
  addComment: (comment: Omit<RfpSectionComment, 'id' | 'createdAt'>) => void;

  // Pre-Sales Lead Review Queue
  reviewQueue: PendingReviewItem[];
  approveReviewItem: (itemId: string, approverName: string) => void;
  rejectReviewItem: (itemId: string, rejectionReason: string, approverName: string) => void;

  // Executive Sign-Off Quorum
  executiveSignOffs: ExecutiveSignOff[];
  signExecutiveRole: (
    role: ExecutiveSignOff['role'],
    signerName: string,
    conditions?: string
  ) => void;
  signOffQuorumMet: boolean;

  // FRD Specifications
  frdList: FrdItem[];
  addFrd: (frd: Omit<FrdItem, 'id' | 'createdAt'>) => string;
  mapFrdToSowClause: (sowId: string, frdId: string) => void;
  unmapFrdFromSowClause: (sowId: string, frdId: string) => void;

  // Integrations
  integrationsList: IntegrationConnector[];
  addIntegrationConnector: (connector: Omit<IntegrationConnector, 'id'>) => void;
  updateIntegrationConnector: (id: string, updates: Partial<IntegrationConnector>) => void;
  deleteIntegrationConnector: (id: string) => void;
  toggleIntegrationApproval: (id: string, approverName: string) => void;
  approveInferredIntegration: (id: string, approverName: string) => void;
}

const RfpContext = createContext<RfpContextType | null>(null);

export const RfpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Parent Context
  const [parentContextChunks, setParentContextChunks] = useState<ParentContextChunk[]>(
    initialParentContextChunks
  );
  const [parentContextVersions, setParentContextVersions] = useState<ParentContextVersion[]>(
    initialParentContextVersions
  );

  // Tenders
  const [tenders, setTenders] = useState<RfpTender[]>(initialRfpTenders);
  const [selectedTenderId, setSelectedTenderId] = useState<string>('rfp-sbi-01');

  // Conflict Flags
  const [conflictFlags, setConflictFlags] = useState<RfpConflictFlag[]>(initialConflictFlags);

  // PBQ
  const [pbqList, setPbqList] = useState<PreBidQueryItem[]>(initialPreBidQueries);

  // SoW
  const [sowList, setSowList] = useState<SowLineItem[]>(initialSowLineItems);

  // Volume Metrics & Infra Sizing
  const [volumeMetrics, setVolumeMetrics] = useState<VolumeMetricItem[]>(initialVolumeMetrics);
  const [infraSizing, setInfraSizing] = useState<InfraSizingSpec>(initialInfraSizing);
  const [pendingInfraDiff, setPendingInfraDiff] = useState<{
    vCpuDiff: number;
    ramDiff: number;
    storageDiff: number;
    costDiffInr: number;
  } | null>(null);

  // Tasks & Comments
  const [tasks, setTasks] = useState<RfpSectionTask[]>(initialRfpTasks);
  const [comments, setComments] = useState<RfpSectionComment[]>(initialRfpComments);

  // FRDs & Integrations
  const [frdList, setFrdList] = useState<FrdItem[]>(initialFrdList);
  const [integrationsList, setIntegrationsList] = useState<IntegrationConnector[]>(initialIntegrationConnectors);

  // Review Queue (Pre-Sales Approval)
  const [reviewQueue, setReviewQueue] = useState<PendingReviewItem[]>([
    {
      id: 'rev-01',
      sourceType: 'PBQ',
      title: 'Late PBQ-003 Staffing Clarification Dispatch',
      sectionId: 'pbq',
      author: 'Vikram Malhotra',
      authorRole: 'Solution Engineer',
      createdAt: '2026-10-23T15:00:00Z',
      field: 'manualSubmissionChannel',
      oldValue: 'Draft',
      newValue: 'Dispatched via TCS Lead Partner Letter',
      justification: 'Aligned with TCS Banking Practice Head on L1/L2 resident engineer split.',
    },
    {
      id: 'rev-02',
      sourceType: 'Task',
      title: 'Proposed Storage Expansion for SBI Tender',
      sectionId: 'infraSizing',
      author: 'Vikram Malhotra',
      authorRole: 'Solution Engineer',
      createdAt: '2026-10-23T16:15:00Z',
      field: 'nvmeStorageTb',
      oldValue: '24 TB',
      newValue: '36 TB',
      justification: 'Volume metrics specify 450M records with 3-year historical retention.',
    },
  ]);

  // Executive Sign-Offs
  const [executiveSignOffs, setExecutiveSignOffs] = useState<ExecutiveSignOff[]>(
    initialExecutiveSignOffs
  );

  // Active selected tender
  const selectedTender = useMemo(() => {
    return tenders.find((t) => t.id === selectedTenderId) || tenders[0];
  }, [tenders, selectedTenderId]);

  // Active conflict count
  const activeConflictCount = useMemo(() => {
    return conflictFlags.filter(
      (c) => c.rfpId === selectedTenderId && c.status === 'Active'
    ).length;
  }, [conflictFlags, selectedTenderId]);

  // Executive sign-off quorum check (any 2 of 3 signed)
  const signOffQuorumMet = useMemo(() => {
    const signedCount = executiveSignOffs.filter((s) => s.signed).length;
    return signedCount >= 2;
  }, [executiveSignOffs]);

  // Admin Parent Context Actions
  const addParentContextPrompt = useCallback((promptText: string, author: string) => {
    const newId = `ctx-${Date.now().toString(36)}`;
    // Auto-detect dimension based on prompt keywords
    let dimension: ParentContextChunk['dimension'] = 'capabilities';
    const lower = promptText.toLowerCase();
    if (lower.includes('certif') || lower.includes('fips') || lower.includes('iso') || lower.includes('soc')) {
      dimension = 'certifications';
    } else if (lower.includes('partner') || lower.includes('tcs') || lower.includes('infosys') || lower.includes('wipro')) {
      dimension = 'partners';
    } else if (lower.includes('rate') || lower.includes('price') || lower.includes('pricing') || lower.includes('cost') || lower.includes('sla')) {
      dimension = 'pricing';
    } else if (lower.includes('legal') || lower.includes('indemnity') || lower.includes('liability') || lower.includes('ld')) {
      dimension = 'legal';
    } else if (lower.includes('dpdp') || lower.includes('compliance') || lower.includes('hipaa') || lower.includes('gdpr')) {
      dimension = 'compliance';
    }

    const titleExtract = promptText.slice(0, 50).trim() + (promptText.length > 50 ? '...' : '');

    const newChunk: ParentContextChunk = {
      id: newId,
      title: titleExtract,
      dimension,
      content: promptText,
      source: 'Prompt',
      tags: ['Prompt-Ingested', dimension.toUpperCase()],
      confidenceScore: 0.96,
      lastUpdated: new Date().toISOString().split('T')[0],
      updatedBy: author,
    };

    setParentContextChunks((prev) => [newChunk, ...prev]);

    // Create new snapshot version
    const newVersionNumber = `v1.${Date.now().toString().slice(-1)}`;
    const newVersion: ParentContextVersion = {
      version: newVersionNumber,
      timestamp: new Date().toISOString(),
      author,
      summary: `Prompt ingestion: "${titleExtract}"`,
      chunksCount: parentContextChunks.length + 1,
      isActive: true,
    };

    setParentContextVersions((prev) => [
      newVersion,
      ...prev.map((v) => ({ ...v, isActive: false })),
    ]);
  }, [parentContextChunks.length]);

  const uploadParentContextDoc = useCallback(
    (
      fileName: string,
      dimension: ParentContextChunk['dimension'],
      summaryText: string,
      tags: string[],
      author: string
    ) => {
      const newChunk: ParentContextChunk = {
        id: `ctx-doc-${Date.now().toString(36)}`,
        title: fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        dimension,
        content: summaryText,
        source: 'Upload',
        sourceFileName: fileName,
        tags: [...tags, 'Document-Upload'],
        confidenceScore: 0.98,
        lastUpdated: new Date().toISOString().split('T')[0],
        updatedBy: author,
      };

      setParentContextChunks((prev) => [newChunk, ...prev]);

      const newVersion: ParentContextVersion = {
        version: `v1.${Date.now().toString().slice(-1)}`,
        timestamp: new Date().toISOString(),
        author,
        summary: `Document uploaded: ${fileName}`,
        chunksCount: parentContextChunks.length + 1,
        isActive: true,
      };

      setParentContextVersions((prev) => [
        newVersion,
        ...prev.map((v) => ({ ...v, isActive: false })),
      ]);
    },
    [parentContextChunks.length]
  );

  const deleteParentContextChunk = useCallback((id: string) => {
    setParentContextChunks((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateTenderActiveSections = useCallback((sections: string[]) => {
    setTenders((prev) =>
      prev.map((t) =>
        t.id === selectedTenderId ? { ...t, activeTemplateSections: sections } : t
      )
    );
  }, [selectedTenderId]);

  // Conflict Resolution
  const resolveConflictFlag = useCallback(
    (flagId: string, notes: string, author: string) => {
      setConflictFlags((prev) =>
        prev.map((f) =>
          f.id === flagId
            ? {
                ...f,
                status: 'Resolved',
                resolutionNotes: notes,
                resolvedBy: author,
                resolvedAt: new Date().toISOString(),
              }
            : f
        )
      );
    },
    []
  );

  // PBQ Actions
  const addPreBidQuery = useCallback(
    (item: Omit<PreBidQueryItem, 'id'>, author: string, authorRole: string) => {
      const newId = `pbq-${Date.now().toString(36)}`;
      const isPreSales = authorRole.toLowerCase().includes('pre-sales');

      const newItem: PreBidQueryItem = {
        ...item,
        id: newId,
        internalStatus: isPreSales ? 'Draft' : 'Pending Pre-Sales Approval',
        draftedBy: author,
        draftedByRole: authorRole,
      };

      setPbqList((prev) => [newItem, ...prev]);

      // If drafted by SE/Sales, queue for Pre-Sales Lead approval
      if (!isPreSales) {
        setReviewQueue((prev) => [
          {
            id: `rev-pbq-${newId}`,
            sourceType: 'PBQ',
            title: `New PBQ Draft: ${item.clauseNumber}`,
            sectionId: 'pbq',
            author,
            authorRole,
            createdAt: new Date().toISOString(),
            field: 'PBQ Item Creation',
            oldValue: 'None',
            newValue: item.queryText.slice(0, 80) + '...',
            justification: item.rationale,
          },
          ...prev,
        ]);
      }
    },
    []
  );

  const resolvePreBidQuery = useCallback(
    (pbqId: string, resolutionComment: string, evidenceDocName?: string, author?: string) => {
      setPbqList((prev) =>
        prev.map((p) =>
          p.id === pbqId
            ? {
                ...p,
                internalStatus: 'Resolved Internally',
                internalResolutionComment: resolutionComment,
                evidenceAttachmentName: evidenceDocName || p.evidenceAttachmentName,
                resolvedBy: author || 'Ananya Sharma (Pre-Sales Lead)',
                resolvedAt: new Date().toISOString(),
              }
            : p
        )
      );
    },
    []
  );

  const uploadClientPbqResponse = useCallback(
    (pbqId: string, responseText: string, docRef: string) => {
      setPbqList((prev) =>
        prev.map((p) =>
          p.id === pbqId
            ? {
                ...p,
                clientResponseText: responseText,
                clientResponseDocRef: docRef,
                clientResponseStatus: 'Corrigendum Issued',
              }
            : p
        )
      );

      // Auto-dispatch conflict flag for cross-section check
      const newFlag: RfpConflictFlag = {
        id: `conf-pbq-${Date.now().toString(36)}`,
        rfpId: selectedTenderId,
        title: `Client Corrigendum Impact: ${docRef}`,
        description: `New client response uploaded for PBQ item: "${responseText.slice(0, 100)}...". Please review affected technical and delivery sections.`,
        severity: 'Medium',
        sourceSection: 'Pre-Bid Queries (PBQ)',
        targetSection: 'Scope of Work / Infra Sizing',
        status: 'Active',
        detectedAt: new Date().toISOString(),
      };
      setConflictFlags((prev) => [newFlag, ...prev]);
    },
    [selectedTenderId]
  );

  // SoW Actions
  const updateSowCompliance = useCallback(
    (
      sowId: string,
      status: SowLineItem['complianceStatus'],
      responseText: string,
      author: string
    ) => {
      setSowList((prev) =>
        prev.map((s) =>
          s.id === sowId
            ? {
                ...s,
                complianceStatus: status,
                complianceResponseText: responseText,
                preSalesLeadNotes: `Updated by ${author} on ${new Date().toLocaleDateString()}`,
              }
            : s
        )
      );
    },
    []
  );

  const addSowQaReview = useCallback(
    (
      sowId: string,
      status: 'Approved' | 'Requires Clarification' | 'Flagged',
      comments: string,
      author: string
    ) => {
      setSowList((prev) =>
        prev.map((s) =>
          s.id === sowId
            ? {
                ...s,
                productQaReview: {
                  reviewedBy: author,
                  status,
                  comments,
                  reviewedAt: new Date().toISOString(),
                },
              }
            : s
        )
      );
    },
    []
  );

  const suggestAlternateToolForSow = useCallback(
    (
      sowId: string,
      category: ThirdPartyCategory,
      toolName: string,
      vendor: string,
      rationale: string
    ) => {
      let targetClause = '';
      setSowList((prev) =>
        prev.map((s) => {
          if (s.id === sowId) {
            targetClause = s.clauseNumber;
            return {
              ...s,
              requiresThirdPartyTool: true,
              thirdPartyCategory: category,
              suggestedThirdPartyTool: {
                toolName,
                vendor,
                category,
                fitScore: 95,
                rationale,
                estimatedCostNote: 'To be absorbed via SI partner envelope',
                webRef: `https://www.google.com/search?q=${encodeURIComponent(
                  `${toolName} ${category} enterprise security`
                )}`,
              },
            };
          }
          return s;
        })
      );

      // Dynamically auto-create/update inferred integration connector in Integrations Scope Review
      setIntegrationsList((prev) => {
        const existing = prev.find((conn) => conn.inferredFromSowId === sowId);
        if (existing) {
          return prev.map((conn) =>
            conn.inferredFromSowId === sowId
              ? {
                  ...conn,
                  name: `${toolName} (${category})`,
                  suggestedToolName: toolName,
                  inferredRationale: rationale,
                }
              : conn
          );
        }
        const newInferred: IntegrationConnector = {
          id: `intg-inferred-${Date.now().toString(36)}`,
          rfpId: selectedTenderId,
          name: `${toolName} (${category})`,
          category:
            category === 'DSPM'
              ? 'DSPM / Data Security'
              : category === 'HSM' || category === 'KMS'
              ? 'HSM / KMS'
              : category === 'SIEM'
              ? 'SIEM & SOC'
              : 'Other Ecosystem',
          protocol: 'REST / HTTPS',
          direction: 'Bidirectional',
          throughputSla: 'Standard API SLA',
          latencySla: '< 50 ms',
          authMethod: 'OAuth 2.0 / JWT',
          clusterScope: 'Architecture & Delivery',
          architectureNotes: `Auto-inferred from SoW Clause ${targetClause || sowId}: Alternate solution planned for ${category} requirement (${toolName}).`,
          deliveryTimelineWeeks: 4,
          status: 'Pending Scope Review',
          origin: 'Inferred from SoW',
          inferredFromSowId: sowId,
          inferredFromClauseNumber: targetClause || sowId,
          inferredRationale: rationale,
          suggestedToolName: toolName,
          isScopeApproved: false,
        };
        return [newInferred, ...prev];
      });
    },
    [selectedTenderId]
  );

  // Volume Metrics Live Propagation
  const updateVolumeMetric = useCallback(
    (volId: string, newValue: number) => {
      setVolumeMetrics((prev) =>
        prev.map((v) => (v.id === volId ? { ...v, currentValue: newValue } : v))
      );

      // Calculate dynamic impact diff on infrastructure
      // e.g. every 100M records adds ~8 vCPUs, 32GB RAM, 6TB NVMe, ~₹8.5 Lakhs cost
      const targetMetric = volumeMetrics.find((v) => v.id === volId);
      const delta = newValue - (targetMetric?.currentValue || 0);

      if (delta !== 0) {
        const vCpuDelta = Math.round((delta / 100) * 8);
        const ramDelta = Math.round((delta / 100) * 32);
        const storageDelta = Math.round((delta / 100) * 6);
        const costDelta = Math.round((delta / 100) * 850000);

        setPendingInfraDiff({
          vCpuDiff: vCpuDelta,
          ramDiff: ramDelta,
          storageDiff: storageDelta,
          costDiffInr: costDelta,
        });
      }
    },
    [volumeMetrics]
  );

  const applyPendingInfraRecalculation = useCallback(() => {
    if (!pendingInfraDiff) return;

    setInfraSizing((prev) => ({
      ...prev,
      vCpuCores: Math.max(16, prev.vCpuCores + pendingInfraDiff.vCpuDiff),
      ramGb: Math.max(64, prev.ramGb + pendingInfraDiff.ramDiff),
      nvmeStorageTb: Math.max(10, prev.nvmeStorageTb + pendingInfraDiff.storageDiff),
      annualInfraCostInr: Math.max(1000000, prev.annualInfraCostInr + pendingInfraDiff.costDiffInr),
      lastRecalculatedAt: new Date().toISOString(),
    }));

    // Auto-resolve volume vs storage conflict if storage increased
    if (pendingInfraDiff.storageDiff > 0) {
      setConflictFlags((prev) =>
        prev.map((f) =>
          f.id === 'conf-001'
            ? {
                ...f,
                status: 'Resolved',
                resolutionNotes: 'Storage capacity recalculated and expanded to match updated volume metrics.',
                resolvedBy: 'Ananya Sharma (Pre-Sales Lead)',
                resolvedAt: new Date().toISOString(),
              }
            : f
        )
      );
    }

    setPendingInfraDiff(null);
  }, [pendingInfraDiff]);

  const discardPendingInfraRecalculation = useCallback(() => {
    setPendingInfraDiff(null);
  }, []);

  // Tasks & Comments
  const addTask = useCallback((taskData: Omit<RfpSectionTask, 'id' | 'createdAt'>) => {
    const newTask: RfpSectionTask = {
      ...taskData,
      id: `task-rfp-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: RfpSectionTask['status']) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status,
              resolvedAt: status === 'Completed' ? new Date().toISOString() : t.resolvedAt,
            }
          : t
      )
    );
  }, []);

  const addComment = useCallback((commentData: Omit<RfpSectionComment, 'id' | 'createdAt'>) => {
    const newComment: RfpSectionComment = {
      ...commentData,
      id: `comm-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [newComment, ...prev]);
  }, []);

  // Pre-Sales Lead Review Queue Approvals
  const approveReviewItem = useCallback((itemId: string) => {
    setReviewQueue((prev) => prev.filter((item) => item.id !== itemId));

    // If it was a PBQ item, mark it active
    if (itemId.startsWith('rev-pbq-')) {
      const pbqId = itemId.replace('rev-pbq-', '');
      setPbqList((prev) =>
        prev.map((p) =>
          p.id === pbqId ? { ...p, internalStatus: 'Submitted to Client' } : p
        )
      );
    }
  }, []);

  const rejectReviewItem = useCallback((itemId: string) => {
    setReviewQueue((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  // Executive Sign-Off Quorum
  const signExecutiveRole = useCallback(
    (role: ExecutiveSignOff['role'], signerName: string, conditions?: string) => {
      setExecutiveSignOffs((prev) =>
        prev.map((s) =>
          s.role === role
            ? {
                ...s,
                signerName,
                signed: true,
                signedAt: new Date().toISOString(),
                conditions: conditions || s.conditions,
              }
            : s
        )
      );
    },
    []
  );

  // FRD Operations
  const addFrd = useCallback((frdData: Omit<FrdItem, 'id' | 'createdAt'>) => {
    const newId = `FRD-CUST-${Date.now().toString(36).toUpperCase()}`;
    const newFrd: FrdItem = {
      ...frdData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setFrdList((prev) => [newFrd, ...prev]);
    return newId;
  }, []);

  const mapFrdToSowClause = useCallback(
    (sowId: string, frdId: string) => {
      setSowList((prev) =>
        prev.map((s) => {
          if (s.id !== sowId) return s;
          const currentMapped = s.mappedFrdIds || [];
          if (currentMapped.includes(frdId)) return s;
          return { ...s, mappedFrdIds: [...currentMapped, frdId] };
        })
      );

      const targetSow = sowList.find((s) => s.id === sowId);
      const clauseRef = targetSow ? targetSow.clauseNumber : sowId;
      setFrdList((prev) =>
        prev.map((f) => {
          if (f.id !== frdId) return f;
          const currentClauses = f.mappedSowClauses || [];
          if (currentClauses.includes(clauseRef)) return f;
          return { ...f, mappedSowClauses: [...currentClauses, clauseRef] };
        })
      );
    },
    [sowList]
  );

  const unmapFrdFromSowClause = useCallback(
    (sowId: string, frdId: string) => {
      setSowList((prev) =>
        prev.map((s) => {
          if (s.id !== sowId) return s;
          return {
            ...s,
            mappedFrdIds: (s.mappedFrdIds || []).filter((id) => id !== frdId),
          };
        })
      );

      const targetSow = sowList.find((s) => s.id === sowId);
      const clauseRef = targetSow ? targetSow.clauseNumber : sowId;
      setFrdList((prev) =>
        prev.map((f) => {
          if (f.id !== frdId) return f;
          return {
            ...f,
            mappedSowClauses: (f.mappedSowClauses || []).filter((c) => c !== clauseRef),
          };
        })
      );
    },
    [sowList]
  );

  // Integrations Operations
  const addIntegrationConnector = useCallback(
    (connectorData: Omit<IntegrationConnector, 'id'>) => {
      const newConnector: IntegrationConnector = {
        ...connectorData,
        id: `intg-${Date.now().toString(36)}`,
      };
      setIntegrationsList((prev) => [newConnector, ...prev]);
    },
    []
  );

  const updateIntegrationConnector = useCallback(
    (id: string, updates: Partial<IntegrationConnector>) => {
      setIntegrationsList((prev) =>
        prev.map((conn) => (conn.id === id ? { ...conn, ...updates } : conn))
      );
    },
    []
  );

  const deleteIntegrationConnector = useCallback((id: string) => {
    setIntegrationsList((prev) => prev.filter((conn) => conn.id !== id));
  }, []);

  const toggleIntegrationApproval = useCallback((id: string, approverName: string) => {
    setIntegrationsList((prev) =>
      prev.map((conn) => {
        if (conn.id !== id) return conn;
        const willBeApproved = !conn.isScopeApproved;
        return {
          ...conn,
          isScopeApproved: willBeApproved,
          approvedBy: willBeApproved ? approverName : undefined,
          approvedAt: willBeApproved ? new Date().toISOString() : undefined,
          status: willBeApproved ? 'Validated' : 'Pending Scope Review',
        };
      })
    );
  }, []);

  const approveInferredIntegration = useCallback((id: string, approverName: string) => {
    setIntegrationsList((prev) =>
      prev.map((conn) => {
        if (conn.id !== id) return conn;
        return {
          ...conn,
          isScopeApproved: true,
          approvedBy: approverName,
          approvedAt: new Date().toISOString(),
          status: 'Validated',
        };
      })
    );
  }, []);

  const value = useMemo(
    () => ({
      parentContextChunks,
      parentContextVersions,
      addParentContextPrompt,
      uploadParentContextDoc,
      deleteParentContextChunk,
      tenders,
      selectedTenderId,
      setSelectedTenderId,
      selectedTender,
      updateTenderActiveSections,
      conflictFlags,
      resolveConflictFlag,
      activeConflictCount,
      pbqList,
      addPreBidQuery,
      resolvePreBidQuery,
      uploadClientPbqResponse,
      sowList,
      updateSowCompliance,
      addSowQaReview,
      suggestAlternateToolForSow,
      volumeMetrics,
      updateVolumeMetric,
      infraSizing,
      pendingInfraDiff,
      applyPendingInfraRecalculation,
      discardPendingInfraRecalculation,
      tasks,
      addTask,
      updateTaskStatus,
      comments,
      addComment,
      reviewQueue,
      approveReviewItem,
      rejectReviewItem,
      executiveSignOffs,
      signExecutiveRole,
      signOffQuorumMet,
      frdList,
      addFrd,
      mapFrdToSowClause,
      unmapFrdFromSowClause,
      integrationsList,
      addIntegrationConnector,
      updateIntegrationConnector,
      deleteIntegrationConnector,
      toggleIntegrationApproval,
      approveInferredIntegration,
    }),
    [
      parentContextChunks,
      parentContextVersions,
      addParentContextPrompt,
      uploadParentContextDoc,
      deleteParentContextChunk,
      tenders,
      selectedTenderId,
      selectedTender,
      updateTenderActiveSections,
      conflictFlags,
      resolveConflictFlag,
      activeConflictCount,
      pbqList,
      addPreBidQuery,
      resolvePreBidQuery,
      uploadClientPbqResponse,
      sowList,
      updateSowCompliance,
      addSowQaReview,
      suggestAlternateToolForSow,
      volumeMetrics,
      updateVolumeMetric,
      infraSizing,
      pendingInfraDiff,
      applyPendingInfraRecalculation,
      discardPendingInfraRecalculation,
      tasks,
      addTask,
      updateTaskStatus,
      comments,
      addComment,
      reviewQueue,
      approveReviewItem,
      rejectReviewItem,
      executiveSignOffs,
      signExecutiveRole,
      signOffQuorumMet,
      frdList,
      addFrd,
      mapFrdToSowClause,
      unmapFrdFromSowClause,
      integrationsList,
      addIntegrationConnector,
      updateIntegrationConnector,
      deleteIntegrationConnector,
      toggleIntegrationApproval,
      approveInferredIntegration,
    ]
  );

  return <RfpContext.Provider value={value}>{children}</RfpContext.Provider>;
};

export const useRfp = (): RfpContextType => {
  const context = useContext(RfpContext);
  if (!context) {
    throw new Error('useRfp must be used within an RfpProvider');
  }
  return context;
};
