import React, { useState } from 'react';
import {
  Account,
  AccountStage,
  AdoptionCategory,
  Currency,
  Geography,
  ProcurementType,
  ProductFamily,
  Sector,
  WinningStance,
} from '../../types/crm';
import { useCrm } from '../../context/CrmContext';
import {
  PRODUCT_GROUPS,
  deriveAdoptionCategory,
  getAdoptionCategoryBadgeStyle,
} from '../../utils/calculations';
import { X, AlertTriangle, Building2, CheckCircle2, Handshake, Plus, Check, Lock, Sparkles } from 'lucide-react';

interface AddAccountModalProps {
  onClose: () => void;
  onSuccess: (account: Account) => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const { addAccount, updateAccount, currentUser, users } = useCrm();

  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [sector, setSector] = useState<Sector>('Banking & Financial Services');
  const [geography, setGeography] = useState<Geography>('India (North)');
  const [annualRevenue, setAnnualRevenue] = useState<number>(1000000000); // 100 Cr INR
  const [currency, setCurrency] = useState<Currency>('INR');
  const [stage, setStage] = useState<AccountStage>('New Account');
  const [winningStance, setWinningStance] = useState<WinningStance>('Initial Stages');
  const [procurementType, setProcurementType] = useState<ProcurementType>('Direct Opportunity');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([
    'PrivaSapien Anonymizer Pro & PETs Core',
  ]);

  const adoptionResult = deriveAdoptionCategory(selectedProducts);
  const adoptionCategory = adoptionResult.category;
  const badgeStyle = getAdoptionCategoryBadgeStyle(adoptionCategory);

  const [petsFlag, setPetsFlag] = useState(true);
  const [responsibleAiFlag, setResponsibleAiFlag] = useState(false);
  const [headOfficeAddress, setHeadOfficeAddress] = useState('Nariman Point, Mumbai 400021');
  const [selectedPartners, setSelectedPartners] = useState<string[]>(['Wipro Technologies']);
  const [customPartnerText, setCustomPartnerText] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const availablePartners = [
    'Wipro Technologies',
    'Tata Consultancy Services',
    'Accenture APAC',
    'Cognizant US',
    'Infosys Responsible AI Unit',
  ];

  const toggleProductSelection = (productName: string) => {
    setSelectedProducts((prev) => {
      const updated = prev.includes(productName)
        ? prev.filter((p) => p !== productName)
        : [...prev, productName];
      const derived = deriveAdoptionCategory(updated);
      setPetsFlag(derived.hasCbac || derived.hasAdditionalPets);
      setResponsibleAiFlag(derived.hasResponsibleAi);
      return updated;
    });
  };

  const togglePartnerSelection = (partnerName: string) => {
    setSelectedPartners((prev) =>
      prev.includes(partnerName)
        ? prev.filter((p) => p !== partnerName)
        : [...prev, partnerName]
    );
  };

  const addCustomPartner = () => {
    const trimmed = customPartnerText.trim();
    if (trimmed && !selectedPartners.includes(trimmed)) {
      setSelectedPartners((prev) => [...prev, trimmed]);
      setCustomPartnerText('');
      setShowCustomInput(false);
    }
  };

  // Duplicate Warning State
  const [duplicateAccount, setDuplicateAccount] = useState<Account | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const derivedAdoption = deriveAdoptionCategory(selectedProducts);

    const accountPayload = {
      name: name.trim(),
      website: website.trim(),
      logoText: name.substring(0, 3).toUpperCase(),
      logoBg: 'bg-indigo-600',
      stage,
      annualRevenue: Number(annualRevenue),
      revenueCurrency: currency,
      winningStance,
      adoptionCategory: derivedAdoption.category,
      owners: {
        sales: currentUser.name,
        preSales: 'Ananya Sharma',
        solutionEngineer: 'Rahul Nair',
        leader: 'Dr. Siddharth Sen',
      },
      petsFlag: derivedAdoption.hasCbac || derivedAdoption.hasAdditionalPets,
      responsibleAiFlag: derivedAdoption.hasResponsibleAi,
      sector,
      geography,
      publicPrivate: 'Private' as const,
      procurementType,
      productFamily: (
        derivedAdoption.hasResponsibleAi
          ? 'Responsible AI & Governance'
          : derivedAdoption.hasCbac || derivedAdoption.hasAdditionalPets
          ? 'Privacy Enhancing Technologies (PETs)'
          : 'PrivacyGRC Core Suite'
      ) as ProductFamily,
      product: selectedProducts[0] || 'PrivaSapien Solution',
      products: selectedProducts,
      headOfficeAddress,
      partners: selectedPartners,
      notes: `Newly onboarded opportunity under ${procurementType} process.`,
    };

    const result = addAccount(accountPayload);

    if (!result.success && result.duplicate) {
      setDuplicateAccount(result.duplicate);
    } else if (result.newAccount) {
      onSuccess(result.newAccount);
    }
  };

  const handleAppendToExisting = () => {
    if (!duplicateAccount) return;
    // Append partner or notes to existing account per PRD ACC-02
    const updated = {
      ...duplicateAccount,
      partners: Array.from(new Set([...duplicateAccount.partners, ...selectedPartners])),
      notes: `${duplicateAccount.notes || ''} [Appended note from duplicate submission: ${procurementType}]`,
    };
    updateAccount(
      updated,
      'Appended From New Submission',
      'Original Record',
      `Appended Partner & Opportunity Notes`,
      new Date().toISOString().split('T')[0]
    );
    onSuccess(updated);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Add New Account</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Duplicate Detection Warning Banner */}
          {duplicateAccount && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Duplicate Account Detected
              </div>
              <p className="text-xs text-slate-600">
                An account with similar name or domain already exists:{' '}
                <strong>{duplicateAccount.name}</strong> ({duplicateAccount.website}) in stage{' '}
                <strong>{duplicateAccount.stage}</strong>.
              </p>
              <div className="pt-1 flex gap-2">
                <button
                  type="button"
                  onClick={handleAppendToExisting}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded font-medium hover:bg-slate-800"
                >
                  Append Information to Existing Record
                </button>
                <button
                  type="button"
                  onClick={() => setDuplicateAccount(null)}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded font-medium hover:bg-slate-50"
                >
                  Modify Name
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Account Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. ICICI Bank Ltd"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setDuplicateAccount(null);
                }}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Website URL *</label>
              <input
                type="url"
                required
                placeholder="https://icicibank.com"
                value={website}
                onChange={(e) => {
                  setWebsite(e.target.value);
                  setDuplicateAccount(null);
                }}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Sector</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value as Sector)}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="Banking & Financial Services">Banking & Financial Services</option>
                <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                <option value="Telecommunications">Telecommunications</option>
                <option value="E-commerce & Retail">E-commerce & Retail</option>
                <option value="Government & Public Sector">Government & Public Sector</option>
                <option value="Automotive & IoT">Automotive & IoT</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Geography</label>
              <select
                value={geography}
                onChange={(e) => setGeography(e.target.value as Geography)}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="India (North)">India (North)</option>
                <option value="India (South)">India (South)</option>
                <option value="India (West)">India (West)</option>
                <option value="India (East)">India (East)</option>
                <option value="Singapore & APAC">Singapore & APAC</option>
                <option value="United States">United States</option>
                <option value="United Kingdom & EU">United Kingdom & EU</option>
                <option value="Middle East">Middle East</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Annual Revenue</label>
              <input
                type="number"
                required
                value={annualRevenue}
                onChange={(e) => setAnnualRevenue(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Revenue Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="SGD">SGD (S$)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Procurement Process</label>
              <select
                value={procurementType}
                onChange={(e) => setProcurementType(e.target.value as ProcurementType)}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 font-semibold"
              >
                <option value="Direct Opportunity">Direct Opportunity</option>
                <option value="Open RFP">Open RFP (Spins up 5 Subtasks)</option>
                <option value="Closed RFP">Closed RFP (Spins up 5 Subtasks)</option>
              </select>
            </div>

            {/* Adoption Category: Auto-Derived and Read-Only */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 text-xs block">
                  Adoption Category
                </label>
                <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-slate-400" />
                  Auto-Derived from Products
                </span>
              </div>
              <div
                className={`p-2 rounded-lg border flex items-center justify-between ${badgeStyle.bg} ${badgeStyle.border}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${badgeStyle.dot}`} />
                  <span className={`text-xs font-bold ${badgeStyle.text}`}>
                    {adoptionResult.category} ({adoptionResult.multiplier}× Multiplier)
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                {adoptionResult.ruleExplanation}
              </p>
            </div>
          </div>

          {/* Product Portfolio Multi-Selection */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-slate-600" />
                  <span>Product Portfolio Selection</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  Select products to determine the account's automated adoption tier and multiplier.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                {selectedProducts.length} Selected
              </span>
            </div>

            <div className="space-y-2.5">
              {PRODUCT_GROUPS.map((group) => {
                const groupSelected = group.products.filter((p) =>
                  selectedProducts.includes(p)
                ).length;
                return (
                  <div
                    key={group.groupId}
                    className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900">
                          {group.groupName}
                        </span>
                        <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                          {groupSelected} / {group.products.length}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {group.ruleHint}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {group.products.map((prod) => {
                        const isSelected = selectedProducts.includes(prod);
                        return (
                          <button
                            key={prod}
                            type="button"
                            onClick={() => toggleProductSelection(prod)}
                            className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 border text-left ${
                              isSelected
                                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {isSelected ? (
                              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                            ) : (
                              <Plus className="w-3 h-3 text-slate-400 shrink-0" />
                            )}
                            <span>{prod}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Multi-Partner SI Tagging */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Handshake className="w-3.5 h-3.5 text-slate-600" />
                <span>Partner System Integrators (SI Co-Bidders)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="text-[11px] text-slate-600 hover:text-slate-900 underline font-medium"
              >
                {showCustomInput ? 'Cancel' : '+ Custom Partner'}
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {availablePartners.map((p) => {
                const isSelected = selectedPartners.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePartnerSelection(p)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-3 h-3 text-slate-200" />
                    ) : (
                      <Plus className="w-3 h-3 text-slate-400" />
                    )}
                    <span>{p}</span>
                  </button>
                );
              })}
            </div>

            {showCustomInput && (
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Enter custom partner organization..."
                  value={customPartnerText}
                  onChange={(e) => setCustomPartnerText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomPartner();
                    }
                  }}
                  className="flex-1 p-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
                />
                <button
                  type="button"
                  onClick={addCustomPartner}
                  disabled={!customPartnerText.trim()}
                  className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-700 disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            )}

            <p className="text-[10px] text-slate-500 leading-normal">
              Multiple System Integrators can be tagged for RFPs. Note: Partner portal views are strictly isolated; competitor partner tags are hidden from partner users.
            </p>
          </div>

          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={petsFlag}
                onChange={(e) => setPetsFlag(e.target.checked)}
                className="rounded text-blue-600"
              />
              PETs Portfolio Fit
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={responsibleAiFlag}
                onChange={(e) => setResponsibleAiFlag(e.target.checked)}
                className="rounded text-emerald-600"
              />
              Responsible AI Governance Fit
            </label>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition"
            >
              Save Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
