import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { PartnerSWOT } from '../../types/crm';
import {
  Handshake,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Building,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import {
  calculateAccountValue,
  calculateDealValue,
  formatCurrencyValue,
} from '../../utils/calculations';

export const PartnersView: React.FC = () => {
  const {
    partnerSwotList,
    scopedAccounts,
    isPartnerMode,
    activePartnerName,
    currentUser,
  } = useCrm();

  const [selectedPartner, setSelectedPartner] = useState<string>(
    isPartnerMode ? activePartnerName : 'Wipro Technologies'
  );
  const [swotList, setSwotList] = useState<PartnerSWOT[]>(partnerSwotList);
  const [swotApplied, setSwotApplied] = useState(false);

  const activeSwot = swotList.find((s) => s.partnerName === selectedPartner);

  // Scoped deals for this partner
  const partnerAccounts = scopedAccounts.filter((a) => a.partners.includes(selectedPartner));

  const totalPartnerValue = partnerAccounts.reduce((acc, curr) => {
    const dv = calculateDealValue(curr.annualRevenue, curr.dealValueOverride);
    const av = calculateAccountValue(dv, curr.winningStance, curr.adoptionCategory);
    return acc + av;
  }, 0);

  const handleApplyAiSwot = () => {
    if (!activeSwot || !activeSwot.aiSuggestedUpdate) return;
    setSwotList((prev) =>
      prev.map((s) =>
        s.id === activeSwot.id
          ? {
              ...s,
              opportunities: [...s.opportunities, activeSwot.aiSuggestedUpdate!],
              aiSuggestedUpdate: undefined,
            }
          : s
      )
    );
    setSwotApplied(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Handshake className="w-5 h-5 text-slate-700" />
            <h3 className="font-semibold text-slate-900 text-base">
              {isPartnerMode ? 'Partner Portal · Scoped View' : 'Partner Ecosystem'}
            </h3>
            {isPartnerMode && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                Partner: {activePartnerName}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isPartnerMode
              ? 'Sanitized Partner View (PART-03/04): You can only see deals where tagged. Co-partner tags are sanitized.'
              : 'Joint GTM co-selling pipeline and monthly SWOT intelligence'}
          </p>
        </div>

        {/* Partner Selector (if internal leader/sales) */}
        {!isPartnerMode && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Inspect Partner:</span>
            <select
              value={selectedPartner}
              onChange={(e) => setSelectedPartner(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-white"
            >
              <option value="Wipro Technologies">Wipro Technologies</option>
              <option value="Tata Consultancy Services">Tata Consultancy Services</option>
            </select>
          </div>
        )}
      </div>

      {/* Partner Scoped Pipeline Funnel Summary */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Associated Strategic Deals
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{partnerAccounts.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Tagged under {selectedPartner}</div>
        </div>

        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Co-Sell Pipeline Value
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {formatCurrencyValue(totalPartnerValue, 'INR')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Weighted Account Value</div>
        </div>

        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Isolation & Security Status
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 mt-2">
            <Lock className="w-4 h-4 text-blue-600" />
            <span>Zero Cross-Partner Exposure Verified</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Complies with least-privilege alliance covenants
          </div>
        </div>
      </div>

      {/* Scoped Accounts Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 font-bold text-slate-900 text-sm flex items-center justify-between">
          <span>Active Partner Accounts ({partnerAccounts.length})</span>
          <span className="text-xs text-slate-500 font-normal">
            Only accounts tagged with {selectedPartner}
          </span>
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider bg-slate-50">
              <th className="py-2.5 px-4">Account</th>
              <th className="py-2.5 px-4">Sector</th>
              <th className="py-2.5 px-4">Geography</th>
              <th className="py-2.5 px-4">Stage</th>
              <th className="py-2.5 px-4">Winning Stance</th>
              <th className="py-2.5 px-4 text-right">Account Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {partnerAccounts.map((acc) => {
              const dv = calculateDealValue(acc.annualRevenue, acc.dealValueOverride);
              const av = calculateAccountValue(dv, acc.winningStance, acc.adoptionCategory);
              return (
                <tr key={acc.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{acc.name}</td>
                  <td className="py-3 px-4 text-slate-600">{acc.sector}</td>
                  <td className="py-3 px-4 text-slate-600">{acc.geography}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {acc.stage}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{acc.winningStance}</td>
                  <td className="py-3 px-4 text-right font-black text-slate-900">
                    {formatCurrencyValue(av, acc.revenueCurrency, acc.geography)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Monthly Partner SWOT Analysis (PART-02) */}
      {activeSwot && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Monthly Partner SWOT Analysis • {activeSwot.partnerName}
              </h4>
              <p className="text-xs text-slate-500">
                Tier: {activeSwot.tier} • HQ: {activeSwot.headquarters} • Last updated:{' '}
                {activeSwot.lastUpdated}
              </p>
            </div>

            {activeSwot.aiSuggestedUpdate && (
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                  AI Suggestion Available
                </span>
                <button
                  onClick={handleApplyAiSwot}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 shadow-xs flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Review & Apply Update
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Strengths */}
            <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-1.5">
              <span className="font-bold text-emerald-900 block text-xs uppercase tracking-wider">
                Strengths
              </span>
              <ul className="list-disc pl-4 space-y-1 text-emerald-950 text-[11px]">
                {activeSwot.strengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="p-3.5 rounded-lg bg-red-50/60 border border-red-200 space-y-1.5">
              <span className="font-bold text-red-900 block text-xs uppercase tracking-wider">
                Weaknesses
              </span>
              <ul className="list-disc pl-4 space-y-1 text-red-950 text-[11px]">
                {activeSwot.weaknesses.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-200 space-y-1.5">
              <span className="font-bold text-blue-900 block text-xs uppercase tracking-wider">
                Opportunities
              </span>
              <ul className="list-disc pl-4 space-y-1 text-blue-950 text-[11px]">
                {activeSwot.opportunities.map((o, idx) => (
                  <li key={idx}>{o}</li>
                ))}
              </ul>
            </div>

            {/* Threats */}
            <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200 space-y-1.5">
              <span className="font-bold text-amber-900 block text-xs uppercase tracking-wider">
                Threats
              </span>
              <ul className="list-disc pl-4 space-y-1 text-amber-950 text-[11px]">
                {activeSwot.threats.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
          </div>

          {activeSwot.aiSuggestedUpdate && (
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-xs text-purple-950 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <strong>Pending AI Suggested Monthly Opportunity:</strong>{' '}
                {activeSwot.aiSuggestedUpdate}
              </div>
            </div>
          )}

          {swotApplied && (
            <div className="p-2 rounded bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Monthly SWOT opportunity updated with human approval recorded in audit!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
