import {
  Account,
  AdoptionCategory,
  Currency,
  ExchangeRates,
  Task,
  TaskStatus,
  WinningStance,
} from '../types/crm';

/**
 * Deal Value defaults to 0.025% of Annual Revenue (0.00025 * Annual Revenue)
 * unless an authorized override is present.
 */
export function calculateDealValue(
  annualRevenue: number,
  dealValueOverride?: number
): number {
  if (dealValueOverride !== undefined && dealValueOverride > 0) {
    return dealValueOverride;
  }
  return Math.round(annualRevenue * 0.00025);
}

/**
 * Winning Stance factor mapping (0.0 to 1.0)
 */
export function getWinningStanceFactor(stance: WinningStance): number {
  switch (stance) {
    case 'Lost/Not Started':
      return 0.0;
    case 'Initial Stages':
      return 0.1;
    case 'Low Chance':
      return 0.25;
    case 'All are Equal':
      return 0.5;
    case 'Customer Prefers Us':
      return 0.75;
    case 'Under PO Negotiations':
      return 0.9;
    case 'Won/PO Received':
      return 1.0;
    default:
      return 0.0;
  }
}

/**
 * Adoption Category Multipliers defined in Section 6.6
 */
export function getAdoptionMultiplier(category: AdoptionCategory): number {
  switch (category) {
    case 'Innovator':
      return 2.0;
    case 'Early Adopter':
      return 1.5;
    case 'Early Majority':
      return 1.0;
    case 'Late Majority':
      return 0.5;
    case 'Laggard':
      return 0.01;
    default:
      return 1.0;
  }
}

/**
 * Product catalogues categorized for Adoption Category derivation
 */
export const PRIVACY_GRC_PRODUCTS = [
  'DPIA & Privacy Impact Assessments',
  'RoPA Data Mapping & Asset Inventory',
  'Consent & Notice Manager',
  'DSAR Subject Rights Portal',
] as const;

export const CBAC_PRODUCT = 'Consentium Bridge & CBAC Engine';

export const ADDITIONAL_PETS_PRODUCTS = [
  'PrivaSapien Anonymizer Pro & PETs Core',
  'Synthetic Data Studio & HIPAA Anonymizer',
  'Zero-Knowledge Proof Verifier',
  'Differential Privacy SQL Proxy',
] as const;

export const RESPONSIBLE_AI_PRODUCTS = [
  'AI Bias & Fairness Auditor (ISO 42001)',
  'Algorithmic Risk Scorecard',
  'LLM Safety Guardrail Firewall',
] as const;

export const PRODUCT_GROUPS = [
  {
    groupId: 'privacy-grc',
    groupName: 'PrivacyGRC Core Suite',
    badge: 'Privacy GRC (4 Total)',
    ruleHint: '<50% = Laggard (0.01×) · ≥50% = Late Majority (0.5×)',
    products: PRIVACY_GRC_PRODUCTS,
  },
  {
    groupId: 'pets-cbac',
    groupName: 'PETs · CBAC Engine',
    badge: 'Bridge to Early Majority',
    ruleHint: '100% PrivacyGRC + CBAC = Early Majority (1.0×)',
    products: [CBAC_PRODUCT] as const,
  },
  {
    groupId: 'additional-pets',
    groupName: 'Additional PETs Portfolio',
    badge: 'Advanced PETs (1.5×)',
    ruleHint: 'Any Additional PETs = Early Adopter (1.5×)',
    products: ADDITIONAL_PETS_PRODUCTS,
  },
  {
    groupId: 'responsible-ai',
    groupName: 'Responsible AI & Governance',
    badge: 'Responsible AI (2.0×)',
    ruleHint: 'Responsible AI Included = Innovator (2.0×)',
    products: RESPONSIBLE_AI_PRODUCTS,
  },
] as const;

export function getAdoptionCategoryBadgeStyle(category: AdoptionCategory): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (category) {
    case 'Innovator':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        dot: 'bg-purple-500',
      };
    case 'Early Adopter':
      return {
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        dot: 'bg-indigo-500',
      };
    case 'Early Majority':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'Late Majority':
      return {
        bg: 'bg-sky-50',
        text: 'text-sky-700',
        border: 'border-sky-200',
        dot: 'bg-sky-500',
      };
    case 'Laggard':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
      };
    default:
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
      };
  }
}

export interface AdoptionCategoryResult {
  category: AdoptionCategory;
  multiplier: number;
  reason: string;
  ruleExplanation: string;
  privacyGrcCount: number;
  privacyGrcTotal: number;
  privacyGrcPercent: number;
  hasCbac: boolean;
  hasAdditionalPets: boolean;
  hasResponsibleAi: boolean;
}

/**
 * Automatically derives the Adoption Category from selected products:
 * 1. Partial PrivacyGRC (<50%) -> Laggard (0.01x)
 * 2. Partial PrivacyGRC (>50%) -> Late Majority (0.5x)
 * 3. Full PrivacyGRC & CBAC from PETs -> Early Majority (1.0x)
 * 4. Additional PETs -> Early Adopter (1.5x)
 * 5. Responsible AI included -> Innovator (2.0x)
 */
export function deriveAdoptionCategory(
  selectedProducts: string[] | string | undefined = []
): AdoptionCategoryResult {
  const productsArray: string[] = Array.isArray(selectedProducts)
    ? selectedProducts
    : typeof selectedProducts === 'string' && selectedProducts.trim()
      ? [selectedProducts]
      : [];

  const privacyGrcTotal = PRIVACY_GRC_PRODUCTS.length; // 4
  const privacyGrcCount = productsArray.filter((p) =>
    PRIVACY_GRC_PRODUCTS.some(
      (grc) => grc.toLowerCase() === p.toLowerCase() || p.toLowerCase().includes(grc.toLowerCase())
    )
  ).length;
  const privacyGrcPercent = Math.round((privacyGrcCount / privacyGrcTotal) * 100);

  const hasCbac = productsArray.some(
    (p) => p.toLowerCase().includes('cbac') || p.toLowerCase().includes('consentium bridge')
  );

  const hasAdditionalPets = productsArray.some(
    (p) =>
      ADDITIONAL_PETS_PRODUCTS.some(
        (pet) => pet.toLowerCase() === p.toLowerCase() || p.toLowerCase().includes(pet.toLowerCase())
      ) ||
      (p.toLowerCase().includes('pets') && !p.toLowerCase().includes('cbac') && !p.toLowerCase().includes('bridge')) ||
      p.toLowerCase().includes('anonymizer') ||
      p.toLowerCase().includes('synthetic') ||
      p.toLowerCase().includes('proof verifier') ||
      p.toLowerCase().includes('differential privacy')
  );

  const hasResponsibleAi = productsArray.some(
    (p) =>
      RESPONSIBLE_AI_PRODUCTS.some(
        (rai) => rai.toLowerCase() === p.toLowerCase() || p.toLowerCase().includes(rai.toLowerCase())
      ) ||
      p.toLowerCase().includes('responsible ai') ||
      p.toLowerCase().includes('bias') ||
      p.toLowerCase().includes('iso 42001') ||
      p.toLowerCase().includes('guardrail')
  );

  // Condition 5: if Responsible AI included then Innovator
  if (hasResponsibleAi) {
    return {
      category: 'Innovator',
      multiplier: 2.0,
      reason: 'Responsible AI included',
      ruleExplanation: 'Responsible AI Included ➔ Innovator (2.0× Multiplier)',
      privacyGrcCount,
      privacyGrcTotal,
      privacyGrcPercent,
      hasCbac,
      hasAdditionalPets,
      hasResponsibleAi: true,
    };
  }

  // Condition 4: if additional PETs then Early Adopter
  if (hasAdditionalPets) {
    return {
      category: 'Early Adopter',
      multiplier: 1.5,
      reason: 'Additional PETs portfolio included',
      ruleExplanation: 'Additional PETs Included ➔ Early Adopter (1.5× Multiplier)',
      privacyGrcCount,
      privacyGrcTotal,
      privacyGrcPercent,
      hasCbac,
      hasAdditionalPets: true,
      hasResponsibleAi: false,
    };
  }

  // Condition 3: if full PrivacyGRC & CBAC from PETs then Early Majority
  if (privacyGrcCount === privacyGrcTotal && hasCbac) {
    return {
      category: 'Early Majority',
      multiplier: 1.0,
      reason: 'Full PrivacyGRC & CBAC from PETs',
      ruleExplanation: 'Full PrivacyGRC (100%) & CBAC from PETs ➔ Early Majority (1.0× Multiplier)',
      privacyGrcCount,
      privacyGrcTotal,
      privacyGrcPercent: 100,
      hasCbac: true,
      hasAdditionalPets: false,
      hasResponsibleAi: false,
    };
  }

  // Condition 2: If partial PrivacyGRC Products (>50%) then late majority
  if (privacyGrcPercent >= 50) {
    return {
      category: 'Late Majority',
      multiplier: 0.5,
      reason: `Partial PrivacyGRC Products (${privacyGrcPercent}%)`,
      ruleExplanation: `Partial PrivacyGRC Products (≥50%) ➔ Late Majority (0.5× Multiplier)`,
      privacyGrcCount,
      privacyGrcTotal,
      privacyGrcPercent,
      hasCbac,
      hasAdditionalPets: false,
      hasResponsibleAi: false,
    };
  }

  // Condition 1: If partial PrivacyGRC Products (<50%) then laggard
  return {
    category: 'Laggard',
    multiplier: 0.01,
    reason: `Partial PrivacyGRC Products (${privacyGrcPercent}% < 50%)`,
    ruleExplanation: `Partial PrivacyGRC Products (<50%) ➔ Laggard (0.01× Multiplier)`,
    privacyGrcCount,
    privacyGrcTotal,
    privacyGrcPercent,
    hasCbac,
    hasAdditionalPets: false,
    hasResponsibleAi: false,
  };
}

/**
 * Weighted Deal Value = Deal Value * Winning Stance Factor
 */
export function calculateWeightedDealValue(
  dealValue: number,
  stance: WinningStance
): number {
  return Math.round(dealValue * getWinningStanceFactor(stance));
}

/**
 * Account Value = Deal Value * Winning Stance Factor * Adoption Multiplier
 */
export function calculateAccountValue(
  dealValue: number,
  stance: WinningStance,
  category: AdoptionCategory
): number {
  const stanceFactor = getWinningStanceFactor(stance);
  const adoptionMultiplier = getAdoptionMultiplier(category);
  return Math.round(dealValue * stanceFactor * adoptionMultiplier);
}

/**
 * Convert value to INR based on exchange rates
 */
export function convertToINR(
  amount: number,
  currency: Currency,
  rates: ExchangeRates
): number {
  if (currency === 'INR') return amount;
  const rate = rates.rates[currency] || 1;
  return Math.round(amount * rate);
}

/**
 * Task SLA calculation:
 * - Pending if within TCT
 * - Completed if finished on or before TCT (Green)
 * - Completed Late if finished after TCT (Amber/Yellow)
 * - Overdue if unfinished past TCT (Red)
 */
export function deriveTaskStatus(tct: string, completedAt?: string): TaskStatus {
  const targetDate = new Date(tct).getTime();
  const now = new Date().getTime();

  if (completedAt) {
    const compDate = new Date(completedAt).getTime();
    return compDate <= targetDate ? 'Completed' : 'Completed Late';
  }

  if (now > targetDate) {
    return 'Overdue';
  }

  return 'Pending';
}

/**
 * Deterministic 70% TCT urgency + 30% Account Priority algorithm for Focus Area
 */
export function calculateTask7030Score(task: Task, account?: Account): number {
  if (task.completedAt) return 0; // completed tasks drop down

  const now = new Date().getTime();
  const targetTime = new Date(task.tct).getTime();
  const diffHours = (targetTime - now) / (1000 * 60 * 60);

  // 1. TCT Urgency Score (0 - 100)
  let tctUrgencyScore = 50;
  if (diffHours < 0) {
    // Overdue: max urgency based on how overdue
    const overdueDays = Math.abs(diffHours) / 24;
    tctUrgencyScore = Math.min(100, 90 + overdueDays * 2);
  } else if (diffHours <= 24) {
    // Due today
    tctUrgencyScore = 85;
  } else if (diffHours <= 72) {
    // Due within 3 days
    tctUrgencyScore = 75;
  } else if (diffHours <= 168) {
    // Due within 7 days
    tctUrgencyScore = 60;
  } else {
    // Due later
    tctUrgencyScore = Math.max(10, 50 - (diffHours - 168) / 24);
  }

  // 2. Account Priority Score (0 - 100)
  let accountPriorityScore = 50;
  if (account) {
    switch (account.stage) {
      case 'Critical':
        accountPriorityScore = 100;
        break;
      case 'Mature':
        accountPriorityScore = 80;
        break;
      case 'Nurturing':
        accountPriorityScore = 60;
        break;
      case 'New Account':
        accountPriorityScore = 40;
        break;
      case 'Closed Won':
      case 'Closed Lost':
        accountPriorityScore = 10;
        break;
    }

    if (account.isStale) {
      accountPriorityScore = Math.min(100, accountPriorityScore + 20);
    }
  }

  // 70% TCT Urgency + 30% Account Priority
  return Math.round(tctUrgencyScore * 0.7 + accountPriorityScore * 0.3);
}

/**
 * Indian & Western locale number and currency formatting
 */
export function formatCurrencyValue(
  amount: number,
  currency: Currency = 'INR',
  geography?: string
): string {
  const isIndian =
    currency === 'INR' || (geography && geography.toLowerCase().includes('india'));

  if (isIndian) {
    // Indian grouping: ₹ 1,23,45,678
    const symbol = currency === 'INR' ? '₹' : currency + ' ';
    const formatted = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(amount);
    return `${symbol} ${formatted}`;
  }

  // Western grouping
  const symbolMap: Record<Currency, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    SGD: 'S$',
    INR: '₹',
  };
  const symbol = symbolMap[currency] || currency;
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${symbol} ${formatted}`;
}
