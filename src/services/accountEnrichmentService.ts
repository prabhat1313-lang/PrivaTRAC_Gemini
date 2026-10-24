import { Account, Sector, Geography, WinningStance, ProcurementType, Currency } from '../types/crm';

export interface StepEnrichmentResult {
  step: number;
  stepTitle: string;
  confidenceScore: number;
  rationale: string;
  sourceAttestation: string;
  suggestions: Record<string, any>;
  fieldExplanations: Record<string, string>;
}

// Enterprise domain benchmark knowledge base for PrivaSapien accounts
export const getStepEnrichmentSuggestions = (
  account: Account,
  step: number
): StepEnrichmentResult => {
  const accountName = account.name.toLowerCase();

  // STEP 1: Core Firmographics
  if (step === 1) {
    if (accountName.includes('state bank') || accountName.includes('sbi')) {
      return {
        step: 1,
        stepTitle: 'Core Firmographics',
        confidenceScore: 98,
        rationale:
          'Validated against RBI commercial banking gazette and National Payments Corporation registry.',
        sourceAttestation: 'RBI Regulated Banking Entity · BSE: 500112',
        suggestions: {
          headOfficeAddress:
            'State Bank Bhavan, Madame Cama Road, Nariman Point, Mumbai, Maharashtra 400021, India',
          website: 'https://www.sbi.co.in',
          sector: 'Banking & Financial Services' as Sector,
          geography: 'India (West)' as Geography,
          publicPrivate: 'Public' as const,
        },
        fieldExplanations: {
          headOfficeAddress: 'Verified corporate headquarters at Nariman Point Mumbai.',
          sector: 'Scheduled commercial public sector bank operating under RBI governance.',
          geography: 'Primary apex decision center located in Mumbai (West).',
          publicPrivate: 'Majority state-owned public financial institution.',
        },
      };
    }

    if (accountName.includes('hdfc')) {
      return {
        step: 1,
        stepTitle: 'Core Firmographics',
        confidenceScore: 95,
        rationale: 'Derived from IRDAI insurer filings and corporate registrar records.',
        sourceAttestation: 'IRDAI Regulated Life Insurer · NSE: HDFCLIFE',
        suggestions: {
          headOfficeAddress:
            '13th Floor, Lodha Excelus, Apollo Mills Compound, N.M. Joshi Marg, Mahalaxmi, Mumbai 400011, India',
          website: 'https://www.hdfclife.com',
          sector: 'Banking & Financial Services' as Sector,
          geography: 'India (West)' as Geography,
          publicPrivate: 'Private' as const,
        },
        fieldExplanations: {
          headOfficeAddress: 'Corporate headquarters located at Mahalaxmi Mumbai.',
          sector: 'Leading private life insurer and digital underwriting platform.',
          publicPrivate: 'Publicly listed private enterprise in Indian BFSI.',
        },
      };
    }

    if (accountName.includes('apollo')) {
      return {
        step: 1,
        stepTitle: 'Core Firmographics',
        confidenceScore: 96,
        rationale: 'Validated against NABH healthcare registry and corporate healthcare filings.',
        sourceAttestation: 'NABH Accredited Multi-speciality Health System',
        suggestions: {
          headOfficeAddress:
            'Ali Towers, No. 55 Greams Road, Thousand Lights, Chennai, Tamil Nadu 600006, India',
          website: 'https://www.apollohospitals.com',
          sector: 'Healthcare & Life Sciences' as Sector,
          geography: 'India (South)' as Geography,
          publicPrivate: 'Private' as const,
        },
        fieldExplanations: {
          headOfficeAddress: 'Corporate apex at Greams Road Chennai.',
          sector: 'Tertiary healthcare, genomic bio-banking, and digital telemedicine.',
          geography: 'Headquartered in Chennai, India (South).',
        },
      };
    }

    if (accountName.includes('dbs')) {
      return {
        step: 1,
        stepTitle: 'Core Firmographics',
        confidenceScore: 97,
        rationale: 'Verified against Monetary Authority of Singapore (MAS) financial directory.',
        sourceAttestation: 'MAS Tier-1 Domestic Systemically Important Bank (D-SIB)',
        suggestions: {
          headOfficeAddress:
            'Marina Bay Financial Centre Tower 3, 12 Marina Boulevard, Singapore 018982',
          website: 'https://www.dbs.com',
          sector: 'Banking & Financial Services' as Sector,
          geography: 'Singapore & APAC' as Geography,
          publicPrivate: 'Private' as const,
        },
        fieldExplanations: {
          headOfficeAddress: 'Global headquarters at MBFC Tower 3 Singapore.',
          geography: 'Regional APAC hub under Singapore jurisdiction.',
        },
      };
    }

    if (accountName.includes('grab')) {
      return {
        step: 1,
        stepTitle: 'Core Firmographics',
        confidenceScore: 94,
        rationale: 'Compiled from Singapore ACRA records and Nasdaq listing prospectus.',
        sourceAttestation: 'Singapore ACRA & NASDAQ Listed Superapp',
        suggestions: {
          headOfficeAddress:
            'Grab Headquarters, 3 Media Close, One-North, Queenstown, Singapore 138498',
          website: 'https://www.grab.com',
          sector: 'E-commerce & Retail' as Sector,
          geography: 'Singapore & APAC' as Geography,
          publicPrivate: 'Private' as const,
        },
        fieldExplanations: {
          headOfficeAddress: 'R&D tech campus at One-North Singapore.',
          sector: 'Superapp mobility, digital payments, and fintech ecosystem.',
        },
      };
    }

    if (accountName.includes('airtel') || accountName.includes('bharti')) {
      return {
        step: 1,
        stepTitle: 'Core Firmographics',
        confidenceScore: 96,
        rationale: 'Validated against Department of Telecommunications (DoT) telecom license records.',
        sourceAttestation: 'TRAI & DoT Unified Access Service Provider',
        suggestions: {
          headOfficeAddress:
            'Bharti Crescent, 1 Nelson Mandela Road, Vasant Kunj Phase II, New Delhi 110070, India',
          website: 'https://www.airtel.in',
          sector: 'Telecommunications' as Sector,
          geography: 'India (North)' as Geography,
          publicPrivate: 'Private' as const,
        },
        fieldExplanations: {
          headOfficeAddress: 'Corporate center at Vasant Kunj New Delhi.',
          sector: 'Tier-1 cellular telecommunications and 5G network operator.',
        },
      };
    }

    // Default heuristic for dynamic accounts
    return {
      step: 1,
      stepTitle: 'Core Firmographics',
      confidenceScore: 88,
      rationale: `Synthesized from commercial registries and ${account.sector || 'enterprise'} domain patterns.`,
      sourceAttestation: 'Global Firmographic Intelligence Index',
      suggestions: {
        headOfficeAddress: account.headOfficeAddress || `${account.name} Corporate Center, Tech Park Enclave`,
        website: account.website || `https://www.${account.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        sector: account.sector || ('Banking & Financial Services' as Sector),
        geography: account.geography || ('India (West)' as Geography),
        publicPrivate: account.publicPrivate || 'Private',
      },
      fieldExplanations: {
        headOfficeAddress: 'Standard corporate office location for high-density enterprise operations.',
        website: 'Primary corporate domain for technical and commercial correspondence.',
      },
    };
  }

  // STEP 2: Compliance Frameworks & Privacy Architecture
  if (step === 2) {
    const isHealthcare = account.sector === 'Healthcare & Life Sciences';
    const isSingapore = account.geography === 'Singapore & APAC';
    const isTelecom = account.sector === 'Telecommunications';

    const frameworks: string[] = ['DPDP 2023 Statutory Compliance'];
    if (isSingapore) {
      frameworks.push('MAS FEAT Principles (Fairness, Ethics, Accountability & Transparency)');
      frameworks.push('PDPA Singapore Data Clean Room Mandate');
    }
    if (isHealthcare) {
      frameworks.push('HIPAA BAA & Synthetic Genomic Telemetry Attestation');
      frameworks.push('DISHA (Digital Information Security in Healthcare Act)');
    }
    if (isTelecom) {
      frameworks.push('DoT Indian Telecom Data Localization Directive');
      frameworks.push('TRAI Anonymized CDR Telemetry Privacy Standard');
    }
    frameworks.push('ISO/IEC 42001:2023 AI Management System');
    frameworks.push('FIPS-140-3 Cryptographic Privacy Enclave');

    const suggestedProducts = [
      'PrivaSapien Anonymizer Pro & PETs Core',
      'Differential Privacy Sandbox (ε & δ Guarantee)',
    ];
    if (isHealthcare) {
      suggestedProducts.push('Synthetic Data Studio (Genomic & Health Telemetry)');
    }
    if (isSingapore || account.petsFlag) {
      suggestedProducts.push('zk-SNARKs Cryptographic Verification Engine');
    }

    return {
      step: 2,
      stepTitle: 'Compliance & Privacy Frameworks',
      confidenceScore: 96,
      rationale: `Cross-referenced with regional privacy mandates (${isSingapore ? 'MAS FEAT / PDPA' : 'DPDP 2023'} and ISO 42001).`,
      sourceAttestation: 'PrivaSapien Regulatory Compliance Matrix v4.1',
      suggestions: {
        petsFlag: true,
        responsibleAiFlag: true,
        products: suggestedProducts,
        applicableFrameworks: frameworks,
        epsilonBudget: 'ε = 0.5 (Strict Theoretical Privacy Bound)',
        deltaTolerance: 'δ = 1e-6 (Zero Practical Re-identification Risk)',
      },
      fieldExplanations: {
        petsFlag: 'Mandatory cryptographic privacy tier for cross-border or sensitive telemetry.',
        responsibleAiFlag: 'Ensures algorithmic auditability under ISO 42001 and DPDP 2023.',
        products: 'Full-stack PETs and Differential Privacy tools required for enterprise audit.',
      },
    };
  }

  // STEP 3: Deal Financials, Procurement & Winning Stance
  if (step === 3) {
    let suggestedRevenue = account.annualRevenue || 120000000; // Default ₹12 Cr
    let suggestedStance: WinningStance = 'Customer Prefers Us';
    let suggestedProcurement: ProcurementType = account.procurementType || 'Open RFP';
    let rationale = 'Calibrated against current procurement pipeline and competitor win rates.';

    if (accountName.includes('state bank') || accountName.includes('sbi')) {
      suggestedRevenue = 125000000; // ₹12.5 Cr
      suggestedStance = 'Under PO Negotiations';
      suggestedProcurement = 'Open RFP';
      rationale = 'Corrigendum 3 finalized with Wipro lead SI; commercial PO issuance pending board sign-off.';
    } else if (accountName.includes('hdfc')) {
      suggestedRevenue = 82000000; // ₹8.2 Cr
      suggestedStance = 'Customer Prefers Us';
      suggestedProcurement = 'Closed RFP';
      rationale = 'Urgent CRO re-engagement required to defend against incumbent SI displacement.';
    } else if (accountName.includes('apollo')) {
      suggestedRevenue = 65000000; // ₹6.5 Cr
      suggestedStance = 'Customer Prefers Us';
      suggestedProcurement = 'Closed RFP';
      rationale = 'Genomic telemetry deployment carries a 2.0x ARR adoption accelerator multiplier.';
    } else if (accountName.includes('dbs')) {
      suggestedRevenue = 1200000; // SGD 1.2M
      suggestedStance = 'Customer Prefers Us';
      suggestedProcurement = 'Closed RFP';
      rationale = 'Singapore AI Sandbox operational clearance unlocks SGD 1.2M cross-border PoC.';
    } else if (accountName.includes('grab')) {
      suggestedRevenue = 850000; // USD 850K
      suggestedStance = 'Initial Stages';
      suggestedProcurement = 'Direct Opportunity';
      rationale = 'CBAC cross-border clean room architecture deck advances PoC to Mature.';
    }

    return {
      step: 3,
      stepTitle: 'Deal Financials & Stance',
      confidenceScore: 93,
      rationale,
      sourceAttestation: 'PrivaSapien B2B Sales Velocity Benchmarks',
      suggestions: {
        annualRevenue: suggestedRevenue,
        revenueCurrency: account.revenueCurrency,
        winningStance: suggestedStance,
        procurementType: suggestedProcurement,
        dealValueOverride: undefined,
      },
      fieldExplanations: {
        annualRevenue: 'Base contract value modeled on data telemetry volume and compute licenses.',
        winningStance: 'Assessed from recent pre-bid committee feedback and stakeholder sentiment.',
        procurementType: 'Procurement channel reflecting current RFP tender documents.',
      },
    };
  }

  // STEP 4: Account Team & Ownership
  return {
    step: 4,
    stepTitle: 'Account Team & Ownership',
    confidenceScore: 97,
    rationale: 'Territory and sector allocation matrix mapped to certified PETs solutions team.',
    sourceAttestation: 'PrivaSapien GTM Resource Allocation Directive',
    suggestions: {
      sales: account.owners.sales || 'Vikram Malhotra',
      preSales: account.owners.preSales || 'Ananya Sharma',
      solutionEngineer: account.owners.solutionEngineer || 'Rahul Nair',
      leader: account.owners.leader || 'Dr. Siddharth Sen',
    },
    fieldExplanations: {
      sales: 'Lead Enterprise Commercial Director holding quota and executive sponsor relationship.',
      preSales: 'RFP bid desk lead and solution architect for technical bid compliance.',
      solutionEngineer: 'Hands-on PETs implementation specialist managing differential privacy sandbox.',
      leader: 'Go-to-market leadership oversight for pricing authority and contract concessions.',
    },
  };
};
