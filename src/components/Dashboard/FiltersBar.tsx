import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Geography,
  ProcurementType,
  ProductFamily,
  Sector,
} from '../../types/crm';
import { Filter, X, ChevronDown, RotateCcw } from 'lucide-react';

export const FiltersBar: React.FC = () => {
  const { filters, setFilters, resetFilters, scopedAccounts, isPartnerMode } = useCrm();
  const [expanded, setExpanded] = useState(false);

  // Available unique lists derived from seed/state
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

  const partnerOptions = Array.from(
    new Set(scopedAccounts.flatMap((a) => a.partners))
  ).sort();

  const salesOwners = Array.from(new Set(scopedAccounts.map((a) => a.owners.sales)));
  const preSalesOwners = Array.from(new Set(scopedAccounts.map((a) => a.owners.preSales)));
  const solutionEngineers = Array.from(
    new Set(scopedAccounts.map((a) => a.owners.solutionEngineer))
  );

  const procurementOptions: ProcurementType[] = [
    'Direct Opportunity',
    'Open RFP',
    'Closed RFP',
  ];

  // Helper toggle functions
  const toggleGeography = (geo: Geography) => {
    setFilters((prev) => ({
      ...prev,
      geographies: prev.geographies.includes(geo)
        ? prev.geographies.filter((g) => g !== geo)
        : [...prev.geographies, geo],
    }));
  };

  const toggleSector = (sec: Sector) => {
    setFilters((prev) => ({
      ...prev,
      sectors: prev.sectors.includes(sec)
        ? prev.sectors.filter((s) => s !== sec)
        : [...prev.sectors, sec],
    }));
  };

  const toggleProcurement = (proc: ProcurementType) => {
    setFilters((prev) => ({
      ...prev,
      procurementTypes: prev.procurementTypes.includes(proc)
        ? prev.procurementTypes.filter((p) => p !== proc)
        : [...prev.procurementTypes, proc],
    }));
  };

  const togglePartner = (partner: string) => {
    setFilters((prev) => ({
      ...prev,
      partners: prev.partners.includes(partner)
        ? prev.partners.filter((p) => p !== partner)
        : [...prev.partners, partner],
    }));
  };

  const activeFiltersCount =
    filters.geographies.length +
    filters.sectors.length +
    (filters.productFamily ? 1 : 0) +
    filters.products.length +
    filters.partners.length +
    filters.salesOwners.length +
    filters.preSalesOwners.length +
    filters.solutionEngineers.length +
    filters.procurementTypes.length +
    (filters.publicPrivate ? 1 : 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      {/* Top summary row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-slate-800 text-sm">Pipeline Filters</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              {activeFiltersCount} Active
            </span>
          )}
          <span className="text-xs text-slate-400 font-normal">
            (FY 2026-27 to date default: Apr 1 - Today)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
          >
            <span>{expanded ? 'Collapse Filters' : 'Filter Options'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded Multi-select controls */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Geography */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              Geography (India & Global)
            </label>
            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {geographyOptions.map((geo) => (
                <label key={geo} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.geographies.includes(geo)}
                    onChange={() => toggleGeography(geo)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>{geo}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sector */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              Target Industry Sector
            </label>
            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {sectorOptions.map((sec) => (
                <label key={sec} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.sectors.includes(sec)}
                    onChange={() => toggleSector(sec)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>{sec}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Product Family & Cascading Product */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              Product Family & Products
            </label>
            <select
              value={filters.productFamily || ''}
              onChange={(e) => {
                const val = e.target.value as ProductFamily | '';
                setFilters((prev) => ({
                  ...prev,
                  productFamily: val ? val : undefined,
                  products: [],
                }));
              }}
              className="w-full px-2 py-1.5 rounded border border-slate-300 text-xs text-slate-800 mb-2 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Product Families</option>
              {productFamilyOptions.map((pf) => (
                <option key={pf} value={pf}>
                  {pf}
                </option>
              ))}
            </select>

            {filters.productFamily && (
              <div className="space-y-1 max-h-24 overflow-y-auto pr-1 bg-slate-50 p-1.5 rounded border border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">
                  Cascading Products:
                </div>
                {productCatalogue[filters.productFamily].map((prod) => (
                  <label key={prod} className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.products.includes(prod)}
                      onChange={() => {
                        setFilters((prev) => ({
                          ...prev,
                          products: prev.products.includes(prod)
                            ? prev.products.filter((p) => p !== prod)
                            : [...prev.products, prod],
                        }));
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>{prod}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Procurement & Partners */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              Procurement Process
            </label>
            <div className="space-y-1 mb-3">
              {procurementOptions.map((proc) => (
                <label key={proc} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.procurementTypes.includes(proc)}
                    onChange={() => toggleProcurement(proc)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>{proc}</span>
                </label>
              ))}
            </div>

            {!isPartnerMode && partnerOptions.length > 0 && (
              <>
                <label className="font-bold text-slate-700 block mb-1">Partner Tag</label>
                <div className="space-y-1 max-h-20 overflow-y-auto pr-1">
                  {partnerOptions.map((p) => (
                    <label key={p} className="flex items-center gap-2 text-[11px] text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.partners.includes(p)}
                        onChange={() => togglePartner(p)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>{p}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
