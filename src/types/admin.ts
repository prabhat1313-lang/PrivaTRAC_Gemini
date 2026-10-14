import { UserRole } from './crm';

export interface UserTeam {
  id: string;
  name: string;
  department: string;
  leadUserId?: string;
  description: string;
  memberCount: number;
  createdDate: string;
}

export type PermissionLevel = 'Full Access' | 'Read Only' | 'Scoped' | 'Hidden';
export type SectionPermissionLevel = 'Full' | 'Read Only' | 'Hidden';
export type FieldPermissionLevel = 'Edit' | 'View' | 'Masked' | 'Hidden';

export interface RolePermissions {
  modules: {
    dashboard: PermissionLevel;
    accounts: PermissionLevel;
    contacts: PermissionLevel;
    tasks: PermissionLevel;
    demos: PermissionLevel;
    partners: PermissionLevel;
    mailbox: PermissionLevel;
    reports: PermissionLevel;
    admin: PermissionLevel;
  };
  sections: {
    financialOverview: SectionPermissionLevel;
    pipelineFunnel: SectionPermissionLevel;
    aiAdvice: SectionPermissionLevel;
    cbacIntelligence: SectionPermissionLevel;
    technicalGaps: SectionPermissionLevel;
    partnerSwot: SectionPermissionLevel;
    collaterals: SectionPermissionLevel;
    auditLogs: SectionPermissionLevel;
  };
  actions: {
    addAccount: boolean;
    deleteAccount: boolean;
    overrideDealValue: boolean;
    completeTask: boolean;
    scheduleDemo: boolean;
    exportReports: boolean;
    manageUsers: boolean;
    delegateOnBehalfOf: boolean;
  };
  fields: {
    dealValue: FieldPermissionLevel;
    revenueCurrency: FieldPermissionLevel;
    winningStance: FieldPermissionLevel;
    procurementType: FieldPermissionLevel;
    contactDirectPii: FieldPermissionLevel; // CBAC Masking
    internalStrategyNotes: FieldPermissionLevel;
  };
}

export interface RoleDefinition {
  id: string;
  name: string;
  focusArea: string;
  description: string;
  isStartingRole: boolean;
  allowsOnBehalfOf: boolean;
  userCount: number;
  createdDate: string;
  permissions: RolePermissions;
}

export interface WorkflowStep {
  id: string;
  stepNumber: number;
  name: string;
  description: string;
  requiredRole: string;
  slaDays: number;
  deliverable: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  category: 'RFP Proposal' | 'Technical PoC' | 'Architecture Review' | 'Security Due Diligence';
  description: string;
  triggerEvent: string;
  active: boolean;
  steps: WorkflowStep[];
}

export type EntityType = 'Account' | 'Contact' | 'Task' | 'Demo';
export type CustomFieldType =
  | 'text'
  | 'number'
  | 'currency'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'boolean'
  | 'textarea';

export interface CustomFieldConfig {
  id: string;
  entity: EntityType;
  fieldName: string;
  fieldKey: string;
  fieldType: CustomFieldType;
  options?: string[];
  required: boolean;
  isCustom: boolean;
  active: boolean;
  description?: string;
  defaultValue?: string;
  auditTracked: boolean;
}

export interface UploadHistoryEntry {
  id: string;
  type: 'Accounts' | 'Contacts' | 'Tasks';
  fileName: string;
  timestamp: string;
  uploadedBy: string;
  recordsCount: number;
  status: 'Success' | 'Partial' | 'Failed';
  summary: string;
}

export interface BulkUploadPreviewItem {
  id: string;
  status: 'Valid' | 'Warning' | 'Error';
  data: Record<string, string>;
  message?: string;
}
