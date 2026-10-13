import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Settings,
  Users,
  Coins,
  FileText,
  ShieldCheck,
  Check,
  Save,
  Plus,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const {
    users,
    exchangeRates,
    updateExchangeRate,
    collaterals,
    currentUser,
  } = useCrm();

  const [usdRate, setUsdRate] = useState(exchangeRates.rates.USD);
  const [eurRate, setEurRate] = useState(exchangeRates.rates.EUR);
  const [gbpRate, setGbpRate] = useState(exchangeRates.rates.GBP);
  const [sgdRate, setSgdRate] = useState(exchangeRates.rates.SGD);
  const [ratesSaved, setRatesSaved] = useState(false);

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    updateExchangeRate('USD', Number(usdRate));
    updateExchangeRate('EUR', Number(eurRate));
    updateExchangeRate('GBP', Number(gbpRate));
    updateExchangeRate('SGD', Number(sgdRate));
    setRatesSaved(true);
    setTimeout(() => setRatesSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-600" />
            <h3 className="font-semibold text-slate-900 text-base">
              System Administration
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage user roles, baseline exchange rates, and marketing collaterals
          </p>
        </div>
        <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200">
          Role: {currentUser.role}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exchange Rates Configuration (ACC-10) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-600" />
              <h4 className="font-bold text-slate-900 text-sm">
                Currency Exchange Rates (Base: INR)
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">
              Last configured: {exchangeRates.lastUpdated}
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Used to dynamically standardize global deal currencies into INR across dashboard funnels and executive rollups without modifying the underlying deal currency.
          </p>

          <form onSubmit={handleSaveRates} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">USD (1 USD = ? INR)</label>
                <input
                  type="number"
                  step="0.1"
                  value={usdRate}
                  onChange={(e) => setUsdRate(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">EUR (1 EUR = ? INR)</label>
                <input
                  type="number"
                  step="0.1"
                  value={eurRate}
                  onChange={(e) => setEurRate(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">GBP (1 GBP = ? INR)</label>
                <input
                  type="number"
                  step="0.1"
                  value={gbpRate}
                  onChange={(e) => setGbpRate(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">SGD (1 SGD = ? INR)</label>
                <input
                  type="number"
                  step="0.1"
                  value={sgdRate}
                  onChange={(e) => setSgdRate(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-800"
                />
              </div>
            </div>

            {ratesSaved && (
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded font-bold text-xs flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                Rates updated and recalculating across active pipeline!
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium text-xs hover:bg-slate-800 flex items-center gap-1.5 transition"
              >
                <Save className="w-3.5 h-3.5" />
                Save Exchange Rates
              </button>
            </div>
          </form>
        </div>

        {/* Marketing Collaterals Repository (ADM-04) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-slate-900 text-sm">
                Marketing Collaterals Repository
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              {collaterals.length} Assets
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {collaterals.map((col) => (
              <div
                key={col.id}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900">{col.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {col.fileName} • {col.fileSize} • {col.category}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {col.updatedDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Users & Role-Based Permissions Register (ADM-01 / ADM-02) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 font-bold text-slate-900 text-sm flex items-center justify-between">
          <span>Users & Role Governance Directory</span>
          <span className="text-xs text-slate-500 font-normal">
            7 Configured Personas for Prototype Acceptance
          </span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] bg-slate-50">
              <th className="py-2.5 px-4">User</th>
              <th className="py-2.5 px-4">Assigned Role</th>
              <th className="py-2.5 px-4">Team / Organization</th>
              <th className="py-2.5 px-4">Scope Model</th>
              <th className="py-2.5 px-4">Attribution Feature</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <div>{u.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{u.email}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'Leader'
                        ? 'bg-purple-100 text-purple-800'
                        : u.role === 'Partner'
                        ? 'bg-emerald-100 text-emerald-800'
                        : u.role === 'SalesOps'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600">
                  {u.partnerOrganization || u.team}
                </td>
                <td className="py-3 px-4 text-slate-700">
                  {u.role === 'Leader' || u.role === 'Administrator' || u.role === 'SalesOps'
                    ? 'Total Enterprise View'
                    : u.role === 'Partner'
                    ? 'Strictly Tagged Accounts'
                    : 'Assigned Accounts Default'}
                </td>
                <td className="py-3 px-4 text-slate-500">
                  {u.role === 'SalesOps' ? 'On-behalf-of field logging' : 'Direct actor logging'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
