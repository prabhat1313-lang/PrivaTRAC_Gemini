export type ParentContextDimension =
  | 'capabilities'
  | 'certifications'
  | 'partners'
  | 'compliance'
  | 'pricing'
  | 'legal';

export interface ParentContextChunk {
  id: string;
  title: string;
  dimension: ParentContextDimension;
  content: string;
  source: 'Prompt' | 'Upload' | 'System Baseline';
  sourceFileName?: string;
  tags: string[];
  confidenceScore: number;
  lastUpdated: string;
  updatedBy: string;
}

export interface ParentContextVersion {
  version: string;
  timestamp: string;
  author: string;
  summary: string;
  chunksCount: number;
  isActive: boolean;
}

export type ThirdPartyCategory =
  | 'DLP'
  | 'EDR'
  | 'XDR'
  | 'DAG'
  | 'DAM'
  | 'DSPM'
  | 'HSM'
  | 'KMS'
  | 'SIEM'
  | 'SOAR'
  | 'UEBA'
  | 'IAM'
  | 'PAM'
  | 'Other';

export interface ThirdPartyToolSuggestion {
  toolName: string;
  vendor: string;
  category: ThirdPartyCategory;
  fitScore: number;
  rationale: string;
  estimatedCostNote: string;
  webRef: string;
}

export interface FrdItem {
  id: string; // e.g. 'FRD-PETS-01'
  title: string;
  module:
    | 'Privacy Engine'
    | 'Synthetic Data Studio'
    | 'Differential Privacy'
    | 'Cryptographic Sandbox'
    | 'Integration Bus'
    | 'Audit & Compliance';
  productFamily: 'PETs Core' | 'Synthetic Studio' | 'ZK Studio' | 'Governance Suite';
  status: 'GA' | 'In Development' | 'Roadmap Backlog' | 'Under Review';
  targetRelease: string;
  specSummary: string;
  technicalAcceptanceCriteria: string[];
  mappedSowClauses: string[];
  createdBy: string;
  createdAt: string;
}

export interface IntegrationConnector {
  id: string;
  rfpId: string;
  name: string;
  category:
    | 'Core Banking / OLTP'
    | 'Data Lake / Storage'
    | 'SIEM & SOC'
    | 'HSM / KMS'
    | 'IAM / Identity'
    | 'Pipeline / ETL'
    | 'DSPM / Data Security'
    | 'Other Ecosystem';
  protocol: 'gRPC' | 'REST / HTTPS' | 'Kafka' | 'PKCS#11' | 'ODBC / JDBC' | 'Syslog TLS' | 'Agent / SDK';
  direction: 'Inbound' | 'Outbound' | 'Bidirectional';
  throughputSla: string;
  latencySla: string;
  authMethod: 'mTLS' | 'OAuth 2.0 / JWT' | 'Hardware Token / PKI' | 'API Key';
  clusterScope: 'Architecture & Delivery';
  architectureNotes: string;
  deliveryTimelineWeeks: number;
  status: 'Validated' | 'Requires Custom Connector' | 'Pending Client Spec' | 'Pending Scope Review';
  origin?: 'RFP Requirement' | 'Inferred from SoW';
  inferredFromSowId?: string;
  inferredFromClauseNumber?: string;
  inferredRationale?: string;
  suggestedToolName?: string;
  isScopeApproved?: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

export interface SowLineItem {
  id: string;
  rfpId: string;
  clauseNumber: string;
  category: string;
  verbatimText: string;
  pageNumber: number;
  complianceStatus: 'Complied' | 'Partially Complied' | 'Exception / Deviation' | 'Not Complied';
  privasapienProductMatch: string;
  isPrivasapienNative: boolean;
  isRoadmapCovered: boolean;
  mappedFrdIds?: string[];
  requiresThirdPartyTool: boolean;
  thirdPartyCategory?: ThirdPartyCategory;
  suggestedThirdPartyTool?: ThirdPartyToolSuggestion;
  complianceResponseText: string;
  productQaReview: {
    reviewedBy: string;
    status: 'Approved' | 'Requires Clarification' | 'Flagged';
    comments: string;
    reviewedAt: string;
  };
  preSalesLeadNotes?: string;
}

export interface VolumeMetricItem {
  id: string;
  rfpId: string;
  metricName: string;
  tag: 'Provided' | 'Assumed';
  unit: string;
  currentValue: number;
  tenderSourcePage?: number;
  notes: string;
}

export interface InfraSizingSpec {
  vCpuCores: number;
  ramGb: number;
  nvmeStorageTb: number;
  networkEgressTb: number;
  gpuUnits: number;
  dpOverheadFactor: number;
  annualInfraCostInr: number;
  lastRecalculatedAt: string;
}

export interface PreBidQueryItem {
  id: string;
  rfpId: string;
  clauseNumber: string;
  tenderPage: number;
  verbatimRfpText: string;
  queryText: string;
  rationale: string;
  category: 'Technical' | 'Commercial' | 'Legal' | 'Eligibility' | 'SLA';
  isLatePostCutoff: boolean;
  manualSubmissionChannel?: string;
  clientResponseText?: string;
  clientResponseDocRef?: string;
  clientResponseStatus: 'Pending Client Response' | 'Clarified' | 'Rejected by Client' | 'Corrigendum Issued';
  internalStatus: 'Draft' | 'Submitted to Client' | 'Pending Pre-Sales Approval' | 'Resolved Internally' | 'Deferred';
  internalResolutionComment?: string;
  evidenceAttachmentName?: string;
  evidenceAttachmentUrl?: string;
  draftedBy: string;
  draftedByRole: string;
  resolvedBy?: string;
  resolvedAt?: string;
  impactsToSections?: string[];
}

export interface RfpConflictFlag {
  id: string;
  rfpId: string;
  title: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  sourceSection: string;
  targetSection: string;
  status: 'Active' | 'Under Review' | 'Resolved';
  detectedAt: string;
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface RfpSectionTask {
  id: string;
  rfpId: string;
  sectionId: string;
  title: string;
  description: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Pending Approval';
  assignee: string;
  createdBy: string;
  createdRole: string;
  dueDate: string;
  createdAt: string;
  resolvedAt?: string;
  pendingDiff?: {
    field: string;
    oldValue: string;
    newValue: string;
    justification: string;
  };
}

export interface RfpSectionComment {
  id: string;
  rfpId: string;
  sectionId: string;
  clauseId?: string;
  author: string;
  authorRole: string;
  avatar: string;
  text: string;
  createdAt: string;
  isTaskDeviation?: boolean;
}

export interface ExecutiveSignOff {
  role: 'Product Manager' | 'Leader' | 'Delivery Manager';
  signerName: string;
  signed: boolean;
  signedAt?: string;
  conditions?: string;
}

export interface RfpTender {
  id: string;
  tenderNumber: string;
  title: string;
  clientName: string;
  accountId: string;
  estimatedValue: number;
  currency: 'INR' | 'USD' | 'SGD' | 'EUR';
  submissionDeadline: string;
  pbqCutoffDate: string;
  preSalesLead: string;
  solutionEngineer: string;
  salesOwner: string;
  primarySiPartner: string;
  status: 'Pre-Bid Phase' | 'Technical Review' | 'Commercial Freeze' | 'Executive Sign-Off' | 'Submitted';
  tenderDocName: string;
  tenderDocPages: number;
  activeTemplateSections: string[];
  overallCompletion: number;
}
