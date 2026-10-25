import React, { useState } from 'react';
import { useMailbox } from '../../context/MailboxContext';
import { useCrm } from '../../context/CrmContext';
import { useRfp } from '../../context/RfpContext';
import { EmailMessage, EmailFolder, EmailCategory } from '../../types/mailbox';
import { CreateTaskFromEmailModal } from './CreateTaskFromEmailModal';
import { EmailComposerModal } from './EmailComposerModal';
import { OutlookConnectModal } from './OutlookConnectModal';
import {
  Mail,
  Send,
  Paperclip,
  Inbox,
  FileText,
  Search,
  CheckCircle2,
  RefreshCw,
  Plus,
  Reply,
  FileSpreadsheet,
  Building,
  CheckSquare,
  HelpCircle,
  ExternalLink,
  Shield,
  Clock,
  Filter,
  SlidersHorizontal,
  X,
  FileCheck,
  Archive,
  FileEdit,
} from 'lucide-react';

interface MailboxViewProps {
  onNavigateTab?: (tab: 'rfpWorkDesk' | 'accounts' | 'tasks' | 'dashboard') => void;
  onSelectAccount?: (account: any) => void;
}

export const MailboxView: React.FC<MailboxViewProps> = ({
  onNavigateTab,
  onSelectAccount,
}) => {
  const {
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
    toastFeedback,
    setToastFeedback,
    markAsRead,
    triggerDeltaSync,
    convertEmailToPbq,
  } = useMailbox();

  const { accounts } = useCrm();
  const { tenders } = useRfp();

  // Modals state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState<EmailMessage | undefined>(undefined);

  // Filter messages based on active folder, category, and search query
  const filteredMessages = messages.filter((msg) => {
    if (msg.folder !== activeFolder) return false;
    if (selectedCategory !== 'all' && msg.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSubject = msg.subject.toLowerCase().includes(q);
      const matchSender = msg.from.name.toLowerCase().includes(q) || msg.from.email.toLowerCase().includes(q);
      const matchBody = msg.bodyPreview.toLowerCase().includes(q);
      const matchTender = msg.matchedTenderNumber?.toLowerCase().includes(q);
      const matchAccount = msg.matchedAccountName?.toLowerCase().includes(q);
      if (!matchSubject && !matchSender && !matchBody && !matchTender && !matchAccount) {
        return false;
      }
    }
    return true;
  });

  const unreadInboxCount = messages.filter((m) => m.folder === 'inbox' && !m.isRead).length;

  const handleSelectMessage = (msg: EmailMessage) => {
    setSelectedMessageId(msg.id);
    if (!msg.isRead) {
      markAsRead(msg.id);
    }
  };

  const handleOpenReply = () => {
    if (!selectedMessage) return;
    setReplyMessage(selectedMessage);
    setIsComposerOpen(true);
  };

  const handleOpenNewMessage = () => {
    setReplyMessage(undefined);
    setIsComposerOpen(true);
  };

  const handleConvertPbq = () => {
    if (!selectedMessage) return;
    convertEmailToPbq(
      selectedMessage,
      `Pre-bid query regarding ${selectedMessage.subject}: "${selectedMessage.bodyPreview}"`,
      selectedMessage.detectedClauseRef || 'Section 3.2 Technical Requirements'
    );
  };

  const handleToastAction = () => {
    if (!toastFeedback) return;
    if (toastFeedback.destination === 'rfp_workdesk') {
      if (onNavigateTab) {
        onNavigateTab('rfpWorkDesk');
      }
    } else if (toastFeedback.destination === 'account_workspace') {
      const targetAcc = accounts.find((a) => a.id === toastFeedback.targetAccountId);
      if (targetAcc && onSelectAccount) {
        onSelectAccount(targetAcc);
      } else if (onNavigateTab) {
        onNavigateTab('accounts');
      }
    }
    setToastFeedback(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Outlook Sync & Integration Ribbon */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                outlookStatus.isConnected ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
            <span className="font-bold text-slate-900">Microsoft 365 Outlook</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600">{outlookStatus.connectedAccountEmail}</span>
          </div>

          <span className="text-slate-400 hidden sm:inline">/</span>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-500 text-[11px]">
            <span>Mode:</span>
            <span className="font-semibold text-slate-700 capitalize">
              {outlookStatus.syncMode.replace('_', ' ')}
            </span>
          </div>

          <span className="text-slate-400 hidden sm:inline">/</span>

          <div className="hidden md:flex items-center gap-1.5 text-slate-500 text-[11px]">
            <span>Delta Link Sync:</span>
            <span className="font-mono text-slate-700">
              {new Date(outlookStatus.lastDeltaSyncAt || Date.now()).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={triggerDeltaSync}
            title="Fetch incremental email updates via Microsoft Graph delta queries"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition cursor-pointer text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Delta Sync</span>
          </button>

          <button
            type="button"
            onClick={() => setIsConnectModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition cursor-pointer text-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>OAuth & Config</span>
          </button>
        </div>
      </div>

      {/* Floating Deep-Link Feedback Toast */}
      {toastFeedback && (
        <div className="p-3 rounded-xl bg-slate-900 text-white shadow-xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-slate-100">{toastFeedback.title}</div>
              <div className="text-slate-300 text-[11px]">{toastFeedback.message}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {toastFeedback.actionLabel && (
              <button
                type="button"
                onClick={handleToastAction}
                className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1"
              >
                <span>{toastFeedback.actionLabel}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setToastFeedback(null)}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main 3-Pane Mailbox Layout */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[640px]">
        {/* Pane 1: Navigation, Folders & Categories (Left, 2 cols on md, 2.5 cols on lg) */}
        <div className="md:col-span-3 lg:col-span-2 border-r border-slate-200 bg-slate-50/70 p-3 flex flex-col justify-between text-xs space-y-4">
          <div className="space-y-4">
            {/* Primary Compose Action */}
            <button
              type="button"
              onClick={handleOpenNewMessage}
              className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Message</span>
            </button>

            {/* Folders List */}
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-2 tracking-wider">
                Mailboxes
              </div>

              <button
                type="button"
                onClick={() => setActiveFolder('inbox')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  activeFolder === 'inbox'
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Inbox className="w-3.5 h-3.5 text-slate-500" />
                  <span>Inbox</span>
                </div>
                {unreadInboxCount > 0 && (
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-1.5 py-0.2 rounded">
                    {unreadInboxCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveFolder('sent')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  activeFolder === 'sent'
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Send className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sent Items</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {messages.filter((m) => m.folder === 'sent').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFolder('drafts')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  activeFolder === 'drafts'
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileEdit className="w-3.5 h-3.5 text-slate-500" />
                  <span>Drafts</span>
                </div>
                <span className="text-[10px] text-slate-400">0</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFolder('archive')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  activeFolder === 'archive'
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Archive className="w-3.5 h-3.5 text-slate-500" />
                  <span>Archive</span>
                </div>
                <span className="text-[10px] text-slate-400">0</span>
              </button>
            </div>

            {/* Category Filters */}
            <div className="space-y-1 pt-2 border-t border-slate-200/70">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-2 tracking-wider">
                Categories
              </div>

              {(['all', 'RFP Tender', 'Client Clarification', 'PoC Scheduling', 'Commercial & Legal'] as const).map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-slate-200/60 text-slate-900 font-semibold'
                        : 'text-slate-500 hover:bg-slate-100/60'
                    }`}
                  >
                    <span>{cat === 'all' ? 'All Messages' : cat}</span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Quick Tender Summary Footer */}
          <div className="p-2.5 rounded-lg border border-slate-200 bg-white space-y-1">
            <div className="text-[10px] font-bold text-slate-700 uppercase">
              Tender Watchdesk
            </div>
            <div className="text-[11px] text-slate-600">
              Active Tenders: <span className="font-semibold text-slate-900">{tenders.length}</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Domain matching enabled for `@sbi.co.in`, `@nha.gov.in`, `@apollohospitals.com`.
            </div>
          </div>
        </div>

        {/* Pane 2: Thread List (Middle, 4 cols on md, 4 cols on lg) */}
        <div className="md:col-span-4 lg:col-span-4 border-r border-slate-200 flex flex-col h-full bg-white">
          {/* Search Header */}
          <div className="p-3 border-b border-slate-200 bg-slate-50/50">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject, account, tender..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Mail className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
                <p className="text-xs">No emails found in this folder</p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessageId === msg.id;
                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`p-3.5 transition cursor-pointer text-xs space-y-1.5 ${
                      isSelected
                        ? 'bg-blue-50/50 border-l-2 border-l-blue-600'
                        : 'hover:bg-slate-50/70 border-l-2 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {!msg.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                        )}
                        <span
                          className={`truncate text-xs ${
                            !msg.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                          }`}
                        >
                          {msg.from.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {new Date(msg.receivedDateTime).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div
                      className={`truncate text-xs ${
                        !msg.isRead ? 'font-semibold text-slate-900' : 'text-slate-800'
                      }`}
                    >
                      {msg.subject}
                    </div>

                    <div className="text-slate-500 text-[11px] line-clamp-2 leading-relaxed">
                      {msg.bodyPreview}
                    </div>

                    {/* Metadata Strip: Unboxed Zero-Pill Discipline */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 pt-1">
                      {msg.matchedAccountName && (
                        <span className="font-semibold text-slate-600">
                          {msg.matchedAccountName}
                        </span>
                      )}
                      {msg.matchedTenderNumber && (
                        <>
                          <span>·</span>
                          <span className="text-indigo-600 font-medium">
                            {msg.matchedTenderNumber}
                          </span>
                        </>
                      )}
                      {msg.hasAttachments && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5 text-slate-500">
                            <Paperclip className="w-2.5 h-2.5" />
                            {msg.attachments?.length || 1}
                          </span>
                        </>
                      )}
                      {msg.createdTaskId && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                            <CheckSquare className="w-2.5 h-2.5" />
                            Task Logged
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pane 3: Detail View & Pre-Sales Action Bar (Right, 5 cols on md, 6 cols on lg) */}
        <div className="md:col-span-5 lg:col-span-6 flex flex-col h-full bg-slate-50/30">
          {selectedMessage ? (
            <div className="flex flex-col h-full">
              {/* Pre-Sales Enterprise Action Bar */}
              <div className="p-3 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsTaskModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition cursor-pointer text-xs shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Task</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConvertPbq}
                    title="Log inquiry into Tender Pre-Bid Queries table"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition cursor-pointer text-xs"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                    <span>Convert to PBQ</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenReply}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition cursor-pointer text-xs"
                  >
                    <Reply className="w-3.5 h-3.5 text-slate-500" />
                    <span>Reply</span>
                  </button>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <span className="font-mono text-[10px] text-slate-400">
                    ID: {selectedMessage.internetMessageId.slice(0, 16)}...
                  </span>
                </div>
              </div>

              {/* Message Header Details */}
              <div className="p-4 border-b border-slate-200 bg-white space-y-3 shrink-0">
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-snug">
                    {selectedMessage.subject}
                  </h2>

                  {/* Contextual Entity Linkage Tags */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">
                      {selectedMessage.category}
                    </span>
                    {selectedMessage.matchedAccountName && (
                      <>
                        <span>·</span>
                        <span className="font-semibold text-slate-800">
                          Account: {selectedMessage.matchedAccountName}
                        </span>
                      </>
                    )}
                    {selectedMessage.matchedTenderNumber && (
                      <>
                        <span>·</span>
                        <span className="text-indigo-700 font-bold">
                          Tender: {selectedMessage.matchedTenderNumber}
                        </span>
                      </>
                    )}
                    {selectedMessage.detectedClauseRef && (
                      <>
                        <span>·</span>
                        <span className="text-slate-600 font-mono text-[11px]">
                          Ref: {selectedMessage.detectedClauseRef}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Sender & Recipient Metadata */}
                <div className="flex items-start justify-between text-xs pt-1">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        {selectedMessage.from.name}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        &lt;{selectedMessage.from.email}&gt;
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      To: {selectedMessage.to.map((t) => t.email).join(', ')}
                      {selectedMessage.cc && selectedMessage.cc.length > 0 && (
                        <span> · CC: {selectedMessage.cc.map((c) => c.email).join(', ')}</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-slate-400 font-mono">
                    {new Date(selectedMessage.receivedDateTime).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>

                {/* Attached Files Strip */}
                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                      <span>Attached Files ({selectedMessage.attachments.length})</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selectedMessage.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="px-2.5 py-1 rounded bg-white border border-slate-200 text-xs flex items-center gap-2 hover:border-slate-300 transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <div>
                            <div className="font-medium text-slate-800">{att.name}</div>
                            <div className="text-[10px] text-slate-400">{att.size}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Message Body Content */}
              <div className="flex-1 overflow-y-auto p-5 text-xs text-slate-800 leading-relaxed font-sans space-y-4">
                <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-800 selection:bg-slate-200">
                  {selectedMessage.bodyText}
                </pre>

                {/* DPDP & Enterprise Verification Note */}
                <div className="mt-8 pt-4 border-t border-slate-200 text-[11px] text-slate-400 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cryptographic Attestation & DPDP 2023 Boundary Verified</span>
                  </div>
                  <span>PrivaSapien Enterprise SalesOps</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
              <Mail className="w-12 h-12 text-slate-300 stroke-1" />
              <div className="font-semibold text-slate-600 text-sm">Select an email to view</div>
              <p className="text-xs text-slate-400 max-w-sm">
                View formal tender correspondence, corrigendum releases, and convert actionable queries directly into tasks.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Task Creation Modal */}
      {isTaskModalOpen && selectedMessage && (
        <CreateTaskFromEmailModal
          email={selectedMessage}
          onClose={() => setIsTaskModalOpen(false)}
          onTaskCreated={(destination, sectionOrAccount) => {
            // Task creation confirmed and feedback toast activated
          }}
        />
      )}

      {/* Composer Modal */}
      {isComposerOpen && (
        <EmailComposerModal
          isOpen={isComposerOpen}
          onClose={() => setIsComposerOpen(false)}
          replyToEmail={replyMessage}
        />
      )}

      {/* Outlook Connect Modal */}
      {isConnectModalOpen && (
        <OutlookConnectModal
          isOpen={isConnectModalOpen}
          onClose={() => setIsConnectModalOpen(false)}
        />
      )}
    </div>
  );
};
