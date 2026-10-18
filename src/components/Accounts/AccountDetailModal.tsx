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
  Contact,
  ComplianceStatus,
  SowRequirementRow,
  SubmissionChecklistItem,
  ReviewScheduleItem,
} from '../../types/crm';
import { useCrm } from '../../context/CrmContext';
import { COMPLEMENTARY_PARTNER_TOOLS } from '../../data/productMatrixData';
import { TasksView } from '../Tasks/TasksView';
import { DemoDetailBalloon } from '../Demos/DemoDetailBalloon';
import { ContactEditModal } from '../Contacts/ContactEditModal';
import { ItemAuditTrailModal } from '../common/ItemAuditTrailModal';
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
  FileSpreadsheet,
  Layers,
  ExternalLink,
  Eye,
  BookOpen,
  FileCheck2,
  CheckCheck,
  Search,
  Filter,
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
    convertSowToExcel,
    generatePreliminaryRemarks,
    updateSowRow,
    approveFinalSow,
    processRfpExtractionTasks,
    activeContextVersion,
  } = useCrm();

  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'tasks' | 'documents' | 'demos'>('overview');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [auditTargetContact, setAuditTargetContact] = useState<Contact | null>(null);

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

  const liveAccount = accounts.find((a) => a.id === account.id) || formData;
  const accountDocuments = liveAccount.documents || formData.documents || [];
  const sowRequirements = liveAccount.sowRequirements || formData.sowRequirements || [];

  // Document Segregation: 'sow' | 'other' | 'rfp'
  const isRfpAccount = liveAccount.procurementType === 'Open RFP' || liveAccount.procurementType === 'Closed RFP';
  const [docSubSection, setDocSubSection] = useState<'sow' | 'other' | 'rfp'>('sow');

  // Documents state and methods
  const [selectedUploadCategory, setSelectedUploadCategory] = useState<DocumentCategory>('Scope of Work / Requirements');
  const [docFilterCategory, setDocFilterCategory] = useState<string>('all');
  const [isDragOver, setIsDragOver] = useState(false);

  // SoW Ingestion State
  const [isConvertingSow, setIsConvertingSow] = useState(false);
  const [isGeneratingRemarks, setIsGeneratingRemarks] = useState(false);
  const [sowSearchTerm, setSowSearchTerm] = useState('');
  const [sowStatusFilter, setSowStatusFilter] = useState('all');

  // Source Citation Drawer
  const [activeCitation, setActiveCitation] = useState<{
    clause: string;
    snippet: string;
    confidence?: string;
  } | null>(null);
  const [isCitationPinned, setIsCitationPinned] = useState(false);

  // RFP Extraction Review Modal
  const [rfpReviewModalOpen, setRfpReviewModalOpen] = useState(false);
  const [rfpPendingDocName, setRfpPendingDocName] = useState('');
  const [rfpChecklistDraft, setRfpChecklistDraft] = useState<SubmissionChecklistItem[]>([]);
  const [rfpLegalDraft, setRfpLegalDraft] = useState<ReviewScheduleItem[]>([]);
  const [rfpDeliveryDraft, setRfpDeliveryDraft] = useState<ReviewScheduleItem[]>([]);
  const [rfpCommercialDraft, setRfpCommercialDraft] = useState<ReviewScheduleItem[]>([]);
  const [rfpInfraDraft, setRfpInfraDraft] = useState<ReviewScheduleItem[]>([]);
  const [rfpOtherDraft, setRfpOtherDraft] = useState<ReviewScheduleItem[]>([]);
  const [rfpSowPreviewText, setRfpSowPreviewText] = useState('');

  const triggerRfpExtraction = (docName: string) => {
    setRfpPendingDocName(docName);

    const defaultChecklist: SubmissionChecklistItem[] = [
      {
        id: `chk-${Date.now()}-1`,
        documentName: 'Manufacturer Authorization Form (MAF / Form-B)',
        description: 'OEM commitment on genuine software licensing and 5-year security patch warranty.',
        mandatory: true,
        owner: 'OEM',
        status: 'Ready',
        notes: 'Signed by CEO Dr. Siddharth Sen on letterhead.',
      },
      {
        id: `chk-${Date.now()}-2`,
        documentName: 'Power of Attorney (PoA) on ₹500 Notarized Stamp Paper',
        description: 'Authorized signatory certification for prime bidding consortium.',
        mandatory: true,
        owner: 'SI Partner',
        assignedPartnerName: liveAccount.partners[0] || 'Wipro Technologies',
        status: 'In Progress',
        notes: 'Wipro partner legal desk executing stamp paper in Mumbai.',
      },
      {
        id: `chk-${Date.now()}-3`,
        documentName: 'FIPS 140-3 Cryptographic Boundary Attestation Certificate',
        description: 'Third-party accredited lab audit report for cryptographic boundary.',
        mandatory: true,
        owner: 'OEM',
        status: 'Ready',
        notes: 'Attached in account document repository.',
      },
      {
        id: `chk-${Date.now()}-4`,
        documentName: 'Integrity Pact & Anti-Collusion Undertaking',
        description: 'Bank standard non-collusion format signed jointly by OEM and Lead SI.',
        mandatory: true,
        owner: 'Both',
        assignedPartnerName: liveAccount.partners[0] || 'Wipro Technologies',
        status: 'Pending',
        notes: 'Pending joint signatures.',
      },
      {
        id: `chk-${Date.now()}-5`,
        documentName: 'Audited Financial Net-Worth Statements (Last 3 FYs)',
        description: 'Last 3 audited balance sheets proving positive net worth.',
        mandatory: true,
        owner: 'SI Partner',
        assignedPartnerName: liveAccount.partners[0] || 'Wipro Technologies',
        status: 'Ready',
        notes: 'Wipro FY24-FY26 audited reports packaged.',
      },
    ];

    const defaultLegal: ReviewScheduleItem[] = [
      {
        id: `leg-${Date.now()}-1`,
        category: 'Indemnity & IP Infringement',
        clauseRef: 'Section 8.2',
        title: 'Unlimited Third-Party IP Infringement Indemnification',
        description: 'Bidder & OEM shall defend, indemnify, and hold harmless the Bank without monetary ceiling.',
        ownerOrRole: 'Legal Counsel',
        riskOrImpact: 'High',
        status: 'Flagged',
        notes: 'Request liability cap at 100% of deal value in pre-bid queries.',
      },
      {
        id: `leg-${Date.now()}-2`,
        category: 'Liquidated Damages',
        clauseRef: 'Section 11.4',
        title: 'Weekly 0.5% Delay Penalty up to 10% Contract Max',
        description: 'Delay penalty on milestone sign-offs not attributable to Bank dependency.',
        ownerOrRole: 'Sales & Delivery Lead',
        riskOrImpact: 'Medium',
        status: 'Reviewed',
        notes: 'Acceptable with standard grace period.',
      },
      {
        id: `leg-${Date.now()}-3`,
        category: 'Dispute Resolution & Jurisdiction',
        clauseRef: 'Section 14.1',
        title: 'Sole Arbitration in Mumbai under Indian Arbitration Act',
        description: 'Exclusive jurisdiction over all legal disputes in Mumbai courts.',
        ownerOrRole: 'Legal Counsel',
        riskOrImpact: 'Standard',
        status: 'Approved',
        notes: 'Compliant with enterprise policy.',
      },
    ];

    const defaultDelivery: ReviewScheduleItem[] = [
      {
        id: `del-${Date.now()}-1`,
        category: 'Implementation Milestone',
        clauseRef: 'Annexure C - Phase 1',
        title: 'Production Cluster Deployment across 2 DC / DR Enclaves',
        description: 'Deployment within 6 weeks of Purchase Order issuance.',
        ownerOrRole: 'Solution Engineer (Rahul Nair)',
        riskOrImpact: 'Medium',
        status: 'Reviewed',
        notes: 'Air-gapped Helm charts validated.',
      },
      {
        id: `del-${Date.now()}-2`,
        category: 'Manpower Allocation',
        clauseRef: 'Annexure C - Staffing',
        title: 'Two Full-Time On-Premise L3 Engineers at CBD Belapur NOC',
        description: 'On-site technical support for first 6 months post go-live.',
        ownerOrRole: 'SI Partner Delivery',
        assignedPartnerName: liveAccount.partners[0] || 'Wipro Technologies',
        riskOrImpact: 'High',
        status: 'Pending Review',
        notes: 'Partner agreed to provide L1/L2 on-site; OEM provides remote L3 tier.',
      },
    ];

    const defaultCommercial: ReviewScheduleItem[] = [
      {
        id: `com-${Date.now()}-1`,
        category: 'Rate Card & Pricing',
        clauseRef: 'Commercial Format BoQ',
        title: 'Tier-1 Multi-Cluster Rate Card & Volume Scale Discounts',
        description: 'Fixed unit pricing for core enterprise licenses and annual AMC.',
        ownerOrRole: 'Sales Owner',
        riskOrImpact: 'High',
        status: 'Reviewed',
        notes: 'Commercial pricing model approved.',
      },
      {
        id: `com-${Date.now()}-2`,
        category: 'Bank Guarantee (BG)',
        clauseRef: 'Section 5.3',
        title: 'Performance Bank Guarantee (PBG) of 5% Contract Value',
        description: 'PBG valid for 18 months from nationalized bank.',
        ownerOrRole: 'Finance & SalesOps',
        riskOrImpact: 'Standard',
        status: 'Approved',
        notes: 'Bank guarantee format aligned with treasury.',
      },
    ];

    const defaultInfra: ReviewScheduleItem[] = [
      {
        id: `inf-${Date.now()}-1`,
        category: 'Compute & Sizing',
        clauseRef: 'Sizing Section 3',
        title: 'Compute Baseline: 3 Master Nodes & 6 Worker Nodes with NVMe',
        description: 'High-availability air-gapped container cluster compute requirements.',
        ownerOrRole: 'Solution Engineer',
        riskOrImpact: 'Standard',
        status: 'Approved',
        notes: 'Client infrastructure team allocated hardware.',
      },
      {
        id: `inf-${Date.now()}-2`,
        category: 'SBOM & Zero Vulnerability',
        clauseRef: 'Security Section 9',
        title: 'CycloneDX SBOM with Zero Critical Unmitigated CVEs',
        description: 'Automated vulnerability attestation on container registry.',
        ownerOrRole: 'Security Architect',
        riskOrImpact: 'High',
        status: 'Reviewed',
        notes: 'Zero critical CVEs attestation signed.',
      },
    ];

    const defaultOther: ReviewScheduleItem[] = [
      {
        id: `oth-${Date.now()}-1`,
        category: 'User Training & Knowledge Transfer',
        clauseRef: 'Section 16.2',
        title: '2-Week Administrator Hands-On Training for 15 Bank Officers',
        description: 'Certification training and lab sessions prior to final UAT sign-off.',
        ownerOrRole: 'Pre-Sales / Training Lead',
        riskOrImpact: 'Low',
        status: 'Approved',
        notes: 'Training syllabus ready.',
      },
    ];

    const sowPreview = `10 Core Technical Requirement Clauses extracted including Differential Privacy Bounds, Format-Preserving Encryption, AI Guardrails Prompt Defense, and Air-Gapped Kubernetes Deployment.`;

    setRfpChecklistDraft(defaultChecklist);
    setRfpLegalDraft(defaultLegal);
    setRfpDeliveryDraft(defaultDelivery);
    setRfpCommercialDraft(defaultCommercial);
    setRfpInfraDraft(defaultInfra);
    setRfpOtherDraft(defaultOther);
    setRfpSowPreviewText(sowPreview);
    setRfpReviewModalOpen(true);
  };

  const handleAccountFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    let isRfpDetected = false;
    let rfpFileName = '';

    const newDocs: AccountDocument[] = Array.from(files).map((file) => {
      let sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      if (file.size > 1024 * 1024) {
        sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      }

      let detectedCat: DocumentCategory =
        docSubSection === 'sow'
          ? 'Scope of Work / Requirements'
          : docSubSection === 'rfp'
          ? 'RFP / Corrigendum'
          : 'Other Documents';

      const lower = file.name.toLowerCase();
      if (lower.includes('rfp') || lower.includes('corrigendum') || lower.includes('tender') || docSubSection === 'rfp') {
        detectedCat = 'RFP / Corrigendum';
        isRfpDetected = true;
        rfpFileName = file.name;
      } else if (lower.includes('sow') || lower.includes('scope') || lower.includes('requirements') || docSubSection === 'sow') {
        detectedCat = 'Scope of Work / Requirements';
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

    if (isRfpDetected) {
      triggerRfpExtraction(rfpFileName || 'RFP_Tender_Document.pdf');
    }
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
                    <label className="text-slate-500 font-bold block mb-1">
                      Account Type:
                    </label>
                    <select
                      value={formData.publicPrivate || 'Private'}
                      onChange={(e) =>
                        handleFieldSave('publicPrivate', e.target.value as 'Public' | 'Private')
                      }
                      className="w-full p-2 border border-slate-300 rounded-lg font-bold text-slate-800 bg-white"
                    >
                      <option value="Private">Private Enterprise</option>
                      <option value="Public">Public / Government Sector</option>
                    </select>
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

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingContact(contact)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 text-white hover:bg-slate-800 text-[11px] font-semibold transition"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setAuditTargetContact(contact)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-semibold transition"
                          >
                            <History className="w-3 h-3 text-slate-500" />
                            <span>Audit ({contact.fieldAuditTrail?.length || 0})</span>
                          </button>
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

          {/* Documents Tab - Segregated Sub-Sections: SoW / Requirements, RFP / Corrigendum, Other Documents */}
          {activeTab === 'documents' && (
            <div className="space-y-5">
              {/* Top Sub-Section Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setDocSubSection('sow')}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      docSubSection === 'sow'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                    <span>Scope of Work / Requirements</span>
                    {sowRequirements.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-bold">
                        {sowRequirements.length}
                      </span>
                    )}
                  </button>

                  {isRfpAccount && (
                    <button
                      type="button"
                      onClick={() => setDocSubSection('rfp')}
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                        docSubSection === 'rfp'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Layers className="w-4 h-4 text-purple-600" />
                      <span>RFP / Corrigendum</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-100 text-purple-800 font-bold">
                        Tender AI
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setDocSubSection('other')}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      docSubSection === 'other'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Paperclip className="w-4 h-4 text-slate-600" />
                    <span>Other Documents</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-bold">
                      {accountDocuments.filter((d) => d.category !== 'Scope of Work / Requirements' && d.category !== 'RFP / Corrigendum').length}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{formData.name}</span>
                  <span>•</span>
                  <span>{formData.procurementType}</span>
                </div>
              </div>

              {/* SUB-SECTION 1: Scope of Work / Requirements */}
              {docSubSection === 'sow' && (
                <div className="space-y-4">
                  {/* Action Bar */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                        <span>Scope of Work Compliance Engine</span>
                        {liveAccount.sowFinalApproved && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Final Approved ✓
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Convert uploaded customer requirements into structured spreadsheets, generate preliminary responses via product context, and update roadmap matrix.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          setIsConvertingSow(true);
                          await convertSowToExcel(formData.id);
                          setIsConvertingSow(false);
                        }}
                        disabled={isConvertingSow}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition shadow-2xs disabled:opacity-50"
                        title="Uses curated AI service to convert SoW into an Excel format"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                        <span>{isConvertingSow ? 'Extracting SoW...' : 'Convert to Excel'}</span>
                      </button>

                      {sowRequirements.length > 0 && (
                        <>
                          <button
                            type="button"
                            onClick={async () => {
                              setIsGeneratingRemarks(true);
                              await generatePreliminaryRemarks(formData.id);
                              setIsGeneratingRemarks(false);
                            }}
                            disabled={isGeneratingRemarks}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition shadow-2xs disabled:opacity-50"
                            title="Consumes backend product context file and checks partner matrix for DAM, DLP, EDR, WAF"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                            <span>{isGeneratingRemarks ? 'Analyzing Context...' : 'Preliminary Remarks (AI)'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => approveFinalSow(formData.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition shadow-2xs"
                            title="Approve Final SoW to update Product Context KB & Product Requirements Matrix"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Approve Final SoW</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Search and Filters */}
                  {sowRequirements.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1 max-w-md">
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={sowSearchTerm}
                            onChange={(e) => setSowSearchTerm(e.target.value)}
                            placeholder="Filter requirements by clause, keyword, or partner..."
                            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                        <select
                          value={sowStatusFilter}
                          onChange={(e) => setSowStatusFilter(e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 bg-white"
                        >
                          <option value="all">All Statuses ({sowRequirements.length})</option>
                          <option value="Fully Compliant">Fully Compliant</option>
                          <option value="Partially Compliant">Partially Compliant</option>
                          <option value="Non-Compliant">Non-Compliant</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">
                          {sowRequirements.filter((r) => r.complianceStatus === 'Fully Compliant').length} Fully •{' '}
                          {sowRequirements.filter((r) => r.complianceStatus === 'Partially Compliant').length} Partial / Partner •{' '}
                          {sowRequirements.filter((r) => r.complianceStatus === 'Non-Compliant').length} Gaps
                        </span>
                      </div>
                    </div>
                  )}

                  {/* SoW Spreadsheet Table */}
                  {sowRequirements.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-3">
                      <FileSpreadsheet className="w-8 h-8 text-slate-300" />
                      <div>
                        <p className="font-semibold text-slate-700 text-sm">No Scope of Work Extracted Yet</p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          Click &quot;Convert to Excel&quot; to automatically extract requirements clauses into an enterprise spreadsheet.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          setIsConvertingSow(true);
                          await convertSowToExcel(formData.id);
                          setIsConvertingSow(false);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                        <span>Generate Sample SoW Excel</span>
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs bg-white">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100/90 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                            <th className="py-2.5 px-3 whitespace-nowrap">Clause #</th>
                            <th className="py-2.5 px-3 whitespace-nowrap">Category</th>
                            <th className="py-2.5 px-3 min-w-[240px]">Requirement Details</th>
                            <th className="py-2.5 px-3 whitespace-nowrap">Compliance Status</th>
                            <th className="py-2.5 px-3 min-w-[260px]">Preliminary Remarks & Complementary Tools</th>
                            <th className="py-2.5 px-3 min-w-[200px]">QA Review (Manual)</th>
                            <th className="py-2.5 px-3 min-w-[220px]">Final Response</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sowRequirements
                            .filter((row) => {
                              if (sowStatusFilter !== 'all' && row.complianceStatus !== sowStatusFilter) return false;
                              if (sowSearchTerm) {
                                const q = sowSearchTerm.toLowerCase();
                                return (
                                  row.clauseNumber.toLowerCase().includes(q) ||
                                  row.category.toLowerCase().includes(q) ||
                                  row.requirementText.toLowerCase().includes(q) ||
                                  row.preliminaryRemarks.toLowerCase().includes(q) ||
                                  (row.complementaryTool && row.complementaryTool.toLowerCase().includes(q))
                                );
                              }
                              return true;
                            })
                            .map((row) => (
                              <tr key={row.id} className="hover:bg-slate-50/70 transition">
                                <td className="py-3 px-3 font-mono font-bold text-indigo-700 whitespace-nowrap">
                                  {row.clauseNumber}
                                </td>
                                <td className="py-3 px-3 whitespace-nowrap">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                    {row.category}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-slate-800 leading-relaxed">
                                  <p>{row.requirementText}</p>
                                </td>
                                <td className="py-3 px-3 whitespace-nowrap">
                                  <select
                                    value={row.complianceStatus}
                                    onChange={(e) =>
                                      updateSowRow(formData.id, row.id, {
                                        complianceStatus: e.target.value as ComplianceStatus,
                                      })
                                    }
                                    className={`px-2 py-1 text-xs border rounded font-semibold ${
                                      row.complianceStatus === 'Fully Compliant'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                        : row.complianceStatus === 'Partially Compliant'
                                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                                        : 'bg-rose-50 text-rose-800 border-rose-300'
                                    }`}
                                  >
                                    <option value="Fully Compliant">Fully Compliant</option>
                                    <option value="Partially Compliant">Partially Compliant</option>
                                    <option value="Non-Compliant">Non-Compliant</option>
                                  </select>
                                </td>
                                <td className="py-3 px-3 space-y-1.5">
                                  <div className="text-slate-700 text-xs">
                                    {row.preliminaryRemarks}
                                  </div>

                                  {/* Pre-filled Complementary Tool Recommendation */}
                                  {row.complementaryTool && (
                                    <div className="p-2 rounded bg-indigo-50/70 border border-indigo-200/80 text-[11px] space-y-1">
                                      <div className="flex items-center justify-between font-semibold text-indigo-900">
                                        <span className="flex items-center gap-1">
                                          <Sparkles className="w-3 h-3 text-indigo-600" />
                                          Partner Solution: {row.complementaryTool}
                                        </span>
                                      </div>
                                      {row.complementaryToolRationale && (
                                        <p className="text-slate-600 text-[10px]">
                                          {row.complementaryToolRationale}
                                        </p>
                                      )}
                                    </div>
                                  )}

                                  {/* 1-Click Source Citation Drawer Trigger */}
                                  {row.citationSnippet && (
                                    <div className="pt-0.5">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setActiveCitation({
                                            clause: row.clauseNumber,
                                            snippet: row.citationSnippet || '',
                                            confidence: row.confidenceScore,
                                          })
                                        }
                                        className="inline-flex items-center gap-1 text-[10px] text-indigo-700 hover:text-indigo-900 bg-white hover:bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-medium transition"
                                        title="Click to view full citation context from Product Context Specification"
                                      >
                                        <BookOpen className="w-2.5 h-2.5" />
                                        <span>Product Context Citation</span>
                                      </button>
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-3">
                                  <input
                                    type="text"
                                    value={row.qaReview || ''}
                                    onChange={(e) =>
                                      updateSowRow(formData.id, row.id, {
                                        qaReview: e.target.value,
                                      })
                                    }
                                    placeholder="Enter QA verification..."
                                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                  />
                                </td>
                                <td className="py-3 px-3">
                                  <textarea
                                    rows={2}
                                    value={row.finalResponse || ''}
                                    onChange={(e) =>
                                      updateSowRow(formData.id, row.id, {
                                        finalResponse: e.target.value,
                                      })
                                    }
                                    placeholder="Final audited response to client..."
                                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                  />
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* SUB-SECTION 2: RFP / Corrigendum (Only for RFP Accounts) */}
              {docSubSection === 'rfp' && isRfpAccount && (
                <div className="space-y-4">
                  {/* RFP Ingestion Banner */}
                  <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold shadow-2xs">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          RFP & Corrigendum Multi-Task Triage Engine
                        </h4>
                        <p className="text-xs text-slate-600">
                          Uploading a tender or corrigendum automatically extracts Submission Checklists, Legal, Delivery, Commercial, and Infra review tasks.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => triggerRfpExtraction('SBI_Core_Banking_RFP_2026.pdf')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-medium text-xs transition shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Simulate RFP Scan & Extraction</span>
                      </button>
                    </div>
                  </div>

                  {/* Upload Dropzone specifically for RFP / Corrigendum */}
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
                        ? 'border-purple-600 bg-purple-50/70'
                        : 'border-purple-200 bg-purple-50/30 hover:bg-purple-50/50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <label
                        htmlFor="rfp-file-upload-input"
                        className="font-semibold text-purple-900 text-xs hover:underline cursor-pointer"
                      >
                        Click to upload RFP / Corrigendum PDF or DOCX
                      </label>
                      <span className="text-slate-500 text-xs"> or drag and drop tender documents</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Auto-triggers multi-party task generation (Submission Checklist, Legal, Delivery, Commercial, Architecture)
                    </p>
                    <input
                      id="rfp-file-upload-input"
                      type="file"
                      multiple
                      onChange={(e) => handleAccountFileUpload(e.target.files)}
                      className="hidden"
                    />
                  </div>

                  {/* List of Uploaded RFP / Corrigendum documents */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Uploaded Tender Documents
                    </div>
                    {accountDocuments.filter((d) => d.category === 'RFP / Corrigendum').length === 0 ? (
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-slate-400 text-xs text-center">
                        No RFP / Corrigendum documents uploaded yet. Click &quot;Simulate RFP Scan & Extraction&quot; above to preview.
                      </div>
                    ) : (
                      accountDocuments
                        .filter((d) => d.category === 'RFP / Corrigendum')
                        .map((doc) => (
                          <div
                            key={doc.id}
                            className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                                <FileText className="w-4 h-4" />
                              </span>
                              <div>
                                <span className="font-semibold text-slate-900 text-xs">{doc.name}</span>
                                <div className="text-[10px] text-slate-500 flex items-center gap-2">
                                  <span>{doc.size}</span>
                                  <span>•</span>
                                  <span>Uploaded by {doc.uploadedBy}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => triggerRfpExtraction(doc.name)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-medium transition"
                            >
                              <Sparkles className="w-3 h-3 text-purple-600" />
                              <span>Re-run Triage Tasks</span>
                            </button>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

              {/* SUB-SECTION 3: Other Documents */}
              {docSubSection === 'other' && (
                <div className="space-y-4">
                  {/* Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={docFilterCategory}
                        onChange={(e) => setDocFilterCategory(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 bg-white"
                      >
                        <option value="all">All Other Categories</option>
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
                        <span>Upload Files</span>
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
                      <span className="text-slate-500 text-xs"> or drag and drop general account files</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Supported formats: PDF, DOCX, XLSX, CSV, JSON, ZIP up to 50MB
                    </p>
                    <input
                      id="account-files-drag-upload"
                      type="file"
                      multiple
                      onChange={(e) => handleAccountFileUpload(e.target.files)}
                      className="hidden"
                    />
                  </div>

                  {/* Document Items List */}
                  {accountDocuments.filter((d) => d.category !== 'Scope of Work / Requirements' && d.category !== 'RFP / Corrigendum' && (docFilterCategory === 'all' || d.category === docFilterCategory)).length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">
                      No documents found in this section.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {accountDocuments
                        .filter((d) => d.category !== 'Scope of Work / Requirements' && d.category !== 'RFP / Corrigendum' && (docFilterCategory === 'all' || d.category === docFilterCategory))
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
                                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border bg-slate-100 text-slate-700 border-slate-200">
                                    {doc.category}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                                  <span>{doc.size}</span>
                                  <span>·</span>
                                  <span>Uploaded by <strong>{doc.uploadedBy}</strong></span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleDownloadAccountDoc(doc.name)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 text-xs font-medium transition"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveAccountDoc(doc.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
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
            </div>
          )}

          {/* Demos Tab */}
          {activeTab === 'demos' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Solution Engineering Demos & Gaps</h4>
                  <p className="text-xs text-slate-500">
                    Click any demo to open its detail balloon with Agenda, Minutes, and Comments
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  {accountDemos.length} Logged
                </span>
              </div>

              {accountDemos.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  No technical demos logged for this account yet.
                </div>
              ) : (
                accountDemos.map((demo) => {
                  const isCompleted = demo.status === 'Completed';
                  const commentsCount = (demo.comments || []).length;
                  const agendaSnippet = demo.agenda
                    ? demo.agenda.split('\n')[0].replace(/^[0-9]+[.)]\s*/, '').trim()
                    : 'Pre-demo agenda documented';

                  return (
                    <div
                      key={demo.id}
                      onClick={() => setSelectedDemoId(demo.id)}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group space-y-2.5"
                      title="Click to open detailed Demo Balloon"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition truncate block">
                            {demo.title}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            Scheduled: {new Date(demo.scheduledDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold border shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {demo.status}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                        <strong className="text-slate-700 block text-[11px] mb-0.5">Summary Agenda:</strong>
                        <p className="line-clamp-2">{agendaSnippet}</p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px]">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium border border-blue-100">
                            Agenda
                          </span>
                          {isCompleted ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium border border-emerald-100">
                              Minutes Logged
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-600 font-medium border border-slate-200">
                              Minutes: Pending
                            </span>
                          )}
                          {demo.gapsIdentified && demo.gapsIdentified.trim() ? (
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 font-medium border border-amber-200/80">
                              Gaps Noted
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-500 font-medium border border-slate-200">
                              No Gaps
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-medium border border-purple-100">
                            {commentsCount} Comments
                          </span>
                        </div>

                        <span className="text-blue-600 font-bold text-xs group-hover:translate-x-0.5 transition flex items-center gap-0.5 shrink-0">
                          Open Balloon 🎈 →
                        </span>
                      </div>
                    </div>
                  );
                })
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

      {/* Demo Detail Balloon */}
      {selectedDemoId && (
        (() => {
          const selDemo = demos.find((d) => d.id === selectedDemoId);
          return selDemo ? (
            <DemoDetailBalloon
              demo={selDemo}
              onClose={() => setSelectedDemoId(null)}
            />
          ) : null;
        })()
      )}

      {/* Edit Contact Modal */}
      {editingContact && (
        <ContactEditModal
          contact={editingContact}
          onClose={() => setEditingContact(null)}
        />
      )}

      {/* Contact Audit Trail Modal */}
      {auditTargetContact && (
        <ItemAuditTrailModal
          title={`${auditTargetContact.firstName} ${auditTargetContact.lastName}`}
          subtitle={`Audit trail history for ${formData.name} contact`}
          entityType="Contact"
          entries={auditTargetContact.fieldAuditTrail || []}
          onClose={() => setAuditTargetContact(null)}
        />
      )}

      {/* 1-Click Persistent Source Citation Drawer */}
      {activeCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Product Context Specification Citation
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Clause {activeCitation.clause} • PrivaSapien Core Architecture Knowledge Base
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveCitation(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Verified Backend Context:</span>
                {activeCitation.confidence && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    {activeCitation.confidence} Confidence
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-slate-800 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed whitespace-pre-wrap">
                {activeCitation.snippet}
              </p>
            </div>

            <div className="text-[11px] text-slate-500 leading-normal">
              This citation is extracted directly from the active Product Context file maintained in the Admin Knowledge Base. To modify baseline compliance responses or add new commitments, edit the context in the Admin console.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveCitation(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
              >
                Dismiss Citation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RFP AI Extraction Review Modal (Before Task Generation) */}
      {rfpReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    RFP Document Extraction Review & Task Triage
                  </h3>
                  <p className="text-xs text-indigo-200/80 mt-0.5">
                    Source Document: <strong>{rfpPendingDocName}</strong> • {formData.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRfpReviewModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Note about SoW routing */}
            <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Automatic SoW Routing:</strong> The Scope of Work clauses (10 requirements) will be automatically sent to the <strong>Scope of Work / Requirements</strong> section and NOT created as a separate task.
              </span>
            </div>

            {/* Tabs for Tasks Preview */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 text-xs">
                <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px] mr-2">
                  Tasks to Generate:
                </span>
                <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-800 font-semibold border border-indigo-200">
                  1. Submission Docs Checklist ({rfpChecklistDraft.length})
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                  2. Legal Review ({rfpLegalDraft.length})
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                  3. Delivery Review ({rfpDeliveryDraft.length})
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                  4. Commercial Review ({rfpCommercialDraft.length})
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                  5. Infra & Architecture ({rfpInfraDraft.length})
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                  6. Other Requirements ({rfpOtherDraft.length})
                </span>
              </div>

              {/* Task 1: Submission Docs Checklist Preview */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">
                      Task 1: Submission Docs Checklist Preview
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      All required tender documents with owner assignment (OEM, SI Partner, Both)
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <th className="py-2 px-3">Document Name</th>
                        <th className="py-2 px-3">Mandatory</th>
                        <th className="py-2 px-3">Owner</th>
                        <th className="py-2 px-3">Assigned SI Partner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rfpChecklistDraft.map((chk, idx) => (
                        <tr key={chk.id || idx}>
                          <td className="py-2 px-3 font-medium text-slate-900">
                            {chk.documentName}
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Mandatory
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <select
                              value={chk.owner}
                              onChange={(e) => {
                                const newDraft = [...rfpChecklistDraft];
                                newDraft[idx].owner = e.target.value as any;
                                setRfpChecklistDraft(newDraft);
                              }}
                              className="px-2 py-0.5 border border-slate-300 rounded text-xs bg-white"
                            >
                              <option value="OEM">OEM</option>
                              <option value="SI Partner">SI Partner</option>
                              <option value="Both">Both</option>
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            {chk.owner === 'OEM' ? (
                              <span className="text-slate-400 italic text-[11px]">PrivaSapien (OEM)</span>
                            ) : (
                              <select
                                value={chk.assignedPartnerName || ''}
                                onChange={(e) => {
                                  const newDraft = [...rfpChecklistDraft];
                                  newDraft[idx].assignedPartnerName = e.target.value;
                                  setRfpChecklistDraft(newDraft);
                                }}
                                className="px-2 py-0.5 border border-indigo-300 rounded text-xs bg-indigo-50/50 font-medium text-indigo-900"
                              >
                                {(formData.partners || ['Wipro Technologies', 'Infosys', 'TCS']).map((p) => (
                                  <option key={p} value={p}>
                                    {p}
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tasks 2-5 Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                  <div className="font-bold text-xs text-slate-900">
                    Task 2: Legal Review ({rfpLegalDraft.length} Clauses)
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Includes Unlimited Indemnity (§8.2), Liquidated Damages (§11.4), and Arbitration in Mumbai.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                  <div className="font-bold text-xs text-slate-900">
                    Task 3: Delivery Review ({rfpDeliveryDraft.length} Clauses)
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Includes 16-Week Production Go-Live (§4.1) and Onsite Security Engineers (§6.3).
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                  <div className="font-bold text-xs text-slate-900">
                    Task 4: Commercial Format Review ({rfpCommercialDraft.length} Items)
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Includes Price Bid BoQ Annexure-C, 5-Year AMC, and 3% Performance Bank Guarantee.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                  <div className="font-bold text-xs text-slate-900">
                    Task 5: Infrastructure & Architecture ({rfpInfraDraft.length} Clauses)
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Includes Air-Gapped Red Hat OpenShift (§2.4), Hardware FIPS 140-3 HSM, and CycloneDX SBOM.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Ready to generate 5 review tasks and populate the SoW Excel matrix.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRfpReviewModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    processRfpExtractionTasks(formData.id, rfpPendingDocName, {
                      checklistItems: rfpChecklistDraft,
                      legalItems: rfpLegalDraft,
                      deliveryItems: rfpDeliveryDraft,
                      commercialItems: rfpCommercialDraft,
                      infraItems: rfpInfraDraft,
                      otherItems: rfpOtherDraft,
                      sowText: rfpSowPreviewText,
                    });
                    setRfpReviewModalOpen(false);
                    setDocSubSection('sow');
                  }}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm & Generate Tasks + Route SoW</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
