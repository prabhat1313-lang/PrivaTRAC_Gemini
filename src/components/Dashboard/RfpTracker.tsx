import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Account } from '../../types/crm';
import {
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  FileText,
  Building2,
  ArrowRight,
  Sparkles,
  Download,
  AlertTriangle,
  Layers,
  Eye,
  EyeOff,
  CheckSquare,
  Users,
  Shield,
  X,
  SlidersHorizontal,
  ChevronsUpDown,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { formatCurrencyValue } from '../../utils/calculations';
import { RfpWorkflowModal } from '../Tasks/RfpWorkflowModal';

export type RfpMilestoneType =
  | 'pre_bid_query'
  | 'pre_bid_meeting'
  | 'corrigendum'
  | 'submission_deadline'
  | 'commercial_opening';

export interface RfpMilestone {
  id: string;
  accountId: string;
  accountName: string;
  tenderRef: string;
  title: string;
  dateStr: string; // YYYY-MM-DD
  timeStr?: string;
  type: RfpMilestoneType;
  priority: 'Critical' | 'High' | 'Medium';
  procurementType: 'Open RFP' | 'Closed RFP';
  dealValueINR: number;
  currency: string;
  leadOwners: {
    sales: string;
    preSales: string;
    solutionArchitect?: string;
  };
  mandatoryDeliverables: string[];
  notes: string;
  status: 'Pending' | 'In Progress' | 'Ready' | 'Completed';
  portalUrl?: string;
}

export const RfpTracker: React.FC = () => {
  const { accounts } = useCrm();

  // Collapsible view state
  const [isMainCollapsed, setIsMainCollapsed] = useState<boolean>(false);
  const [isOptionsCollapsed, setIsOptionsCollapsed] = useState<boolean>(false);
  const [timelineDensity, setTimelineDensity] = useState<'detailed' | 'compact'>('detailed');
  const [expandedMilestoneIds, setExpandedMilestoneIds] = useState<Record<string, boolean>>({
    'ms-sbi-1': true,
    'ms-apollo-1': true,
    'ms-sbi-2': true,
  });

  // View state
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'pre_bid' | 'submission' | 'critical'>('all');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [selectedMilestone, setSelectedMilestone] = useState<RfpMilestone | null>(null);
  const [activeRfpModalAccount, setActiveRfpModalAccount] = useState<Account | null>(null);

  // Calendar month navigation: Default to current system date (October 2026)
  const [calendarMonthDate, setCalendarMonthDate] = useState<Date>(new Date(2026, 9, 1)); // Oct 2026

  // Current anchor date in simulated CRM
  const todayDateStr = '2026-10-18';
  const today = useMemo(() => new Date(2026, 9, 18), []);

  // Filter accounts that have an active RFP process
  const rfpAccounts = useMemo(() => {
    return accounts.filter(
      (a) => a.procurementType === 'Open RFP' || a.procurementType === 'Closed RFP'
    );
  }, [accounts]);

  // Master list of RFP milestones for the coming month (Oct 18 – Nov 30, 2026)
  const masterMilestones: RfpMilestone[] = useMemo(() => {
    return [
      {
        id: 'ms-sbi-1',
        accountId: 'acc-1',
        accountName: 'State Bank of India (SBI)',
        tenderRef: 'SBI/GITC/PETs/2026/04',
        title: 'Pre-Bid Clarification Query Cutoff',
        dateStr: '2026-10-21',
        timeStr: '15:00 IST',
        type: 'pre_bid_query',
        priority: 'High',
        procurementType: 'Open RFP',
        dealValueINR: 125000000,
        currency: 'INR',
        leadOwners: {
          sales: 'Vikram Malhotra',
          preSales: 'Kavita Rao',
          solutionArchitect: 'Dr. Siddharth Sen',
        },
        mandatoryDeliverables: [
          'Pre-bid Query Matrix (Annexure VII)',
          'Cryptographic Boundary Clause Clarifications',
        ],
        notes: 'Final queries regarding Clause 4.3 zero-knowledge proof requirements must be emailed to SBI Procurement Committee.',
        status: 'In Progress',
        portalUrl: 'https://etender.sbi.co.in',
      },
      {
        id: 'ms-apollo-1',
        accountId: 'acc-2',
        accountName: 'Apollo Health Networks',
        tenderRef: 'AHN/DIGITAL/GENOMICS/26',
        title: 'HIPAA & Synthetic Data Pre-Bid Review Session',
        dateStr: '2026-10-23',
        timeStr: '11:00 IST',
        type: 'pre_bid_meeting',
        priority: 'Medium',
        procurementType: 'Closed RFP',
        dealValueINR: 65000000,
        currency: 'INR',
        leadOwners: {
          sales: 'Vikram Malhotra',
          preSales: 'Kavita Rao',
          solutionArchitect: 'Dr. Siddharth Sen',
        },
        mandatoryDeliverables: [
          'Synthetic Patient Telemetry Benchmark Dossier',
          'HIPAA Business Associate Agreement (BAA)',
        ],
        notes: 'Pre-bid alignment meeting with Dr. Padmanabhan & Chief Information Security Officer.',
        status: 'Ready',
      },
      {
        id: 'ms-sbi-2',
        accountId: 'acc-1',
        accountName: 'State Bank of India (SBI)',
        tenderRef: 'SBI/GITC/PETs/2026/04',
        title: 'Formal Pre-Bid Conference with SBI IT Committee',
        dateStr: '2026-10-24',
        timeStr: '14:30 IST',
        type: 'pre_bid_meeting',
        priority: 'Critical',
        procurementType: 'Open RFP',
        dealValueINR: 125000000,
        currency: 'INR',
        leadOwners: {
          sales: 'Vikram Malhotra',
          preSales: 'Kavita Rao',
          solutionArchitect: 'Dr. Siddharth Sen',
        },
        mandatoryDeliverables: [
          'Corporate Presentation on On-Prem Air-Gapped PETs Architecture',
          'OEM Technical Credentials',
        ],
        notes: 'In-person / VC conference at SBI Global IT Centre, Belapur, Navi Mumbai.',
        status: 'Pending',
      },
      {
        id: 'ms-dbs-1',
        accountId: 'acc-5',
        accountName: 'DBS Bank Southeast Asia',
        tenderRef: 'DBS-SG/RFP/PETS/2026-08',
        title: 'Pre-Bid Sandbox Architecture Query Submission',
        dateStr: '2026-10-26',
        timeStr: '17:00 SGT',
        type: 'pre_bid_query',
        priority: 'Medium',
        procurementType: 'Open RFP',
        dealValueINR: 78000000,
        currency: 'SGD',
        leadOwners: {
          sales: 'Vikram Malhotra',
          preSales: 'Kavita Rao',
          solutionArchitect: 'Dr. Siddharth Sen',
        },
        mandatoryDeliverables: ['MAS FEAT Assessment Matrix', 'Cross-Border Privacy Sandbox Plan'],
        notes: 'Submission of formal questions regarding Singapore and Regional tenant separation.',
        status: 'In Progress',
      },
      {
        id: 'ms-sbi-3',
        accountId: 'acc-1',
        accountName: 'State Bank of India (SBI)',
        tenderRef: 'SBI/GITC/PETs/2026/04',
        title: 'Corrigendum-3 Clarifications & Addendum Release',
        dateStr: '2026-10-28',
        timeStr: '18:00 IST',
        type: 'corrigendum',
        priority: 'High',
        procurementType: 'Open RFP',
        dealValueINR: 125000000,
        currency: 'INR',
        leadOwners: {
          sales: 'Vikram Malhotra',
          preSales: 'Kavita Rao',
          solutionArchitect: 'Dr. Siddharth Sen',
        },
        mandatoryDeliverables: [
          'Corrigendum-3 Checklist Acknowledgement',
          'Updated FIPS-140-3 Compliance Schedule',
        ],
        notes: 'Bank will upload replies to pre-bid queries; bid desk must verify changes against Annexure B.',
        status: 'Pending',
      },
      {
        id: 'ms-nhs-1',
        accountId: 'acc-7',
        accountName: 'NHS Digital Trust (England)',
        tenderRef: 'NHS-ENG/TEND-2026/092',
        title: 'Pre-Bid Vendor Clarifications Cutoff',
        dateStr: '2026-10-29',
        timeStr: '16:00 GMT',
        type: 'pre_bid_query',
        priority: 'Medium',
        procurementType: 'Open RFP',
        dealValueINR: 194000000,
        currency: 'GBP',
        leadOwners: {
          sales: 'Vikram Malhotra',
          preSales: 'Kavita Rao',
          solutionArchitect: 'Dr. Siddharth Sen',
        },
        mandatoryDeliverables: [
          'DSPT Compliance Attestation',
          'Cyber Essentials Plus Certification Statement',
        ],
        notes: 'UK Crown Commercial Service portal submission of technical clarification questions.',
        status: 'Pending',
      },
      {
        id: 'ms-apollo-2',
        accountId: 'acc-2',
        accountName: 'Apollo Health Networks',
        tenderRef: 'AHN/DIGITAL/GENOMICS/26',
        title: 'Final Technical & Commercial SOW Submission Deadline',
        dateStr: '2026-11-02',
        timeStr: '17:00 IST',
        type: 'submission_deadline',
        priority: 'Critical',
        procurementType: 'Closed RFP',
        dealValueINR: 65000000,
        currency: 'INR',
        leadOwners: {
          sales: 'Vikram Malhotra',
          preSales: 'Kavita Rao',
        },
        mandatoryDeliverables: [
          'Final Scope of Work Signed Off',
          'Differential Privacy Epsilon Guarantees Table',
          'Commercial Pricing Schedule',
        ],
        notes: 'Executive submission via encrypted board portal.',
        status: 'In Progress',
      },
      {
        id: 'ms-sbi-4',
        accountId: 'acc-1',
        accountName: 'State Bank of India (SBI)',
        tenderRef: 'SBI/GITC/PETs/2026/04',
        title: 'Final Technical & Commercial Bid Submission Deadline (Tender Seal)',
        dateStr: '2026-11-04',
        timeStr: '15:00 IST',
        type: 'submission_deadline',
        priority: 'Critical',
        procurementType: 'Open RFP',
        dealValueINR: 125000000,
        currency: 'INR',
        leadOwners: {
          sales: 'Vikram Malhotra',
          preSales: 'Kavita Rao',
          solutionArchitect: 'Dr. Siddharth Sen',
        },
        mandatoryDeliverables: [
          'Packet A: Eligibility & EMD Bank Guarantee (₹25 Lakhs)',
          'Packet B: Technical Proposal & Signed Annexure B Compliance',
          'Packet C: Commercial Bid (e-Reverse Auction Sealed Format)',
          'FIPS-140-3 Laboratory Attestation Report',
          'Software Bill of Materials (SBOM) CycloneDX',
        ],
        notes: 'Hard deadline. Requires dual digital signature token submission on SBI e-procurement portal.',
        status: 'In Progress',
        portalUrl: 'https://etender.sbi.co.in',
      },
      {
        id: 'ms-nhs-2',
        accountId: 'acc-7',
        accountName: 'NHS Digital Trust (England)',
        tenderRef: 'NHS-ENG/TEND-2026/092',
        title: 'DSPT & Cyber Governance Pre-Bid Clarification Session',
        dateStr: '2026-11-05',
        timeStr: '14:00 GMT',
        type: 'pre_bid_meeting',
        priority: 'High',
        procurementType: 'Open RFP',
        dealValueINR: 194000000,
        currency: 'GBP',
        leadOwners: {
          sales: 'Vikram Malhotra',
          preSales: 'Kavita Rao',
        },
        mandatoryDeliverables: [
          'NHS Caldicott Principles Alignment Matrix',
          'UK GDPR Adequacy Whitepaper',
        ],
        notes: 'Official dialogue session with NHS Digital procurement team.',
        status: 'Pending',
      },
      {
        id: 'ms-zurich-1',
        accountId: 'acc-11',
        accountName: 'Zurich Financial Services',
        tenderRef: 'ZFS/EU/AI-ACT/2026-Q4',
        title: 'Solvency II & EU AI Act Pre-Bid Queries',
        dateStr: '2026-11-06',
        timeStr: '16:00 CET',
        type: 'pre_bid_query',
        priority: 'Medium',
        procurementType: 'Closed RFP',
        dealValueINR: 126000000,
        currency: 'EUR',
        leadOwners: {
          sales: 'Vikram Malhotra',
          preSales: 'Kavita Rao',
        },
        mandatoryDeliverables: ['Model Risk Management (MRM) Architecture Document'],
        notes: 'Pre-bid alignment on high-risk AI classification under EU AI Act Article 6.',
        status: 'Pending',
      },
      {
        id: 'ms-grab-1',
        accountId: 'acc-4',
        accountName: 'Grab Holdings Pte',
        tenderRef: 'GRAB-CORP-2026-PETS-02',
        title: 'Southeast Asia Cross-Border Privacy Review Deadline',
        dateStr: '2026-11-08',
        timeStr: '18:00 SGT',
        type: 'pre_bid_query',
        priority: 'High',
        procurementType: 'Closed RFP',
        dealValueINR: 79000000,
        currency: 'USD',
        leadOwners: {
          sales: 'Vikram Malhotra',
          preSales: 'Kavita Rao',
        },
        mandatoryDeliverables: [
          'Cross-Border CBAC Privacy Masking Architecture Deck',
          'Singapore PDPA Data Protection Trustmark Verification',
        ],
        notes: 'Technical gate prior to commercial pricing submission.',
        status: 'In Progress',
      },
      {
        id: 'ms-airtel-1',
        accountId: 'acc-12',
        accountName: 'Bharti Airtel Enterprise',
        tenderRef: 'AIRTEL/PETS-TELCO/26-11',
        title: 'Pre-Bid Telecom Data Mesh Technical Submission',
        dateStr: '2026-11-10',
        timeStr: '16:00 IST',
        type: 'pre_bid_query',
        priority: 'High',
        procurementType: 'Open RFP',
        dealValueINR: 48000000,
        currency: 'INR',
        leadOwners: {
          sales: 'Vikram Malhotra',
          preSales: 'Kavita Rao',
        },
        mandatoryDeliverables: ['Telecom CDR Anonymization Benchmark', 'Kafka Stream Masking Latency SLA'],
        notes: 'Pre-bid query and proof-of-capability submission.',
        status: 'Pending',
      },
      {
        id: 'ms-dbs-2',
        accountId: 'acc-5',
        accountName: 'DBS Bank Southeast Asia',
        tenderRef: 'DBS-SG/RFP/PETS/2026-08',
        title: 'Final RFP Response & Commercial Bid Submission Deadline',
        dateStr: '2026-11-12',
        timeStr: '15:00 SGT',
        type: 'submission_deadline',
        priority: 'Critical',
        procurementType: 'Open RFP',
        dealValueINR: 78000000,
        currency: 'SGD',
        leadOwners: {
          sales: 'Vikram Malhotra',
          preSales: 'Kavita Rao',
          solutionArchitect: 'Dr. Siddharth Sen',
        },
        mandatoryDeliverables: [
          'DBS RFP Schedule A: Technical Compliance Matrix',
          'Schedule B: Regional Pricing & Tiered Volume Discount',
          'Schedule C: SOC 2 Type II & MAS Technology Risk Guidelines Attestation',
        ],
        notes: 'Electronic tender box submission via DBS Ariba Sourcing portal.',
        status: 'Pending',
        portalUrl: 'https://service.ariba.com',
      },
      {
        id: 'ms-grab-2',
        accountId: 'acc-4',
        accountName: 'Grab Holdings Pte',
        tenderRef: 'GRAB-CORP-2026-PETS-02',
        title: 'Closed RFP Final Scope & Commercial Submission Deadline',
        dateStr: '2026-11-15',
        timeStr: '17:00 SGT',
        type: 'submission_deadline',
        priority: 'Critical',
        procurementType: 'Closed RFP',
        dealValueINR: 79000000,
        currency: 'USD',
        leadOwners: {
          sales: 'Vikram Malhotra',
          preSales: 'Kavita Rao',
        },
        mandatoryDeliverables: [
          'Statement of Work Signed-off by Security & Legal',
          'Multi-Tenant SaaS Latency Guarantee',
        ],
        notes: 'Final executive submission to Grab Head of Data Platforms.',
        status: 'Pending',
      },
      {
        id: 'ms-nhs-3',
        accountId: 'acc-7',
        accountName: 'NHS Digital Trust (England)',
        tenderRef: 'NHS-ENG/TEND-2026/092',
        title: 'Final Crown Commercial Tender Submission Deadline',
        dateStr: '2026-11-19',
        timeStr: '12:00 GMT',
        type: 'submission_deadline',
        priority: 'Critical',
        procurementType: 'Open RFP',
        dealValueINR: 194000000,
        currency: 'GBP',
        leadOwners: {
          sales: 'Vikram Malhotra',
          preSales: 'Kavita Rao',
          solutionArchitect: 'Dr. Siddharth Sen',
        },
        mandatoryDeliverables: [
          'ITT Response Volume 1: Standard Selection Questionnaire (SQ)',
          'Volume 2: Technical & Clinical Safety Quality Criteria (DCB0129)',
          'Volume 3: Whole Life Costing Commercial Model',
        ],
        notes: 'Hard cutoff via UK Find a Tender e-procurement service.',
        status: 'Pending',
      },
      {
        id: 'ms-zurich-2',
        accountId: 'acc-11',
        accountName: 'Zurich Financial Services',
        tenderRef: 'ZFS/EU/AI-ACT/2026-Q4',
        title: 'Final Insurance Underwriting AI Governance Proposal Deadline',
        dateStr: '2026-11-22',
        timeStr: '17:00 CET',
        type: 'submission_deadline',
        priority: 'Critical',
        procurementType: 'Closed RFP',
        dealValueINR: 126000000,
        currency: 'EUR',
        leadOwners: {
          sales: 'Vikram Malhotra',
          preSales: 'Kavita Rao',
        },
        mandatoryDeliverables: [
          'ISO 42001 Compliance Matrix',
          'EU AI Act Conformity Assessment Dossier',
          'Fixed Price Enterprise License Schedule',
        ],
        notes: 'Corporate procurement portal submission.',
        status: 'Pending',
      },
      {
        id: 'ms-airtel-2',
        accountId: 'acc-12',
        accountName: 'Bharti Airtel Enterprise',
        tenderRef: 'AIRTEL/PETS-TELCO/26-11',
        title: 'Final Airtel RFP Commercial & Technical Bid Submission',
        dateStr: '2026-11-25',
        timeStr: '16:00 IST',
        type: 'submission_deadline',
        priority: 'Critical',
        procurementType: 'Open RFP',
        dealValueINR: 48000000,
        currency: 'INR',
        leadOwners: {
          sales: 'Vikram Malhotra',
          preSales: 'Kavita Rao',
        },
        mandatoryDeliverables: [
          'Carrier-Grade PETs Architecture Validation',
          'Signed SLA & Commercial Reverse Auction Terms',
        ],
        notes: 'Airtel Enterprise e-procurement portal submission.',
        status: 'Pending',
      },
    ];
  }, []);

  // Filtered milestones based on category & account
  const filteredMilestones = useMemo(() => {
    return masterMilestones.filter((m) => {
      // Account filter
      if (selectedAccountId !== 'all' && m.accountId !== selectedAccountId) {
        return false;
      }

      // Category filter
      if (categoryFilter === 'pre_bid') {
        return m.type === 'pre_bid_query' || m.type === 'pre_bid_meeting' || m.type === 'corrigendum';
      }
      if (categoryFilter === 'submission') {
        return m.type === 'submission_deadline' || m.type === 'commercial_opening';
      }
      if (categoryFilter === 'critical') {
        const d = new Date(m.dateStr);
        const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
      }

      return true;
    });
  }, [masterMilestones, categoryFilter, selectedAccountId, today]);

  // Next upcoming milestone
  const nextImminentMilestone = useMemo(() => {
    return masterMilestones.find((m) => {
      const d = new Date(m.dateStr);
      return d.getTime() >= today.getTime();
    });
  }, [masterMilestones, today]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalPipelineINR = masterMilestones
      .filter((m) => m.type === 'submission_deadline')
      .reduce((sum, m) => sum + m.dealValueINR, 0);

    const upcoming7Days = masterMilestones.filter((m) => {
      const d = new Date(m.dateStr);
      const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    }).length;

    const preBidCount = masterMilestones.filter(
      (m) => m.type === 'pre_bid_query' || m.type === 'pre_bid_meeting' || m.type === 'corrigendum'
    ).length;

    const submissionCount = masterMilestones.filter(
      (m) => m.type === 'submission_deadline'
    ).length;

    return {
      totalPipelineFormatted: formatCurrencyValue(totalPipelineINR, 'INR'),
      upcoming7Days,
      preBidCount,
      submissionCount,
      totalRFPs: new Set(masterMilestones.map((m) => m.accountId)).size,
    };
  }, [masterMilestones, today]);

  // Helper for milestone badge styling
  const getMilestoneStyle = (type: RfpMilestoneType) => {
    switch (type) {
      case 'pre_bid_query':
        return {
          label: 'Pre-Bid Query Deadline',
          bg: 'bg-amber-50',
          text: 'text-amber-800',
          border: 'border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'pre_bid_meeting':
        return {
          label: 'Pre-Bid Meeting / Conf',
          bg: 'bg-sky-50',
          text: 'text-sky-800',
          border: 'border-sky-200',
          dot: 'bg-sky-500',
        };
      case 'corrigendum':
        return {
          label: 'Corrigendum & Addendum',
          bg: 'bg-purple-50',
          text: 'text-purple-800',
          border: 'border-purple-200',
          dot: 'bg-purple-500',
        };
      case 'submission_deadline':
        return {
          label: 'Final Submission Deadline',
          bg: 'bg-rose-50',
          text: 'text-rose-800',
          border: 'border-rose-200',
          dot: 'bg-rose-600',
        };
      case 'commercial_opening':
        return {
          label: 'Commercial Opening',
          bg: 'bg-emerald-50',
          text: 'text-emerald-800',
          border: 'border-emerald-200',
          dot: 'bg-emerald-600',
        };
      default:
        return {
          label: 'RFP Milestone',
          bg: 'bg-slate-50',
          text: 'text-slate-800',
          border: 'border-slate-200',
          dot: 'bg-slate-500',
        };
    }
  };

  // Helper to calculate days diff & countdown
  const getCountdown = (dateStr: string) => {
    const target = new Date(dateStr);
    const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { text: 'Today', urgency: 'critical' };
    }
    if (diffDays === 1) {
      return { text: 'Tomorrow', urgency: 'critical' };
    }
    if (diffDays > 1 && diffDays <= 3) {
      return { text: `In ${diffDays} days`, urgency: 'critical' };
    }
    if (diffDays > 3 && diffDays <= 7) {
      return { text: `In ${diffDays} days`, urgency: 'high' };
    }
    if (diffDays > 7) {
      return { text: `In ${diffDays} days`, urgency: 'normal' };
    }
    return { text: `${Math.abs(diffDays)}d ago`, urgency: 'past' };
  };

  // Toggle single milestone expanded state
  const toggleMilestoneExpanded = (id: string) => {
    setExpandedMilestoneIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Toggle all milestones expanded or collapsed
  const areAllExpanded = useMemo(() => {
    return filteredMilestones.every((m) => !!expandedMilestoneIds[m.id]);
  }, [filteredMilestones, expandedMilestoneIds]);

  const toggleAllMilestones = () => {
    if (areAllExpanded) {
      setExpandedMilestoneIds({});
    } else {
      const all: Record<string, boolean> = {};
      filteredMilestones.forEach((m) => {
        all[m.id] = true;
      });
      setExpandedMilestoneIds(all);
    }
  };

  // Calendar generation helpers
  const calendarDays = useMemo(() => {
    const year = calendarMonthDate.getFullYear();
    const month = calendarMonthDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: Array<{
      date: Date;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      milestones: RfpMilestone[];
    }> = [];

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      const dStr = d.toISOString().split('T')[0];
      days.push({
        date: d,
        dateStr: dStr,
        isCurrentMonth: false,
        isToday: dStr === todayDateStr,
        milestones: masterMilestones.filter((m) => m.dateStr === dStr),
      });
    }

    for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
      const current = new Date(year, month, d);
      const dStr = current.toISOString().split('T')[0];
      days.push({
        date: current,
        dateStr: dStr,
        isCurrentMonth: true,
        isToday: dStr === todayDateStr,
        milestones: masterMilestones.filter((m) => m.dateStr === dStr),
      });
    }

    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const dStr = d.toISOString().split('T')[0];
      days.push({
        date: d,
        dateStr: dStr,
        isCurrentMonth: false,
        isToday: dStr === todayDateStr,
        milestones: masterMilestones.filter((m) => m.dateStr === dStr),
      });
    }

    return days;
  }, [calendarMonthDate, masterMilestones, todayDateStr]);

  const monthLabel = useMemo(() => {
    return calendarMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [calendarMonthDate]);

  const handlePrevMonth = () => {
    setCalendarMonthDate(
      new Date(calendarMonthDate.getFullYear(), calendarMonthDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCalendarMonthDate(
      new Date(calendarMonthDate.getFullYear(), calendarMonthDate.getMonth() + 1, 1)
    );
  };

  const handleTodayMonth = () => {
    setCalendarMonthDate(new Date(2026, 9, 1));
  };

  const handleOpenRfpDesk = (accId: string) => {
    const acc = accounts.find((a) => a.id === accId);
    if (acc) {
      setActiveRfpModalAccount(acc);
    }
  };

  const handleExportIcs = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PrivaSapien CRM//RFP Tracker//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      ...filteredMilestones.flatMap((m) => [
        'BEGIN:VEVENT',
        `UID:${m.id}@privasapien.crm`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART;VALUE=DATE:${m.dateStr.replace(/-/g, '')}`,
        `SUMMARY:[RFP] ${m.title} - ${m.accountName}`,
        `DESCRIPTION:${m.notes.replace(/\n/g, ' ')} | Mandatory Deliverables: ${m.mandatoryDeliverables.join(', ')}`,
        `STATUS:CONFIRMED`,
        'END:VEVENT',
      ]),
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `RFP_Deadlines_${todayDateStr}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs transition-all duration-300 overflow-hidden">
      {/* 1. Header Banner with Title, Collapsible Toggle, and Quick Status Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-indigo-50/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white flex items-center justify-center shadow-xs shrink-0">
              <CalendarIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-bold text-slate-900 text-base tracking-tight">
                  RFP Tracker & Deadlines Radar
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                  Coming Month · Oct – Nov 2026
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {stats.totalRFPs} Active RFPs · {stats.totalPipelineFormatted}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Track pre-bid queries, clarification meetings, addenda, and hard submission deadlines across all public & private tenders.
              </p>
            </div>
          </div>

          {/* Header Controls: Collapse/Expand View, View Switcher & Export */}
          <div className="flex items-center gap-2 self-start lg:self-center flex-wrap">
            {/* View Switcher: Only active when expanded */}
            {!isMainCollapsed && (
              <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'timeline'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Switch to detailed chronological timeline"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Timeline</span>
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'calendar'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Switch to monthly calendar grid"
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Calendar</span>
                </button>
              </div>
            )}

            {!isMainCollapsed && (
              <button
                onClick={handleExportIcs}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
                title="Download iCalendar file to sync with Google Calendar or Outlook"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Export (.ics)</span>
              </button>
            )}

            {/* Master Collapsible Toggle Button */}
            <button
              onClick={() => setIsMainCollapsed(!isMainCollapsed)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition shadow-2xs cursor-pointer ${
                isMainCollapsed
                  ? 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title={isMainCollapsed ? 'Expand RFP tracker timeline & calendar views' : 'Collapse views'}
            >
              {isMainCollapsed ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Expand Tracker</span>
                  <ChevronDown className="w-3.5 h-3.5 text-indigo-200 ml-0.5" />
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                  <span>Collapse View</span>
                  <ChevronUp className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Collapsed State Summary Pill Banner */}
        {isMainCollapsed && (
          <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <strong>Summary Radar:</strong> {stats.totalRFPs} Active Tenders ({stats.totalPipelineFormatted})
              </span>
              <span className="text-slate-300">|</span>
              {nextImminentMilestone ? (
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Next Imminent Deadline:{' '}
                  <strong className="text-slate-900">{nextImminentMilestone.accountName}</strong> (
                  {nextImminentMilestone.title} on {nextImminentMilestone.dateStr})
                </span>
              ) : null}
            </div>

            <button
              onClick={() => setIsMainCollapsed(false)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Calendar & Timeline</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Main Collapsible Body */}
      {!isMainCollapsed && (
        <div className="p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
          {/* Collapsible Options Header Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Display & Filter Options
              </span>
              <span className="text-[11px] text-slate-400">
                ({isOptionsCollapsed ? 'Options Hidden' : 'Full Controls Active'})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Density toggle for Timeline View */}
              {viewMode === 'timeline' && (
                <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px]">
                  <button
                    onClick={() => setTimelineDensity('detailed')}
                    className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer ${
                      timelineDensity === 'detailed'
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Detailed
                  </button>
                  <button
                    onClick={() => setTimelineDensity('compact')}
                    className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer ${
                      timelineDensity === 'compact'
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Compact
                  </button>
                </div>
              )}

              {/* Expand/Collapse All Details for Timeline */}
              {viewMode === 'timeline' && timelineDensity === 'detailed' && (
                <button
                  onClick={toggleAllMilestones}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition flex items-center gap-1 cursor-pointer"
                >
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                  <span>{areAllExpanded ? 'Collapse All Cards' : 'Expand All Cards'}</span>
                </button>
              )}

              {/* Options Collapse Button */}
              <button
                onClick={() => setIsOptionsCollapsed(!isOptionsCollapsed)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-1 cursor-pointer"
                title={isOptionsCollapsed ? 'Show filters and KPI ribbon' : 'Collapse filters to maximize view area'}
              >
                <span>{isOptionsCollapsed ? 'Show Options' : 'Hide Options'}</span>
                {isOptionsCollapsed ? (
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                ) : (
                  <ChevronUp className="w-3 h-3 text-slate-500" />
                )}
              </button>
            </div>
          </div>

          {/* 2. Top Metric KPI Badges Bar (Collapsible with Options) */}
          {!isOptionsCollapsed && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in duration-150">
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Total RFP Pipeline
                </div>
                <div className="text-base font-extrabold text-slate-900 mt-0.5">
                  {stats.totalPipelineFormatted}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Across {stats.totalRFPs} tenders</div>
              </div>

              <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-200/70">
                <div className="text-[10px] uppercase font-bold text-rose-600 tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-500" />
                  Urgent (Next 7 Days)
                </div>
                <div className="text-base font-extrabold text-rose-700 mt-0.5">
                  {stats.upcoming7Days} Deadlines
                </div>
                <div className="text-[11px] text-rose-600/80 mt-0.5">Includes SBI & Apollo bids</div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/70">
                <div className="text-[10px] uppercase font-bold text-amber-700 tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  Pre-Bid Deadlines
                </div>
                <div className="text-base font-extrabold text-amber-800 mt-0.5">
                  {stats.preBidCount} Milestones
                </div>
                <div className="text-[11px] text-amber-700/80 mt-0.5">Queries & Conferences</div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-200/70">
                <div className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider flex items-center gap-1">
                  <CheckSquare className="w-3 h-3 text-indigo-600" />
                  Final Submissions
                </div>
                <div className="text-base font-extrabold text-indigo-800 mt-0.5">
                  {stats.submissionCount} Tender Seals
                </div>
                <div className="text-[11px] text-indigo-700/80 mt-0.5">Sealed Technical & Commercial</div>
              </div>
            </div>
          )}

          {/* 3. Filter Controls (Collapsible with Options) */}
          {!isOptionsCollapsed && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/60 p-2.5 rounded-xl border border-slate-200/70 animate-in fade-in duration-150">
              {/* Category Pill Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    categoryFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  All Milestones ({masterMilestones.length})
                </button>
                <button
                  onClick={() => setCategoryFilter('critical')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    categoryFilter === 'critical'
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  Next 7 Days ({stats.upcoming7Days})
                </button>
                <button
                  onClick={() => setCategoryFilter('pre_bid')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    categoryFilter === 'pre_bid'
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Pre-Bid Deadlines ({stats.preBidCount})
                </button>
                <button
                  onClick={() => setCategoryFilter('submission')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    categoryFilter === 'submission'
                      ? 'bg-indigo-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Submission Seals ({stats.submissionCount})
                </button>
              </div>

              {/* Account Selector Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs font-medium"
                >
                  <option value="all">All RFP Accounts ({rfpAccounts.length})</option>
                  {rfpAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.procurementType})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* 4. Main Body: Timeline View OR Calendar View */}
          {viewMode === 'timeline' ? (
            /* TIMELINE VIEW (Supports Collapsible Details & Compact/Detailed Density) */
            <div className="space-y-4">
              <div className="relative pl-6 sm:pl-8 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-slate-300 before:to-emerald-500 space-y-3.5">
                {filteredMilestones.map((ms) => {
                  const style = getMilestoneStyle(ms.type);
                  const countdown = getCountdown(ms.dateStr);
                  const isExpanded =
                    timelineDensity === 'compact' ? false : !!expandedMilestoneIds[ms.id];

                  return (
                    <div key={ms.id} className="relative group">
                      {/* Timeline Node Dot */}
                      <div
                        className={`absolute -left-6 sm:-left-8 top-3.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition-transform group-hover:scale-125 ${
                          countdown.urgency === 'critical'
                            ? 'border-rose-600 shadow-xs ring-4 ring-rose-100'
                            : countdown.urgency === 'high'
                            ? 'border-amber-500 ring-2 ring-amber-100'
                            : 'border-indigo-600'
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            countdown.urgency === 'critical'
                              ? 'bg-rose-600'
                              : countdown.urgency === 'high'
                              ? 'bg-amber-500'
                              : 'bg-indigo-600'
                          }`}
                        ></div>
                      </div>

                      {/* Milestone Card */}
                      <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-md transition-all duration-200 space-y-2.5">
                        {/* Top Row: Date & Countdown + Milestone Category + Collapsible Toggle */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {new Date(ms.dateStr).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                              {ms.timeStr && (
                                <span className="text-slate-500 font-normal">· {ms.timeStr}</span>
                              )}
                            </span>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                countdown.urgency === 'critical'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                                  : countdown.urgency === 'high'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {countdown.urgency === 'critical' && <AlertTriangle className="w-3 h-3" />}
                              {countdown.text}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${style.bg} ${style.text} ${style.border}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                              {style.label}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              {ms.procurementType}
                            </span>

                            {/* Card Details Collapse Toggle Button */}
                            {timelineDensity === 'detailed' && (
                              <button
                                onClick={() => toggleMilestoneExpanded(ms.id)}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                                title={isExpanded ? 'Collapse card details' : 'Expand card details'}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Middle: Title & Account & Value */}
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-indigo-900 transition-colors">
                              {ms.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 flex-wrap">
                              <span className="font-semibold text-slate-800 flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                {ms.accountName}
                              </span>
                              <span className="text-slate-400">·</span>
                              <span className="text-slate-500 font-mono text-[11px]">{ms.tenderRef}</span>
                              <span className="text-slate-400">·</span>
                              <span className="font-bold text-emerald-700">
                                {formatCurrencyValue(ms.dealValueINR, 'INR')}
                              </span>
                            </div>
                          </div>

                          {/* Direct Actions */}
                          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                            <button
                              onClick={() => setSelectedMilestone(ms)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>Specs</span>
                            </button>
                            <button
                              onClick={() => handleOpenRfpDesk(ms.accountId)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-indigo-950 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-indigo-300" />
                              <span>RFP Tender Desk</span>
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                            </button>
                          </div>
                        </div>

                        {/* Collapsible Card Details (Notes & Mandatory Deliverables) */}
                        {isExpanded && (
                          <div className="space-y-2 pt-1 border-t border-slate-100 animate-in fade-in duration-150">
                            {/* Notes */}
                            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                              {ms.notes}
                            </p>

                            {/* Mandatory Deliverables Chips */}
                            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                                <CheckSquare className="w-3 h-3 text-slate-400" />
                                Mandatory Deliverables:
                              </span>
                              {ms.mandatoryDeliverables.map((item, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>

                            {/* Footer Team Attribution */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                <span>
                                  Owners: <strong>{ms.leadOwners.sales}</strong> (Sales) ·{' '}
                                  <strong>{ms.leadOwners.preSales}</strong> (Pre-Sales)
                                  {ms.leadOwners.solutionArchitect && (
                                    <>
                                      {' '}· <strong>{ms.leadOwners.solutionArchitect}</strong> (Arch)
                                    </>
                                  )}
                                </span>
                              </div>

                              <span className="text-[10px] font-semibold text-slate-400">
                                PrivaTRAC Certified Audit Flow
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* CALENDAR VIEW */
            <div className="space-y-3">
              {/* Calendar Month Navigation Header */}
              <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900 tracking-tight">{monthLabel}</h4>
                  <span className="text-xs text-slate-500">(Showing pre-bid & submission dead-drops)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleTodayMonth}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                  >
                    Today (Oct 2026)
                  </button>
                  <button
                    onClick={handlePrevMonth}
                    className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                    title="Previous month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                    title="Next month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 7-Day Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-slate-500 uppercase tracking-wider py-1 border-b border-slate-100">
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div className="text-slate-400">Sat</div>
                <div className="text-slate-400">Sun</div>
              </div>

              {/* Calendar Grid Cells */}
              <div className="grid grid-cols-7 gap-1.5">
                {calendarDays.map((cell, idx) => {
                  const hasMilestones = cell.milestones.length > 0;

                  return (
                    <div
                      key={idx}
                      className={`min-h-[105px] p-2 rounded-xl border flex flex-col justify-between transition-all ${
                        cell.isToday
                          ? 'border-indigo-500 bg-indigo-50/20 shadow-xs ring-2 ring-indigo-200/60'
                          : cell.isCurrentMonth
                          ? 'border-slate-200 bg-white hover:border-slate-300'
                          : 'border-slate-100 bg-slate-50/50 text-slate-400 opacity-60'
                      }`}
                    >
                      {/* Date Number Header */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                            cell.isToday
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : cell.isCurrentMonth
                              ? 'text-slate-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {cell.date.getDate()}
                        </span>

                        {hasMilestones && (
                          <span className="text-[10px] font-bold px-1.5 rounded-full bg-slate-900 text-white">
                            {cell.milestones.length}
                          </span>
                        )}
                      </div>

                      {/* Milestones in this Day */}
                      <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                        {cell.milestones.slice(0, 2).map((m) => {
                          const style = getMilestoneStyle(m.type);
                          return (
                            <div
                              key={m.id}
                              onClick={() => setSelectedMilestone(m)}
                              className={`px-1.5 py-1 rounded text-[10px] font-semibold border truncate cursor-pointer hover:opacity-90 transition shadow-2xs ${style.bg} ${style.text} ${style.border}`}
                              title={`${m.title} (${m.accountName})`}
                            >
                              <div className="flex items-center gap-1 truncate">
                                <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0`}></span>
                                <span className="truncate">
                                  {m.accountName.split(' ')[0]}: {m.title}
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {cell.milestones.length > 2 && (
                          <div
                            onClick={() => setSelectedMilestone(cell.milestones[0])}
                            className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded text-center cursor-pointer hover:underline"
                          >
                            +{cell.milestones.length - 2} more milestones
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Calendar Legend */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
                <div className="flex items-center gap-3 flex-wrap text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Pre-Bid Queries</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                    <span>Pre-Bid Conference</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span>Corrigendum & Addendum</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                    <span>Final Submission Deadline</span>
                  </span>
                </div>

                <span className="text-[10px] text-slate-400">
                  Click any milestone badge for full specs & portal launch
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Detailed Milestone Inspection Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-400/30 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-tight">{selectedMilestone.title}</h4>
                  <p className="text-xs text-slate-300">
                    {selectedMilestone.accountName} · {selectedMilestone.tenderRef}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMilestone(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Target Date</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {selectedMilestone.dateStr} {selectedMilestone.timeStr && `(${selectedMilestone.timeStr})`}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Contract Value</span>
                  <div className="font-bold text-emerald-700 text-sm mt-0.5">
                    {formatCurrencyValue(selectedMilestone.dealValueINR, 'INR')}
                  </div>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Scope & Instructions:</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                  {selectedMilestone.notes}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Mandatory Deliverables:</span>
                <div className="space-y-1.5">
                  {selectedMilestone.mandatoryDeliverables.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 text-slate-800"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">
                  Procurement Model: <strong>{selectedMilestone.procurementType}</strong>
                </span>
                <button
                  onClick={() => {
                    const accId = selectedMilestone.accountId;
                    setSelectedMilestone(null);
                    handleOpenRfpDesk(accId);
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Launch RFP Tender Desk</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. RFP Workflow Modal */}
      {activeRfpModalAccount && (
        <RfpWorkflowModal
          account={activeRfpModalAccount}
          onClose={() => setActiveRfpModalAccount(null)}
        />
      )}
    </div>
  );
};
