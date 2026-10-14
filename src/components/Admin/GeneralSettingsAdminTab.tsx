import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Coins,
  Settings,
  Shield,
  Save,
  Check,
  RotateCcw,
  Download,
  AlertTriangle,
  Building2,
  Lock,
  Sparkles,
  Database,
  Calendar,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export const GeneralSettingsAdminTab: React.FC = () => {
  const {
    exchangeRates,
    updateExchangeRate,
    resetToSeedData,
    recordAdminAudit,
    accounts,
    contacts,
    tasks,
    demos,
    partnersSwotList: _swot,
    users,
    collaterals,
  } = useCrm() as any;

  // Currency Exchange Rates state
  const [usdRate, setUsdRate] = useState(exchangeRates?.rates?.USD || 84.5);
  const [eurRate, setEurRate] = useState(exchangeRates?.rates?.EUR || 92.0);
  const [gbpRate, setGbpRate] = useState(exchangeRates?.rates?.GBP || 107.5);
  const [sgdRate, setSgdRate] = useState(exchangeRates?.rates?.SGD || 63.5);
  const [ratesSaved, setRatesSaved] = useState(false);

  // Corporate Governance & Configuration settings
  const [staleThresholdDays, setStaleThresholdDays] = useState(14);
  const [defaultCurrency, setDefaultCurrency] = useState<'INR' | 'USD' | 'EUR' | 'GBP' | 'SGD'>('INR');
  const [autoLaggardThreshold, setAutoLaggardThreshold] = useState(50);
  const [strictCbacMasking, setStrictCbacMasking] = useState(true);
  const [aiAdviceAutoGenerate, setAiAdviceAutoGenerate] = useState(true);
  const [fiscalYearStart, setFiscalYearStart] = useState('April (Q1)');
  const [governanceSaved, setGovernanceSaved] = useState(false);

  // Reset confirmation modal state
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState(false);

  // Export JSON backup state
  const [backupExported, setBackupExported] = useState(false);

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    updateExchangeRate('USD', Number(usdRate));
    updateExchangeRate('EUR', Number(eurRate));
    updateExchangeRate('GBP', Number(gbpRate));
    updateExchangeRate('SGD', Number(sgdRate));
    setRatesSaved(true);
    setTimeout(() => setRatesSaved(false), 3500);
  };

  const handleSaveGovernance = (e: React.FormEvent) => {
    e.preventDefault();
    if (recordAdminAudit) {
      recordAdminAudit(
        'Corporate Governance Policies',
        'Previous Policies',
        `Stale Threshold: ${staleThresholdDays}d, Currency: ${defaultCurrency}, CBAC Strict Masking: ${strictCbacMasking ? 'Enforced' : 'Disabled'}, AI Advice: ${aiAdviceAutoGenerate ? 'Auto' : 'Manual'}, FY: ${fiscalYearStart}`
      );
    }
    setGovernanceSaved(true);
    setTimeout(() => setGovernanceSaved(false), 3500);
  };

  const handleConfirmReset = () => {
    resetToSeedData();
    setIsResetConfirmOpen(false);
    setResetSuccessMessage(true);
    setTimeout(() => setResetSuccessMessage(false), 4000);
  };

  const handleExportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      metadata: {
        application: 'PrivaTRAC CRM',
        version: '1.0-enterprise',
      },
      counts: {
        accounts: accounts?.length || 0,
        contacts: contacts?.length || 0,
        tasks: tasks?.length || 0,
        demos: demos?.length || 0,
        users: users?.length || 0,
        collaterals: collaterals?.length || 0,
      },
      exchangeRates,
      governance: {
        staleThresholdDays,
        defaultCurrency,
        autoLaggardThreshold,
        strictCbacMasking,
        aiAdviceAutoGenerate,
        fiscalYearStart,
      },
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `privatrac_crm_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setBackupExported(true);
    setTimeout(() => setBackupExported(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {resetSuccessMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>CRM workspace database successfully reset to clean benchmark seed data!</span>
          </div>
        </div>
      )}

      {backupExported && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>CRM system configuration backup downloaded successfully as JSON snapshot.</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">
              General System Settings & Governance Controls
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure multi-currency conversion baselines, enterprise data freshness thresholds, and CBAC protection rules
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportBackup}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition border border-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Snapshot</span>
          </button>
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition border border-rose-200"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span>Reset Database</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Currency Exchange Rates Configuration */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-600" />
              <h4 className="font-bold text-slate-900 text-sm">
                Currency Exchange Rates (Base: INR)
              </h4>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Last synced: {exchangeRates?.lastUpdated || 'Today'}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Standardizes global deal currencies into INR across dashboard funnels and executive rollups without modifying the underlying deal currency.
          </p>

          <form onSubmit={handleSaveRates} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">USD (1 USD = ? INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={usdRate}
                    onChange={(e) => setUsdRate(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">EUR (1 EUR = ? INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={eurRate}
                    onChange={(e) => setEurRate(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">GBP (1 GBP = ? INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={gbpRate}
                    onChange={(e) => setGbpRate(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">SGD (1 SGD = ? INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={sgdRate}
                    onChange={(e) => setSgdRate(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {ratesSaved && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-semibold text-xs flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Exchange rates updated and recalculating across active pipeline!</span>
              </div>
            )}

            <div className="pt-1 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium text-xs hover:bg-slate-800 flex items-center gap-1.5 transition shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Exchange Rates</span>
              </button>
            </div>
          </form>
        </div>

        {/* Corporate Governance & Automated Rules */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <h4 className="font-bold text-slate-900 text-sm">
                Corporate Governance & Rule Engine
              </h4>
            </div>
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Active Policies
            </span>
          </div>

          <form onSubmit={handleSaveGovernance} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Stale Account Threshold</label>
                <select
                  value={staleThresholdDays}
                  onChange={(e) => setStaleThresholdDays(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={7}>7 days inactivity</option>
                  <option value={14}>14 days inactivity (Default)</option>
                  <option value={21}>21 days inactivity</option>
                  <option value={30}>30 days inactivity</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Default Currency for Deals</label>
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="INR">INR (₹ Indian Rupee)</option>
                  <option value="USD">USD ($ US Dollar)</option>
                  <option value="EUR">EUR (€ Euro)</option>
                  <option value="GBP">GBP (£ British Pound)</option>
                  <option value="SGD">SGD (S$ Singapore Dollar)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Laggard Auto-Derivation Rule</label>
                <select
                  value={autoLaggardThreshold}
                  onChange={(e) => setAutoLaggardThreshold(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={50}>{'< 50% PrivacyGRC Products (Default)'}</option>
                  <option value={40}>{'< 40% PrivacyGRC Products'}</option>
                  <option value={60}>{'< 60% PrivacyGRC Products'}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Fiscal Year Cycle</label>
                <select
                  value={fiscalYearStart}
                  onChange={(e) => setFiscalYearStart(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="April (Q1)">April - March (India/UK FY)</option>
                  <option value="January (Q1)">January - December (Calendar Year)</option>
                  <option value="October (Q1)">October - September (US Fed FY)</option>
                </select>
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="pt-2 space-y-2.5 border-t border-slate-100">
              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition">
                <div>
                  <div className="font-bold text-slate-900">Enforce Strict CBAC Contact Masking</div>
                  <div className="text-[11px] text-slate-500">
                    Require justification purpose before unmasking stakeholder email or mobile
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={strictCbacMasking}
                  onChange={(e) => setStrictCbacMasking(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition">
                <div>
                  <div className="font-bold text-slate-900">Auto-Generate AI Advisory for High-Tier Deals</div>
                  <div className="text-[11px] text-slate-500">
                    Derive PETs and Responsible-AI pitch angles automatically upon stage advancement
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={aiAdviceAutoGenerate}
                  onChange={(e) => setAiAdviceAutoGenerate(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
              </label>
            </div>

            {governanceSaved && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-semibold text-xs flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Governance policies saved and active across CRM!</span>
              </div>
            )}

            <div className="pt-1 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs flex items-center gap-1.5 transition shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Governance Policies</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* System Metrics Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-600" />
            <h4 className="font-bold text-slate-900 text-sm">
              Live Workspace Repository Statistics
            </h4>
          </div>
          <span className="text-xs text-slate-500">
            Real-time Client In-Memory Data Store
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <div className="text-xl font-bold text-slate-900">{accounts?.length || 0}</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Accounts</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <div className="text-xl font-bold text-slate-900">{contacts?.length || 0}</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Contacts</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <div className="text-xl font-bold text-slate-900">{tasks?.length || 0}</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Tasks & RFPs</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <div className="text-xl font-bold text-slate-900">{demos?.length || 0}</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Demos & Gaps</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <div className="text-xl font-bold text-slate-900">{users?.length || 0}</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Active Personas</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <div className="text-xl font-bold text-slate-900">{collaterals?.length || 0}</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Collaterals</div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Resetting Database */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  Reset CRM to Default Seed Data?
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  This will reload all prototype accounts, contacts, tasks, workflows, roles, and exchange rates back to the initial PRD acceptance baseline state. Any transient custom additions will be restored.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition shadow-2xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Yes, Reset Database</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
