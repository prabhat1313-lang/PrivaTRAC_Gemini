import {
  ProductMatrixRequirement,
  ProductContextVersion,
  CrmNotification,
  MatrixHierarchyLevel,
  AvailabilityStatus,
  ProductMatrixTag,
} from '../types/crm';

export const INITIAL_MATRIX_HIERARCHY: MatrixHierarchyLevel[] = [
  { id: 'hier-1', name: 'Product Family', order: 1 },
  { id: 'hier-2', name: 'Product', order: 2 },
  { id: 'hier-3', name: 'Module', order: 3 },
];

export const INITIAL_AVAILABILITY_STATUSES: AvailabilityStatus[] = [
  'Fully Available',
  'Partially Available',
  'Not Available',
];

export const INITIAL_PRODUCT_MATRIX_TAGS: ProductMatrixTag[] = [
  'Requires Configuration',
  'Requires Integration',
  'Requires Customization',
  'Not Applicable',
  'Architecturally Infeasible',
];

export interface ComplementaryPartnerTool {
  category: 'WAF' | 'EDR' | 'DLP' | 'DAM' | 'Browser Security' | 'CASB' | 'HSM';
  topVendor: string;
  solutionName: string;
  rationale: string;
  supportedIntegration: string;
  alternativeVendors: string[];
}

export const COMPLEMENTARY_PARTNER_TOOLS: Record<string, ComplementaryPartnerTool> = {
  WAF: {
    category: 'WAF',
    topVendor: 'Cloudflare',
    solutionName: 'Cloudflare Magic WAF & L7 DDoS Defense',
    rationale: 'Fulfills perimeter OWASP Top 10 web attack mitigation, rate limiting, and bot defense at API gateway boundary.',
    supportedIntegration: 'Pre-configured Cloudflare reverse-proxy connector with Envoy ingress headers',
    alternativeVendors: ['AWS WAF', 'Akamai App & API Protector', 'F5 Distributed Cloud'],
  },
  EDR: {
    category: 'EDR',
    topVendor: 'CrowdStrike',
    solutionName: 'CrowdStrike Falcon Endpoint Security',
    rationale: 'Addresses workstation & server runtime memory protection, telemetry ingestion, and endpoint telemetry audit requirements.',
    supportedIntegration: 'Syslog CEF forwarding & Falcon SIEM API integration',
    alternativeVendors: ['Microsoft Defender for Endpoint', 'SentinelOne Singularity'],
  },
  DLP: {
    category: 'DLP',
    topVendor: 'Forcepoint',
    solutionName: 'Forcepoint Enterprise Data Loss Prevention',
    rationale: 'Enforces deep packet inspection, clipboard blocking, and removable USB storage restrictions on endpoints.',
    supportedIntegration: 'REST webhook hook for flagged un-anonymized data exfiltration alerts',
    alternativeVendors: ['Symantec Data Loss Prevention', 'Digital Guardian DLP'],
  },
  DAM: {
    category: 'DAM',
    topVendor: 'Bynder',
    solutionName: 'Bynder Enterprise Digital Asset Management',
    rationale: 'Fulfills multi-tenant media asset cataloging, rights management, and brand asset lifecycle storage.',
    supportedIntegration: 'OAuth 2.0 asset ingestion connector with automated PII blurring on upload',
    alternativeVendors: ['Adobe Experience Manager Assets', 'Canto DAM'],
  },
  'Browser Security': {
    category: 'Browser Security',
    topVendor: 'Island',
    solutionName: 'Island Enterprise Browser Security Agent',
    rationale: 'Provides browser-level session watermarking, screen-capture blocking, and isolated sandboxing for sensitive portals.',
    supportedIntegration: 'Zero Trust Network Access (ZTNA) policy headers & SAML federation',
    alternativeVendors: ['Talon Cyber Security (Palo Alto)', 'Menlo Security Isolation'],
  },
  CASB: {
    category: 'CASB',
    topVendor: 'Netskope',
    solutionName: 'Netskope Cloud Access Security Broker (CASB)',
    rationale: 'Monitors unmanaged SaaS uploads, shadow IT discovery, and API-based data leak prevention across cloud services.',
    supportedIntegration: 'Native cloud-to-cloud API connector with DLP policy alignment',
    alternativeVendors: ['Zscaler Cloud Protection', 'Microsoft Defender for Cloud Apps'],
  },
  HSM: {
    category: 'HSM',
    topVendor: 'Thales',
    solutionName: 'Thales Luna PCIe / Network HSM (FIPS 140-3 Level 3)',
    rationale: 'Hardware-grade root of trust for master encryption keys, PKI signing, and confidential enclave attestation.',
    supportedIntegration: 'PKCS#11 bridge drivers & Microsoft CNG key storage provider',
    alternativeVendors: ['Entrust nShield HSM', 'Utimaco CryptoServer HSM'],
  },
};

export const INITIAL_PRODUCT_CONTEXT_VERSIONS: ProductContextVersion[] = [
  {
    id: 'ctx-v1.0',
    version: '1.0.0',
    createdAt: '2026-09-15T09:00:00Z',
    createdBy: 'Dr. Siddharth Sen',
    changeSummary: 'Baseline certified product architecture for PrivacyGRC & PETs Enterprise Suite v4.2',
    isActive: true,
    content: `# PrivaSapien Enterprise Product Capability Baseline (v1.0.0)

## 1. Product Family: Privacy Enhancing Technologies (PETs)
- **PrivaSapien Anonymizer Pro & PETs Core**:
  - *Mathematical Guarantees*: Differential privacy (epsilon-delta bounded privacy budget), k-anonymity (k >= 5), l-diversity, and t-closeness.
  - *Data Modalities*: Tabular databases (Postgres, Oracle, SQL Server, Snowflake), semi-structured JSON, and text corpora.
  - *Format-Preserving Encryption (FPE)*: AES-FF1 and AES-FF3-1 certified for maintaining PAN, Aadhaar, and national ID formats.
  - *High-Throughput Streaming*: Ingests up to 250,000 events/sec via Apache Kafka and Apache Flink connectors.

## 2. Product Family: Responsible AI & Governance
- **PrivaSapien AI Guardrails**:
  - *Prompt Injection Defense*: Detects direct and indirect jailbreaks with < 12ms p99 latency overhead.
  - *PII Masking at Inference*: Real-time NER redaction before tokens hit third-party LLMs (OpenAI, Anthropic, Bedrock).
  - *Fairness & Bias Auditing*: Demographic parity, equalized odds, and disparate impact ratio reports for credit/lending models.

## 3. Product Family: PrivacyGRC Core Suite
- **RoPA & Data Mapping**:
  - Automated Record of Processing Activities compliant with DPDP Act 2023, GDPR Article 30, and CCPA/CPRA.
- **DSAR Fulfillment Automation**:
  - Identity verification workflows, cross-system data discovery orchestrator, and automated PDF export generation.

## 4. Infrastructure & Architecture Requirements
- **Deployment**: Supports Air-Gapped Bare Metal, On-Premises OpenShift/Kubernetes, and Private Cloud (AWS/Azure/GCP).
- **Authentication**: Native SAML 2.0, OpenID Connect (OIDC), Azure AD, Okta, and PingFederate with MFA enforcement.
- **High Availability**: Multi-region active-active cluster deployment with RPO < 5s and RTO < 60s.

## 5. Non-Native Gaps & Approved Complementary Solutions
- *Perimeter Web Application Firewall (WAF)*: Non-native. Fulfilled by **Cloudflare Magic WAF** or **AWS WAF**.
- *Endpoint Detection & Response (EDR)*: Non-native. Fulfilled by **CrowdStrike Falcon** or **Microsoft Defender**.
- *Endpoint Data Loss Prevention (DLP)*: Non-native. Fulfilled by **Forcepoint DLP** or **Symantec DLP**.
- *Digital Asset Management (DAM)*: Non-native. Fulfilled by **Bynder DAM**.
- *Browser Security Agent / Isolation*: Non-native. Fulfilled by **Island Enterprise Browser**.
- *Hardware Security Module (HSM)*: Hardware appliances provided by certified OEM partners (**Thales Luna HSM**).`,
  },
];

export const INITIAL_PRODUCT_MATRIX_REQUIREMENTS: ProductMatrixRequirement[] = [
  {
    id: 'req-mat-1',
    productFamily: 'Privacy Enhancing Technologies (PETs)',
    product: 'PrivaSapien Anonymizer Pro & PETs Core',
    module: 'Differential Privacy Engine',
    title: 'Configurable Epsilon (ε) and Delta (δ) Bounded Privacy Budgets for Analytics Queries',
    description: 'System must enforce mathematical differential privacy guarantees per SQL/NoSQL query execution, preventing membership inference attacks with automated privacy budget decay tracking.',
    availabilityStatus: 'Fully Available',
    tags: ['Requires Configuration'],
    linkedFrd: {
      id: 'FRD-2025-012',
      title: 'Differential Privacy SQL Query Rewriter & Budget Ledger',
      status: 'Shipped',
      targetRelease: 'v4.1.0',
      owner: 'Rahul Nair',
      linkUrl: 'https://wiki.internal.privasapien.io/frd/FRD-2025-012',
    },
    accountMappings: {
      'acc-1': {
        accountId: 'acc-1',
        accountName: 'State Bank of India (SBI)',
        complianceStatus: 'Fully Compliant',
        preliminaryRemarks: 'Native differential privacy engine is certified and actively running under PO scoping.',
        finalResponse: 'Compliant. Epsilon bounds configurable via admin console from 0.01 to 2.0 with audit ledger.',
        tenderRef: 'RFP/SBI/IT/2026/04 Clause 4.2.1',
      },
      'acc-2': {
        accountId: 'acc-2',
        accountName: 'Ministry of Health & Family Welfare',
        complianceStatus: 'Fully Compliant',
        preliminaryRemarks: 'Standard out-of-the-box feature for national health registry anonymization.',
        finalResponse: 'Compliant. Meets MoHFW data sharing guidelines 2024.',
        tenderRef: 'Tender-MoHFW-2026-PET-08',
      },
    },
    createdAt: '2026-05-10T10:00:00Z',
    updatedAt: '2026-10-12T14:20:00Z',
  },
  {
    id: 'req-mat-2',
    productFamily: 'Privacy Enhancing Technologies (PETs)',
    product: 'PrivaSapien Anonymizer Pro & PETs Core',
    module: 'Format-Preserving Encryption (FPE)',
    title: 'Hardware-Enforced FIPS 140-3 Level 3 Root of Trust for Master Cryptographic Keys',
    description: 'Master data encryption keys (MEK) and key encryption keys (KEK) must reside in a dedicated Hardware Security Module with PKCS#11 tamper-reactive zeroization.',
    availabilityStatus: 'Partially Available',
    tags: ['Requires Integration', 'Requires Configuration'],
    linkedFrd: {
      id: 'FRD-2026-034',
      title: 'Thales & Entrust PKCS#11 Native Connector Bridge',
      status: 'In Development',
      targetRelease: 'v4.3.0',
      owner: 'Rahul Nair',
      linkUrl: 'https://wiki.internal.privasapien.io/frd/FRD-2026-034',
    },
    accountMappings: {
      'acc-1': {
        accountId: 'acc-1',
        accountName: 'State Bank of India (SBI)',
        complianceStatus: 'Partially Compliant',
        preliminaryRemarks: 'Software KMS is native; hardware HSM requires integration with client Thales Luna appliances.',
        finalResponse: 'Partially Compliant. Software HSM native; Thales Luna HSM integration enabled via PKCS#11 driver.',
        tenderRef: 'RFP/SBI/IT/2026/04 Clause 4.3.5',
      },
      'acc-3': {
        accountId: 'acc-3',
        accountName: 'HDFC Bank Enterprise',
        complianceStatus: 'Partially Compliant',
        preliminaryRemarks: 'Configured with HDFC on-prem Thales HSM in Mumbai data center.',
        finalResponse: 'Supported via partner integration with Thales HSM appliance.',
        tenderRef: 'RFI-HDFC-SEC-2026-11',
      },
    },
    createdAt: '2026-06-14T11:00:00Z',
    updatedAt: '2026-10-14T09:30:00Z',
  },
  {
    id: 'req-mat-3',
    productFamily: 'Responsible AI & Governance',
    product: 'PrivaSapien AI Guardrails',
    module: 'Prompt Injection Defense',
    title: 'Zero-Latency Token-Level Prompt Injection & Adversarial Jailbreak Filtering',
    description: 'In-line proxy capability to intercept LLM prompts and filter multimodal adversarial jailbreaks before model weights are evaluated.',
    availabilityStatus: 'Fully Available',
    tags: ['Requires Configuration'],
    linkedFrd: {
      id: 'FRD-2026-045',
      title: 'Heuristic & Embedding Guardrail Fast-Path Proxy',
      status: 'Shipped',
      targetRelease: 'v4.2.0',
      owner: 'Ananya Sharma',
      linkUrl: 'https://wiki.internal.privasapien.io/frd/FRD-2026-045',
    },
    accountMappings: {
      'acc-1': {
        accountId: 'acc-1',
        accountName: 'State Bank of India (SBI)',
        complianceStatus: 'Fully Compliant',
        preliminaryRemarks: 'Supported via PrivaSapien AI Guardrails proxy layer (<15ms latency).',
        finalResponse: 'Compliant. Deployed in forward proxy mode with custom finance toxic embedding dictionary.',
        tenderRef: 'RFP/SBI/IT/2026/04 Clause 4.7.2',
      },
    },
    createdAt: '2026-07-22T16:00:00Z',
    updatedAt: '2026-10-15T11:00:00Z',
  },
  {
    id: 'req-mat-4',
    productFamily: 'PrivacyGRC Core Suite',
    product: 'PrivaSapien GRC Platform',
    module: 'Endpoint DLP & Exfiltration Control',
    title: 'Endpoint Workstation Clipboard, USB Storage and Screen Capture Blocking',
    description: 'Endpoint agent software installed on analyst laptops to block clipboard copy-paste and watermark confidential datasets on screens.',
    availabilityStatus: 'Not Available',
    tags: ['Requires Integration'],
    linkedFrd: {
      id: 'FRD-2026-088',
      title: 'Partner DLP Webhook Relay & Agentless Browser Policy Enforcer',
      status: 'Draft',
      targetRelease: 'v4.5.0',
      owner: 'Vikram Malhotra',
      linkUrl: 'https://wiki.internal.privasapien.io/frd/FRD-2026-088',
    },
    accountMappings: {
      'acc-1': {
        accountId: 'acc-1',
        accountName: 'State Bank of India (SBI)',
        complianceStatus: 'Partially Compliant',
        preliminaryRemarks: 'Endpoint agent is non-native; recommended to fulfill via Forcepoint DLP or Island Enterprise Browser.',
        finalResponse: 'Partially Compliant via Partner. PrivaSapien provides server-side watermarking; workstation agent provided via certified partner Forcepoint DLP.',
        tenderRef: 'RFP/SBI/IT/2026/04 Clause 6.1.4',
      },
    },
    createdAt: '2026-08-05T09:00:00Z',
    updatedAt: '2026-10-16T15:45:00Z',
  },
  {
    id: 'req-mat-5',
    productFamily: 'PrivacyGRC Core Suite',
    product: 'PrivaSapien GRC Platform',
    module: 'Perimeter Web Application Firewall (WAF)',
    title: 'Layer-7 OWASP Top 10 Web Application Firewall and Distributed DDoS Mitigation',
    description: 'In-line edge protection with managed DDoS filtering, SSL/TLS termination, and automated bot mitigation.',
    availabilityStatus: 'Not Available',
    tags: ['Requires Integration', 'Not Applicable'],
    accountMappings: {
      'acc-1': {
        accountId: 'acc-1',
        accountName: 'State Bank of India (SBI)',
        complianceStatus: 'Non-Compliant',
        preliminaryRemarks: 'Perimeter network WAF is outside core privacy scope. Best fulfilled via Cloudflare Magic WAF or AWS WAF.',
        finalResponse: 'Compliant via Ecosystem. Fulfilled via Bank existing Cloudflare Enterprise WAF connector.',
        tenderRef: 'RFP/SBI/IT/2026/04 Clause 7.2.3',
      },
    },
    createdAt: '2026-09-01T12:00:00Z',
    updatedAt: '2026-10-16T16:00:00Z',
  },
];

export const INITIAL_NOTIFICATIONS: CrmNotification[] = [
  {
    id: 'notif-1',
    category: 'product',
    title: 'FRD Status Update: FRD-2026-034',
    message: 'Thales & Entrust PKCS#11 Native Connector moved to "In Development". Review compliance on State Bank of India & HDFC Bank.',
    timestamp: '2026-10-16T14:30:00Z',
    read: false,
    targetId: 'req-mat-2',
    targetType: 'matrix',
  },
  {
    id: 'notif-2',
    category: 'task',
    title: 'New Review Task Assigned',
    message: 'Ananya Sharma assigned you "Submission Docs Checklist Review" for State Bank of India RFP.',
    timestamp: '2026-10-17T11:00:00Z',
    read: false,
    targetId: 'task-sbi-submission',
    targetType: 'task',
  },
  {
    id: 'notif-3',
    category: 'account',
    title: 'RFP Scope of Work Converted',
    message: 'SoW for State Bank of India was converted to Excel with 14 compliance clauses extracted.',
    timestamp: '2026-10-17T16:45:00Z',
    read: true,
    targetId: 'acc-1',
    targetType: 'account',
  },
];
