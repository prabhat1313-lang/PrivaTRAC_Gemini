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
  AccountDocument,
  DocumentCategory,
} from '../../types/crm';
import { useCrm } from '../../context/CrmContext';
import { TasksView } from '../Tasks/TasksView';
import {
  calculateAccountValue,
  calculateDealValue,
  calculateWeightedDealValue,
  convertToINR,
  formatCurrencyValue,
  deriveAdoptionCategory,
  PRIVACY_GRC_PRODUCTS,
  CBAC_PRODUCT,
  ADDITIONAL_PETS_PRODUCTS,
  RESPONSIBLE_AI_PRODUCTS,
  getAdoptionMultiplier,
  PRODUCT_GROUPS,
  getAdoptionCategoryBadgeStyle,
} from '../../utils/calculations';
import {
  X,
  Sparkles,
  ShieldCheck,
  Cpu,
  History,
  Check,
  Edit2,
  Plus,
  Info,
  Calendar,
  AlertCircle,
  Building,
  User,
  Users,
  FileText,
  Handshake,
  Paperclip,
  Upload,
  Trash2,
  Download,
  FileCheck,
  Lock,
} from 'lucide-react';

interface AccountDetailModalProps {
  account: Account;
  onClose: () => void;
  onOpenAudit: (account: Account) => void;
}

export const AccountDetailModal: React.FC<AccountDetailModalProps> = ({
  account,
  onClose,
  onOpenAudit,
}) => {
  const {
    currentUser,
    accounts,
    updateAccount,
    enrichAccountWithAi,
    completeProfileField,
    exchangeRates,
    contacts,
    tasks,
    demos,
  } = useCrm();

  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'tasks' | 'documents' | 'demos'>('overview');
  const [editingField, setEditingField] = useState<string | null>(null);

  // Form state for edits
  const [formData, setFormData] = useState<Account>(account);
  const [effectiveDate, setEffectiveDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [customDealOverride, setCustomDealOverride] = useState<string>(
    account.dealValueOverride ? String(account.dealValueOverride) : ''
  );

  const isLeaderOrAdmin = currentUser.role === 'Leader' || currentUser.role === 'Administrator';
  const isPartnerUser = currentUser.role === 'Partner';

  const [newPartnerInput, setNewPartnerInput] = useState('');
  const [showAddPartnerInput, setShowAddPartnerInput] = useState(false);

  // Documents state and methods
  const [selectedUploadCategory, setSelectedUploadCategory] = useState<DocumentCategory>('General');
  const [docFilterCategory, setDocFilterCategory] = useState<string>('all');
  const [isDragOver, setIsDragOver] = useState(false);

  const liveAccount = accounts.find((a) => a.id === account.id) || formData;
  const accountDocuments = liveAccount.documents || formData.documents || [];

  const handleAccountFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newDocs: AccountDocument[] = Array.from(files).map((file) => {
      let sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      if (file.size > 1024 * 1024) {
        sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      }

      let detectedCat: DocumentCategory = selectedUploadCategory;
      const lower = file.name.toLowerCase();
      if (lower.includes('proposal') || lower.includes('rfp') || lower.includes('bid') || lower.includes('tender')) {
        detectedCat = 'Proposal';
      } else if (lower.includes('contract') || lower.includes('agreement') || lower.includes('msa') || lower.includes('nda')) {
        detectedCat = 'Contract';
      } else if (lower.includes('security') || lower.includes('fips') || lower.includes('compliance') || lower.includes('iso') || lower.includes('cert')) {
        detectedCat = 'Security & Compliance';
      } else if (lower.includes('arch') || lower.includes('blueprint') || lower.includes('tech') || lower.includes('infra') || lower.includes('sbom')) {
        detectedCat = 'Technical Architecture';
      }

      return {
        id: `adoc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        size: sizeStr,
        uploadedBy: currentUser.name,
        timestamp: new Date().toISOString(),
        category: detectedCat,
        type: file.type || 'application/octet-stream',
      };
    });

    const updatedDocs = [...accountDocuments, ...newDocs];
    const updated = { ...liveAccount, documents: updatedDocs };
    setFormData(updated);
    updateAccount(
      updated,
      'Documents Uploaded',
      `${accountDocuments.length} files`,
      `${updatedDocs.length} files`,
      effectiveDate
    );
  };

  const handleAddSampleAccountDoc = (name: string, size: string, category: DocumentCategory) => {
    const sampleDoc: AccountDocument = {
      id: `adoc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      size,
      uploadedBy: currentUser.name,
      timestamp: new Date().toISOString(),
      category,
      type: 'application/pdf',
    };
    const updatedDocs = [...accountDocuments, sampleDoc];
    const updated = { ...liveAccount, documents: updatedDocs };
    setFormData(updated);
    updateAccount(
      updated,
      'Document Added',
      `${accountDocuments.length} files`,
      `${updatedDocs.length} files`,
      effectiveDate
    );
  };

  const handleRemoveAccountDoc = (docId: string) => {
    const updatedDocs = accountDocuments.filter((d) => d.id !== docId);
    const updated = { ...liveAccount, documents: updatedDocs };
    setFormData(updated);
    updateAccount(
      updated,
      'Document Removed',
      `${accountDocuments.length} files`,
      `${updatedDocs.length} files`,
      effectiveDate
    );
  };

  const handleDownloadAccountDoc = (docName: string) => {
    const blob = new Blob([`Enterprise document deliverable for ${formData.name}: ${docName}`], {
      type: 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = docName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const systemPartners = [
    'Wipro Technologies',
    'Tata Consultancy Services',
    'Accenture APAC',
    'Cognizant US',
    'Infosys Responsible AI Unit',
  ];

  const handleAddPartner = (partnerName: string) => {
    const trimmed = partnerName.trim();
    if (!trimmed || formData.partners.includes(trimmed)) return;
    const updatedPartners = [...formData.partners, trimmed];
    handleFieldSave('partners', updatedPartners);
    setNewPartnerInput('');
    setShowAddPartnerInput(false);
  };

  const handleRemovePartner = (partnerName: string) => {
    const updatedPartners = formData.partners.filter((p) => p !== partnerName);
    handleFieldSave('partners', updatedPartners);
  };

  // Math & Auto-Derived Adoption Category
  const accountProducts =
    formData.products && formData.products.length > 0
      ? formData.products
      : formData.product
      ? [formData.product]
      : [];
  const adoptionResult = deriveAdoptionCategory(accountProducts);
  const effectiveAdoptionCategory = adoptionResult.category;
  const adoptionBadgeStyle = getAdoptionCategoryBadgeStyle(effectiveAdoptionCategory);

  const dealValue = calculateDealValue(formData.annualRevenue, formData.dealValueOverride);
  const weightedDealValue = calculateWeightedDealValue(dealValue, formData.winningStance);
  const accountValue = calculateAccountValue(
    dealValue,
    formData.winningStance,
    effectiveAdoptionCategory
  );
  const accountValueINR = convertToINR(accountValue, formData.revenueCurrency, exchangeRates);

  const handleToggleProduct = (productName: string) => {
    const currentProducts =
      formData.products && formData.products.length > 0
        ? formData.products
        : formData.product
        ? [formData.product]
        : [];
    const exists = currentProducts.some(
      (p) => p.toLowerCase() === productName.toLowerCase()
    );
    const newProducts = exists
      ? currentProducts.filter((p) => p.toLowerCase() !== productName.toLowerCase())
      : [...currentProducts, productName];

    const derived = deriveAdoptionCategory(newProducts);
    const updated: Account = {
      ...formData,
      products: newProducts,
      product: newProducts[0] || 'PrivaSapien Solution',
      adoptionCategory: derived.category,
      petsFlag: derived.hasCbac || derived.hasAdditionalPets,
      responsibleAiFlag: derived.hasResponsibleAi,
    };
    setFormData(updated);
    updateAccount(
      updated,
      'Product Portfolio',
      currentProducts.join(', ') || 'None',
      newProducts.join(', ') || 'None',
      effectiveDate
    );
  };

  const accountContacts = contacts.filter((c) => c.accountId === account.id);
  const accountTasks = tasks.filter((t) => t.accountId === account.id);
  const accountDemos = demos.filter((d) => d.accountId === account.id);

  const handleFieldSave = (fieldName: keyof Account, newValue: any) => {
    const oldValue = account[fieldName];
    const updated = { ...account, [fieldName]: newValue };
    setFormData(updated);
    updateAccount(updated, String(fieldName), String(oldValue), String(newValue), effectiveDate);
    setEditingField(null);
  };

  const handleOverrideSave = () => {
    const num = customDealOverride ? Number(customDealOverride) : undefined;
    const oldValue = account.dealValueOverride ? String(account.dealValueOverride) : 'Default (0.025%)';
    const newValue = num ? String(num) : 'Default (0.025%)';
    const updated = { ...account, dealValueOverride: num };
    setFormData(updated);
    updateAccount(updated, 'Deal Value (Override)', oldValue, newValue, effectiveDate);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-base shadow-xs"
            >
              {account.logoText}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{account.name}</h2>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {account.stage}
                </span>
                {account.isStale && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                    Stale
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>{account.sector}</span>
                <span>·</span>
                <span>{account.geography}</span>
                <span>·</span>
                <a
                  href={account.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-600 hover:text-slate-900 underline"
                >
                  {account.website}
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAudit(account)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
              title="View field-level audit trail"
            >
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>Audit Trail ({account.fieldAuditTrail.length})</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-slate-200 flex gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview & Value Engine
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'contacts'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Contacts</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px]">
              {accountContacts.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'tasks'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Tasks</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px]">
              {accountTasks.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Documents</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px]">
              {accountDocuments.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('demos')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'demos'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Demos</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px]">
              {accountDemos.length}
            </span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {activeTab === 'overview' && (
            <>
              {/* AI Enrichment & Profile Completion Strip */}
              <div className="p-4 rounded-xl bg-[#faf8fd] border border-purple-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold text-slate-900 text-sm">
                      AI Profile Assistant & Provenance
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-800 border border-purple-200/60">
                      Mock Adapter
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Profile Completion: <strong>{account.profileCompletion.human}% human-entered</strong> ·{' '}
                    <strong>{account.profileCompletion.ai}% AI-suggested</strong>
                  </p>
                </div>

                <button
                  onClick={() => enrichAccountWithAi(account.id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 shadow-2xs flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                  Run AI Enrichment
                </button>
              </div>

              {/* Authoritative Valuation Engine Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <span>Valuation Engine</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      [Formula: Deal Value × Winning Stance × Adoption Multiplier]
                    </span>
                  </div>
                  <span className="text-slate-900 font-bold text-xs tabular-nums">
                    Account Value (INR): {formatCurrencyValue(accountValueINR, 'INR')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Deal Value */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-slate-500 text-[11px] font-medium flex items-center justify-between">
                      <span>Annual Revenue:</span>
                      <span className="font-semibold text-slate-800 tabular-nums">
                        {formatCurrencyValue(account.annualRevenue, account.revenueCurrency, account.geography)}
                      </span>
                    </div>
                    <div className="mt-2 text-slate-500 text-[11px]">
                      Default Deal Value (0.025%):
                      <div className="text-sm font-semibold text-slate-900 tabular-nums mt-0.5">
                        {formatCurrencyValue(dealValue, account.revenueCurrency, account.geography)}
                      </div>
                    </div>

                    {/* Deal Value Override */}
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <label className="text-[10px] text-slate-500 font-medium block mb-1">
                        Override Deal Value:
                      </label>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          placeholder="Override amount"
                          value={customDealOverride}
                          onChange={(e) => setCustomDealOverride(e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                        />
                        <button
                          onClick={handleOverrideSave}
                          className="px-2 py-1 bg-slate-800 text-white rounded font-medium hover:bg-slate-900"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Winning Stance */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <label className="text-slate-500 text-[11px] font-medium block mb-1">
                      Winning Stance (Factor):
                    </label>
                    <select
                      value={formData.winningStance}
                      onChange={(e) =>
                        handleFieldSave('winningStance', e.target.value as WinningStance)
                      }
                      className="w-full p-1.5 border border-slate-300 rounded font-medium text-slate-800 text-xs"
                    >
                      <option value="Lost/Not Started">Lost/Not Started (0%)</option>
                      <option value="Initial Stages">Initial Stages (10%)</option>
                      <option value="Low Chance">Low Chance (25%)</option>
                      <option value="All are Equal">All are Equal (50%)</option>
                      <option value="Customer Prefers Us">Customer Prefers Us (75%)</option>
                      <option value="Under PO Negotiations">Under PO Negotiations (90%)</option>
                      <option value="Won/PO Received">Won/PO Received (100%)</option>
                    </select>

                    <div className="mt-3 text-[11px] text-slate-500">
                      Weighted Deal Value:
                      <div className="text-sm font-bold text-slate-900 tabular-nums mt-0.5">
                        {formatCurrencyValue(weightedDealValue, account.revenueCurrency, account.geography)}
                      </div>
                    </div>
                  </div>

                  {/* Adoption Category Multiplier (Auto-Derived from Products) */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-500 text-[11px] font-bold block">
                        Adoption Category:
                      </label>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-slate-400" />
                        Auto-Derived from Products
                      </span>
                    </div>

                    <div
                      className={`p-2 rounded-lg border flex items-center justify-between ${adoptionBadgeStyle.bg} ${adoptionBadgeStyle.border}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${adoptionBadgeStyle.dot}`} />
                        <span className={`text-xs font-bold ${adoptionBadgeStyle.text}`}>
                          {effectiveAdoptionCategory} ({adoptionResult.multiplier}× Multiplier)
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-tight">
                      {adoptionResult.ruleExplanation}
                    </p>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      Composite Account Value:
                      <div className="text-sm font-bold text-slate-900 tabular-nums mt-0.5">
                        {formatCurrencyValue(accountValue, account.revenueCurrency, account.geography)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Stage & Core Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">
                      Pipeline Stage:
                    </label>
                    <select
                      value={formData.stage}
                      onChange={(e) => handleFieldSave('stage', e.target.value as AccountStage)}
                      className="w-full p-2 border border-slate-300 rounded-lg font-bold text-slate-800"
                    >
                      <option value="New Account">1. New Account</option>
                      <option value="Nurturing">2. Nurturing</option>
                      <option value="Mature">3. Mature</option>
                      <option value="Critical">4. Critical</option>
                      <option value="Closed Won">5. Closed Won</option>
                      <option value="Closed Lost">Closed Lost (Loss Bin)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-500 font-bold block mb-1">
                      Procurement Process:
                    </label>
                    <div
                      className={`p-2 rounded border ${
                        account.aiEnrichedFields['procurementType']
                          ? 'bg-purple-50 border-purple-300 text-purple-900'
                          : 'bg-white border-slate-300 text-slate-800'
                      }`}
                    >
                      <select
                        value={formData.procurementType}
                        onChange={(e) =>
                          handleFieldSave('procurementType', e.target.value as ProcurementType)
                        }
                        className="w-full bg-transparent font-medium"
                      >
                        <option value="Direct Opportunity">Direct Opportunity</option>
                        <option value="Open RFP">Open RFP (Auto-creates subtasks)</option>
                        <option value="Closed RFP">Closed RFP (Auto-creates subtasks)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-slate-500 font-bold block text-xs">
                        Product Portfolio & Catalogue:
                      </label>
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {accountProducts.length} Selected
                      </span>
                    </div>

                    <div className="space-y-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50/70">
                      {PRODUCT_GROUPS.map((group) => {
                        const groupCount = group.products.filter((p) =>
                          accountProducts.some((ap) => ap.toLowerCase() === p.toLowerCase())
                        ).length;

                        return (
                          <div
                            key={group.groupId}
                            className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-slate-900">
                                  {group.groupName}
                                </span>
                                <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                                  {groupCount} / {group.products.length}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {group.ruleHint}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {group.products.map((prod) => {
                                const isSelected = accountProducts.some(
                                  (ap) => ap.toLowerCase() === prod.toLowerCase()
                                );

                                return (
                                  <button
                                    key={prod}
                                    type="button"
                                    onClick={() => handleToggleProduct(prod)}
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
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">
                      Account Owners:
                    </label>
                    <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Sales Owner:</span>
                        <span className="font-bold text-slate-800">{account.owners.sales}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Pre-Sales Owner:</span>
                        <span className="font-bold text-slate-800">{account.owners.preSales}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Solution Engineer:</span>
                        <span className="font-bold text-slate-800">{account.owners.solutionEngineer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Leader:</span>
                        <span className="font-bold text-slate-800">{account.owners.leader}</span>
                      </div>
                    </div>
                  </div>

                  {!isPartnerUser && (
                    <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-slate-800 font-bold flex items-center gap-1.5 text-xs">
                          <Handshake className="w-3.5 h-3.5 text-slate-500" />
                          <span>Partner Associations & SI Co-Bidders:</span>
                        </label>
                        <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          Internal Only · Hidden from Partners
                        </span>
                      </div>

                      {/* Tagged partners */}
                      <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-slate-50 rounded-lg border border-slate-200">
                        {formData.partners.length === 0 ? (
                          <span className="text-[11px] text-slate-400 italic">
                            No partners tagged for this opportunity.
                          </span>
                        ) : (
                          formData.partners.map((p) => (
                            <span
                              key={p}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-white text-slate-800 border border-slate-300 shadow-2xs"
                            >
                              <Handshake className="w-3 h-3 text-slate-500" />
                              <span>{p}</span>
                              <button
                                type="button"
                                onClick={() => handleRemovePartner(p)}
                                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded ml-0.5"
                                title={`Remove partner ${p}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      {/* Available partners quick toggle */}
                      <div>
                        <div className="text-[10px] text-slate-500 font-medium mb-1 flex items-center justify-between">
                          <span>Quick Add System Integrators:</span>
                          <button
                            type="button"
                            onClick={() => setShowAddPartnerInput(!showAddPartnerInput)}
                            className="text-slate-700 hover:text-slate-900 underline text-[10px]"
                          >
                            {showAddPartnerInput ? 'Cancel' : '+ Custom Partner'}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {systemPartners
                            .filter((sp) => !formData.partners.includes(sp))
                            .map((sp) => (
                              <button
                                key={sp}
                                type="button"
                                onClick={() => handleAddPartner(sp)}
                                className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 flex items-center gap-1 transition"
                              >
                                <Plus className="w-3 h-3 text-slate-400" />
                                <span>{sp}</span>
                              </button>
                            ))}
                        </div>

                        {showAddPartnerInput && (
                          <div className="mt-2 flex gap-1.5">
                            <input
                              type="text"
                              placeholder="Enter partner organization name..."
                              value={newPartnerInput}
                              onChange={(e) => setNewPartnerInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddPartner(newPartnerInput);
                                }
                              }}
                              className="flex-1 px-2 py-1 border border-slate-300 rounded text-xs text-slate-800 bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddPartner(newPartnerInput)}
                              disabled={!newPartnerInput.trim()}
                              className="px-2.5 py-1 bg-slate-900 text-white rounded text-xs font-medium hover:bg-slate-800 disabled:opacity-40"
                            >
                              Add
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="text-[10px] text-slate-500 leading-normal pt-1">
                        Especially for RFPs, multiple System Integrators can be partnered to bid. Partner users only see accounts where they are tagged; other partner tags remain confidential and strictly hidden.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-slate-500 font-bold block mb-1">
                      Head Office Address:
                    </label>
                    <p className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                      {account.headOfficeAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Strategic Account Notes */}
              <div>
                <label className="text-slate-500 font-bold block mb-1 flex items-center justify-between">
                  <span>Strategic Account Notes:</span>
                  {account.aiEnrichedFields['notes'] && (
                    <span className="text-purple-700 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Synthesized
                    </span>
                  )}
                </label>
                <div
                  className={`p-3 rounded-lg border text-xs leading-relaxed ${
                    account.aiEnrichedFields['notes']
                      ? 'bg-purple-50/70 border-purple-300 text-purple-950'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  {account.notes || 'No strategic notes recorded yet.'}
                </div>
              </div>

              {/* Account Documents Quick Widget */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-slate-500" />
                    <span className="font-semibold text-slate-900 text-sm">
                      Account Documents & Deliverables ({accountDocuments.length})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="overview-account-upload"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs cursor-pointer transition shadow-2xs"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload Multiple Files</span>
                    </label>
                    <input
                      id="overview-account-upload"
                      type="file"
                      multiple
                      onChange={(e) => handleAccountFileUpload(e.target.files)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setActiveTab('documents')}
                      className="text-xs text-slate-600 hover:text-slate-900 underline font-medium ml-1"
                    >
                      View All Documents →
                    </button>
                  </div>
                </div>

                {accountDocuments.length === 0 ? (
                  <div className="py-4 text-center text-slate-400 text-xs">
                    No documents uploaded yet. Upload proposals, signed contracts, or security certs.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {accountDocuments.slice(0, 6).map((doc) => (
                      <div
                        key={doc.id}
                        className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2 text-xs hover:border-slate-300 transition"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 truncate" title={doc.name}>
                              {doc.name}
                            </p>
                            <span className="text-[10px] text-slate-500">
                              {doc.category} · {doc.size}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDownloadAccountDoc(doc.name)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition"
                          title="Download file"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm">Associated Contacts ({accountContacts.length})</h4>
                <span className="text-slate-500 text-[11px]">
                  Governed by Mock CBAC & Consentium policies
                </span>
              </div>

              {accountContacts.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-lg">
                  No contacts linked to this account yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {accountContacts.map((contact) => (
                    <div key={contact.id} className="p-3.5 rounded-lg border border-slate-200 bg-white">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {contact.firstName} {contact.lastName}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {contact.designation}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {contact.tags.map((t) => (
                            <span key={t} className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] space-y-1">
                        <div>
                          Email: {contact.isMasked ? '••••••••••@•••••' : contact.email}
                        </div>
                        <div>
                          Phone: {contact.isMasked ? '+91 ••••• •••••' : contact.phone1}
                        </div>
                        <div className="text-slate-400 text-[10px]">
                          Consent State: <strong>{contact.consentState}</strong> ({contact.source})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tasks Tab - Full Tasks module scoped strictly to this account */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span>Account Tasks & SLA Tracker</span>
                    <span className="text-[11px] font-normal text-slate-500">
                      ({accountTasks.length} total for {formData.name})
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Full Tasks management module scoped to {formData.name}. Create tasks, log comments with channel tags, attach documents, and complete SLAs.
                  </p>
                </div>
              </div>

              <TasksView scopedAccountId={formData.id} hideHeaderStats={true} />
            </div>
          )}

          {/* Documents Tab - Multiple File Upload & Deliverables Management */}
          {activeTab === 'documents' && (
            <div className="space-y-5">
              {/* Header and Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-slate-600" />
                    <span>Account Documents & Enterprise Deliverables</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {accountDocuments.length} files
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Secure document vault for {formData.name}. Upload contracts, proposals, security certifications, and technical blueprints.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={docFilterCategory}
                    onChange={(e) => setDocFilterCategory(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 bg-white"
                  >
                    <option value="all">All Categories ({accountDocuments.length})</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Contract">Contract</option>
                    <option value="Security & Compliance">Security & Compliance</option>
                    <option value="Technical Architecture">Technical Architecture</option>
                    <option value="General">General</option>
                  </select>

                  <label
                    htmlFor="account-files-upload-btn"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs cursor-pointer transition shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Multiple Files</span>
                  </label>
                  <input
                    id="account-files-upload-btn"
                    type="file"
                    multiple
                    onChange={(e) => handleAccountFileUpload(e.target.files)}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files) {
                    handleAccountFileUpload(e.dataTransfer.files);
                  }
                }}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition flex flex-col items-center justify-center gap-2 ${
                  isDragOver
                    ? 'border-slate-800 bg-slate-100/70'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-700">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <label
                    htmlFor="account-files-drag-upload"
                    className="font-semibold text-slate-900 text-xs hover:underline cursor-pointer"
                  >
                    Click to browse
                  </label>
                  <span className="text-slate-500 text-xs"> or drag and drop multiple files here</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Supported formats: PDF, DOCX, XLSX, CSV, JSON, ZIP up to 50MB
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-medium text-slate-500">Default Category:</span>
                  <select
                    value={selectedUploadCategory}
                    onChange={(e) => setSelectedUploadCategory(e.target.value as DocumentCategory)}
                    className="px-2 py-0.5 rounded border border-slate-300 bg-white text-[10px] font-medium text-slate-700"
                  >
                    <option value="General">General</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Contract">Contract</option>
                    <option value="Security & Compliance">Security & Compliance</option>
                    <option value="Technical Architecture">Technical Architecture</option>
                  </select>
                </div>
                <input
                  id="account-files-drag-upload"
                  type="file"
                  multiple
                  onChange={(e) => handleAccountFileUpload(e.target.files)}
                  className="hidden"
                />
              </div>

              {/* Quick Sample Presets */}
              <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-medium">Quick enterprise templates:</span>
                <button
                  type="button"
                  onClick={() =>
                    handleAddSampleAccountDoc(
                      `${formData.name.replace(/\s+/g, '_')}_Master_Services_Agreement_2026.pdf`,
                      '3.2 MB',
                      'Contract'
                    )
                  }
                  className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 font-medium transition"
                >
                  + Master Agreement (MSA)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleAddSampleAccountDoc(
                      `FIPS_140_3_Cryptographic_Attestation_${formData.name.replace(/\s+/g, '_')}.pdf`,
                      '1.7 MB',
                      'Security & Compliance'
                    )
                  }
                  className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 font-medium transition"
                >
                  + FIPS 140-3 Attestation
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleAddSampleAccountDoc(
                      `Technical_Architecture_Differential_Privacy_v4.pdf`,
                      '4.8 MB',
                      'Technical Architecture'
                    )
                  }
                  className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 font-medium transition"
                >
                  + Architecture Blueprint
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleAddSampleAccountDoc(
                      `PrivaSapien_RFP_Technical_Response_Matrix.xlsx`,
                      '940 KB',
                      'Proposal'
                    )
                  }
                  className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 font-medium transition"
                >
                  + RFP Response Matrix
                </button>
              </div>

              {/* Document Items List */}
              {accountDocuments.filter(d => docFilterCategory === 'all' || d.category === docFilterCategory).length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-1.5">
                  <FileText className="w-6 h-6 text-slate-300" />
                  <span className="font-medium text-slate-600">No documents found matching criteria.</span>
                  <span className="text-[11px] text-slate-400">
                    Click &quot;Upload Multiple Files&quot; above or choose an enterprise template.
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  {accountDocuments
                    .filter(d => docFilterCategory === 'all' || d.category === docFilterCategory)
                    .map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-4 hover:border-slate-300 transition shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-700">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-900 truncate text-xs" title={doc.name}>
                                {doc.name}
                              </span>
                              <span
                                className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                                  doc.category === 'Contract'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : doc.category === 'Security & Compliance'
                                    ? 'bg-purple-50 text-purple-800 border-purple-200'
                                    : doc.category === 'Proposal'
                                    ? 'bg-sky-50 text-sky-800 border-sky-200'
                                    : doc.category === 'Technical Architecture'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                {doc.category}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>{doc.size}</span>
                              <span>·</span>
                              <span>Uploaded by <strong>{doc.uploadedBy}</strong></span>
                              <span>·</span>
                              <span>{new Date(doc.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleDownloadAccountDoc(doc.name)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 text-xs font-medium transition"
                            title="Download file"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveAccountDoc(doc.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Demos Tab */}
          {activeTab === 'demos' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Solution Engineering Demos & Gaps</h4>

              {accountDemos.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-lg">
                  No technical demos logged for this account.
                </div>
              ) : (
                accountDemos.map((demo) => (
                  <div key={demo.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{demo.title}</span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-xs">
                        {demo.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Scheduled: {new Date(demo.scheduledDate).toLocaleString()}
                    </div>
                    <div className="pt-2 border-t border-slate-100 text-xs">
                      <strong>Minutes of Meeting:</strong>
                      <p className="text-slate-700 mt-0.5">{demo.minutesOfMeeting}</p>
                    </div>
                    <div className="text-xs">
                      <strong className="text-amber-800">Identified Gaps:</strong>
                      <p className="text-slate-700 mt-0.5">{demo.gapsIdentified}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <Calendar className="w-3.5 h-3.5" />
            <span>Effective Change Date:</span>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="px-2 py-0.5 border border-slate-300 rounded text-xs bg-white"
            />
            {effectiveDate < new Date().toISOString().split('T')[0] && (
              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                Back-Dated Entry
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
