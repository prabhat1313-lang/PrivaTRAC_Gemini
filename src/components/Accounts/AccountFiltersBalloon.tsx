import React, { useState, useRef, useEffect } from 'react';
import {
  Account,
  AccountStage,
  AdoptionCategory,
  Geography,
  ProcurementType,
  ProductFamily,
  Sector,
  WinningStance,
} from '../../types/crm';
import {
  Filter,
  X,
  RotateCcw,
  Check,
  Building2,
  Globe,
  Layers,
  Users,
  ShieldCheck,
  Cpu,
  AlertTriangle,
  Briefcase,
  ChevronRight,
} from 'lucide-react';

export interface AccountFilterState {
  stages: AccountStage[];
  publicPrivate: 'all' | 'Public' | 'Private';
  geographies: Geography[];
  sectors: Sector[];
  productFamily: ProductFamily | 'all';
  products: string[];
  procurementTypes: ProcurementType[];
  partners: string[];
  salesOwners: string[];
  preSalesOwners: string[];
  solutionEngineers: string[];
  adoptionCategories: AdoptionCategory[];
  winningStances: WinningStance[];
  petsOnly: boolean;
  responsibleAiOnly: boolean;
  staleOnly: boolean;
}

export const initialAccountFilterState: AccountFilterState = {
  stages: [],
  publicPrivate: 'all',
  geographies: [],
  sectors: [],
  productFamily: 'all',
  products: [],
  procurementTypes: [],
  partners: [],
  salesOwners: [],
  preSalesOwners: [],
  solutionEngineers: [],
  adoptionCategories: [],
  winningStances: [],
  petsOnly: false,
  responsibleAiOnly: false,
  staleOnly: false,
};

interface AccountFiltersBalloonProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AccountFilterState;
  onFiltersChange: React.Dispatch<React.SetStateAction<AccountFilterState>>;
  onReset: () => void;
  accounts: Account[];
  isPartnerMode?: boolean;
}

export const AccountFiltersBalloon: React.FC<AccountFiltersBalloonProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onReset,
  accounts,
  isPartnerMode = false,
}) => {
  const balloonRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'stage' | 'territory' | 'product' | 'owners'>('stage');

  // Close on outside click
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (
        isOpen &&
        balloonRef.current &&
        !balloonRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Options catalogs
  const stageOptions: AccountStage[] = [
    'New Account',
    'Nurturing',
    'Mature',
    'Critical',
    'Closed Won',
    'Closed Lost',
  ];

  const geographyOptions: Geography[] = [
    'India (North)',
    'India (South)',
    'India (West)',
    'India (East)',
    'Singapore & APAC',
    'United States',
    'United Kingdom & EU',
    'Middle East',
  ];

  const sectorOptions: Sector[] = [
    'Banking & Financial Services',
    'Healthcare & Life Sciences',
    'Telecommunications',
    'E-commerce & Retail',
    'Government & Public Sector',
    'Automotive & IoT',
  ];

  const productFamilyOptions: ProductFamily[] = [
    'Privacy Enhancing Technologies (PETs)',
    'Responsible AI & Governance',
    'Data Anonymization Suite',
    'PrivacyGRC Core Suite',
  ];

  const productCatalogue: Record<ProductFamily, string[]> = {
    'Privacy Enhancing Technologies (PETs)': [
      'PrivaSapien Anonymizer Pro & PETs Core',
      'Consentium Bridge & CBAC Engine',
      'Zero-Knowledge Proof Verifier',
    ],
    'Responsible AI & Governance': [
      'AI Bias & Fairness Auditor (ISO 42001)',
      'Algorithmic Risk Scorecard',
      'LLM Safety Guardrail Firewall',
    ],
    'Data Anonymization Suite': [
      'Synthetic Data Studio & HIPAA Anonymizer',
      'Differential Privacy SQL Proxy',
      'Telecom Subscriber De-Identifier',
    ],
    'PrivacyGRC Core Suite': [
      'DPIA & Privacy Impact Assessments',
      'RoPA Data Mapping & Asset Inventory',
      'Consent & Notice Manager',
      'DSAR Subject Rights Portal',
    ],
  };

  const procurementOptions: ProcurementType[] = [
    'Direct Opportunity',
    'Open RFP',
    'Closed RFP',
  ];

  const adoptionCategoryOptions: AdoptionCategory[] = [
    'Innovator',
    'Early Adopter',
    'Early Majority',
    'Late Majority',
    'Laggard',
  ];

  const winningStanceOptions: WinningStance[] = [
    'Won/PO Received',
    'Under PO Negotiations',
    'Customer Prefers Us',
    'All are Equal',
    'Initial Stages',
    'Low Chance',
    'Lost/Not Started',
  ];

  const partnerOptions = Array.from(
    new Set(accounts.flatMap((a) => a.partners))
  ).sort();

  const salesOwners = Array.from(new Set(accounts.map((a) => a.owners.sales))).sort();
  const preSalesOwners = Array.from(new Set(accounts.map((a) => a.owners.preSales))).sort();
  const solutionEngineers = Array.from(
    new Set(accounts.map((a) => a.owners.solutionEngineer))
  ).sort();

  // Helper toggle functions
  const toggleStage = (stage: AccountStage) => {
    onFiltersChange((prev) => ({
      ...prev,
      stages: prev.stages.includes(stage)
        ? prev.stages.filter((s) => s !== stage)
        : [...prev.stages, stage],
    }));
  };

  const toggleGeography = (geo: Geography) => {
    onFiltersChange((prev) => ({
      ...prev,
      geographies: prev.geographies.includes(geo)
        ? prev.geographies.filter((g) => g !== geo)
        : [...prev.geographies, geo],
    }));
  };

  const toggleSector = (sec: Sector) => {
    onFiltersChange((prev) => ({
      ...prev,
      sectors: prev.sectors.includes(sec)
        ? prev.sectors.filter((s) => s !== sec)
        : [...prev.sectors, sec],
    }));
  };

  const toggleProduct = (prod: string) => {
    onFiltersChange((prev) => ({
      ...prev,
      products: prev.products.includes(prod)
        ? prev.products.filter((p) => p !== prod)
        : [...prev.products, prod],
    }));
  };

  const toggleProcurement = (proc: ProcurementType) => {
    onFiltersChange((prev) => ({
      ...prev,
      procurementTypes: prev.procurementTypes.includes(proc)
        ? prev.procurementTypes.filter((p) => p !== proc)
        : [...prev.procurementTypes, proc],
    }));
  };

  const togglePartner = (partner: string) => {
    onFiltersChange((prev) => ({
      ...prev,
      partners: prev.partners.includes(partner)
        ? prev.partners.filter((p) => p !== partner)
        : [...prev.partners, partner],
    }));
  };

  const toggleSalesOwner = (owner: string) => {
    onFiltersChange((prev) => ({
      ...prev,
      salesOwners: prev.salesOwners.includes(owner)
        ? prev.salesOwners.filter((o) => o !== owner)
        : [...prev.salesOwners, owner],
    }));
  };

  const togglePreSalesOwner = (owner: string) => {
    onFiltersChange((prev) => ({
      ...prev,
      preSalesOwners: prev.preSalesOwners.includes(owner)
        ? prev.preSalesOwners.filter((o) => o !== owner)
        : [...prev.preSalesOwners, owner],
    }));
  };

  const toggleSolutionEngineer = (eng: string) => {
    onFiltersChange((prev) => ({
      ...prev,
      solutionEngineers: prev.solutionEngineers.includes(eng)
        ? prev.solutionEngineers.filter((e) => e !== eng)
        : [...prev.solutionEngineers, eng],
    }));
  };

  const toggleAdoptionCategory = (cat: AdoptionCategory) => {
    onFiltersChange((prev) => ({
      ...prev,
      adoptionCategories: prev.adoptionCategories.includes(cat)
        ? prev.adoptionCategories.filter((c) => c !== cat)
        : [...prev.adoptionCategories, cat],
    }));
  };

  const toggleWinningStance = (stance: WinningStance) => {
    onFiltersChange((prev) => ({
      ...prev,
      winningStances: prev.winningStances.includes(stance)
        ? prev.winningStances.filter((s) => s !== stance)
        : [...prev.winningStances, stance],
    }));
  };

  // Active counts per category
  const stageTabCount =
    filters.stages.length +
    (filters.publicPrivate !== 'all' ? 1 : 0) +
    (filters.staleOnly ? 1 : 0);

  const territoryTabCount = filters.geographies.length + filters.sectors.length;

  const productTabCount =
    (filters.productFamily !== 'all' ? 1 : 0) +
    filters.products.length +
    (filters.petsOnly ? 1 : 0) +
    (filters.responsibleAiOnly ? 1 : 0) +
    filters.adoptionCategories.length;

  const ownersTabCount =
    filters.salesOwners.length +
    filters.preSalesOwners.length +
    filters.solutionEngineers.length +
    filters.procurementTypes.length +
    filters.partners.length +
    filters.winningStances.length;

  const totalActiveCount =
    stageTabCount + territoryTabCount + productTabCount + ownersTabCount;

  return (
    <div
      ref={balloonRef}
      className="absolute right-0 top-full mt-2.5 z-50 w-[580px] sm:w-[680px] max-w-[94vw] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      style={{ filter: 'drop-shadow(0 20px 25px rgba(15, 23, 42, 0.15))' }}
    >
      {/* Balloon pointer/triangle pointing up */}
      <div className="absolute -top-2 right-8 w-4 h-4 bg-white border-t border-l border-slate-200 rotate-45 transform pointer-events-none" />

      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-200">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Account Filters</h3>
              {totalActiveCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500 text-white">
                  {totalActiveCount} active
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Pipeline-level multi-dimensional filters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {totalActiveCount > 0 && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50 px-2 pt-2 gap-1 text-xs font-medium">
        <button
          onClick={() => setActiveTab('stage')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition border-b-2 -mb-px ${
            activeTab === 'stage'
              ? 'bg-white text-slate-900 border-slate-900 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 border-transparent'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Stage & Type</span>
          {stageTabCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">
              {stageTabCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('territory')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition border-b-2 -mb-px ${
            activeTab === 'territory'
              ? 'bg-white text-slate-900 border-slate-900 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 border-transparent'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Territory & Sector</span>
          {territoryTabCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">
              {territoryTabCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('product')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition border-b-2 -mb-px ${
            activeTab === 'product'
              ? 'bg-white text-slate-900 border-slate-900 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 border-transparent'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Products & Tech</span>
          {productTabCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">
              {productTabCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('owners')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition border-b-2 -mb-px ${
            activeTab === 'owners'
              ? 'bg-white text-slate-900 border-slate-900 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 border-transparent'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Owners & Process</span>
          {ownersTabCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">
              {ownersTabCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab Body */}
      <div className="p-5 max-h-[420px] overflow-y-auto text-xs space-y-4">
        {/* TAB 1: Stage & Type */}
        {activeTab === 'stage' && (
          <div className="space-y-4">
            {/* Account Type Selector (Public vs Private) */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="font-bold text-slate-800 block mb-1.5">
                Account Classification (Public vs Private)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'all', label: 'All Account Types' },
                  { value: 'Private', label: 'Private Enterprise' },
                  { value: 'Public', label: 'Public Sector' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      onFiltersChange((prev) => ({
                        ...prev,
                        publicPrivate: item.value as 'all' | 'Public' | 'Private',
                      }))
                    }
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition text-center ${
                      filters.publicPrivate === item.value
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stages Multi-Select */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-bold text-slate-800">
                  Account Pipeline Stages
                </label>
                {filters.stages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onFiltersChange((prev) => ({ ...prev, stages: [] }))}
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                  >
                    Clear stages
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {stageOptions.map((stg) => {
                  const isSelected = filters.stages.includes(stg);
                  const count = accounts.filter((a) => a.stage === stg).length;
                  return (
                    <button
                      key={stg}
                      type="button"
                      onClick={() => toggleStage(stg)}
                      className={`p-2 rounded-lg border text-left flex items-center justify-between transition ${
                        isSelected
                          ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <div
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <span className="truncate">{stg}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal ml-1">
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Health & Stale Toggle */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <div>
                  <div className="font-bold text-slate-800">Stale Accounts Only</div>
                  <div className="text-[11px] text-slate-500">
                    Accounts with no engagement logged in &gt; 14 days
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.staleOnly}
                  onChange={(e) =>
                    onFiltersChange((prev) => ({
                      ...prev,
                      staleOnly: e.target.checked,
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
              </label>
            </div>
          </div>
        )}

        {/* TAB 2: Territory & Sector */}
        {activeTab === 'territory' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Geography */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800">
                  Geography (India & Global)
                </label>
                {filters.geographies.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      onFiltersChange((prev) => ({ ...prev, geographies: [] }))
                    }
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                  >
                    Clear ({filters.geographies.length})
                  </button>
                )}
              </div>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 border border-slate-200 rounded-lg p-2 bg-slate-50/50">
                {geographyOptions.map((geo) => {
                  const isChecked = filters.geographies.includes(geo);
                  const count = accounts.filter((a) => a.geography === geo).length;
                  return (
                    <label
                      key={geo}
                      className="flex items-center justify-between gap-2 p-1.5 rounded hover:bg-white text-slate-700 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleGeography(geo)}
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                        />
                        <span className="truncate">{geo}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({count})
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Sector / Industry */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800">
                  Industry Sector
                </label>
                {filters.sectors.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      onFiltersChange((prev) => ({ ...prev, sectors: [] }))
                    }
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                  >
                    Clear ({filters.sectors.length})
                  </button>
                )}
              </div>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 border border-slate-200 rounded-lg p-2 bg-slate-50/50">
                {sectorOptions.map((sec) => {
                  const isChecked = filters.sectors.includes(sec);
                  const count = accounts.filter((a) => a.sector === sec).length;
                  return (
                    <label
                      key={sec}
                      className="flex items-center justify-between gap-2 p-1.5 rounded hover:bg-white text-slate-700 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSector(sec)}
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                        />
                        <span className="truncate">{sec}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({count})
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Products & Tech */}
        {activeTab === 'product' && (
          <div className="space-y-4">
            {/* Product Family & Products */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Product Family
                </label>
                <select
                  value={filters.productFamily}
                  onChange={(e) => {
                    const val = e.target.value as ProductFamily | 'all';
                    onFiltersChange((prev) => ({
                      ...prev,
                      productFamily: val,
                      products: [],
                    }));
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 font-medium"
                >
                  <option value="all">All Product Families</option>
                  {productFamilyOptions.map((pf) => (
                    <option key={pf} value={pf}>
                      {pf}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specific Cascading Products */}
              {filters.productFamily !== 'all' && (
                <div className="border-t border-slate-200 pt-2.5">
                  <div className="text-[11px] font-semibold text-slate-700 mb-1.5">
                    Specific Products under {filters.productFamily}:
                  </div>
                  <div className="space-y-1.5 bg-white p-2 rounded-lg border border-slate-200">
                    {productCatalogue[filters.productFamily]?.map((prod) => {
                      const isChecked = filters.products.includes(prod);
                      return (
                        <label
                          key={prod}
                          className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleProduct(prod)}
                            className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                          />
                          <span>{prod}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Technology Capability Flags */}
            <div>
              <label className="font-bold text-slate-800 block mb-2">
                Technology Flags
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
                    filters.petsOnly
                      ? 'bg-blue-50 border-blue-300 text-blue-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={filters.petsOnly}
                    onChange={(e) =>
                      onFiltersChange((prev) => ({
                        ...prev,
                        petsOnly: e.target.checked,
                      }))
                    }
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      PETs Enabled Only
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Privacy-Enhancing Technologies deployed
                    </div>
                  </div>
                </label>

                <label
                  className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
                    filters.responsibleAiOnly
                      ? 'bg-purple-50 border-purple-300 text-purple-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={filters.responsibleAiOnly}
                    onChange={(e) =>
                      onFiltersChange((prev) => ({
                        ...prev,
                        responsibleAiOnly: e.target.checked,
                      }))
                    }
                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <div className="font-semibold flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-purple-600" />
                      Resp-AI Enabled Only
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Responsible AI & Governance features
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Adoption Category */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-800">
                  Adoption Curve Category
                </label>
                {filters.adoptionCategories.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      onFiltersChange((prev) => ({ ...prev, adoptionCategories: [] }))
                    }
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {adoptionCategoryOptions.map((cat) => {
                  const isChecked = filters.adoptionCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleAdoptionCategory(cat)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition ${
                        isChecked
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Owners & Process */}
        {activeTab === 'owners' && (
          <div className="space-y-4">
            {/* Sales Owners */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800">
                    Sales Owner
                  </label>
                  {filters.salesOwners.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        onFiltersChange((prev) => ({ ...prev, salesOwners: [] }))
                      }
                      className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1 border border-slate-200 rounded-lg p-2 bg-slate-50/50">
                  {salesOwners.map((owner) => (
                    <label
                      key={owner}
                      className="flex items-center gap-2 text-slate-700 cursor-pointer p-1 rounded hover:bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={filters.salesOwners.includes(owner)}
                        onChange={() => toggleSalesOwner(owner)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                      />
                      <span className="truncate">{owner}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Pre-Sales & Solution Engineer */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800">
                    Pre-Sales / Solution Engineer
                  </label>
                  {(filters.preSalesOwners.length > 0 ||
                    filters.solutionEngineers.length > 0) && (
                    <button
                      type="button"
                      onClick={() =>
                        onFiltersChange((prev) => ({
                          ...prev,
                          preSalesOwners: [],
                          solutionEngineers: [],
                        }))
                      }
                      className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1 border border-slate-200 rounded-lg p-2 bg-slate-50/50">
                  <div className="text-[10px] uppercase font-bold text-slate-400 px-1 pt-1">
                    Pre-Sales
                  </div>
                  {preSalesOwners.map((owner) => (
                    <label
                      key={`ps-${owner}`}
                      className="flex items-center gap-2 text-slate-700 cursor-pointer p-1 rounded hover:bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={filters.preSalesOwners.includes(owner)}
                        onChange={() => togglePreSalesOwner(owner)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                      />
                      <span className="truncate">{owner}</span>
                    </label>
                  ))}
                  <div className="text-[10px] uppercase font-bold text-slate-400 px-1 pt-1 border-t border-slate-200 mt-1">
                    Solution Engineers
                  </div>
                  {solutionEngineers.map((eng) => (
                    <label
                      key={`se-${eng}`}
                      className="flex items-center gap-2 text-slate-700 cursor-pointer p-1 rounded hover:bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={filters.solutionEngineers.includes(eng)}
                        onChange={() => toggleSolutionEngineer(eng)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                      />
                      <span className="truncate">{eng}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Procurement Process */}
            <div>
              <label className="font-bold text-slate-800 block mb-1.5">
                Procurement Route
              </label>
              <div className="grid grid-cols-3 gap-2">
                {procurementOptions.map((proc) => {
                  const isChecked = filters.procurementTypes.includes(proc);
                  return (
                    <button
                      key={proc}
                      type="button"
                      onClick={() => toggleProcurement(proc)}
                      className={`p-2 rounded-lg text-xs font-medium border text-center transition ${
                        isChecked
                          ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {proc}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Partner SI Tags */}
            {!isPartnerMode && partnerOptions.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800">
                    Partner SI Ecosystem
                  </label>
                  {filters.partners.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        onFiltersChange((prev) => ({ ...prev, partners: [] }))
                      }
                      className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1.5 border border-slate-200 rounded-lg bg-slate-50/50">
                  {partnerOptions.map((p) => {
                    const isChecked = filters.partners.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePartner(p)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition ${
                          isChecked
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <div className="text-xs text-slate-600">
          {totalActiveCount === 0 ? (
            <span>No filters currently applied</span>
          ) : (
            <span className="font-semibold text-slate-900">
              {totalActiveCount} filter{totalActiveCount === 1 ? '' : 's'} active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {totalActiveCount > 0 && (
            <button
              onClick={onReset}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Clear All
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
