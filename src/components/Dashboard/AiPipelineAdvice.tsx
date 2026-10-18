import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
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
} from 'lucide-react';
import { formatCurrencyValue } from '../../utils/calculations';
import { SalesOpsAgentModal } from '../SalesOps/SalesOpsAgentModal';

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
  const { pipelineMetrics } = useCrm();
  const [refreshCount, setRefreshCount] = useState(0);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotPrompt, setCopilotPrompt] = useState('');
  const [activeRecId, setActiveRecId] = useState<number | null>(null);

  const aiSummary = useMemo(() => {
    const totalCount = pipelineMetrics.totalAccounts;
    const criticalCount = pipelineMetrics.stageCounts['Critical'] || 0;
    const matureCount = pipelineMetrics.stageCounts['Mature'] || 0;
    const nurturingCount = pipelineMetrics.stageCounts['Nurturing'] || 0;
    const totalINRFormatted = formatCurrencyValue(pipelineMetrics.totalAccountValueINR, 'INR');

    return `Synthesizing ${totalCount} active accounts representing ${totalINRFormatted} in total weighted adoption value. High concentration of enterprise momentum in Critical (${criticalCount}) and Mature (${matureCount}) stages, with ${nurturingCount} accounts in early validation. BFSI and Healthcare sectors demonstrate the highest adoption multipliers (Innovators/Early Adopters). Immediate revenue closure relies on executing technical SBOM submissions for State Bank of India and DBS Bank.`;
  }, [pipelineMetrics, refreshCount]);

  const recommendations: ActionRecommendation[] = [
    {
      id: 1,
      target: 'State Bank of India (Critical)',
      recommendation: 'Close Tier-1 PO negotiations before FY Q3 procurement deadline.',
      rationale: 'Overdue FIPS-140-3 cryptography attestation is the single blocker to commercial seal.',
      timing: 'Within next 24 hours',
      tag: 'Urgent Closure',
      tagColor: {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
      },
      impact: '₹12.5 Cr Pipeline Unlocked',
      copilotPrompt:
        "Close PO negotiations for State Bank of India: update winning stance to 'Under PO Negotiations' and add urgent follow-up task 'Deliver FIPS-140-3 cryptography attestation before FY Q3 deadline'",
    },
    {
      id: 2,
      target: 'HDFC Life & Digital (Stale Warning)',
      recommendation: 'Initiate automated re-engagement sequence with Chief Risk Officer.',
      rationale: 'Zero recorded interactions for over 25 days; deal risk elevated to Stale.',
      timing: 'Before Friday 17:00 IST',
      tag: 'Deal Rescue',
      tagColor: {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
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

  const handleTriggerCopilot = (rec: ActionRecommendation) => {
    setActiveRecId(rec.id);
    setCopilotPrompt(rec.copilotPrompt);
    setIsCopilotOpen(true);
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
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                Generated by AI · Advisory
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                Copilot Integrated
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Triggered automatically on dataset modification · Click any action to execute with SalesOps Copilot
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-1">
          <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            Top 6 Explainable Action Recommendations
          </h4>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Click any recommendation to trigger SalesOps Copilot
          </span>
        </div>

        {/* Selected Element: 6 Action Recommendation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {recommendations.slice(0, 6).map((rec) => {
            const isSelected = activeRecId === rec.id;
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

                  {/* Impact Metric */}
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 mb-2">
                    <TrendingUp className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Impact: {rec.impact}</span>
                  </div>
                </div>

                {/* Footer and Interactive Copilot Action Trigger */}
                <div className="pt-2.5 border-t border-slate-100 mt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                    <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {rec.timing}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-indigo-600 font-semibold bg-indigo-50/80 px-1.5 py-0.5 rounded border border-indigo-100">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Human Approval
                    </span>
                  </div>

                  {/* Clickable Action Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTriggerCopilot(rec);
                    }}
                    className="w-full inline-flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white hover:from-indigo-900 hover:to-slate-800 border border-indigo-500/20 shadow-2xs group-hover:shadow transition-all duration-150 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-12 transition-transform" />
                      <span>Trigger Copilot</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-indigo-200 font-medium">
                      <span>Work Action</span>
                      <ArrowRight className="w-3 h-3 text-indigo-300 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </button>
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
          SalesOps Copilot v2.4 · Guardrails Active
        </span>
      </div>

      {/* SalesOps Agent Copilot Modal */}
      <SalesOpsAgentModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        initialPrompt={copilotPrompt}
      />
    </div>
  );
};
