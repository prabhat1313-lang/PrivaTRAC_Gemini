import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Account } from '../../types/crm';
import {
  Sparkles,
  RefreshCw,
  ShieldAlert,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Building2,
  Zap,
  Compass,
  Check,
} from 'lucide-react';
import { formatCurrencyValue } from '../../utils/calculations';
import { SalesOpsAgentModal } from '../SalesOps/SalesOpsAgentModal';
import { AccountUpdateJourneyModal } from '../Accounts/AccountUpdateJourneyModal';

interface ActionRecommendation {
  id: number;
  target: string;
  recommendation: string;
  rationale: string;
  timing: string;
  tag: string;
  tagColor: { bg: string; text: string; border: string; dot: string };
  impact: string;
  copilotPrompt: string;
}

export const AiPipelineAdvice: React.FC = () => {
  const { accounts } = useCrm();
  const [refreshCount, setRefreshCount] = useState(0);
  const [activeRecId, setActiveRecId] = useState<number | null>(null);
  const [copilotPrompt, setCopilotPrompt] = useState<string>('');
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [journeyAccount, setJourneyAccount] = useState<Account | null>(null);

  const aiSummary = useMemo(() => {
    return `PrivaSapien AI Pipeline Intelligence analyzed active deals across India, APAC, and EMEA. Key findings: 2 high-velocity deals require urgent human-in-the-loop decisions (SBI PO negotiations, HDFC Life re-engagement). 1 account presents a 2.0x ARR acceleration via genomic PETs telemetry (Apollo Health). Strategic partners (Wipro, TCS) have active alignments on 6 tenders with zero compliance leaks.`;
  }, [refreshCount]);

  const recommendations: ActionRecommendation[] = [
    {
      id: 1,
      target: 'State Bank of India (Critical)',
      recommendation: 'Complete pre-bid RFP annexures and advance stage to Closed Won upon PO sign-off.',
      rationale: 'Commercial pricing approved with Wipro lead SI; final board sanction pending this cycle.',
      timing: 'Immediate (Next 24h)',
      tag: 'Urgent Closure',
      tagColor: {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
      },
      impact: '₹12.5 Cr Pipeline Unlocked',
      copilotPrompt:
        "Advance State Bank of India deal: set stage to 'Closed Won', update stance to 'Won/PO Received', and assign handover tasks to Pre-Sales and SE teams",
    },
    {
      id: 2,
      target: 'HDFC Life & Digital (Stale Warning)',
      recommendation: 'Schedule emergency re-engagement meeting with Chief Risk Officer regarding ISO-42001 governance.',
      rationale: 'No logged touchpoints in 18 days; competitor pushing uncertified anonymization claims.',
      timing: 'Within 48 hours',
      tag: 'Deal Rescue',
      tagColor: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      },
      impact: '₹8.2 Cr Rescue Probability +40%',
      copilotPrompt:
        "Re-engage HDFC Life & Digital: add high priority task 'Schedule emergency re-engagement meeting with Chief Risk Officer regarding ISO-42001 governance' and update stance to 'Customer Prefers Us'",
    },
    {
      id: 3,
      target: 'Apollo Health Networks (Mature)',
      recommendation: 'Schedule genomic synthetic telemetry demonstration with Dr. Padmanabhan.',
      rationale: 'Innovator adoption profile (2.0x multiplier) offers maximum pipeline leverage.',
      timing: 'Mid-week morning window',
      tag: 'Value Multiplier',
      tagColor: {
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        dot: 'bg-indigo-500',
      },
      impact: '2.0x ARR Adoption Acceleration',
      copilotPrompt:
        "Advance Apollo Health Networks deal: add task 'Schedule genomic synthetic telemetry demonstration with Dr. Padmanabhan' and advance stage to 'Mature'",
    },
    {
      id: 4,
      target: 'Wipro Technologies Alliance',
      recommendation: 'Execute monthly SWOT co-sell synchronization for Singapore public tenders.',
      rationale: 'Wipro tagged on 5 active strategic deals without cross-partner leakage.',
      timing: 'Monthly review cycle',
      tag: 'Partner Co-sell',
      tagColor: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
      },
      impact: 'Multi-Deal Win Rate +35%',
      copilotPrompt:
        "Coordinate Wipro partnership: add follow-up task 'Execute monthly SWOT co-sell synchronization for Singapore public tenders with Wipro alliance team'",
    },
    {
      id: 5,
      target: 'Grab Holdings Pte (Nurturing)',
      recommendation: 'Deliver cross-border CBAC privacy masking architecture deck.',
      rationale: 'Recent Southeast Asian regulatory mandates for data clean rooms.',
      timing: 'Next scheduled check-in',
      tag: 'Technical Alignment',
      tagColor: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      },
      impact: 'Accelerate PoC to Mature Stage',
      copilotPrompt:
        "Deliver architecture for Grab Holdings Pte: add task 'Deliver cross-border CBAC privacy masking architecture deck' and advance stage to 'Mature'",
    },
    {
      id: 6,
      target: 'DBS Bank Southeast Asia (Mature)',
      recommendation: 'Submit MAS FEAT compliance validation and regional cross-border SLA addendum.',
      rationale: 'MAS FEAT principles evaluation required for Singapore AI sandbox operational clearance.',
      timing: 'Within 48 hours',
      tag: 'Regulatory Clearance',
      tagColor: {
        bg: 'bg-violet-50',
        text: 'text-violet-700',
        border: 'border-violet-200',
        dot: 'bg-violet-500',
      },
      impact: 'SGD $1.2M Contract Finalization',
      copilotPrompt:
        "Submit compliance for DBS Bank Southeast Asia: add high priority task 'Submit MAS FEAT compliance validation and regional cross-border SLA addendum' and update winning stance to 'Customer Prefers Us'",
    },
  ];

  // Helper to map recommendation target to account in CRM state
  const getAccountForRec = (rec: ActionRecommendation): Account | undefined => {
    const targetLower = rec.target.toLowerCase();
    return (
      accounts.find((a) => {
        const aName = a.name.toLowerCase();
        if (targetLower.includes('state bank') || targetLower.includes('sbi')) {
          return aName.includes('state bank') || aName.includes('sbi');
        }
        if (targetLower.includes('hdfc')) return aName.includes('hdfc');
        if (targetLower.includes('apollo')) return aName.includes('apollo');
        if (targetLower.includes('dbs')) return aName.includes('dbs');
        if (targetLower.includes('grab')) return aName.includes('grab');
        if (targetLower.includes('wipro')) {
          return (
            a.partners?.some((p) => p.toLowerCase().includes('wipro')) ||
            aName.includes('state bank')
          );
        }
        return aName.includes(targetLower.split(' ')[0]);
      }) || accounts[0]
    );
  };

  const handleTriggerCopilot = (rec: ActionRecommendation) => {
    setActiveRecId(rec.id);
    setCopilotPrompt(rec.copilotPrompt);
    setIsCopilotOpen(true);
  };

  const handleLaunchJourney = (rec: ActionRecommendation, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetAcc = getAccountForRec(rec);
    if (targetAcc) {
      setJourneyAccount(targetAcc);
    }
  };

  return (
    <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5 shadow-xs">
      {/* Header with AI provenance badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-200/80 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-900 text-sm">Pipeline Intelligence & Recommendations</h3>
              <span className="text-[11px] text-slate-500 font-normal">
                Generated by AI · Advisory Mode
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                Copilot & Guided Journey
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Triggered automatically on dataset modification · Click actions to execute with SalesOps Copilot or launch Guided Account Update
            </p>
          </div>
        </div>

        <button
          onClick={() => setRefreshCount((c) => c + 1)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Regenerate Insights</span>
        </button>
      </div>

      {/* Dynamic Summary */}
      <div className="mt-4 p-3.5 rounded-lg bg-white border border-slate-200/80 text-xs text-slate-700 leading-relaxed shadow-2xs">
        <p className="font-normal">{aiSummary}</p>
      </div>

      {/* Top 6 Explainable Strategic Recommendations */}
      <div className="mt-4">
        {/* Child 1: Focused Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3.5 gap-2 pb-1 border-b border-slate-200/60">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Top 6 Explainable Action Recommendations
            </h4>
            <span className="text-[11px] text-slate-400">·</span>
            <span className="text-[11px] text-slate-500 font-medium">
              Human-in-the-Loop PrivaTRAC Validation
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Click card for Copilot</span>
            </span>
            <span>/</span>
            <span className="flex items-center gap-1.5 text-indigo-600 font-medium">
              <Compass className="w-3 h-3 text-indigo-500" />
              <span>Launch Account Update Journey</span>
            </span>
          </div>
        </div>

        {/* Selected Element: 6 Action Recommendation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {recommendations.slice(0, 6).map((rec) => {
            const isSelected = activeRecId === rec.id;
            const targetAccount = getAccountForRec(rec);
            const profileCompletion = targetAccount?.profileCompletion
              ? targetAccount.profileCompletion.human + targetAccount.profileCompletion.ai
              : 75;

            return (
              <div
                key={rec.id}
                onClick={() => handleTriggerCopilot(rec)}
                className={`group relative p-4 rounded-xl bg-white border transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-md ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50/20'
                    : 'border-slate-200/90 hover:border-indigo-400 hover:ring-2 hover:ring-indigo-100/70'
                }`}
                title="Click to trigger SalesOps Copilot for this recommendation"
              >
                <div>
                  {/* Card Header: Target and Tag */}
                  <div className="flex items-center justify-between gap-1.5 mb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-bold text-xs text-slate-900 truncate tracking-tight">
                        {rec.target}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${rec.tagColor.bg} ${rec.tagColor.text} ${rec.tagColor.border} shrink-0`}
                    >
                      <span className={`w-1 h-1 rounded-full ${rec.tagColor.dot}`}></span>
                      {rec.tag}
                    </span>
                  </div>

                  {/* Recommendation Headline */}
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-950 transition-colors mb-2 leading-snug">
                    {rec.recommendation}
                  </p>

                  {/* Explainability Block */}
                  <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100 mb-2.5">
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      <strong className="text-slate-900 font-semibold">Why (Explainability):</strong>{' '}
                      {rec.rationale}
                    </p>
                  </div>

                  {/* Impact Metric & Profile Progress Bar */}
                  <div className="flex items-center justify-between text-[11px] mb-2 gap-2">
                    <div className="flex items-center gap-1.5 font-medium text-emerald-700 truncate">
                      <TrendingUp className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">Impact: {rec.impact}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 text-[10px] text-slate-500 font-mono">
                      <span>Profile: {profileCompletion}%</span>
                    </div>
                  </div>
                </div>

                {/* Footer and Interactive Action Triggers */}
                <div className="pt-2.5 border-t border-slate-100 mt-1 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {rec.timing}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-indigo-600 font-semibold bg-indigo-50/80 px-1.5 py-0.5 rounded border border-indigo-100">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Human Approval
                    </span>
                  </div>

                  {/* Dual Action Buttons */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {/* Trigger Copilot */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTriggerCopilot(rec);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 border border-slate-800 shadow-2xs transition-all cursor-pointer"
                      title="Trigger SalesOps Copilot to execute CRM pipeline stage or task mutations"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span className="truncate">Copilot</span>
                    </button>

                    {/* Guided Profile Journey */}
                    <button
                      type="button"
                      onClick={(e) => handleLaunchJourney(rec, e)}
                      className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200 shadow-2xs transition-all cursor-pointer"
                      title="Launch guided step-by-step account profile completion wizard with AI enrichment"
                    >
                      <Compass className="w-3 h-3 text-indigo-600 shrink-0" />
                      <span className="truncate">Profile Journey</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Governance Notice */}
      <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            <strong>PrivaTRAC Governance Rule:</strong> AI recommendations require human confirmation before pipeline state modification.
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          SalesOps Copilot & Account Journey v2.5 · Guardrails Active
        </span>
      </div>

      {/* SalesOps Agent Copilot Modal */}
      <SalesOpsAgentModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        initialPrompt={copilotPrompt}
      />

      {/* Guided Account Profile Completion Journey Modal */}
      {journeyAccount && (
        <AccountUpdateJourneyModal
          account={journeyAccount}
          isOpen={!!journeyAccount}
          onClose={() => setJourneyAccount(null)}
        />
      )}
    </div>
  );
};
