import React, { useState, useMemo } from 'react';
import {
  Account,
  Sector,
  Geography,
  WinningStance,
  ProcurementType,
  Currency,
} from '../../types/crm';
import { useCrm } from '../../context/CrmContext';
import {
  getStepEnrichmentSuggestions,
  StepEnrichmentResult,
} from '../../services/accountEnrichmentService';
import {
  X,
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  Building2,
  ShieldCheck,
  DollarSign,
  Users,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Info,
} from 'lucide-react';
import { formatCurrencyValue } from '../../utils/calculations';

interface AccountUpdateJourneyModalProps {
  account: Account;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (updatedAccount: Account) => void;
}

const SECTORS: Sector[] = [
  'Banking & Financial Services',
  'Healthcare & Life Sciences',
  'Telecommunications',
  'E-commerce & Retail',
  'Government & Public Sector',
  'Automotive & IoT',
];

const GEOGRAPHIES: Geography[] = [
  'India (North)',
  'India (South)',
  'India (West)',
  'India (East)',
  'Singapore & APAC',
  'United States',
  'United Kingdom & EU',
  'Middle East',
];

const WINNING_STANCES: WinningStance[] = [
  'Lost/Not Started',
  'Initial Stages',
  'Low Chance',
  'All are Equal',
  'Customer Prefers Us',
  'Under PO Negotiations',
  'Won/PO Received',
];

const PROCUREMENT_TYPES: ProcurementType[] = [
  'Direct Opportunity',
  'Open RFP',
  'Closed RFP',
];

const CURRENCIES: Currency[] = ['INR', 'USD', 'SGD', 'EUR', 'GBP'];

export const AccountUpdateJourneyModal: React.FC<AccountUpdateJourneyModalProps> = ({
  account,
  isOpen,
  onClose,
  onComplete,
}) => {
  const { updateAccount, currentUser, onBehalfOfUser, users } = useCrm();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isRefreshingAi, setIsRefreshingAi] = useState<boolean>(false);
  const [confirmedGovernance, setConfirmedGovernance] = useState<boolean>(true);

  // Draft state accumulating user edits across steps
  const [draft, setDraft] = useState<Account>({ ...account });

  // Tracks which fields have been accepted from AI
  const [aiAcceptedFields, setAiAcceptedFields] = useState<Record<string, boolean>>({
    ...(account.aiEnrichedFields || {}),
  });

  // Track original values to compute exact before/after diffs
  const initialAccount = useMemo(() => ({ ...account }), [account.id]);

  // Active step AI enrichment suggestions
  const enrichmentData: StepEnrichmentResult = useMemo(() => {
    return getStepEnrichmentSuggestions(draft, currentStep);
  }, [draft, currentStep]);

  // Handle accepting a specific field from AI suggestions
  const handleAcceptSuggestion = (fieldKey: string, value: any) => {
    setDraft((prev) => {
      const next = { ...prev };
      if (fieldKey in next.owners) {
        next.owners = { ...next.owners, [fieldKey]: value };
      } else {
        (next as any)[fieldKey] = value;
      }
      return next;
    });

    setAiAcceptedFields((prev) => ({
      ...prev,
      [fieldKey]: true,
    }));
  };

  // Handle accepting all suggestions for the current step
  const handleAcceptAllStep = () => {
    setDraft((prev) => {
      const next = { ...prev };
      Object.entries(enrichmentData.suggestions).forEach(([key, val]) => {
        if (key === 'applicableFrameworks' || key === 'epsilonBudget' || key === 'deltaTolerance') {
          return;
        }
        if (key in next.owners) {
          next.owners = { ...next.owners, [key]: val };
        } else {
          (next as any)[key] = val;
        }
      });
      return next;
    });

    const newAccepted = { ...aiAcceptedFields };
    Object.keys(enrichmentData.suggestions).forEach((k) => {
      newAccepted[k] = true;
    });
    setAiAcceptedFields(newAccepted);
  };

  // Simulate refreshing AI suggestions
  const handleRefreshAi = () => {
    setIsRefreshingAi(true);
    setTimeout(() => {
      setIsRefreshingAi(false);
    }, 450);
  };

  // Calculate dynamic completion percentage based on filled fields
  const completionStats = useMemo(() => {
    let humanFields = 0;
    let aiFields = 0;
    const trackedKeys = [
      'name',
      'headOfficeAddress',
      'website',
      'sector',
      'geography',
      'publicPrivate',
      'petsFlag',
      'responsibleAiFlag',
      'annualRevenue',
      'revenueCurrency',
      'winningStance',
      'procurementType',
      'salesOwner',
      'preSalesOwner',
      'solutionEngineerOwner',
      'leaderOwner',
    ];

    trackedKeys.forEach((key) => {
      if (aiAcceptedFields[key]) {
        aiFields++;
      } else {
        humanFields++;
      }
    });

    const totalTracked = trackedKeys.length;
    const humanPct = Math.round((humanFields / totalTracked) * 70);
    const aiPct = Math.round((aiFields / totalTracked) * 30);
    const totalPct = Math.min(100, humanPct + aiPct + 15);

    return { humanPct, aiPct, totalPct };
  }, [draft, aiAcceptedFields]);

  // Compute final modified diffs
  const modifiedDiffs = useMemo(() => {
    const diffs: { field: string; before: string; after: string; isAi: boolean }[] = [];

    if (draft.headOfficeAddress !== initialAccount.headOfficeAddress) {
      diffs.push({
        field: 'Head Office Address',
        before: initialAccount.headOfficeAddress || 'Not set',
        after: draft.headOfficeAddress,
        isAi: !!aiAcceptedFields.headOfficeAddress,
      });
    }
    if (draft.website !== initialAccount.website) {
      diffs.push({
        field: 'Website',
        before: initialAccount.website || 'Not set',
        after: draft.website,
        isAi: !!aiAcceptedFields.website,
      });
    }
    if (draft.sector !== initialAccount.sector) {
      diffs.push({
        field: 'Industry Sector',
        before: initialAccount.sector,
        after: draft.sector,
        isAi: !!aiAcceptedFields.sector,
      });
    }
    if (draft.geography !== initialAccount.geography) {
      diffs.push({
        field: 'Geography',
        before: initialAccount.geography,
        after: draft.geography,
        isAi: !!aiAcceptedFields.geography,
      });
    }
    if (draft.petsFlag !== initialAccount.petsFlag) {
      diffs.push({
        field: 'PETs Encryption Flag',
        before: initialAccount.petsFlag ? 'Enabled' : 'Disabled',
        after: draft.petsFlag ? 'Enabled' : 'Disabled',
        isAi: !!aiAcceptedFields.petsFlag,
      });
    }
    if (draft.responsibleAiFlag !== initialAccount.responsibleAiFlag) {
      diffs.push({
        field: 'Responsible AI Governance',
        before: initialAccount.responsibleAiFlag ? 'Enabled' : 'Disabled',
        after: draft.responsibleAiFlag ? 'Enabled' : 'Disabled',
        isAi: !!aiAcceptedFields.responsibleAiFlag,
      });
    }
    if (draft.annualRevenue !== initialAccount.annualRevenue) {
      diffs.push({
        field: 'Annual Revenue ARR',
        before: formatCurrencyValue(initialAccount.annualRevenue, initialAccount.revenueCurrency),
        after: formatCurrencyValue(draft.annualRevenue, draft.revenueCurrency),
        isAi: !!aiAcceptedFields.annualRevenue,
      });
    }
    if (draft.winningStance !== initialAccount.winningStance) {
      diffs.push({
        field: 'Winning Stance',
        before: initialAccount.winningStance,
        after: draft.winningStance,
        isAi: !!aiAcceptedFields.winningStance,
      });
    }
    if (draft.procurementType !== initialAccount.procurementType) {
      diffs.push({
        field: 'Procurement Channel',
        before: initialAccount.procurementType,
        after: draft.procurementType,
        isAi: !!aiAcceptedFields.procurementType,
      });
    }
    if (draft.owners.sales !== initialAccount.owners.sales) {
      diffs.push({
        field: 'Sales Owner',
        before: initialAccount.owners.sales,
        after: draft.owners.sales,
        isAi: !!aiAcceptedFields.sales,
      });
    }
    if (draft.owners.preSales !== initialAccount.owners.preSales) {
      diffs.push({
        field: 'Pre-Sales Owner',
        before: initialAccount.owners.preSales,
        after: draft.owners.preSales,
        isAi: !!aiAcceptedFields.preSales,
      });
    }
    if (draft.owners.solutionEngineer !== initialAccount.owners.solutionEngineer) {
      diffs.push({
        field: 'Solution Engineer',
        before: initialAccount.owners.solutionEngineer,
        after: draft.owners.solutionEngineer,
        isAi: !!aiAcceptedFields.solutionEngineer,
      });
    }
    if (draft.owners.leader !== initialAccount.owners.leader) {
      diffs.push({
        field: 'Team Leader',
        before: initialAccount.owners.leader,
        after: draft.owners.leader,
        isAi: !!aiAcceptedFields.leader,
      });
    }

    return diffs;
  }, [draft, initialAccount, aiAcceptedFields]);

  // Save changes and complete the journey
  const handleFinalSave = () => {
    const finalAccount: Account = {
      ...draft,
      profileCompletion: {
        human: Math.min(100, Math.max(65, completionStats.humanPct + 30)),
        ai: Math.min(35, completionStats.aiPct + 10),
      },
      aiEnrichedFields: {
        ...draft.aiEnrichedFields,
        ...aiAcceptedFields,
      },
      lastActivityDate: new Date().toISOString().split('T')[0],
    };

    // Commit through CrmContext updateAccount with audit trail entry
    updateAccount(
      finalAccount,
      'Guided Profile Completion Journey',
      `Incomplete (${account.profileCompletion.human + account.profileCompletion.ai}%)`,
      `Completed (${finalAccount.profileCompletion.human + finalAccount.profileCompletion.ai}%) · ${modifiedDiffs.length} fields updated`,
      new Date().toISOString().split('T')[0],
      {
        actor: currentUser.name,
        actingOnBehalfOf: onBehalfOfUser?.name,
        provenance: 'Human-confirmed',
      }
    );

    if (onComplete) {
      onComplete(finalAccount);
    }
    onClose();
  };

  const stepsList = [
    { id: 1, label: 'Firmographics', icon: Building2 },
    { id: 2, label: 'Compliance & PETs', icon: ShieldCheck },
    { id: 3, label: 'Financials & Stance', icon: DollarSign },
    { id: 4, label: 'Ownership & Review', icon: Users },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs ${account.logoBg || 'bg-slate-900'}`}
            >
              {account.logoText || 'ACC'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-slate-900 text-sm truncate">
                  {account.name}
                </h2>
                <span className="text-[11px] text-slate-500 font-medium">·</span>
                <span className="text-[11px] text-slate-600 font-medium">
                  {account.stage}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                  Guided Journey
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                Guided Account Profile completion with per-step AI enrichment & PrivaTRAC audit assurance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Profile Progress
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-24 h-1.5 rounded-full bg-slate-200 overflow-hidden flex">
                  <div
                    className="bg-slate-800 h-full transition-all duration-300"
                    style={{ width: `${completionStats.humanPct}%` }}
                    title={`Human: ${completionStats.humanPct}%`}
                  />
                  <div
                    className="bg-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${completionStats.aiPct}%` }}
                    title={`AI: ${completionStats.aiPct}%`}
                  />
                </div>
                <span className="text-xs font-bold text-slate-800 tabular-nums">
                  {completionStats.totalPct}%
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="Close journey wizard"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stepper Navigation Ribbon */}
        <div className="px-5 py-2.5 bg-white border-b border-slate-200/80 flex items-center justify-between overflow-x-auto gap-2">
          {stepsList.map((st, idx) => {
            const Icon = st.icon;
            const isCurrent = currentStep === st.id;
            const isCompleted = currentStep > st.id;

            return (
              <button
                key={st.id}
                onClick={() => setCurrentStep(st.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100/70 border border-emerald-200/60'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent
                      ? 'bg-indigo-500 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isCompleted ? <Check className="w-2.5 h-2.5" /> : st.id}
                </div>
                <span>{st.label}</span>
                {idx < stepsList.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-slate-300 hidden md:inline ml-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Main Body: Dual-Pane Layout */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Pane (7 cols): Active Step Form Fields */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Step 1: Core Firmographics */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-600" />
                    Step 1: Core Enterprise Firmographics
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Define primary enterprise headquarters, legal jurisdiction, and corporate classification.
                  </p>
                </div>

                {/* Account Name */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Account Legal Entity Name
                  </label>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Head Office Address */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700">
                      Corporate Head Office Address
                    </label>
                    {aiAcceptedFields.headOfficeAddress && (
                      <span className="text-[10px] text-indigo-600 font-medium flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> AI Enriched
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    value={draft.headOfficeAddress || ''}
                    onChange={(e) => {
                      setDraft({ ...draft, headOfficeAddress: e.target.value });
                      setAiAcceptedFields((prev) => ({ ...prev, headOfficeAddress: false }));
                    }}
                    placeholder="Enter full physical address, city, and postal code..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Website & Public/Private */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Corporate Website
                    </label>
                    <input
                      type="url"
                      value={draft.website || ''}
                      onChange={(e) => {
                        setDraft({ ...draft, website: e.target.value });
                        setAiAcceptedFields((prev) => ({ ...prev, website: false }));
                      }}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Enterprise Classification
                    </label>
                    <select
                      value={draft.publicPrivate}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          publicPrivate: e.target.value as 'Public' | 'Private',
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Private">Private Enterprise</option>
                      <option value="Public">Public Sector Undertaking (PSU / Gov)</option>
                    </select>
                  </div>
                </div>

                {/* Sector & Geography */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Industry Sector
                    </label>
                    <select
                      value={draft.sector}
                      onChange={(e) => setDraft({ ...draft, sector: e.target.value as Sector })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    >
                      {SECTORS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Operating Geography
                    </label>
                    <select
                      value={draft.geography}
                      onChange={(e) =>
                        setDraft({ ...draft, geography: e.target.value as Geography })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    >
                      {GEOGRAPHIES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Compliance Frameworks & Privacy Architecture */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Step 2: Compliance & Privacy Architecture
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure statutory compliance mandates (DPDP 2023, MAS FEAT, HIPAA) and PETs privacy settings.
                  </p>
                </div>

                {/* Core Feature Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => {
                      setDraft({ ...draft, petsFlag: !draft.petsFlag });
                      setAiAcceptedFields((prev) => ({ ...prev, petsFlag: true }));
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      draft.petsFlag
                        ? 'bg-indigo-50/60 border-indigo-300 ring-1 ring-indigo-200'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-slate-900">
                        PETs Cryptographic Pipeline
                      </span>
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                          draft.petsFlag
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {draft.petsFlag && <Check className="w-2.5 h-2.5" />}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Differential privacy (ε & δ) noise injection and zero-knowledge data pipelines.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setDraft({ ...draft, responsibleAiFlag: !draft.responsibleAiFlag });
                      setAiAcceptedFields((prev) => ({ ...prev, responsibleAiFlag: true }));
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      draft.responsibleAiFlag
                        ? 'bg-violet-50/60 border-violet-300 ring-1 ring-violet-200'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-slate-900">
                        Responsible AI & ISO 42001
                      </span>
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                          draft.responsibleAiFlag
                            ? 'bg-violet-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {draft.responsibleAiFlag && <Check className="w-2.5 h-2.5" />}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Model risk management, bias monitoring, and EU AI Act / DPDP statutory audit trails.
                    </p>
                  </div>
                </div>

                {/* Applicable Standards Checklist */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Applicable Statutory & Industry Frameworks
                  </label>
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {enrichmentData.suggestions.applicableFrameworks?.map((fw: string) => (
                      <div key={fw} className="flex items-center gap-2 text-xs text-slate-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{fw}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes & Architecture Scope */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Privacy Architecture Implementation Notes
                  </label>
                  <textarea
                    rows={2}
                    value={draft.notes || ''}
                    onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                    placeholder="Document differential privacy budget or regulatory scope details..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Deal Financials, Procurement & Stance */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-slate-700" />
                    Step 3: Deal Financials, Valuation & Stance
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Calibrate contract ARR, multi-currency values, procurement channels, and winning stance.
                  </p>
                </div>

                {/* Currency and Annual Revenue */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Billing Currency
                    </label>
                    <select
                      value={draft.revenueCurrency}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          revenueCurrency: e.target.value as Currency,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-slate-700">
                        Annual Deal Revenue (ARR)
                      </label>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Formatted: {formatCurrencyValue(draft.annualRevenue, draft.revenueCurrency, draft.geography)}
                      </span>
                    </div>
                    <input
                      type="number"
                      step={100000}
                      value={draft.annualRevenue || 0}
                      onChange={(e) => {
                        setDraft({ ...draft, annualRevenue: parseFloat(e.target.value) || 0 });
                        setAiAcceptedFields((prev) => ({ ...prev, annualRevenue: false }));
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium tabular-nums"
                    />
                  </div>
                </div>

                {/* Procurement Type & Winning Stance */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Procurement Channel
                    </label>
                    <select
                      value={draft.procurementType}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          procurementType: e.target.value as ProcurementType,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    >
                      {PROCUREMENT_TYPES.map((pt) => (
                        <option key={pt} value={pt}>
                          {pt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Winning Stance
                    </label>
                    <select
                      value={draft.winningStance}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          winningStance: e.target.value as WinningStance,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      {WINNING_STANCES.map((ws) => (
                        <option key={ws} value={ws}>
                          {ws}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Commercial Pipeline Impact Preview */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-700 mb-1">
                    PrivaSapien Valuation Calculation:
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Base Value × Winning Stance Weight:</span>
                    <strong className="text-slate-900">
                      {draft.winningStance} ({formatCurrencyValue(draft.annualRevenue, draft.revenueCurrency, draft.geography)})
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Account Team & Review */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Step 4: Quad-Ownership Team & Final Audit
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Assign responsible cross-functional owners and confirm the immutable audit trail diffs.
                  </p>
                </div>

                {/* Quad Ownership Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Sales Owner (Quota Lead)
                    </label>
                    <select
                      value={draft.owners.sales}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          owners: { ...draft.owners, sales: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Pre-Sales Owner (Bid Desk)
                    </label>
                    <select
                      value={draft.owners.preSales}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          owners: { ...draft.owners, preSales: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Solution Engineer (PETs Specialist)
                    </label>
                    <select
                      value={draft.owners.solutionEngineer}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          owners: { ...draft.owners, solutionEngineer: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Team Leader (Commercial Escalation)
                    </label>
                    <select
                      value={draft.owners.leader}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          owners: { ...draft.owners, leader: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Audit Diffs Summary */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-xs text-slate-800">
                      Audit Trail Before & After Diffs ({modifiedDiffs.length} fields)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Provenance: Human-confirmed
                    </span>
                  </div>

                  {modifiedDiffs.length === 0 ? (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                      No changes made yet. All current account fields are retained.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-[10px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-2">Field</th>
                            <th className="px-3 py-2">Previous</th>
                            <th className="px-3 py-2">Updated</th>
                            <th className="px-3 py-2 text-right">Source</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {modifiedDiffs.map((d, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="px-3 py-1.5 font-medium text-slate-900">{d.field}</td>
                              <td className="px-3 py-1.5 text-slate-400 line-through truncate max-w-[130px]">{d.before}</td>
                              <td className="px-3 py-1.5 text-emerald-700 font-medium truncate max-w-[150px]">{d.after}</td>
                              <td className="px-3 py-1.5 text-right">
                                {d.isAi ? (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    AI
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 text-slate-700">
                                    Human
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* PrivaTRAC Governance Gate */}
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-950">
                    <div className="font-semibold mb-0.5">PrivaTRAC Governance & Audit Gate</div>
                    <label className="flex items-center gap-2 cursor-pointer mt-1">
                      <input
                        type="checkbox"
                        checked={confirmedGovernance}
                        onChange={(e) => setConfirmedGovernance(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-[11px] text-amber-900">
                        I confirm these profile enhancements on behalf of <strong>{currentUser.name}</strong>. Mutating pipeline records will be logged with full ISO-8601 audit stamps.
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Pane (5 cols): Contextual AI Enrichment Assistant */}
          <div className="lg:col-span-5 bg-slate-50/80 rounded-xl border border-slate-200/90 p-4 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">
                      Step {currentStep} AI Enrichment
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {enrichmentData.sourceAttestation}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRefreshAi}
                  disabled={isRefreshingAi}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white transition cursor-pointer"
                  title="Refresh AI suggestions"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isRefreshingAi ? 'animate-spin text-indigo-600' : ''}`}
                  />
                </button>
              </div>

              {/* Confidence Badge & Rationale */}
              <div className="mt-3 p-2.5 bg-white rounded-lg border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Why AI Suggests This
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {enrichmentData.confidenceScore}% Confidence
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {enrichmentData.rationale}
                </p>
              </div>

              {/* Granular Field Suggestions */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-700">
                    Suggested Step Enhancements:
                  </span>
                  <button
                    type="button"
                    onClick={handleAcceptAllStep}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    Accept All Step
                  </button>
                </div>

                {Object.entries(enrichmentData.suggestions).map(([fieldKey, suggestedVal]) => {
                  if (fieldKey === 'applicableFrameworks' || fieldKey === 'epsilonBudget' || fieldKey === 'deltaTolerance') {
                    return null;
                  }

                  const isAccepted = !!aiAcceptedFields[fieldKey];
                  const explanation = enrichmentData.fieldExplanations?.[fieldKey] || '';

                  let displayVal = String(suggestedVal);
                  if (typeof suggestedVal === 'boolean') {
                    displayVal = suggestedVal ? 'Enabled' : 'Disabled';
                  } else if (fieldKey === 'annualRevenue') {
                    displayVal = formatCurrencyValue(Number(suggestedVal), draft.revenueCurrency, draft.geography);
                  }

                  return (
                    <div
                      key={fieldKey}
                      className={`p-2.5 rounded-lg border transition ${
                        isAccepted
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-white border-slate-200/80 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            {fieldKey.replace(/([A-Z])/g, ' $1')}
                          </span>
                          <div className="text-xs font-bold text-slate-900 truncate mt-0.5">
                            {displayVal}
                          </div>
                          {explanation && (
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                              {explanation}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAcceptSuggestion(fieldKey, suggestedVal)}
                          className={`px-2 py-1 rounded text-[10px] font-semibold transition shrink-0 cursor-pointer flex items-center gap-1 ${
                            isAccepted
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-900 text-white hover:bg-slate-800'
                          }`}
                        >
                          {isAccepted ? (
                            <>
                              <Check className="w-2.5 h-2.5 text-emerald-700" />
                              Accepted
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-2.5 h-2.5 text-indigo-300" />
                              Accept
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prompt Assist Footer */}
            <div className="mt-4 pt-3 border-t border-slate-200 text-[10px] text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span>
                All AI suggestions remain advisory until accepted by the human operator.
              </span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s - 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous Step
              </button>
            )}
            <span className="text-xs text-slate-500 font-medium">
              Step {currentStep} of 4
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 transition cursor-pointer"
            >
              Cancel
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s + 1)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition shadow-xs cursor-pointer"
              >
                <span>Save & Next Step</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSave}
                disabled={!confirmedGovernance}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Complete Journey & Save Profile</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
