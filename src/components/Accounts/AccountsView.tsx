import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Account } from '../../types/crm';
import { AccountCard } from './AccountCard';
import { KanbanBoard } from './KanbanBoard';
import { AccountDetailModal } from './AccountDetailModal';
import { AddAccountModal } from './AddAccountModal';
import { AuditTrailModal } from './AuditTrailModal';
import {
  LayoutGrid,
  Kanban,
  Search,
  Plus,
  Building2,
} from 'lucide-react';

export const AccountsView: React.FC = () => {
  const { filteredAccounts, currentUser } = useCrm();

  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');

  const [activeAccount, setActiveAccount] = useState<Account | null>(null);
  const [auditAccount, setAuditAccount] = useState<Account | null>(null);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

  // Search and quick filter
  const displayedAccounts = useMemo(() => {
    return filteredAccounts.filter((acc) => {
      if (selectedStage !== 'all' && acc.stage !== selectedStage) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          acc.name.toLowerCase().includes(q) ||
          acc.sector.toLowerCase().includes(q) ||
          acc.product.toLowerCase().includes(q) ||
          acc.owners.sales.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [filteredAccounts, searchQuery, selectedStage]);

  return (
    <div className="space-y-5">
      {/* Search & Actions Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search accounts by name, sector, product or sales owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
          />
        </div>

        {/* Right Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Stage Quick Filter */}
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="all">All Stages ({filteredAccounts.length})</option>
            <option value="New Account">New Account</option>
            <option value="Nurturing">Nurturing</option>
            <option value="Mature">Mature</option>
            <option value="Critical">Critical</option>
            <option value="Closed Won">Closed Won</option>
            <option value="Closed Lost">Closed Lost</option>
          </select>

          {/* Grid vs Kanban Toggle */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          {/* Add Account Button */}
          {currentUser.role !== 'Partner' && (
            <button
              onClick={() => setIsAddAccountOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Account</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content View (Grid or Kanban) */}
      {viewMode === 'grid' ? (
        displayedAccounts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="font-semibold text-slate-800 text-sm">No Accounts Found</h4>
            <p className="text-xs text-slate-500 mt-1">
              No accounts match the active search or role visibility filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayedAccounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onSelect={(acc) => setActiveAccount(acc)}
                onOpenAudit={(acc) => setAuditAccount(acc)}
              />
            ))}
          </div>
        )
      ) : (
        <KanbanBoard
          accounts={displayedAccounts}
          onSelectAccount={(acc) => setActiveAccount(acc)}
          onOpenAudit={(acc) => setAuditAccount(acc)}
        />
      )}

      {/* Modals */}
      {activeAccount && (
        <AccountDetailModal
          account={activeAccount}
          onClose={() => setActiveAccount(null)}
          onOpenAudit={(acc) => setAuditAccount(acc)}
        />
      )}

      {isAddAccountOpen && (
        <AddAccountModal
          onClose={() => setIsAddAccountOpen(false)}
          onSuccess={(acc) => {
            setIsAddAccountOpen(false);
            setActiveAccount(acc);
          }}
        />
      )}

      {auditAccount && (
        <AuditTrailModal
          account={auditAccount}
          onClose={() => setAuditAccount(null)}
        />
      )}
    </div>
  );
};
