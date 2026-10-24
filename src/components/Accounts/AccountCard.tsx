import React, { useState } from 'react';
import { Account } from '../../types/crm';
import { useCrm } from '../../context/CrmContext';
import { AccountUpdateJourneyModal } from './AccountUpdateJourneyModal';
import {
  calculateAccountValue,
  calculateDealValue,
  formatCurrencyValue,
  getAdoptionCategoryBadgeStyle,
  getAdoptionMultiplier,
} from '../../utils/calculations';
import {
  Sparkles,
  ShieldCheck,
  Cpu,
  History,
  AlertTriangle,
  User,
  Handshake,
} from 'lucide-react';

interface AccountCardProps {
  account: Account;
  onSelect: (account: Account) => void;
  onOpenAudit: (account: Account) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onSelect,
  onOpenAudit,
}) => {
  const { currentUser } = useCrm();
  const isPartnerUser = currentUser.role === 'Partner';
  const [isJourneyOpen, setIsJourneyOpen] = useState(false);

  const dealValue = calculateDealValue(account.annualRevenue, account.dealValueOverride);
  const accountValue = calculateAccountValue(
    dealValue,
    account.winningStance,
    account.adoptionCategory
  );
  const adoptionBadge = getAdoptionCategoryBadgeStyle(account.adoptionCategory);
  const adoptionMult = getAdoptionMultiplier(account.adoptionCategory);

  const hasAiFields = Object.keys(account.aiEnrichedFields).length > 0;

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'Critical':
        return 'bg-amber-50 text-amber-800 border-amber-200/70';
      case 'Closed Won':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200/70';
      case 'Closed Lost':
        return 'bg-rose-50 text-rose-800 border-rose-200/70';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      onClick={() => onSelect(account)}
      className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition cursor-pointer relative group flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-slate-800 text-white flex items-center justify-center font-semibold text-xs">
              {account.logoText}
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm group-hover:text-slate-700 transition truncate max-w-[170px]">
                {account.name}
              </h4>
              <p className="text-[11px] text-slate-500 truncate max-w-[170px]">
                {account.sector}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getStageBadge(account.stage)}`}>
              {account.stage}
            </span>

            {account.isStale && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200/60 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-500" />
                Stale
              </span>
            )}
          </div>
        </div>

        {/* AI Enriched banner */}
        {hasAiFields && (
          <div className="mb-3 px-2 py-1 rounded bg-slate-50 border border-slate-200 text-[10px] text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3 text-slate-500" />
              AI Enriched
            </span>
            <span className="text-slate-500 font-medium">
              {Object.keys(account.aiEnrichedFields).length} fields
            </span>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {account.petsFlag && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <ShieldCheck className="w-3 h-3 text-slate-500" />
              PETs
            </span>
          )}
          {account.responsibleAiFlag && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <Cpu className="w-3 h-3 text-slate-500" />
              Resp-AI
            </span>
          )}
          <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-500 bg-slate-50 border border-slate-200">
            {account.geography}
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
              account.publicPrivate === 'Public'
                ? 'bg-blue-50 text-blue-700 border-blue-200/60'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
            }`}
          >
            {account.publicPrivate || 'Private'}
          </span>
        </div>

        {/* Partner SI Tags (Internal PrivaSapien frontend item - hidden in Partner mode) */}
        {!isPartnerUser && account.partners && account.partners.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            {account.partners.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                title={`Partner SI: ${p}`}
              >
                <Handshake className="w-2.5 h-2.5 text-slate-500" />
                <span className="truncate max-w-[130px]">{p}</span>
              </span>
            ))}
          </div>
        )}

        {/* Value Box */}
        <div className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-200 mb-3 text-xs space-y-1">
          <div className="flex justify-between items-center text-slate-500">
            <span>Winning Stance:</span>
            <span className="font-medium text-slate-800">{account.winningStance}</span>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span>Adoption:</span>
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${adoptionBadge.bg} ${adoptionBadge.text} ${adoptionBadge.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${adoptionBadge.dot}`} />
              {account.adoptionCategory} ({adoptionMult}×)
            </span>
          </div>
          <div className="pt-1 border-t border-slate-200/80 flex justify-between items-center">
            <span className="text-slate-600 font-medium">Account Value:</span>
            <span className="text-slate-900 font-bold tabular-nums">
              {formatCurrencyValue(accountValue, account.revenueCurrency, account.geography)}
            </span>
          </div>
        </div>

        {/* Completion Progress Bar */}
        <div className="mb-2">
          <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
            <span className="flex items-center gap-1">
              <span>Profile Completion</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsJourneyOpen(true);
                }}
                className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                title="Launch guided account profile update journey"
              >
                · Complete Journey →
              </button>
            </span>
            <span className="tabular-nums font-semibold text-slate-700">
              {account.profileCompletion.human + account.profileCompletion.ai}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden flex">
            <div
              className="bg-slate-700 h-full transition-all duration-300"
              style={{ width: `${account.profileCompletion.human}%` }}
            />
            <div
              className="bg-indigo-500 h-full transition-all duration-300"
              style={{ width: `${account.profileCompletion.ai}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5 truncate max-w-[180px]">
          <User className="w-3 h-3 text-slate-400" />
          <span className="truncate">{account.owners.sales}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenAudit(account);
          }}
          className="text-slate-400 hover:text-slate-600 flex items-center gap-1 transition"
          title="Inspect Field Audit Trail"
        >
          <History className="w-3.5 h-3.5" />
          <span className="text-[10px] tabular-nums">{account.fieldAuditTrail.length}</span>
        </button>
      </div>

      {/* Guided Account Profile Completion Journey */}
      {isJourneyOpen && (
        <AccountUpdateJourneyModal
          account={account}
          isOpen={isJourneyOpen}
          onClose={() => setIsJourneyOpen(false)}
        />
      )}
    </div>
  );
};
