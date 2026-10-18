export type UserRole =
  | 'Sales Owner'
  | 'Pre-Sales Owner'
  | 'Solution Engineer'
  | 'Leader'
  | 'SalesOps'
  | 'Partner'
  | 'Administrator';

export interface UserProfileDetails {
  designation?: string;
  department?: string;
  primaryTerritory?: string;
  productSpecializations?: string[];
  defaultCurrency?: 'INR' | 'USD' | 'SGD' | 'EUR' | 'GBP';
  useIndianNumbering?: boolean;
  delegationAuthorized?: boolean;
  delegatedProxyUser?: string;
  notificationsEnabled?: boolean;
  profileCompletionPercentage?: number;
  completedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  team: string;
  partnerOrganization?: string;
  onBehalfOf?: string;
  guidanceThreshold?: number; // Threshold percentage below which leadership guidance is considered low/deficit (default 20)
  initiativeThreshold?: number; // Threshold percentage above which self-initiative is considered high (default 50)
  profileCompleted?: boolean;
  profileDetails?: UserProfileDetails;
}

export type AccountStage =
  | 'New Account'
  | 'Nurturing'
  | 'Mature'
  | 'Critical'
  | 'Closed Won'
  | 'Closed Lost';

export type WinningStance =
  | 'Lost/Not Started'
  | 'Initial Stages'
  | 'Low Chance'
  | 'All are Equal'
  | 'Customer Prefers Us'
  | 'Under PO Negotiations'
  | 'Won/PO Received';

export type AdoptionCategory =
  | 'Innovator'
  | 'Early Adopter'
  | 'Early Majority'
  | 'Late Majority'
  | 'Laggard';

export type Sector =
  | 'Banking & Financial Services'
  | 'Healthcare & Life Sciences'
  | 'Telecommunications'
  | 'E-commerce & Retail'
  | 'Government & Public Sector'
  | 'Automotive & IoT';

export type Geography =
  | 'India (North)'
  | 'India (South)'
  | 'India (West)'
  | 'India (East)'
  | 'Singapore & APAC'
  | 'United States'
  | 'United Kingdom & EU'
  | 'Middle East';

export type ProcurementType =
  | 'Direct Opportunity'
  | 'Open RFP'
  | 'Closed RFP';

export type ProductFamily =
  | 'Privacy Enhancing Technologies (PETs)'
  | 'Responsible AI & Governance'
  | 'Data Anonymization Suite'
  | 'PrivacyGRC Core Suite';

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'SGD';

export interface AuditEntry {
  id: string;
  field: string;
  actor: string;
  actingOnBehalfOf?: string;
  timestamp: string;
  effectiveDate: string;
  oldValue: string;
  newValue: string;
  provenance: 'Human-entered' | 'AI-suggested' | 'Human-confirmed';
  isBackDated?: boolean;
  entityType?: 'Account' | 'Contact' | 'Task' | 'Admin' | 'Other';
  entityId?: string;
  entityName?: string;
}

export interface AuditMeta {
  actor?: string;
  actingOnBehalfOf?: string;
  provenance?: 'Human-entered' | 'AI-suggested' | 'Human-confirmed';
  effectiveDate?: string;
}

export interface Account {
  id: string;
  name: string;
  website: string;
  logoText: string;
  logoBg: string;
  stage: AccountStage;
  annualRevenue: number;
  revenueCurrency: Currency;
  dealValueOverride?: number;
  winningStance: WinningStance;
  adoptionCategory: AdoptionCategory;
  owners: {
    sales: string;
    preSales: string;
    solutionEngineer: string;
    leader: string;
  };
  petsFlag: boolean;
  responsibleAiFlag: boolean;
  sector: Sector;
  geography: Geography;
  publicPrivate: 'Public' | 'Private';
  procurementType: ProcurementType;
  productFamily: ProductFamily;
  product: string;
  products?: string[];
  headOfficeAddress: string;
  partners: string[];
  dateAdded: string;
  lastActivityDate: string;
  isStale: boolean;
  notes?: string;
  aiEnrichedFields: Record<string, boolean>;
  fieldAuditTrail: AuditEntry[];
  profileCompletion: {
    human: number;
    ai: number;
  };
  documents?: AccountDocument[];
  sowRequirements?: SowRequirementRow[];
  sowFinalApproved?: boolean;
  sowLastConvertedAt?: string;
}

export type DocumentCategory =
  | 'Scope of Work / Requirements'
  | 'RFP / Corrigendum'
  | 'Other Documents'
  | 'Proposal'
  | 'Contract'
  | 'Security & Compliance'
  | 'Technical Architecture'
  | 'General';

export interface AccountDocument {
  id: string;
  name: string;
  size: string;
  uploadedBy: string;
  timestamp: string;
  category: DocumentCategory;
  url?: string;
  type?: string;
  extractedReviewId?: string;
}

export type ContactTag =
  | 'Champion'
  | 'Detractor'
  | 'Influencer'
  | 'Decision Maker'
  | 'Observer';

export interface UnmaskLog {
  id: string;
  actor: string;
  purpose: string;
  timestamp: string;
}

export interface Contact {
  id: string;
  accountId: string;
  firstName: string;
  lastName: string;
  designation: string;
  email: string;
  phone1: string;
  phone2?: string;
  tags: ContactTag[];
  source: 'Email Received' | 'Public Registry' | 'In-person Meeting' | 'Web Inquiry';
  consentState: 'Deemed Consent' | 'Notice Sent' | 'Explicit Opt-in';
  isMasked: boolean;
  unmaskHistory: UnmaskLog[];
  fieldAuditTrail?: AuditEntry[];
}

export type TaskStatus = 'Pending' | 'Completed' | 'Completed Late' | 'Overdue';
export type TaskSection =
  | 'Demo'
  | 'Contact'
  | 'Technical Proposal'
  | 'Commercial Proposal'
  | 'Infra & SBOM'
  | 'General';

export type InteractionTag = 'email' | 'call' | 'in-person' | 'whatsapp';

export interface TaskComment {
  id: string;
  author: string;
  timestamp: string;
  text: string;
  interactionTag?: InteractionTag;
}

export interface TaskDocument {
  id: string;
  name: string;
  size: string;
  uploadedBy: string;
  timestamp: string;
  url?: string;
  type?: string;
}

export interface Task {
  id: string;
  name?: string; // Short Task Name displayed in Tasks List
  accountId: string;
  relatedSection?: TaskSection;
  description: string;
  creatorId: string;
  assigneeId: string;
  tct: string; // Target Completion Time (ISO date)
  completedAt?: string;
  status: TaskStatus;
  interactionTag?: InteractionTag;
  interactionTags?: InteractionTag[];
  priority: 'High' | 'Medium' | 'Low';
  comments: TaskComment[];
  documents: TaskDocument[];
  isActivity: boolean; // Self-created
  partnerTag?: string; // Tagged Partner organization (e.g. Wipro Technologies) - backward compatibility
  partnerTags?: string[]; // Multiple tagged partner organizations for RFP multi-SI bids
  rfpSubtask?: {
    stage: string;
    stepIndex: number;
    requiredRole: string;
  };
  effectiveDate?: string;
  isBackDated?: boolean;
  parentTaskId?: string; // If set, this task is a Sub-Task of the designated parent Task
  fieldAuditTrail?: AuditEntry[];
  reviewType?:
    | 'submission_checklist'
    | 'legal_review'
    | 'delivery_review'
    | 'commercial_review'
    | 'infra_architecture_review'
    | 'other_requirements';
  submissionChecklist?: SubmissionChecklistItem[];
  reviewSchedule?: ReviewScheduleItem[];
  sourceDocumentName?: string;
}

export interface DemoComment {
  id: string;
  author: string;
  timestamp: string;
  text: string;
}

export interface Demo {
  id: string;
  accountId: string;
  title: string;
  scheduledDate: string;
  status: 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled';
  attendeeContactIds: string[];
  solutionEngineerId: string;
  agenda?: string;
  minutesOfMeeting: string;
  gapsIdentified: string;
  comments?: DemoComment[];
  timeline: { date: string; note: string }[];
}

export interface Collateral {
  id: string;
  title: string;
  category:
    | 'Product Datasheet'
    | 'Architecture Whitepaper'
    | 'Security & SBOM'
    | 'Case Study'
    | 'Sample RFP Response';
  fileName: string;
  fileSize: string;
  downloadUrl?: string;
  updatedDate: string;
  description: string;
}

export interface PartnerSWOT {
  id: string;
  partnerName: string;
  tier: 'Strategic Global' | 'Regional Tier-1' | 'Specialist Boutique';
  headquarters: string;
  associatedAccountsCount: number;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  lastUpdated: string;
  aiSuggestedUpdate?: string;
}

export interface ExchangeRates {
  base: 'INR';
  rates: {
    USD: number;
    EUR: number;
    GBP: number;
    SGD: number;
    INR: number;
  };
  lastUpdated: string;
}

export interface FilterState {
  geographies: Geography[];
  sectors: Sector[];
  productFamily?: ProductFamily;
  products: string[];
  partners: string[];
  salesOwners: string[];
  preSalesOwners: string[];
  solutionEngineers: string[];
  publicPrivate?: 'Public' | 'Private';
  procurementTypes: ProcurementType[];
  startDate?: string;
  endDate?: string;
}

// ==========================================
// RFP / Corrigendum Review & Task Models
// ==========================================
export type ChecklistOwnerType = 'OEM' | 'SI Partner' | 'Both';

export interface SubmissionChecklistItem {
  id: string;
  documentName: string;
  description: string;
  mandatory: boolean;
  owner: ChecklistOwnerType;
  assignedPartnerId?: string;
  assignedPartnerName?: string;
  status: 'Pending' | 'In Progress' | 'Ready' | 'Submitted';
  uploadedDocId?: string;
  notes?: string;
}

export interface ReviewScheduleItem {
  id: string;
  category: string;
  clauseRef: string;
  title: string;
  description: string;
  ownerOrRole: string;
  assignedPartnerName?: string;
  riskOrImpact: 'High' | 'Medium' | 'Low' | 'Standard';
  status: 'Pending Review' | 'Reviewed' | 'Flagged' | 'Approved';
  notes?: string;
}

// ==========================================
// Scope of Work (SoW) & AI Compliance
// ==========================================
export type ComplianceStatus =
  | 'Fully Compliant'
  | 'Partially Compliant'
  | 'Non-Compliant'
  | 'Not Applicable';

export interface SowRequirementRow {
  id: string;
  clauseNumber: string;
  category: string;
  requirementText: string;
  complianceStatus: ComplianceStatus;
  preliminaryRemarks: string;
  qaReview: string;
  finalResponse: string;
  complementaryTool?: string;
  complementaryToolRationale?: string;
  confidenceScore?: 'High' | 'Medium' | 'Partner Inferred';
  citationSnippet?: string;
  matrixRequirementId?: string;
  updatedAt?: string;
}

// ==========================================
// Product Requirements Matrix
// ==========================================
export type AvailabilityStatus =
  | 'Fully Available'
  | 'Partially Available'
  | 'Not Available';

export type ProductMatrixTag =
  | 'Requires Configuration'
  | 'Requires Integration'
  | 'Requires Customization'
  | 'Not Applicable'
  | 'Architecturally Infeasible';

export interface LinkedFRD {
  id: string;
  title: string;
  linkUrl?: string;
  status: 'Draft' | 'Approved' | 'In Development' | 'Shipped';
  targetRelease?: string;
  owner?: string;
}

export interface AccountRequirementMapping {
  accountId: string;
  accountName: string;
  complianceStatus: ComplianceStatus | string;
  preliminaryRemarks?: string;
  finalResponse?: string;
  tenderRef?: string;
  updatedAt?: string;
}

export interface ProductMatrixRequirement {
  id: string;
  productFamily: string;
  product: string;
  module: string;
  title: string;
  description: string;
  availabilityStatus: AvailabilityStatus;
  tags: ProductMatrixTag[];
  linkedFrd?: LinkedFRD;
  accountMappings: Record<string, AccountRequirementMapping>;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// Product Context Knowledge Base (Admin)
// ==========================================
export interface ProductContextVersion {
  id: string;
  version: string;
  createdAt: string;
  createdBy: string;
  changeSummary: string;
  sourceSoWAccountId?: string;
  sourceSoWAccountName?: string;
  content: string; // Markdown or detailed structured specifications
  isActive: boolean;
  isDraft?: boolean;
}

// ==========================================
// Notification System
// ==========================================
export interface CrmNotification {
  id: string;
  category: 'product' | 'task' | 'account';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetId?: string;
  targetType?: 'account' | 'task' | 'matrix' | 'frd';
}

// ==========================================
// Configurable Matrix Hierarchy
// ==========================================
export interface MatrixHierarchyLevel {
  id: string;
  name: string;
  label?: string;
  order: number;
  enabled?: boolean;
  description?: string;
}

export interface ComplementaryPartnerTool {
  solutionName: string;
  topVendor: string;
  rationale: string;
  alternativeVendors: string[];
}

