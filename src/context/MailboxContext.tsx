import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  EmailMessage,
  EmailFolder,
  OutlookConnectionStatus,
  TaskCreationDraft,
  ToastFeedback,
} from '../types/mailbox';
import { initialEmailMessages, initialOutlookStatus } from '../data/mailboxSeedData';
import { useCrm } from './CrmContext';
import { useRfp } from './RfpContext';
import { TaskSection } from '../types/crm';

interface MailboxContextType {
  messages: EmailMessage[];
  selectedMessageId: string | null;
  setSelectedMessageId: (id: string | null) => void;
  selectedMessage: EmailMessage | undefined;
  activeFolder: EmailFolder;
  setActiveFolder: (folder: EmailFolder) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  outlookStatus: OutlookConnectionStatus;
  setOutlookStatus: React.Dispatch<React.SetStateAction<OutlookConnectionStatus>>;
  toastFeedback: ToastFeedback | null;
  setToastFeedback: (toast: ToastFeedback | null) => void;
  markAsRead: (id: string) => void;
  triggerDeltaSync: () => void;
  sendMessage: (draft: {
    to: string;
    cc?: string;
    subject: string;
    body: string;
    attachedCollateralIds?: string[];
    attachedFrdIds?: string[];
  }) => void;
  createTaskFromEmail: (draft: TaskCreationDraft) => { success: boolean; taskId: string };
  convertEmailToPbq: (email: EmailMessage, queryText: string, specificClause?: string) => void;
}

const MailboxContext = createContext<MailboxContextType | null>(null);

export const MailboxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, addTask: crmAddTask } = useCrm();
  const { addTask: rfpAddTask, addPreBidQuery, selectedTender } = useRfp();

  const [messages, setMessages] = useState<EmailMessage[]>(initialEmailMessages);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>('msg-sbi-01');
  const [activeFolder, setActiveFolder] = useState<EmailFolder>('inbox');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [outlookStatus, setOutlookStatus] = useState<OutlookConnectionStatus>(initialOutlookStatus);
  const [toastFeedback, setToastFeedback] = useState<ToastFeedback | null>(null);

  const selectedMessage = useMemo(
    () => messages.find((m) => m.id === selectedMessageId),
    [messages, selectedMessageId]
  );

  const markAsRead = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, isRead: true } : msg))
    );
    setOutlookStatus((prev) => ({
      ...prev,
      unreadCount: Math.max(0, prev.unreadCount - 1),
    }));
  }, []);

  const triggerDeltaSync = useCallback(() => {
    // Simulate Microsoft Graph Delta Query incremental sync
    const simulatedIncoming: EmailMessage = {
      id: `msg-delta-${Date.now().toString(36)}`,
      internetMessageId: `<delta-sync-${Date.now()}@sbi.co.in>`,
      conversationId: 'conv-sbi-hsm-01',
      from: {
        name: 'SBI IT Procurement Desk (Corrigendum Updates)',
        email: 'it.procurement@sbi.co.in',
      },
      to: [
        {
          name: currentUser.name,
          email: 'ananya.sharma@privasapien.com',
        },
      ],
      subject: 'State Bank of India RFP: Corrigendum #4 Released (Schedule of Requirements)',
      bodyPreview:
        'Please find attached Corrigendum #4 detailing updated differential privacy query SLAs and revised PBQ clarifications...',
      bodyText: `Dear Bidders,

State Bank of India has published Corrigendum #4 for Tender RFP/SBI/IT/2026/04.

Key revisions include:
1. Revised peak query throughput requirement: 1,500 queries/second (QPS).
2. Clarification on HSM partition segregation: Virtualized partition acceptable subject to FIPS-140-3 Level 3 physical boundary.

Please review the revised RFP technical matrices prior to the submission deadline.

Regards,
IT Procurement Committee
State Bank of India`,
      receivedDateTime: new Date().toISOString(),
      isRead: false,
      hasAttachments: true,
      folder: 'inbox',
      category: 'RFP Tender',
      matchedAccountId: 'acc-1',
      matchedAccountName: 'State Bank of India',
      matchedTenderId: 'rfp-sbi-01',
      matchedTenderNumber: 'RFP/SBI/IT/2026/04',
      detectedClauseRef: 'Section 3.2',
      attachments: [
        {
          id: `att-${Date.now()}`,
          name: 'SBI_RFP_Corrigendum_4_Schedule_of_Requirements.pdf',
          size: '2.4 MB',
          type: 'application/pdf',
        },
      ],
    };

    setMessages((prev) => [simulatedIncoming, ...prev]);
    setSelectedMessageId(simulatedIncoming.id);
    setOutlookStatus((prev) => ({
      ...prev,
      lastDeltaSyncAt: new Date().toISOString(),
      unreadCount: prev.unreadCount + 1,
    }));

    setToastFeedback({
      id: `toast-sync-${Date.now()}`,
      type: 'info',
      title: 'Microsoft Graph Delta Sync Complete',
      message: 'New incoming corrigendum synced from State Bank of India IT Procurement.',
      destination: 'rfp_workdesk',
      targetSectionId: 'sow',
      actionLabel: 'View Corrigendum →',
    });
  }, [currentUser]);

  const sendMessage = useCallback(
    (draft: {
      to: string;
      cc?: string;
      subject: string;
      body: string;
      attachedCollateralIds?: string[];
      attachedFrdIds?: string[];
    }) => {
      const newOutbound: EmailMessage = {
        id: `msg-sent-${Date.now().toString(36)}`,
        internetMessageId: `<privasapien-outbound-${Date.now()}@privasapien.com>`,
        conversationId: `conv-outbound-${Date.now().toString(36)}`,
        from: {
          name: `${currentUser.name} (${currentUser.role})`,
          email: 'ananya.sharma@privasapien.com',
        },
        to: [
          {
            name: draft.to.split('@')[0],
            email: draft.to,
          },
        ],
        cc: draft.cc
          ? [
              {
                name: draft.cc.split('@')[0],
                email: draft.cc,
              },
            ]
          : undefined,
        subject: draft.subject,
        bodyPreview: draft.body.slice(0, 100) + '...',
        bodyText: draft.body,
        receivedDateTime: new Date().toISOString(),
        isRead: true,
        hasAttachments:
          (draft.attachedCollateralIds && draft.attachedCollateralIds.length > 0) ||
          (draft.attachedFrdIds && draft.attachedFrdIds.length > 0) ||
          false,
        folder: 'sent',
        category: 'RFP Tender',
        attachedCollateralIds: draft.attachedCollateralIds,
        attachedFrdIds: draft.attachedFrdIds,
      };

      setMessages((prev) => [newOutbound, ...prev]);
      setSelectedMessageId(newOutbound.id);

      setToastFeedback({
        id: `toast-send-${Date.now()}`,
        type: 'success',
        title: 'Email Dispatched via Outlook M365',
        message: `Message "${draft.subject}" sent with ${
          (draft.attachedCollateralIds?.length || 0) + (draft.attachedFrdIds?.length || 0)
        } certified attachments.`,
        destination: 'account_workspace',
        actionLabel: 'Dismiss',
      });
    },
    [currentUser]
  );

  // Smart Dual-Destination Task Creation
  const createTaskFromEmail = useCallback(
    (draft: TaskCreationDraft): { success: boolean; taskId: string } => {
      const taskId = `task-email-${Date.now().toString(36)}`;

      if (draft.routingDestination === 'rfp_workdesk') {
        // Route directly into the targeted RFP Work Desk section
        rfpAddTask({
          rfpId: draft.matchedTenderId || selectedTender.id || 'rfp-sbi-01',
          sectionId: draft.targetSection || 'sow',
          title: draft.title,
          description: `${draft.description}\n\n[Email Source: "${draft.sourceSubject}" from ${draft.sourceSender}]`,
          priority: draft.priority,
          status: 'Pending',
          assignee: draft.assigneeName || 'Vikram Malhotra (Solution Engineer)',
          createdBy: currentUser.name,
          createdRole: currentUser.role,
          dueDate: draft.dueDate,
        });

        // Mark message with task linkage
        setMessages((prev) =>
          prev.map((m) =>
            m.id === draft.emailId
              ? {
                  ...m,
                  createdTaskId: taskId,
                  createdTaskDestination: 'rfp_workdesk',
                }
              : m
          )
        );

        setToastFeedback({
          id: `toast-task-${Date.now()}`,
          type: 'success',
          title: 'Task Created in RFP Work Desk',
          message: `Task "${draft.title}" added to RFP section (${draft.targetSection.toUpperCase()}).`,
          destination: 'rfp_workdesk',
          targetSectionId: draft.targetSection,
          actionLabel: `Jump to RFP Work Desk (${draft.targetSection}) →`,
        });

        return { success: true, taskId };
      } else {
        // Route into Account CRM Workspace
        const cleanPriority = draft.priority === 'Urgent' ? 'High' : draft.priority;
        const dueTct = draft.dueDate.includes('T') ? draft.dueDate : `${draft.dueDate}T18:00:00Z`;

        crmAddTask({
          accountId: draft.matchedAccountId || 'acc-3',
          name: draft.title,
          description: `${draft.description}\n\n[Email Source: "${draft.sourceSubject}" from ${draft.sourceSender}]`,
          priority: cleanPriority,
          creatorId: currentUser.id,
          assigneeId: currentUser.id,
          tct: dueTct,
          isActivity: false,
          relatedSection: (draft.targetSection as TaskSection) || 'General',
          comments: [],
          documents: [],
        });

        // Mark message with task linkage
        setMessages((prev) =>
          prev.map((m) =>
            m.id === draft.emailId
              ? {
                  ...m,
                  createdTaskId: taskId,
                  createdTaskDestination: 'account_workspace',
                }
              : m
          )
        );

        setToastFeedback({
          id: `toast-task-${Date.now()}`,
          type: 'success',
          title: 'Task Created in Account Workspace',
          message: `Task "${draft.title}" logged in ${draft.matchedAccountName || 'Account'} workspace.`,
          destination: 'account_workspace',
          targetAccountId: draft.matchedAccountId,
          actionLabel: `View in ${draft.matchedAccountName || 'Account'} Workspace →`,
        });

        return { success: true, taskId };
      }
    },
    [currentUser, selectedTender, rfpAddTask, crmAddTask]
  );

  const convertEmailToPbq = useCallback(
    (email: EmailMessage, queryText: string, specificClause?: string) => {
      const pbqId = `pbq-email-${Date.now().toString(36)}`;
      addPreBidQuery(
        {
          rfpId: email.matchedTenderId || selectedTender.id || 'rfp-sbi-01',
          clauseNumber: specificClause || email.detectedClauseRef || 'Section 3.2',
          tenderPage: 48,
          verbatimRfpText: email.bodyPreview,
          queryText: queryText || email.bodyPreview,
          rationale: 'Clarification on technical acceptance criteria & delivery readiness.',
          category: 'Technical',
          isLatePostCutoff: false,
          clientResponseStatus: 'Pending Client Response',
          internalStatus: 'Pending Pre-Sales Approval',
          draftedBy: currentUser.name,
          draftedByRole: currentUser.role,
        },
        currentUser.name,
        currentUser.role
      );

      setMessages((prev) =>
        prev.map((m) => (m.id === email.id ? { ...m, createdPbqId: pbqId } : m))
      );

      setToastFeedback({
        id: `toast-pbq-${Date.now()}`,
        type: 'success',
        title: 'Clarification Converted to Pre-Bid Query (PBQ)',
        message: `Inquiry logged in Tender Pre-Bid Queries queue (${email.matchedTenderNumber || 'Active Tender'}).`,
        destination: 'rfp_workdesk',
        targetSectionId: 'pbq',
        actionLabel: 'Jump to PBQ Desk →',
      });
    },
    [currentUser, selectedTender, addPreBidQuery]
  );

  const value = useMemo(
    () => ({
      messages,
      selectedMessageId,
      setSelectedMessageId,
      selectedMessage,
      activeFolder,
      setActiveFolder,
      selectedCategory,
      setSelectedCategory,
      searchQuery,
      setSearchQuery,
      outlookStatus,
      setOutlookStatus,
      toastFeedback,
      setToastFeedback,
      markAsRead,
      triggerDeltaSync,
      sendMessage,
      createTaskFromEmail,
      convertEmailToPbq,
    }),
    [
      messages,
      selectedMessageId,
      selectedMessage,
      activeFolder,
      selectedCategory,
      searchQuery,
      outlookStatus,
      toastFeedback,
      markAsRead,
      triggerDeltaSync,
      sendMessage,
      createTaskFromEmail,
      convertEmailToPbq,
    ]
  );

  return <MailboxContext.Provider value={value}>{children}</MailboxContext.Provider>;
};

export const useMailbox = (): MailboxContextType => {
  const context = useContext(MailboxContext);
  if (!context) {
    throw new Error('useMailbox must be used within a MailboxProvider');
  }
  return context;
};
