import React, { useState } from 'react';
import { useRfp } from '../../context/RfpContext';
import {
  Coins,
  DollarSign,
  TrendingUp,
  PieChart,
  ShieldCheck,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import { SectionTasksComments } from './SectionTasksComments';

export const CommercialPlanningSection: React.FC = () => {
  const { selectedTender, infraSizing } = useRfp();
  const [selectedCurrency, setSelectedCurrency] = useState<'INR' | 'USD' | 'SGD' | 'EUR'>('INR');

  // Multi-Currency Exchange Rates
  const fxRates = {
    INR: 1,
    USD: 84.5,
    SGD: 63.8,
    EUR: 91.2,
  };

  const tenderBaseInr = selectedTender.estimatedValue; // ₹14.85 Cr

  const formatCurrencyValue = (inrVal: number, curr: 'INR' | 'USD' | 'SGD' | 'EUR') => {
    if (curr === 'INR') {
      const cr = inrVal / 10000000;
      if (cr >= 1) {
        return `₹${cr.toFixed(2)} Cr`;
      }
      return `₹${(inrVal / 100000).toFixed(1)} Lakhs`;
    }
    const converted = inrVal / fxRates[curr];
    const prefix = curr === 'USD' ? '$' : curr === 'SGD' ? 'S$' : '€';
    return `${prefix}${(converted / 1000000).toFixed(2)}M`;
  };

  const lineItems = [
    {
      item: 'PrivaSapien PETs Core & Differential Privacy Sandbox Perpetual Enterprise License',
      inrValue: 96500000, // ₹9.65 Cr
      share: '65% (OEM Software)',
      taxRate: '18% GST',
    },
    {
      item: '5-Year Comprehensive Annual Software Maintenance (AMC) & Cryptographic Updates',
      inrValue: 34700000, // ₹3.47 Cr
      share: '23% (OEM Support)',
      taxRate: '18% GST',
    },
    {
      item: 'Turnkey Implementation, Integration Services & Training (TCS Scope)',
      inrValue: 17300000, // ₹1.73 Cr
      share: '12% (SI Partner Scope)',
      taxRate: '18% GST',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Commercial Planning & Multi-Currency Price Book
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
              Cluster 4 · Section 17
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Multi-currency financial modeling supporting Indian Rupees (formatted in Crores & Lakhs via Indian numbering system) and international currencies. Reconciles OEM software vs SI integration margin splits.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
          {(['INR', 'USD', 'SGD', 'EUR'] as const).map((curr) => (
            <button
              key={curr}
              type="button"
              onClick={() => setSelectedCurrency(curr)}
              className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                selectedCurrency === curr
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>

      {/* Commercial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Total Contract Value (TCV)
          </div>
          <div className="text-2xl font-bold text-indigo-600 tabular-nums">
            {formatCurrencyValue(tenderBaseInr, selectedCurrency)}
          </div>
          <div className="text-[11px] text-slate-500">Fixed Turnkey Bid Envelope</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            OEM Software Net Share (PrivaSapien)
          </div>
          <div className="text-2xl font-bold text-emerald-600 tabular-nums">
            {formatCurrencyValue(tenderBaseInr * 0.65, selectedCurrency)} (65%)
          </div>
          <div className="text-[11px] text-slate-500">Perpetual License + OEM AMC</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            SI Turnkey & Hardware Share (TCS)
          </div>
          <div className="text-2xl font-bold text-amber-600 tabular-nums">
            {formatCurrencyValue(tenderBaseInr * 0.35, selectedCurrency)} (35%)
          </div>
          <div className="text-[11px] text-slate-500">Racking, Cabling, 24x7 Engineers</div>
        </div>
      </div>

      {/* Bill of Quantities (BOQ) Commercial Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Commercial Bill of Quantities (BOQ) Annexure
          </h4>
          <span className="text-xs text-slate-500">Base Currency: {selectedCurrency}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider bg-slate-50/50">
                <th className="py-2.5 px-4">Line Item Description</th>
                <th className="py-2.5 px-4">Scope Allocation</th>
                <th className="py-2.5 px-4">Applicable Taxes</th>
                <th className="py-2.5 px-4 text-right">Commercial Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lineItems.map((li) => (
                <tr key={li.item} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-900 max-w-md">{li.item}</td>
                  <td className="py-3 px-4 text-indigo-700 font-medium">{li.share}</td>
                  <td className="py-3 px-4 text-slate-500">{li.taxRate}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums text-sm">
                    {formatCurrencyValue(li.inrValue, selectedCurrency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SectionTasksComments sectionId="commercialPlanning" sectionTitle="Commercial Planning" />
    </div>
  );
};
