export interface HelpActionShortcut {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  actionType:
    | 'open_profile_wizard'
    | 'switch_to_copilot_action'
    | 'open_rfp_desk'
    | 'navigate_tab'
    | 'open_checklist';
  payload?: {
    tabId?: string;
    accountId?: string;
    prompt?: string;
  };
}

export interface HelpArticle {
  id: string;
  title: string;
  category: 'CRM Guidance' | 'PETs & Tech' | 'Compliance & Governance' | 'RFP & Bids' | 'Profile & Setup';
  summary: string;
  detailedContent: string;
  keywords: string[];
  shortcuts: HelpActionShortcut[];
}

export const HELP_KNOWLEDGE_BASE: HelpArticle[] = [
  {
    id: 'kb-profile-setup',
    title: 'How to Complete Your Operational Profile',
    category: 'Profile & Setup',
    summary:
      'Configure your designation, territory, default currency (INR/USD/SGD/EUR), and PrivaTRAC delegation preferences.',
    detailedContent: `Your PrivaSapien CRM profile establishes your operational identity across all tenders, account ownerships, and delegated audit trails.
- **Identity & Persona**: Set your corporate designation (Sales Owner, Pre-Sales Consultant, Solution Architect) and department.
- **Territory & Products**: Select your primary sales region (e.g., India North/West/South, Singapore & APAC, Europe) and product specialization (PETs Core, Synthetic Data Studio).
- **Currency & Formatting**: Choose Indian numbering format (₹ Crores & Lakhs) or international currency formatting.
- **PrivaTRAC Delegation**: Authorize colleagues to act on your behalf with immutable audit provenance logged under your delegation rules.`,
    keywords: ['profile', 'setup', 'onboarding', 'account', 'delegation', 'currency', 'designation', 'user'],
    shortcuts: [
      {
        id: 'sc-launch-profile',
        label: 'Launch Profile Wizard',
        description: 'Open the 4-step guided profile setup wizard',
        actionType: 'open_profile_wizard',
      },
    ],
  },
  {
    id: 'kb-rfp-submission',
    title: 'RFP Submission Checklist & Pre-Bid Deadlines',
    category: 'RFP & Bids',
    summary:
      'Track pre-bid queries, corrigendum addenda, and upload mandatory annexures for tender submission.',
    detailedContent: `The RFP lifecycle in PrivaSapien CRM enforces full document governance:
1. **Pre-Bid Query Cutoff**: Submit clarification queries regarding zero-knowledge boundaries and deployment topology.
2. **Corrigendum Reconciliation**: When the client publishes tender corrigenda (e.g., Corrigendum-3 for SBI), the system triggers automated impact analysis.
3. **Mandatory Annexures Checklist**: Track ownership across OEM, SI Partner, and Joint deliverables.
4. **Final Tender Seal**: Packet A (EMD guarantee), Packet B (Signed technical proposal & SBOM), and Packet C (Commercial reverse auction price).`,
    keywords: ['rfp', 'tender', 'pre-bid', 'submission', 'corrigendum', 'annexure', 'sbi', 'dbs', 'deadline'],
    shortcuts: [
      {
        id: 'sc-rfp-sbi',
        label: 'Open SBI Tender Desk',
        description: 'View SBI tender milestones & annexure checklists',
        actionType: 'open_rfp_desk',
        payload: { accountId: 'acc-1' },
      },
      {
        id: 'sc-rfp-nav',
        label: 'Go to Tasks & RFP Desk',
        description: 'Navigate to full tasks and RFP management tab',
        actionType: 'navigate_tab',
        payload: { tabId: 'tasks' },
      },
    ],
  },
  {
    id: 'kb-pets-core',
    title: 'PrivaSapien PETs Core & zk-SNARKs Architecture',
    category: 'PETs & Tech',
    summary:
      'Understanding zero-knowledge proofs and differential privacy in enterprise data clean rooms.',
    detailedContent: `PrivaSapien PETs Core delivers state-of-the-art privacy-preserving computation:
- **zk-SNARKs**: Elliptic curve non-interactive zero-knowledge proofs verify query legitimacy without exposing plaintext databases to compute runtimes.
- **Differential Privacy Sandbox**: Mathematically guarantees that statistical outputs cannot be reverse-engineered to reconstruct individual records.
- **Privacy Epsilon (ε) & Delta (δ)**: Configurable privacy loss budgets. Lower ε values enforce tighter mathematical privacy at high data utility.
- **On-Prem Air-Gapped Topology**: Certified for banking grade deployments without egress to external public clouds.`,
    keywords: ['pets', 'zk-snarks', 'differential privacy', 'epsilon', 'delta', 'encryption', 'cryptography'],
    shortcuts: [
      {
        id: 'sc-matrix-nav',
        label: 'Open Product Matrix View',
        description: 'Inspect product requirements, FRDs, and availability status',
        actionType: 'navigate_tab',
        payload: { tabId: 'matrix' },
      },
      {
        id: 'sc-copilot-pets-demo',
        label: 'Stage PETs Demo Task with Copilot',
        description: 'Have SalesOps Copilot schedule a differential privacy demo',
        actionType: 'switch_to_copilot_action',
        payload: {
          prompt: "Schedule differential privacy benchmark demonstration with Apollo Health Networks",
        },
      },
    ],
  },
  {
    id: 'kb-compliance-dpdp',
    title: 'Compliance: DPDP 2023, MAS FEAT & ISO 42001',
    category: 'Compliance & Governance',
    summary:
      'Regulatory compliance guarantees across Indian, Singaporean, and European data privacy laws.',
    detailedContent: `PrivaSapien provides ready-made technical attestation packs for global regulatory frameworks:
- **India DPDP Act 2023**: Mandates purpose limitation, notice, and non-identifiability of personal data.
- **Singapore MAS FEAT Principles**: Fairness, Ethics, Accountability, and Transparency for AI in financial services.
- **ISO/IEC 42001**: International artificial intelligence management system standard for algorithmic fairness.
- **FIPS 140-3**: Cryptographic module security certification required by government tenders and tier-1 banks.`,
    keywords: ['dpdp', 'mas feat', 'iso 42001', 'compliance', 'hipaa', 'fips', 'regulation', 'gdpr'],
    shortcuts: [
      {
        id: 'sc-copilot-compliance',
        label: 'Create MAS FEAT Follow-up in Copilot',
        description: 'Stage MAS FEAT compliance task for DBS Bank',
        actionType: 'switch_to_copilot_action',
        payload: {
          prompt: "Submit MAS FEAT compliance validation and regional cross-border SLA addendum for DBS Bank Southeast Asia",
        },
      },
    ],
  },
  {
    id: 'kb-salesops-copilot',
    title: 'How to Use SalesOps Copilot for CRM Updates',
    category: 'CRM Guidance',
    summary:
      'Instruct operational changes in plain English with PrivaTRAC human-in-the-loop review.',
    detailedContent: `SalesOps Copilot accelerates CRM operations while preserving audit compliance:
1. **Instruct in Natural Language**: Type commands like "Move State Bank of India to Critical stage, set deal value to ₹12.5 Cr, and add follow-up task to deliver FIPS attestation."
2. **Review Atomic Diff**: Copilot stages planned changes showing before/after values.
3. **PrivaTRAC Human Gate**: Suggestions remain advisory until confirmed by the operator.
4. **Immutable Audit Trail**: All actions record actor: "SalesOps Copilot" on behalf of the acting user.
5. **Admin Section Interception**: Administrative settings (Users, Roles, Schemas) cannot be modified by Copilot.`,
    keywords: ['copilot', 'agent', 'salesops', 'audit', 'privatrac', 'governance', 'task', 'stage', 'deal value'],
    shortcuts: [
      {
        id: 'sc-switch-to-copilot',
        label: 'Open SalesOps Actions Mode',
        description: 'Switch to the Action Plan tab to stage CRM updates',
        actionType: 'switch_to_copilot_action',
      },
    ],
  },
  {
    id: 'kb-synthetic-data',
    title: 'PrivaSapien Synthetic Data Studio & Healthcare Telemetry',
    category: 'PETs & Tech',
    summary:
      'Generate HIPAA-compliant synthetic datasets preserving correlation matrices without patient re-identification.',
    detailedContent: `Synthetic Data Studio generates statistically representative data with mathematical privacy guarantees:
- **Genomic & DICOM Pseudonymization**: Removes 18 HIPAA identifiers while retaining clinical utility for AI model training.
- **Fairness & Bias Mitigation**: Rebalances training datasets for underwriting and risk models (ISO 42001).
- **Utility Scoring**: Validates Wasserstein distance and mutual information fidelity against production datasets.`,
    keywords: ['synthetic', 'synthetic data', 'hipaa', 'healthcare', 'apollo', 'dicom', 'clinical'],
    shortcuts: [
      {
        id: 'sc-copilot-synthetic-apollo',
        label: 'Advance Apollo Synthetic Data PoC',
        description: 'Stage task to advance Apollo Health Networks to Mature stage',
        actionType: 'switch_to_copilot_action',
        payload: {
          prompt: "Advance Apollo Health Networks deal: add task 'Schedule genomic synthetic telemetry demonstration with Dr. Padmanabhan' and advance stage to 'Mature'",
        },
      },
    ],
  },
];

export const SAMPLE_HELP_QUERIES = [
  'How do I complete my user profile and set default currency?',
  'How do I submit an RFP tender annexure checklist?',
  'What is PrivaSapien zk-SNARKs and Differential Privacy?',
  'How does PrivaTRAC governance protect the Admin section?',
  'What compliance standards does PrivaSapien support (DPDP, MAS FEAT)?',
];

export function searchHelpKnowledgeBase(query: string): HelpArticle[] {
  const q = query.trim().toLowerCase();
  if (!q) return HELP_KNOWLEDGE_BASE;

  const words = q.split(/\s+/).filter((w) => w.length > 2);

  const scored = HELP_KNOWLEDGE_BASE.map((article) => {
    let score = 0;
    const titleLower = article.title.toLowerCase();
    const summaryLower = article.summary.toLowerCase();
    const contentLower = article.detailedContent.toLowerCase();

    // Exact title match
    if (titleLower.includes(q)) score += 50;

    // Word matching
    words.forEach((w) => {
      if (titleLower.includes(w)) score += 15;
      if (article.keywords.some((k) => k.includes(w))) score += 12;
      if (summaryLower.includes(w)) score += 8;
      if (contentLower.includes(w)) score += 4;
    });

    return { article, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.article);
}
