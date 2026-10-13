import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Account, AccountStage } from '../../types/crm';
import {
  calculateAccountValue,
  calculateDealValue,
  formatCurrencyValue,
} from '../../utils/calculations';
import {
  Layers,
  ArrowDown,
  ChevronRight,
  AlertOctagon,
  CheckCircle2,
  Filter,
  Building2,
  Clock,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  X,
} from 'lucide-react';
import { AccountDetailModal } from '../Accounts/AccountDetailModal';

interface FunnelViewProps {
  selectedStage?: AccountStage;
  onSelectStage?: (stage: AccountStage) => void;
}

export const FunnelView: React.FC<FunnelViewProps> = ({ selectedStage, onSelectStage }) => {
  const { pipelineMetrics, accounts } = useCrm();
  const [viewMode, setViewMode] = useState<'funnel-graphic' | 'pipeline-chevrons'>('funnel-graphic');
  const [inspectingAccount, setInspectingAccount] = useState<Account | null>(null);

  // 5 Active Stages Definition with Gate Criteria and conversion metrics
  const stages: {
    stage: AccountStage;
    label: string;
    stepNumber: number;
    subtext: string;
    gateCriteria: string;
    avgCycleDays: number;
    topWidthPct: number;
    bottomWidthPct: number;
    svgFill: string;
    svgStroke: string;
    textColor: string;
    badgeBg: string;
    borderColor: string;
  }[] = [
    {
      stage: 'New Account',
      label: 'Top of Funnel · New Ingestion',
      stepNumber: 1,
      subtext: 'Prospect identification, outbound qualification & DPDP fitment',
      gateCriteria: 'Eligibility verified & initial contact unmasked',
      avgCycleDays: 7,
      topWidthPct: 100,
      bottomWidthPct: 82,
      svgFill: '#f8fafc',
      svgStroke: '#cbd5e1',
      textColor: 'text-slate-900',
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
      borderColor: 'border-slate-200',
    },
    {
      stage: 'Nurturing',
      label: 'Discovery & Solution Fitment · Nurturing',
      stepNumber: 2,
      subtext: 'Architecture mapping, stakeholder discovery & scoping calls',
      gateCriteria: 'Technical architecture matched with product family',
      avgCycleDays: 14,
      topWidthPct: 82,
      bottomWidthPct: 65,
      svgFill: '#f1f5f9',
      svgStroke: '#cbd5e1',
      textColor: 'text-slate-900',
      badgeBg: 'bg-slate-200/80 text-slate-700 border-slate-300',
      borderColor: 'border-slate-200',
    },
    {
      stage: 'Mature',
      label: 'Technical Validation & Proof of Concept · Mature',
      stepNumber: 3,
      subtext: 'Live PETs benchmarks, SBOM compliance & security review',
      gateCriteria: 'FIPS/SBOM certification approved by CISO/Security',
      avgCycleDays: 21,
      topWidthPct: 65,
      bottomWidthPct: 48,
      svgFill: '#e2e8f0',
      svgStroke: '#94a3b8',
      textColor: 'text-slate-900',
      badgeBg: 'bg-slate-200 text-slate-800 border-slate-300',
      borderColor: 'border-slate-300',
    },
    {
      stage: 'Critical',
      label: 'Commercials & Tender Negotiations · Critical',
      stepNumber: 4,
      subtext: 'Rate card approval, SLA warranty & procurement tender seal',
      gateCriteria: 'Finance & Legal commercial sign-off received',
      avgCycleDays: 10,
      topWidthPct: 48,
      bottomWidthPct: 34,
      svgFill: '#fef3c7',
      svgStroke: '#f59e0b',
      textColor: 'text-amber-950',
      badgeBg: 'bg-amber-100/80 text-amber-900 border-amber-300/80',
      borderColor: 'border-amber-200',
    },
    {
      stage: 'Closed Won',
      label: 'Procurement Conversion · Closed Won',
      stepNumber: 5,
      subtext: 'Signed purchase order, enterprise license execution & onboarding',
      gateCriteria: 'PO issued & revenue recognized',
      avgCycleDays: 5,
      topWidthPct: 34,
      bottomWidthPct: 24,
      svgFill: '#dcfce7',
      svgStroke: '#10b981',
      textColor: 'text-emerald-950',
      badgeBg: 'bg-emerald-100/80 text-emerald-900 border-emerald-300/80',
      borderColor: 'border-emerald-200',
    },
  ];

  const lostCount = pipelineMetrics.stageCounts['Closed Lost'] || 0;
  const lostValue = pipelineMetrics.stageValuesINR['Closed Lost'] || 0;

  // Conversion calculations
  const getStageConversionRate = (currentIndex: number) => {
    if (currentIndex === 0) return null;
    const prevCount = pipelineMetrics.stageCounts[stages[currentIndex - 1].stage] || 0;
    const currCount = pipelineMetrics.stageCounts[stages[currentIndex].stage] || 0;
    if (prevCount === 0) return 0;
    return Math.min(100, Math.round((currCount / prevCount) * 100));
  };

  // Accounts in selected stage
  const selectedStageAccounts = useMemo(() => {
    if (!selectedStage) return [];
    return accounts.filter((a) => a.stage === selectedStage);
  }, [accounts, selectedStage]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      {/* 1. Header with Executive Title, Mode Switcher, and Totals */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-5 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              <Layers className="w-4 h-4 text-slate-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                  Sales Pipeline & Funnel Diagram
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded text-slate-600 bg-slate-100 border border-slate-200 font-medium">
                  5-Stage Flow
                </span>
                {selectedStage && (
                  <span className="text-[11px] px-2 py-0.5 rounded text-slate-800 bg-slate-100 border border-slate-300 font-semibold flex items-center gap-1">
                    <span>Filtering: {selectedStage}</span>
                    <button
                      onClick={() => onSelectStage && onSelectStage(selectedStage)}
                      className="hover:text-slate-900 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Stage progression funnel · Conversion velocity · Weighted Account Value in INR
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('funnel-graphic')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                viewMode === 'funnel-graphic'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Geometric Funnel
            </button>
            <button
              onClick={() => setViewMode('pipeline-chevrons')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                viewMode === 'pipeline-chevrons'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stage Gates Flow
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Active Accounts
              </div>
              <div className="text-lg font-bold text-slate-900 tabular-nums">
                {pipelineMetrics.totalAccounts}
              </div>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Total Value
              </div>
              <div className="text-lg font-bold text-slate-900 tabular-nums">
                {formatCurrencyValue(pipelineMetrics.totalAccountValueINR, 'INR')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MODE A: TRUE GEOMETRIC FUNNEL DIAGRAM */}
      {viewMode === 'funnel-graphic' ? (
        <div className="mt-6 flex flex-col items-center">
          <div className="w-full max-w-4xl space-y-2">
            {stages.map((st, idx) => {
              const count = pipelineMetrics.stageCounts[st.stage] || 0;
              const valueINR = pipelineMetrics.stageValuesINR[st.stage] || 0;
              const isSelected = selectedStage === st.stage;
              const conversion = getStageConversionRate(idx);

              return (
                <div key={st.stage} className="w-full flex flex-col items-center">
                  {/* Subtle Inter-Stage Conversion Arrow & Drop-off */}
                  {idx > 0 && (
                    <div className="my-1 flex items-center justify-center gap-2 text-[10px] text-slate-500">
                      <ArrowDown className="w-3 h-3 text-slate-400" />
                      <span className="font-medium bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                        Conversion: {conversion !== null ? `${conversion}%` : '—'}
                      </span>
                      <span className="text-slate-400">· Avg Cycle: {st.avgCycleDays} days</span>
                    </div>
                  )}

                  {/* Tapered Funnel Tier Card */}
                  <div
                    onClick={() => onSelectStage && onSelectStage(st.stage)}
                    style={{ width: `${st.topWidthPct}%` }}
                    className={`cursor-pointer transition-all duration-150 group rounded-xl ${
                      isSelected
                        ? 'ring-2 ring-slate-800 shadow-sm'
                        : 'hover:shadow-2xs'
                    }`}
                  >
                    <div
                      className={`w-full p-3.5 sm:p-4 rounded-xl border ${st.borderColor} transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}
                      style={{ backgroundColor: st.svgFill }}
                    >
                      {/* Left: Stage number badge & titles */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg ${st.badgeBg} flex items-center justify-center font-bold text-sm tabular-nums border shadow-2xs shrink-0`}
                        >
                          {count}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-900 text-sm">
                              {st.label}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/80 border border-slate-200 text-slate-600 font-medium">
                              Stage {st.stepNumber} of 5
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                            {st.subtext}
                          </p>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-medium flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-slate-400" />
                            <span>Gate: {st.gateCriteria}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Stage INR Opportunity Value */}
                      <div className="text-right sm:pl-4 sm:border-l sm:border-slate-300/60 shrink-0 self-end sm:self-center">
                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                          Stage Value
                        </div>
                        <div className={`text-base font-bold ${st.textColor} tabular-nums mt-0.5`}>
                          {formatCurrencyValue(valueINR, 'INR')}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                          {pipelineMetrics.totalAccountValueINR > 0
                            ? `${Math.round((valueINR / pipelineMetrics.totalAccountValueINR) * 100)}% of pipeline`
                            : '0%'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 3. MODE B: PIPELINE CHEVRONS & STAGE GATES */
        <div className="mt-6 overflow-x-auto pb-2">
          <div className="flex items-stretch gap-2 min-w-[960px]">
            {stages.map((st, idx) => {
              const count = pipelineMetrics.stageCounts[st.stage] || 0;
              const valueINR = pipelineMetrics.stageValuesINR[st.stage] || 0;
              const isSelected = selectedStage === st.stage;
              const conversion = getStageConversionRate(idx);

              return (
                <div
                  key={st.stage}
                  onClick={() => onSelectStage && onSelectStage(st.stage)}
                  style={{ backgroundColor: st.svgFill }}
                  className={`flex-1 border ${st.borderColor} p-3.5 rounded-xl transition flex flex-col justify-between cursor-pointer ${
                    isSelected ? 'ring-2 ring-slate-800' : 'hover:border-slate-400'
                  }`}
                >
                  <div>
                    {/* Header: Stage number + count */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Gate {st.stepNumber}
                      </span>
                      <span className={`w-6 h-6 rounded ${st.badgeBg} flex items-center justify-center font-bold text-xs tabular-nums border`}>
                        {count}
                      </span>
                    </div>

                    <h4 className="font-semibold text-slate-900 text-xs mb-1">
                      {st.stage}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
                      {st.subtext}
                    </p>

                    <div className="p-2 rounded bg-white/70 border border-slate-200/80 text-[10px] text-slate-600 mb-2">
                      <strong>Exit Gate:</strong> {st.gateCriteria}
                    </div>
                  </div>

                  <div>
                    {conversion !== null && (
                      <div className="text-[10px] text-slate-500 mb-2 flex items-center gap-1 font-medium">
                        <TrendingUp className="w-3 h-3 text-slate-400" />
                        <span>Conversion: {conversion}%</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-300/60">
                      <div className="text-[10px] text-slate-400 uppercase font-medium">
                        Opportunity Value
                      </div>
                      <div className={`text-sm font-bold ${st.textColor} tabular-nums mt-0.5`}>
                        {formatCurrencyValue(valueINR, 'INR')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Closed Lost (Outflow Loss Bin) */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs gap-3">
        <div className="flex items-center gap-2.5">
          <AlertOctagon className="w-4 h-4 text-slate-500 shrink-0" />
          <div>
            <div className="font-semibold text-slate-800">
              Closed Lost (Loss Analysis Bin)
            </div>
            <p className="text-[11px] text-slate-500">
              Deals outside conversion probability · Loss post-mortem records preserved
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5 shrink-0 sm:pl-4 sm:border-l sm:border-slate-200">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Lost Deals</div>
            <div className="text-sm font-semibold text-slate-800 tabular-nums">{lostCount}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Lost Value</div>
            <div className="text-sm font-semibold text-slate-800 tabular-nums">
              {formatCurrencyValue(lostValue, 'INR')}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Stage Accounts Inspector (Appears when a stage is selected) */}
      {selectedStage && (
        <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-600" />
              <h4 className="font-semibold text-slate-900 text-xs">
                Accounts in Stage: {selectedStage} ({selectedStageAccounts.length})
              </h4>
            </div>
            <button
              onClick={() => onSelectStage && onSelectStage(selectedStage)}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Clear Filter
            </button>
          </div>

          {selectedStageAccounts.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">
              No accounts currently in this stage.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {selectedStageAccounts.map((account) => {
                const dealVal = calculateDealValue(account.annualRevenue, account.dealValueOverride);
                const accVal = calculateAccountValue(
                  dealVal,
                  account.winningStance,
                  account.adoptionCategory
                );

                return (
                  <div
                    key={account.id}
                    onClick={() => setInspectingAccount(account)}
                    className="p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition cursor-pointer flex flex-col justify-between shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-semibold text-xs text-slate-900 truncate">
                          {account.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                          {account.sector.split(' ')[0]}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-2 truncate">
                        Owner: {account.owners.sales} · Stance: {account.winningStance}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Account Value:</span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {formatCurrencyValue(accVal, account.revenueCurrency, account.geography)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Account Details Modal for Stage Inspector */}
      {inspectingAccount && (
        <AccountDetailModal
          account={inspectingAccount}
          onClose={() => setInspectingAccount(null)}
          onOpenAudit={() => {}}
        />
      )}
    </div>
  );
};
