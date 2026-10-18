import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import {
  parseSalesOpsInstruction,
  PlannedUpdateItem,
  SalesOpsPlanResult,
} from '../../utils/salesOpsAgent';
import { Account, Contact, Task } from '../../types/crm';

interface SalesOpsAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export const SalesOpsAgentModal: React.FC<SalesOpsAgentModalProps> = ({
  isOpen,
  onClose,
  initialPrompt = '',
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

  if (!isOpen) return null;

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
      // Ensure blocked items are never automatically confirmed
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
      if (initialPrompt && initialPrompt.trim()) {
        setPrompt(initialPrompt);
        executePlan(initialPrompt);
      } else {
        setPrompt('');
        setPlanResult(null);
        setItems([]);
        setExecutionSuccess(null);
      }
    }
  }, [isOpen, initialPrompt]);

  const handleGeneratePlan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await executePlan(prompt);
  };

  const handleToggleConfirm = (id: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          if (it.isBlocked || it.type === 'admin_restricted') {
            return it; // Blocked items cannot be toggled
          }
          return { ...it, confirmed: !it.confirmed };
        }
        return it;
      })
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleStartEdit = (item: PlannedUpdateItem) => {
    if (item.isBlocked || item.type === 'admin_restricted') return;
    setEditingItemId(item.id);
    setEditTitle(item.title);
    setEditDescription(item.description);
  };

  const handleSaveEdit = (id: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              title: editTitle.trim() || it.title,
              description: editDescription.trim() || it.description,
            }
          : it
      )
    );
    setEditingItemId(null);
  };

  const handleAddCustomItem = () => {
    if (!newItemTitle.trim()) return;

    // Check if user is attempting an admin operation
    const combinedText = `${newItemTitle} ${newItemDescription} ${newItemTarget}`.toLowerCase();
    const isAdminAttempt =
      /admin|user role|create user|delete user|team|workflow|sla|exchange rate|custom field|field config|bulk import/i.test(
        combinedText
      );

    if (isAdminAttempt) {
      setAddItemError(
        'SalesOps Copilot cannot make changes to the Admin section. Administrative settings must be configured directly in the Admin tab.'
      );
      return;
    }

    setAddItemError(null);
    const matched = accounts.find(
      (a) => a.name.toLowerCase() === newItemTarget.toLowerCase()
    );
    const newItem: PlannedUpdateItem = {
      id: `custom-item-${Date.now()}`,
      type: 'update_account',
      title: newItemTitle.trim(),
      description: newItemDescription.trim() || `Manual update instructed for ${newItemTarget}`,
      targetEntityName: newItemTarget,
      details: {
        accountId: matched ? matched.id : accounts[0]?.id || 'acc-1',
        accountName: newItemTarget,
        field: 'notes',
        newValue: newItemDescription.trim(),
      },
      confirmed: true,
      isBlocked: false,
    };
    setItems((prev) => [...prev, newItem]);
    setIsAddingItem(false);
    setNewItemTitle('');
    setNewItemDescription('');
  };

  const handleExecuteConfirmedItems = () => {
    // Strict security filter: Never execute blocked or admin restricted items
    const executableItems = items.filter(
      (it) => it.confirmed && !it.isBlocked && it.type !== 'admin_restricted'
    );
    if (executableItems.length === 0) return;

    setIsExecuting(true);
    let executedCount = 0;

    const actor = 'SalesOps Copilot';
    const actingOnBehalfOf = actingOnBehalfLabel;

    executableItems.forEach((it) => {
      try {
        if (it.type === 'update_account' && it.details.accountId) {
          const acc = accounts.find((a) => a.id === it.details.accountId);
          if (acc) {
            const field = it.details.field || 'notes';
            const updatedAcc: Account = {
              ...acc,
              [field]: it.details.newValue,
            };
            updateAccount(
              updatedAcc,
              field,
              String(it.details.oldValue ?? (acc as any)[field] ?? ''),
              String(it.details.newValue),
              undefined,
              {
                actor,
                actingOnBehalfOf,
                provenance: 'Human-confirmed',
              }
            );
            executedCount++;
          }
        } else if (it.type === 'add_task') {
          const taskData = it.details.taskData;
          const targetAccId = taskData?.accountId || accounts[0]?.id || 'acc-1';
          addTask({
            accountId: targetAccId,
            description: taskData?.description || it.description,
            creatorId: currentUser.id,
            assigneeId: currentUser.id,
            tct: taskData?.tct || new Date().toISOString().split('T')[0],
            priority: taskData?.priority || 'Medium',
            relatedSection: (taskData?.relatedSection as any) || 'General',
            comments: [
              {
                id: `cmt-${Date.now()}`,
                author: `SalesOps Copilot (On behalf of ${actingOnBehalfOf})`,
                timestamp: new Date().toISOString(),
                text: `Task generated by SalesOps Copilot on behalf of ${actingOnBehalfOf} from confirmed instruction: "${prompt}"`,
              },
            ],
            isActivity: true,
          });

          // Log corresponding audit trail entry on target account
          const targetAcc = accounts.find((a) => a.id === targetAccId);
          if (targetAcc) {
            updateAccount(
              targetAcc,
              'Task Added (SalesOps Copilot)',
              'None',
              taskData?.description || it.description,
              undefined,
              {
                actor,
                actingOnBehalfOf,
                provenance: 'Human-confirmed',
              }
            );
          }
          executedCount++;
        } else if (it.type === 'add_contact') {
          const cData = it.details.contactData;
          const targetAccId = cData?.accountId || accounts[0]?.id || 'acc-1';
          addContact({
            accountId: targetAccId,
            firstName: cData?.firstName || 'New',
            lastName: cData?.lastName || 'Contact',
            designation: cData?.designation || 'Stakeholder',
            email: cData?.email || 'contact@enterprise.com',
            phone1: '+91 98765 43210',
            tags: (cData?.tags as any) || ['Champion'],
            source: 'In-person Meeting',
            consentState: 'Deemed Consent',
            isMasked: true,
          });

          // Log corresponding audit trail entry on target account
          const targetAcc = accounts.find((a) => a.id === targetAccId);
          if (targetAcc) {
            updateAccount(
              targetAcc,
              'Contact Added (SalesOps Copilot)',
              'None',
              `${cData?.firstName || 'New'} ${cData?.lastName || 'Contact'} (${cData?.designation || 'Stakeholder'})`,
              undefined,
              {
                actor,
                actingOnBehalfOf,
                provenance: 'Human-confirmed',
              }
            );
          }
          executedCount++;
        } else if (it.type === 'add_account') {
          const aData = it.details.accountData;
          addAccount(
            {
              name: aData?.name || it.targetEntityName,
              website: 'https://enterprise.example.com',
              logoText: (aData?.name || it.targetEntityName).substring(0, 2).toUpperCase(),
              logoBg: '#1e293b',
              stage: (aData?.stage as any) || 'New Account',
              annualRevenue: aData?.dealValue || 1500000,
              revenueCurrency: 'INR',
              winningStance: 'Initial Stages',
              adoptionCategory: 'Early Adopter',
              owners: {
                sales: currentUser.name,
                preSales: 'Unassigned',
                solutionEngineer: 'Unassigned',
                leader: 'Leadership Team',
              },
              petsFlag: true,
              responsibleAiFlag: true,
              sector: (aData?.sector as any) || 'Banking & Financial Services',
              geography: 'India (North)',
              publicPrivate: 'Private',
              procurementType: 'Direct Opportunity',
              productFamily: 'Responsible AI & Governance',
              product: 'PrivaSapien AI Safety Engine',
              headOfficeAddress: 'Corporate Office',
              partners: [],
            },
            {
              actor,
              actingOnBehalfOf,
              provenance: 'Human-confirmed',
            }
          );
          executedCount++;
        }
      } catch (err) {
        console.error('Failed executing item:', it, err);
      }
    });

    setIsExecuting(false);
    setExecutionSuccess(
      `Successfully executed ${executedCount} confirmed update item${
        executedCount === 1 ? '' : 's'
      }. Changes captured in Audit Trail: Actor: "${actor}" on behalf of "${actingOnBehalfOf}".`
    );
  };

  const samplePrompts = [
    'Move Tata Consultancy Services to Mature stage and increase deal value to 45 Lakhs INR',
    'Add an urgent follow-up task for Infosys to deliver the Differential Privacy technical proposal by next Friday',
    "Mark Bharti Airtel's winning stance as Customer Prefers Us and schedule an architecture review task",
    'Add new CISO contact for Reliance Jio with Champion stakeholder tag',
  ];

  const confirmedExecutableCount = items.filter(
    (it) => it.confirmed && !it.isBlocked && it.type !== 'admin_restricted'
  ).length;

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
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight text-white">
                  SalesOps AI Copilot
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Role: SalesOps
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Human-in-Control
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Instruct CRM pipeline updates in natural language. Review, customize, and confirm atomic changes with audit trails.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
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
              <strong>Security Policy:</strong> SalesOps Copilot is scoped strictly to Operational CRM entities (Accounts, Stages, Deal Values, Stances, Tasks, Contacts). The Copilot <strong>cannot make changes to the Admin section</strong> (Users, Roles, Teams, Workflows, Schemas, Exchange Rates, or System Settings).
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
                placeholder="e.g. Move Tata Consultancy Services to Mature stage, set deal value to 45 Lakhs INR, and create a high priority task to send DP PoC proposal..."
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
                      className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-900 text-slate-600 border border-slate-200 transition"
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
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-900 text-sm">Updates Successfully Committed!</p>
                <p className="mt-0.5 text-emerald-700">{executionSuccess}</p>
                <p className="mt-1 text-[11px] text-emerald-800 font-medium">
                  Provenance: <strong>Human-confirmed</strong> • Actor: <strong>SalesOps Copilot</strong> (On behalf of <strong>{actingOnBehalfLabel}</strong>)
                </p>
              </div>
            </div>
          )}

          {/* Proposed Items Confirmation Panel */}
          {items.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Proposed Update Items</span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-bold">
                      {items.length} Identified
                    </span>
                    {items.some((it) => it.isBlocked) && (
                      <span className="px-2 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-amber-600" />
                        Admin Restricted Items Blocked
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Toggle items to confirm. You can add, edit, or remove items before executing.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingItem(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                  <span>Add Item</span>
                </button>
              </div>

              {/* Add Custom Item Inline Form */}
              {isAddingItem && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Add Custom Operational Item</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingItem(false);
                        setAddItemError(null);
                      }}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {addItemError && (
                    <div className="p-2 rounded bg-rose-50 border border-rose-200 text-[11px] text-rose-800 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{addItemError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Title (e.g. Update deal value, Add contact)"
                      value={newItemTitle}
                      onChange={(e) => setNewItemTitle(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-800"
                    />
                    <select
                      value={newItemTarget}
                      onChange={(e) => setNewItemTarget(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-800"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.name}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Description / Note details (Admin configuration updates are restricted)"
                    value={newItemDescription}
                    onChange={(e) => setNewItemDescription(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-800"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingItem(false);
                        setAddItemError(null);
                      }}
                      className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCustomItem}
                      className="px-3 py-1 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800"
                    >
                      Add to Plan
                    </button>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2">
                {items.map((item) => {
                  const isEditing = editingItemId === item.id;
                  const isBlocked = item.isBlocked || item.type === 'admin_restricted';

                  if (isBlocked) {
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/60 transition space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <div className="p-1 rounded bg-rose-100 text-rose-700 mt-0.5">
                              <Lock className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-rose-950">
                                  {item.title}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                  Admin Action Blocked
                                </span>
                              </div>
                              <p className="text-xs text-rose-900 mt-0.5">
                                {item.description}
                              </p>
                              <div className="mt-1.5 p-2 rounded bg-white/80 border border-rose-200 text-[11px] text-rose-800 flex items-center gap-1.5">
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span>
                                  {item.blockedReason ||
                                    'SalesOps Copilot cannot make changes to the Admin section. Only Administrators can modify administrative settings in the Admin tab.'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-100 transition"
                            title="Dismiss blocked item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition ${
                        item.confirmed
                          ? 'bg-white border-slate-200 shadow-2xs ring-1 ring-slate-900/5'
                          : 'bg-slate-50/70 border-slate-200 opacity-60'
                      }`}
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-2.5 py-1 text-xs font-semibold border border-slate-300 rounded bg-white text-slate-900"
                          />
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            rows={2}
                            className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white text-slate-700"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingItemId(null)}
                              className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(item.id)}
                              className="px-3 py-1 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800"
                            >
                              Save Edit
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            {/* Confirmation Checkbox */}
                            <input
                              type="checkbox"
                              id={`item-confirm-${item.id}`}
                              checked={item.confirmed}
                              onChange={() => handleToggleConfirm(item.id)}
                              className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                            />

                            <div>
                              <div className="flex items-center gap-2">
                                <label
                                  htmlFor={`item-confirm-${item.id}`}
                                  className="text-xs font-bold text-slate-900 cursor-pointer"
                                >
                                  {item.title}
                                </label>
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                  {item.targetEntityName}
                                </span>
                                {item.confirmed ? (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Confirmed
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-400">
                                    Skipped
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5">
                                {item.description}
                              </p>
                            </div>
                          </div>

                          {/* Item Actions (Edit / Delete) */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(item)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition"
                              title="Edit item"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Follow-up Note */}
              {planResult?.suggestedFollowUp && (
                <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>
                    <strong>SalesOps Advisory:</strong> {planResult.suggestedFollowUp}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            <strong>{confirmedExecutableCount}</strong> executable item(s) confirmed to be executed by{' '}
            <span className="font-semibold text-slate-800">SalesOps Copilot</span> on behalf of{' '}
            <span className="font-semibold text-indigo-700">{actingOnBehalfLabel}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
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
        </div>
      </div>
    </div>
  );
};
