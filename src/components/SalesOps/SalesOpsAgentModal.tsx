import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  X,
  UserCheck,
  ShieldAlert,
  Shield,
  Lock,
  Info,
  HelpCircle,
  Search,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Zap,
  User,
  FileText,
  Check,
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import {
  parseSalesOpsInstruction,
  PlannedUpdateItem,
  SalesOpsPlanResult,
} from '../../utils/salesOpsAgent';
import { Account, Contact, Task, ContactTag, TaskSection } from '../../types/crm';
import {
  HELP_KNOWLEDGE_BASE,
  SAMPLE_HELP_QUERIES,
  searchHelpKnowledgeBase,
  HelpArticle,
  HelpActionShortcut,
} from '../../data/helpKnowledgeBase';
import { ProfileWizardModal } from '../Profile/ProfileWizardModal';
import { RfpWorkflowModal } from '../Tasks/RfpWorkflowModal';

interface SalesOpsAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  initialMode?: 'actions' | 'help';
  onNavigateTab?: (tabId: string) => void;
}

export const SalesOpsAgentModal: React.FC<SalesOpsAgentModalProps> = ({
  isOpen,
  onClose,
  initialPrompt = '',
  initialMode = 'actions',
  onNavigateTab,
}) => {
  const {
    accounts,
    contacts,
    tasks,
    currentUser,
    onBehalfOfUser,
    updateAccount,
    addContact,
    addTask,
    addAccount,
  } = useCrm();

  // Mode state: 'actions' or 'help'
  const [activeMode, setActiveMode] = useState<'actions' | 'help'>(initialMode);

  // Actions Mode state
  const [prompt, setPrompt] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);
  const [planResult, setPlanResult] = useState<SalesOpsPlanResult | null>(null);
  const [items, setItems] = useState<PlannedUpdateItem[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionSuccess, setExecutionSuccess] = useState<string | null>(null);

  // New item draft modal state
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemTarget, setNewItemTarget] = useState(accounts[0]?.name || '');
  const [addItemError, setAddItemError] = useState<string | null>(null);

  // Help & Guide Mode state
  const [helpQuery, setHelpQuery] = useState('');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>('kb-profile-setup');
  const [isProfileWizardOpen, setIsProfileWizardOpen] = useState(false);
  const [rfpAccountToOpen, setRfpAccountToOpen] = useState<Account | null>(null);

  // Filtered Help Articles (unconditional useMemo hooks)
  const helpArticles = useMemo(() => {
    return searchHelpKnowledgeBase(helpQuery);
  }, [helpQuery]);

  const activeHelpArticle = useMemo(() => {
    return HELP_KNOWLEDGE_BASE.find((a) => a.id === selectedArticleId) || helpArticles[0];
  }, [selectedArticleId, helpArticles]);

  // Sample prompt inspiration
  const samplePrompts = [
    'Move Tata Consultancy Services to Mature stage and set deal value to 45 Lakhs INR',
    'Add a high priority task to schedule differential privacy demo with Apollo Health Networks',
    'Update State Bank of India winning stance to Under PO Negotiations',
    'Add Dr. Rajesh Verma as Champion contact for Apollo Health Networks',
  ];

  const actingOnBehalfLabel = onBehalfOfUser
    ? `${onBehalfOfUser.name} (${currentUser.name})`
    : currentUser.name;

  const executePlan = async (instructionText: string) => {
    if (!instructionText.trim()) return;

    setIsPlanning(true);
    setExecutionSuccess(null);
    try {
      const result = await parseSalesOpsInstruction(instructionText.trim(), {
        accounts: accounts.map((a) => ({
          id: a.id,
          name: a.name,
          stage: a.stage,
          annualRevenue: a.dealValueOverride || a.annualRevenue,
          owners: a.owners,
        })),
        contacts: contacts.map((c) => ({
          id: c.id,
          accountId: c.accountId,
          firstName: c.firstName,
          lastName: c.lastName,
          designation: c.designation,
        })),
        tasks: tasks.map((t) => ({
          id: t.id,
          accountId: t.accountId,
          description: t.description,
          status: t.status,
        })),
        currentUser,
        onBehalfOfUser,
      });

      setPlanResult(result);
      setItems(
        result.items.map((it) =>
          it.isBlocked || it.type === 'admin_restricted'
            ? { ...it, confirmed: false }
            : it
        )
      );
    } catch (err) {
      console.error('Plan generation failed:', err);
    } finally {
      setIsPlanning(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (initialMode) {
        setActiveMode(initialMode);
      }
      if (initialPrompt && initialPrompt.trim()) {
        if (initialMode === 'help') {
          setHelpQuery(initialPrompt);
        } else {
          setPrompt(initialPrompt);
          executePlan(initialPrompt);
        }
      } else if (!initialMode || initialMode === 'actions') {
        setPrompt('');
        setPlanResult(null);
        setItems([]);
        setExecutionSuccess(null);
      }
    }
  }, [isOpen, initialPrompt, initialMode]);

  const handleGeneratePlan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await executePlan(prompt);
  };

  const handleToggleConfirm = (id: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          if (it.isBlocked || it.type === 'admin_restricted') {
            return it;
          }
          return { ...it, confirmed: !it.confirmed };
        }
        return it;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleStartEdit = (item: PlannedUpdateItem) => {
    setEditingItemId(item.id);
    setEditTitle(item.title);
    setEditDescription(item.description);
  };

  const handleSaveEdit = (id: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, title: editTitle, description: editDescription } : it
      )
    );
    setEditingItemId(null);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
  };

  // Add custom manual operational action item
  const handleAddNewItem = () => {
    setAddItemError(null);
    if (!newItemTitle.trim()) {
      setAddItemError('Action title is required');
      return;
    }

    const matchedAcc = accounts.find((a) => a.name === newItemTarget) || accounts[0];

    const newItem: PlannedUpdateItem = {
      id: `item-${Date.now()}-custom`,
      type: 'add_task',
      title: newItemTitle.trim(),
      description: newItemDescription.trim() || newItemTitle.trim(),
      targetEntityName: matchedAcc ? matchedAcc.name : 'Operational Task',
      details: {
        accountId: matchedAcc?.id,
        accountName: matchedAcc?.name,
        taskData: {
          description: newItemDescription.trim() || newItemTitle.trim(),
          accountId: matchedAcc?.id || 'acc-1',
          priority: 'High',
          tct: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          relatedSection: 'General',
        },
      },
      confirmed: true,
      isBlocked: false,
    };

    setItems((prev) => [newItem, ...prev]);
    setIsAddingItem(false);
    setNewItemTitle('');
    setNewItemDescription('');
  };

  // Execute confirmed changes
  const handleExecuteConfirmedItems = async () => {
    const confirmedItems = items.filter(
      (it) => it.confirmed && !it.isBlocked && it.type !== 'admin_restricted'
    );
    if (confirmedItems.length === 0) return;

    setIsExecuting(true);
    const actor = 'SalesOps Copilot';
    const actingOnBehalf = onBehalfOfUser ? onBehalfOfUser.name : currentUser.name;

    try {
      for (const it of confirmedItems) {
        if (it.type === 'update_account' && it.details?.accountId) {
          const targetAcc = accounts.find((a) => a.id === it.details?.accountId);
          if (targetAcc && it.details.field) {
            const updated = {
              ...targetAcc,
              [it.details.field]: it.details.newValue,
            };
            updateAccount(
              updated,
              `Field: ${it.details.field} (SalesOps Copilot on behalf of ${actingOnBehalf})`,
              String(it.details.oldValue ?? ''),
              String(it.details.newValue ?? ''),
              new Date().toISOString().split('T')[0],
              {
                actor,
                actingOnBehalfOf: actingOnBehalf,
              }
            );
          }
        } else if (it.type === 'add_task' && it.details?.taskData) {
          const tData = it.details.taskData;
          addTask(
            {
              accountId: tData.accountId || accounts[0]?.id || 'acc-1',
              relatedSection: (tData.relatedSection as TaskSection) || 'General',
              description: tData.description,
              creatorId: currentUser.id,
              assigneeId: currentUser.id,
              tct: tData.tct || new Date().toISOString(),
              priority: tData.priority || 'Medium',
              isActivity: false,
              comments: [
                {
                  id: `c-${Date.now()}`,
                  author: `SalesOps Copilot (On behalf of ${actingOnBehalf})`,
                  timestamp: new Date().toISOString(),
                  text: `Task generated by SalesOps Copilot on behalf of ${actingOnBehalf} from instruction: "${prompt}"`,
                },
              ],
              documents: [],
            },
            {
              actor,
              actingOnBehalfOf: actingOnBehalf,
            }
          );
        } else if (it.type === 'add_contact' && it.details?.contactData) {
          const cData = it.details.contactData;
          addContact(
            {
              accountId: cData.accountId || accounts[0]?.id || 'acc-1',
              firstName: cData.firstName,
              lastName: cData.lastName,
              email: cData.email,
              phone1: '+91 98765 00000',
              designation: cData.designation,
              tags: (cData.tags as ContactTag[]) || ['Champion'],
              source: 'In-person Meeting',
              consentState: 'Explicit Opt-in',
              isMasked: false,
            },
            {
              actor,
              actingOnBehalfOf: actingOnBehalf,
            }
          );
        }
      }

      setExecutionSuccess(
        `Successfully executed ${confirmedItems.length} operational update(s) to the CRM with audit attribution.`
      );
      setItems([]);
      setPlanResult(null);
      setPrompt('');
    } catch (err) {
      console.error('Execution error:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  const confirmedExecutableCount = items.filter(
    (it) => it.confirmed && !it.isBlocked && it.type !== 'admin_restricted'
  ).length;

  // Execute shortcut actions from Help Mode
  const handleExecuteShortcut = (shortcut: HelpActionShortcut) => {
    if (shortcut.actionType === 'open_profile_wizard') {
      setIsProfileWizardOpen(true);
    } else if (shortcut.actionType === 'switch_to_copilot_action') {
      setActiveMode('actions');
      if (shortcut.payload?.prompt) {
        setPrompt(shortcut.payload.prompt);
        executePlan(shortcut.payload.prompt);
      }
    } else if (shortcut.actionType === 'open_rfp_desk') {
      const targetAcc = accounts.find((a) => a.id === shortcut.payload?.accountId) || accounts[0];
      if (targetAcc) {
        setRfpAccountToOpen(targetAcc);
      }
    } else if (shortcut.actionType === 'navigate_tab') {
      if (onNavigateTab && shortcut.payload?.tabId) {
        onNavigateTab(shortcut.payload.tabId);
        onClose();
      } else {
        window.dispatchEvent(
          new CustomEvent('crm:navigate_tab', { detail: { tabId: shortcut.payload?.tabId } })
        );
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base tracking-tight text-white">
                  PrivaSapien AI Copilot & Guide
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Role: SalesOps & Help
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  PrivaTRAC Protected
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Execute operational CRM updates with audit trails or query grounded knowledge with one-click actions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual Mode Switcher Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100/80 px-6 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveMode('actions')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'actions'
                ? 'bg-white text-slate-900 border-t border-x border-slate-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>SalesOps Actions Mode</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              CRM Updates
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('help')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'help'
                ? 'bg-white text-slate-900 border-t border-x border-slate-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Help & Knowledge Guide</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Q&A & Shortcuts
            </span>
          </button>
        </div>

        {/* Modal Body: Mode 1 (Actions) vs Mode 2 (Help) */}
        {activeMode === 'actions' ? (
          /* ============================================================== */
          /* MODE 1: SALESOPS ACTIONS MODE                                  */
          /* ============================================================== */
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {/* Persona Delegation Context & Security Policy Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700 truncate">
                  <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="truncate">
                    Operator: <strong>{currentUser.name}</strong>
                    {onBehalfOfUser && (
                      <span className="text-indigo-700 ml-1">
                        (for {onBehalfOfUser.name})
                      </span>
                    )}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                  Audit: On Behalf
                </span>
              </div>

              <div className="px-3 py-2 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900">
                  <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-semibold text-[11px]">
                    Admin Section: Restricted & Protected
                  </span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-200/60 text-amber-800">
                  Read-Only
                </span>
              </div>
            </div>

            {/* Security Boundary Notice */}
            <div className="px-3.5 py-2 rounded-lg bg-blue-50/60 border border-blue-200/60 text-[11px] text-blue-900 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>
                <strong>Security Policy:</strong> SalesOps Copilot is scoped strictly to Operational CRM entities (Accounts, Stages, Deal Values, Stances, Tasks, Contacts). The Copilot <strong>cannot make changes to the Admin section</strong>.
              </span>
            </div>

            {/* User Instruction Input */}
            <form onSubmit={handleGeneratePlan} className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Instruction to SalesOps Agent
              </label>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Move State Bank of India to Critical stage, set deal value to 12.5 Cr INR, and create a high priority task to send FIPS attestation..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400 shadow-2xs resize-none"
                />
                <button
                  type="submit"
                  disabled={isPlanning || !prompt.trim()}
                  className="absolute right-2.5 bottom-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
                >
                  {isPlanning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-300" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Plan Updates</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Inspiration Pills */}
              {!planResult && (
                <div className="pt-0.5">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Quick examples to try:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {samplePrompts.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPrompt(sample)}
                        className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-900 text-slate-600 border border-slate-200 transition cursor-pointer"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>

            {/* Execution Success Banner */}
            {executionSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{executionSuccess}</span>
                </div>
                <button
                  onClick={() => setExecutionSuccess(null)}
                  className="text-emerald-700 hover:text-emerald-900 text-[11px] font-semibold underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Staged Updates Review Table */}
            {items.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      Staged Operational Updates ({items.length})
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      Human Review Gate
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddingItem(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Manual Action</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition ${
                        item.isBlocked || item.type === 'admin_restricted'
                          ? 'bg-rose-50/70 border-rose-200'
                          : item.confirmed
                          ? 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            disabled={item.isBlocked || item.type === 'admin_restricted'}
                            checked={item.confirmed && !item.isBlocked}
                            onChange={() => handleToggleConfirm(item.id)}
                            className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-xs text-slate-900">
                                {item.title}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">
                                Target: {item.targetEntityName}
                              </span>
                              {item.isBlocked && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-200 text-rose-800">
                                  Restricted
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ============================================================== */
          /* MODE 2: HELP & KNOWLEDGE GUIDE MODE                            */
          /* ============================================================== */
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {/* Help Search Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Search Knowledge Base or Ask Help Query
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={helpQuery}
                  onChange={(e) => setHelpQuery(e.target.value)}
                  placeholder="e.g. How do I complete my profile? What is Privacy Epsilon? How to submit RFP?"
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-slate-800 placeholder-slate-400 shadow-2xs"
                />
                {helpQuery && (
                  <button
                    onClick={() => setHelpQuery('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Suggested Queries */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                Suggested questions & topics:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_HELP_QUERIES.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setHelpQuery(q)}
                    className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-900 text-slate-600 border border-slate-200 transition cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Help Articles List & Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Left Column: Article Selector */}
              <div className="md:col-span-1 space-y-1.5 border-r border-slate-100 pr-2 max-h-[380px] overflow-y-auto">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Matched Guides ({helpArticles.length})
                </span>
                {helpArticles.map((art) => (
                  <button
                    key={art.id}
                    type="button"
                    onClick={() => setSelectedArticleId(art.id)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition cursor-pointer flex flex-col gap-1 ${
                      selectedArticleId === art.id
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                        {art.category}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900 leading-snug">{art.title}</div>
                  </button>
                ))}
              </div>

              {/* Right Column: Active Article Reader & One-Click Actionable Shortcuts */}
              <div className="md:col-span-2 space-y-3.5">
                {activeHelpArticle ? (
                  <div className="space-y-3.5">
                    {/* Article Header */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                          {activeHelpArticle.category}
                        </span>
                        <span className="text-[11px] text-slate-400">· Grounded Guidance</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 leading-snug">
                        {activeHelpArticle.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {activeHelpArticle.summary}
                      </p>
                    </div>

                    {/* Article In-Depth Body */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line space-y-2">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Execution Overview & Key Principles</span>
                      </div>
                      {activeHelpArticle.detailedContent}
                    </div>

                    {/* One-Click Actionable Shortcuts */}
                    {activeHelpArticle.shortcuts && activeHelpArticle.shortcuts.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-50/60 to-slate-50 border border-indigo-100 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 uppercase tracking-wider">
                          <Zap className="w-3.5 h-3.5 text-indigo-600" />
                          <span>One-Click Actionable Shortcuts</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {activeHelpArticle.shortcuts.map((sc) => (
                            <button
                              key={sc.id}
                              type="button"
                              onClick={() => handleExecuteShortcut(sc)}
                              className="p-2.5 rounded-xl bg-white border border-indigo-200 hover:border-indigo-400 hover:shadow-xs transition text-left cursor-pointer flex flex-col justify-between group"
                            >
                              <div>
                                <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-900 flex items-center justify-between">
                                  <span>{sc.label}</span>
                                  <ArrowRight className="w-3 h-3 text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                                {sc.description && (
                                  <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                    {sc.description}
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500">
                    No articles matched your search. Try searching for "profile", "rfp", "pets", or "compliance".
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          {activeMode === 'actions' ? (
            <>
              <div className="text-xs text-slate-500">
                <strong>{confirmedExecutableCount}</strong> executable item(s) confirmed to be executed by{' '}
                <span className="font-semibold text-slate-800">SalesOps Copilot</span> on behalf of{' '}
                <span className="font-semibold text-indigo-700">{actingOnBehalfLabel}</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={isExecuting || confirmedExecutableCount === 0}
                  onClick={handleExecuteConfirmedItems}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Applying Changes...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Execute Confirmed Changes ({confirmedExecutableCount})</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Grounded Knowledge Base · PrivaTRAC Certified Guidance</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('actions')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Switch to Action Mode</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Embedded Guided Profile Wizard Modal */}
      <ProfileWizardModal
        isOpen={isProfileWizardOpen}
        onClose={() => setIsProfileWizardOpen(false)}
      />

      {/* Embedded RFP Workflow Modal */}
      {rfpAccountToOpen && (
        <RfpWorkflowModal
          account={rfpAccountToOpen}
          onClose={() => setRfpAccountToOpen(null)}
        />
      )}
    </div>
  );
};
