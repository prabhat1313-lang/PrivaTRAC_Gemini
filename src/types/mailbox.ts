export interface EmailAddress {
  name: string;
  email: string;
}

export type EmailFolder = 'inbox' | 'sent' | 'drafts' | 'archive';

export type EmailCategory =
  | 'RFP Tender'
  | 'Client Clarification'
  | 'PoC Scheduling'
  | 'Commercial & Legal'
  | 'General';

export interface EmailAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  isPrivasapienCollateral?: boolean;
  isFrdSpec?: boolean;
}

export interface EmailMessage {
  id: string;
  internetMessageId: string;
  conversationId: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  subject: string;
  bodyPreview: string;
  bodyText: string;
  receivedDateTime: string;
  isRead: boolean;
  hasAttachments: boolean;
  folder: EmailFolder;
  category: EmailCategory;
  // CRM & RFP Entity Auto-Matching
  matchedAccountId?: string;
  matchedAccountName?: string;
  matchedTenderId?: string;
  matchedTenderNumber?: string;
  detectedClauseRef?: string;
  // Attachments
  attachments?: EmailAttachment[];
  attachedCollateralIds?: string[];
  attachedFrdIds?: string[];
  // Task & PBQ tracking
  createdTaskId?: string;
  createdTaskDestination?: 'rfp_workdesk' | 'account_workspace';
  createdPbqId?: string;
}

export interface OutlookConnectionStatus {
  isConnected: boolean;
  connectedAccountEmail?: string;
  connectedAccountName?: string;
  tenantId?: string;
  lastDeltaSyncAt?: string;
  syncMode: 'live_graph' | 'simulated_sandbox';
  unreadCount: number;
}

export interface TaskCreationDraft {
  emailId: string;
  sourceSubject: string;
  sourceSender: string;
  selectedTextSnippet?: string;
  matchedAccountId?: string;
  matchedAccountName?: string;
  matchedTenderId?: string;
  matchedTenderNumber?: string;
  isRfpDeal: boolean;
  routingDestination: 'rfp_workdesk' | 'account_workspace';
  targetSection: string; // RFP section key OR CRM task section
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low' | 'Urgent';
  assigneeName: string;
  dueDate: string;
}

export interface ToastFeedback {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
  destination: 'rfp_workdesk' | 'account_workspace';
  targetSectionId?: string;
  targetAccountId?: string;
  actionLabel: string;
}
