import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Account } from '../../types/crm';
import { AccountCard } from './AccountCard';
import { KanbanBoard } from './KanbanBoard';
import { AccountDetailModal } from './AccountDetailModal';
import { AddAccountModal } from './AddAccountModal';
import { AuditTrailModal } from './AuditTrailModal';
import {
  AccountFiltersBalloon,
  AccountFilterState,
  initialAccountFilterState,
} from './AccountFiltersBalloon';
import {
  LayoutGrid,
  Kanban,
  Search,
  Plus,
  Building2,
  Filter,
  ChevronDown,
  X,
} from 'lucide-react';

export const AccountsView: React.FC = () => {
  const { filteredAccounts, currentUser } = useCrm();

  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterBalloonOpen, setIsFilterBalloonOpen] = useState(false);
  const [accountFilters, setAccountFilters] = useState<AccountFilterState>(
    initialAccountFilterState
  );

  const [activeAccount, setActiveAccount] = useState<Account | null>(null);
  const [auditAccount, setAuditAccount] = useState<Account | null>(null);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

  // Active filters count calculation
  const activeFiltersCount =
    accountFilters.stages.length +
    (accountFilters.publicPrivate !== 'all' ? 1 : 0) +
    accountFilters.geographies.length +
    accountFilters.sectors.length +
    (accountFilters.productFamily !== 'all' ? 1 : 0) +
    accountFilters.products.length +
    accountFilters.procurementTypes.length +
    accountFilters.partners.length +
    accountFilters.salesOwners.length +
    accountFilters.preSalesOwners.length +
    accountFilters.solutionEngineers.length +
    accountFilters.adoptionCategories.length +
    accountFilters.winningStances.length +
    (accountFilters.petsOnly ? 1 : 0) +
    (accountFilters.responsibleAiOnly ? 1 : 0) +
    (accountFilters.staleOnly ? 1 : 0);

  // Search and comprehensive multi-dimensional filter
  const displayedAccounts = useMemo(() => {
    return filteredAccounts.filter((acc) => {
      // Stage filter
      if (
        accountFilters.stages.length > 0 &&
        !accountFilters.stages.includes(acc.stage)
      ) {
        return false;
      }
      // Public / Private
      if (
        accountFilters.publicPrivate !== 'all' &&
        acc.publicPrivate !== accountFilters.publicPrivate
      ) {
        return false;
      }
      // Geography
      if (
        accountFilters.geographies.length > 0 &&
        !accountFilters.geographies.includes(acc.geography)
      ) {
        return false;
      }
      // Sector
      if (
        accountFilters.sectors.length > 0 &&
        !accountFilters.sectors.includes(acc.sector)
      ) {
        return false;
      }
      // Product Family
      if (
        accountFilters.productFamily !== 'all' &&
        acc.productFamily !== accountFilters.productFamily
      ) {
        return false;
      }
      // Specific Products
      if (accountFilters.products.length > 0) {
        const hasMatch = acc.products
          ? acc.products.some((p) => accountFilters.products.includes(p))
          : accountFilters.products.includes(acc.product);
        if (!hasMatch) return false;
      }
      // Procurement Types
      if (
        accountFilters.procurementTypes.length > 0 &&
        !accountFilters.procurementTypes.includes(acc.procurementType)
      ) {
        return false;
      }
      // Partners
      if (
        accountFilters.partners.length > 0 &&
        !acc.partners.some((p) => accountFilters.partners.includes(p))
      ) {
        return false;
      }
      // Sales Owners
      if (
        accountFilters.salesOwners.length > 0 &&
        !accountFilters.salesOwners.includes(acc.owners.sales)
      ) {
        return false;
      }
      // Pre-Sales Owners
      if (
        accountFilters.preSalesOwners.length > 0 &&
        !accountFilters.preSalesOwners.includes(acc.owners.preSales)
      ) {
        return false;
      }
      // Solution Engineers
      if (
        accountFilters.solutionEngineers.length > 0 &&
        !accountFilters.solutionEngineers.includes(acc.owners.solutionEngineer)
      ) {
        return false;
      }
      // Adoption Categories
      if (
        accountFilters.adoptionCategories.length > 0 &&
        !accountFilters.adoptionCategories.includes(acc.adoptionCategory)
      ) {
        return false;
      }
      // Winning Stance
      if (
        accountFilters.winningStances.length > 0 &&
        !accountFilters.winningStances.includes(acc.winningStance)
      ) {
        return false;
      }
      // Tech flags & Stale
      if (accountFilters.petsOnly && !acc.petsFlag) return false;
      if (accountFilters.responsibleAiOnly && !acc.responsibleAiFlag) return false;
      if (accountFilters.staleOnly && !acc.isStale) return false;

      // Text search
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          acc.name.toLowerCase().includes(q) ||
          acc.sector.toLowerCase().includes(q) ||
          acc.product.toLowerCase().includes(q) ||
          acc.owners.sales.toLowerCase().includes(q) ||
          acc.owners.preSales.toLowerCase().includes(q) ||
          acc.owners.solutionEngineer.toLowerCase().includes(q) ||
          acc.geography.toLowerCase().includes(q) ||
          acc.partners.some((p) => p.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [filteredAccounts, searchQuery, accountFilters]);

  return (
    <div className="space-y-4">
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
          {/* Filters Button with Pop-up Balloon */}
          <div className="relative">
            <button
              onClick={() => setIsFilterBalloonOpen((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                activeFiltersCount > 0
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-500 text-white">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  isFilterBalloonOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Pop-up Balloon with all Account-Level Filters */}
            <AccountFiltersBalloon
              isOpen={isFilterBalloonOpen}
              onClose={() => setIsFilterBalloonOpen(false)}
              filters={accountFilters}
              onFiltersChange={setAccountFilters}
              onReset={() => setAccountFilters(initialAccountFilterState)}
              accounts={filteredAccounts}
              isPartnerMode={currentUser.role === 'Partner'}
            />
          </div>

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

      {/* Active Filter Chips Strip */}
      {activeFiltersCount > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider mr-1">
            Active Filters ({activeFiltersCount}):
          </span>

          {accountFilters.publicPrivate !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 font-medium shadow-2xs">
              <span className="text-slate-400">Type:</span> {accountFilters.publicPrivate}
              <button
                type="button"
                onClick={() =>
                  setAccountFilters((prev) => ({ ...prev, publicPrivate: 'all' }))
                }
                className="hover:text-red-600 ml-0.5 text-slate-400 hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {accountFilters.stages.map((stg) => (
            <span
              key={stg}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 font-medium shadow-2xs"
            >
              <span className="text-slate-400">Stage:</span> {stg}
              <button
                type="button"
                onClick={() =>
                  setAccountFilters((prev) => ({
                    ...prev,
                    stages: prev.stages.filter((s) => s !== stg),
                  }))
                }
                className="hover:text-red-600 ml-0.5 text-slate-400"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {accountFilters.geographies.map((geo) => (
            <span
              key={geo}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 font-medium shadow-2xs"
            >
              <span className="text-slate-400">Geo:</span> {geo}
              <button
                type="button"
                onClick={() =>
                  setAccountFilters((prev) => ({
                    ...prev,
                    geographies: prev.geographies.filter((g) => g !== geo),
                  }))
                }
                className="hover:text-red-600 ml-0.5 text-slate-400"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {accountFilters.sectors.map((sec) => (
            <span
              key={sec}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 font-medium shadow-2xs"
            >
              <span className="text-slate-400">Sector:</span> {sec}
              <button
                type="button"
                onClick={() =>
                  setAccountFilters((prev) => ({
                    ...prev,
                    sectors: prev.sectors.filter((s) => s !== sec),
                  }))
                }
                className="hover:text-red-600 ml-0.5 text-slate-400"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {accountFilters.productFamily !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 font-medium shadow-2xs">
              <span className="text-slate-400">Family:</span> {accountFilters.productFamily}
              <button
                type="button"
                onClick={() =>
                  setAccountFilters((prev) => ({
                    ...prev,
                    productFamily: 'all',
                    products: [],
                  }))
                }
                className="hover:text-red-600 ml-0.5 text-slate-400"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {accountFilters.products.map((prod) => (
            <span
              key={prod}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 font-medium shadow-2xs"
            >
              <span className="text-slate-400">Product:</span> {prod}
              <button
                type="button"
                onClick={() =>
                  setAccountFilters((prev) => ({
                    ...prev,
                    products: prev.products.filter((p) => p !== prod),
                  }))
                }
                className="hover:text-red-600 ml-0.5 text-slate-400"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {accountFilters.petsOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-800 font-medium shadow-2xs">
              PETs Only
              <button
                type="button"
                onClick={() =>
                  setAccountFilters((prev) => ({ ...prev, petsOnly: false }))
                }
                className="hover:text-red-600 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {accountFilters.responsibleAiOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 border border-purple-200 text-purple-800 font-medium shadow-2xs">
              Resp-AI Only
              <button
                type="button"
                onClick={() =>
                  setAccountFilters((prev) => ({ ...prev, responsibleAiOnly: false }))
                }
                className="hover:text-red-600 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {accountFilters.staleOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-medium shadow-2xs">
              Stale Only
              <button
                type="button"
                onClick={() =>
                  setAccountFilters((prev) => ({ ...prev, staleOnly: false }))
                }
                className="hover:text-red-600 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {accountFilters.salesOwners.map((owner) => (
            <span
              key={owner}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 font-medium shadow-2xs"
            >
              <span className="text-slate-400">Sales:</span> {owner}
              <button
                type="button"
                onClick={() =>
                  setAccountFilters((prev) => ({
                    ...prev,
                    salesOwners: prev.salesOwners.filter((o) => o !== owner),
                  }))
                }
                className="hover:text-red-600 ml-0.5 text-slate-400"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {accountFilters.procurementTypes.map((proc) => (
            <span
              key={proc}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 font-medium shadow-2xs"
            >
              <span className="text-slate-400">Route:</span> {proc}
              <button
                type="button"
                onClick={() =>
                  setAccountFilters((prev) => ({
                    ...prev,
                    procurementTypes: prev.procurementTypes.filter((p) => p !== proc),
                  }))
                }
                className="hover:text-red-600 ml-0.5 text-slate-400"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {accountFilters.partners.map((p) => (
            <span
              key={p}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 font-medium shadow-2xs"
            >
              <span className="text-slate-400">Partner:</span> {p}
              <button
                type="button"
                onClick={() =>
                  setAccountFilters((prev) => ({
                    ...prev,
                    partners: prev.partners.filter((item) => item !== p),
                  }))
                }
                className="hover:text-red-600 ml-0.5 text-slate-400"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <button
            type="button"
            onClick={() => setAccountFilters(initialAccountFilterState)}
            className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline ml-auto"
          >
            Clear All
          </button>
        </div>
      )}

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
