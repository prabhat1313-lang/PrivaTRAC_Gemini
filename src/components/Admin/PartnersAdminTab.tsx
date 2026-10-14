import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { PartnerSWOT } from '../../types/crm';
import {
  Handshake,
  Plus,
  Edit2,
  Trash2,
  Building2,
  Globe,
  Award,
  AlertCircle,
  TrendingUp,
  X,
  Search,
  ExternalLink,
} from 'lucide-react';

export const PartnersAdminTab: React.FC = () => {
  const { partnerSwotList, addPartner, updatePartner, deletePartner, accounts } = useCrm();

  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerSWOT | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const [tier, setTier] = useState<PartnerSWOT['tier']>('Strategic Global');
  const [headquarters, setHeadquarters] = useState('');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [opportunities, setOpportunities] = useState('');
  const [threats, setThreats] = useState('');

  const tiers: PartnerSWOT['tier'][] = [
    'Strategic Global',
    'Regional Tier-1',
    'Specialist Boutique',
  ];

  const openAdd = () => {
    setEditingPartner(null);
    setPartnerName('');
    setTier('Strategic Global');
    setHeadquarters('');
    setStrengths('Deep enterprise relationships, PrivaSapien CoE trained');
    setWeaknesses('Longer procurement clearance cycles');
    setOpportunities('Joint banking RFP responses in APAC');
    setThreats('Competing OEM partnerships');
    setIsModalOpen(true);
  };

  const openEdit = (p: PartnerSWOT) => {
    setEditingPartner(p);
    setPartnerName(p.partnerName);
    setTier(p.tier);
    setHeadquarters(p.headquarters);
    setStrengths(p.strengths.join(', '));
    setWeaknesses(p.weaknesses.join(', '));
    setOpportunities((p.opportunities || []).join(', '));
    setThreats((p.threats || []).join(', '));
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim()) return;

    const parseList = (str: string) =>
      str
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    if (editingPartner) {
      updatePartner({
        ...editingPartner,
        partnerName: partnerName.trim(),
        tier,
        headquarters: headquarters.trim() || 'Global Office',
        strengths: parseList(strengths),
        weaknesses: parseList(weaknesses),
        opportunities: parseList(opportunities),
        threats: parseList(threats),
        lastUpdated: new Date().toISOString().split('T')[0],
      });
    } else {
      addPartner({
        partnerName: partnerName.trim(),
        tier,
        headquarters: headquarters.trim() || 'Global Office',
        associatedAccountsCount: 0,
        strengths: parseList(strengths),
        weaknesses: parseList(weaknesses),
        opportunities: parseList(opportunities),
        threats: parseList(threats),
      });
    }

    setIsModalOpen(false);
  };

  const filteredPartners = partnerSwotList.filter((p) => {
    const matchesSearch =
      p.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.headquarters.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'All' ? true : p.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Handshake className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Partner Ecosystem & SI Alliance Administration
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure System Integrator partnerships, partner tiering, co-sell accounts, and ecosystem SWOT parameters
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-2xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Onboard Partner Organization</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search partners by name or city..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-semibold text-slate-500 mr-1 shrink-0">Tier:</span>
          {['All', ...tiers].map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition ${
                tierFilter === t
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPartners.map((partner) => {
          const associatedAccounts = accounts.filter((a) =>
            (a.partners || []).includes(partner.partnerName)
          );

          return (
            <div
              key={partner.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition space-y-3 flex flex-col justify-between text-xs"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">
                      {partner.partnerName}
                    </h4>
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 ${
                        partner.tier === 'Strategic Global'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : partner.tier === 'Regional Tier-1'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-purple-50 text-purple-800 border-purple-200'
                      }`}
                    >
                      {partner.tier}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(partner)}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded"
                      title="Edit Partner"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {partnerSwotList.length > 1 && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete partner "${partner.partnerName}"?`)) {
                            deletePartner(partner.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                        title="Delete Partner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-slate-400" />
                  <span>HQ: {partner.headquarters}</span>
                </div>

                {/* Strengths */}
                <div className="space-y-1 pt-1">
                  <div className="font-bold text-emerald-900 text-[11px] flex items-center gap-1">
                    <Award className="w-3 h-3 text-emerald-600" />
                    <span>Ecosystem Strengths:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {partner.strengths.slice(0, 3).map((st, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                      >
                        {st}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Weaknesses / Gaps */}
                {partner.weaknesses && partner.weaknesses.length > 0 && (
                  <div className="space-y-1">
                    <div className="font-bold text-amber-900 text-[11px] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      <span>Identified Gaps:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {partner.weaknesses.slice(0, 2).map((w, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200/60"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">
                  {associatedAccounts.length} Co-Sell Account{associatedAccounts.length === 1 ? '' : 's'}
                </span>
                <span className="text-slate-400 text-[10px]">Updated: {partner.lastUpdated}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Partner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingPartner ? 'Edit Partner Organization' : 'Onboard Partner Organization'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Partner Organization Name *</label>
                <input
                  type="text"
                  required
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="e.g. Tata Consultancy Services"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Partnership Tier *</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as PartnerSWOT['tier'])}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  >
                    {tiers.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Global Headquarters *</label>
                  <input
                    type="text"
                    required
                    value={headquarters}
                    onChange={(e) => setHeadquarters(e.target.value)}
                    placeholder="e.g. Mumbai, India / London, UK"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Ecosystem Strengths (Comma-separated)
                </label>
                <textarea
                  rows={2}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="e.g. Deep SBI relationships, Dedicated Privacy CoE, Global onshore team"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Identified Weaknesses / Gaps (Comma-separated)
                </label>
                <textarea
                  rows={2}
                  value={weaknesses}
                  onChange={(e) => setWeaknesses(e.target.value)}
                  placeholder="e.g. Longer procurement cycles, Complex joint margins"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Opportunities</label>
                  <input
                    type="text"
                    value={opportunities}
                    onChange={(e) => setOpportunities(e.target.value)}
                    placeholder="e.g. Joint banking bids in APAC"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Threats</label>
                  <input
                    type="text"
                    value={threats}
                    onChange={(e) => setThreats(e.target.value)}
                    placeholder="e.g. Competing OEM products"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-slate-600 font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs"
                >
                  {editingPartner ? 'Save Changes' : 'Onboard Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
