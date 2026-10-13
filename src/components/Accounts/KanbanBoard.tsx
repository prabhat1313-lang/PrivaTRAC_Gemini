import React from 'react';
import { Account, AccountStage } from '../../types/crm';
import { useCrm } from '../../context/CrmContext';
import {
  calculateAccountValue,
  calculateDealValue,
  formatCurrencyValue,
} from '../../utils/calculations';
import { AccountCard } from './AccountCard';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface KanbanBoardProps {
  accounts: Account[];
  onSelectAccount: (account: Account) => void;
  onOpenAudit: (account: Account) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  accounts,
  onSelectAccount,
  onOpenAudit,
}) => {
  const { updateAccount } = useCrm();

  const stages: { stage: AccountStage; label: string; headerColor: string }[] = [
    { stage: 'New Account', label: 'New Account', headerColor: 'text-slate-800' },
    { stage: 'Nurturing', label: 'Nurturing', headerColor: 'text-slate-800' },
    { stage: 'Mature', label: 'Mature', headerColor: 'text-slate-800' },
    { stage: 'Critical', label: 'Critical', headerColor: 'text-amber-900' },
    { stage: 'Closed Won', label: 'Closed Won', headerColor: 'text-emerald-900' },
    { stage: 'Closed Lost', label: 'Closed Lost', headerColor: 'text-slate-700' },
  ];

  const stageOrder: AccountStage[] = [
    'New Account',
    'Nurturing',
    'Mature',
    'Critical',
    'Closed Won',
    'Closed Lost',
  ];

  const moveStage = (account: Account, direction: 'prev' | 'next') => {
    const currentIndex = stageOrder.indexOf(account.stage);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (newIndex >= 0 && newIndex < stageOrder.length) {
      const newStage = stageOrder[newIndex];
      updateAccount(
        { ...account, stage: newStage },
        'Stage',
        account.stage,
        newStage
      );
    }
  };

  return (
    <div className="overflow-x-auto pb-6">
      <div className="flex gap-4 min-w-[1280px]">
        {stages.map(({ stage, label, headerColor }) => {
          const stageAccounts = accounts.filter((a) => a.stage === stage);
          const totalValINR = stageAccounts.reduce((sum, a) => {
            const dv = calculateDealValue(a.annualRevenue, a.dealValueOverride);
            const av = calculateAccountValue(dv, a.winningStance, a.adoptionCategory);
            return sum + av;
          }, 0);

          return (
            <div
              key={stage}
              className="flex-1 bg-slate-50/70 rounded-xl border border-slate-200 flex flex-col max-h-[750px]"
            >
              {/* Column Header */}
              <div className="p-3 bg-white rounded-t-xl border-b border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold ${headerColor}`}>
                    {label}
                  </span>
                  <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center tabular-nums">
                    {stageAccounts.length}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between mt-1 pt-1 border-t border-slate-100">
                  <span>Stage Total:</span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    {formatCurrencyValue(totalValINR, 'INR')}
                  </span>
                </div>
              </div>

              {/* Column Content Cards */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1">
                {stageAccounts.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 font-normal">
                    No accounts in stage
                  </div>
                ) : (
                  stageAccounts.map((account) => (
                    <div key={account.id} className="relative group">
                      <AccountCard
                        account={account}
                        onSelect={onSelectAccount}
                        onOpenAudit={onOpenAudit}
                      />

                      {/* Quick stage transition buttons */}
                      <div className="mt-1 flex justify-between items-center px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveStage(account, 'prev');
                          }}
                          disabled={account.stage === 'New Account'}
                          className="px-2 py-0.5 rounded bg-white text-slate-600 hover:text-slate-900 text-[10px] font-medium border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-0.5 shadow-2xs"
                        >
                          <ChevronLeft className="w-3 h-3" /> Prev
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveStage(account, 'next');
                          }}
                          disabled={account.stage === 'Closed Won' || account.stage === 'Closed Lost'}
                          className="px-2 py-0.5 rounded bg-white text-slate-600 hover:text-slate-900 text-[10px] font-medium border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-0.5 shadow-2xs"
                        >
                          Next <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
