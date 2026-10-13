import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  INITIAL_ACCOUNTS,
  INITIAL_COLLATERAL,
  INITIAL_CONTACTS,
  INITIAL_DEMOS,
  INITIAL_EXCHANGE_RATES,
  INITIAL_PARTNER_SWOT,
  INITIAL_TASKS,
  INITIAL_USERS,
} from '../data/seedData';
import {
  Account,
  AccountStage,
  AccountDocument,
  AuditEntry,
  Collateral,
  Contact,
  Demo,
  ExchangeRates,
  FilterState,
  PartnerSWOT,
  Task,
  TaskComment,
  TaskDocument,
  TaskStatus,
  InteractionTag,
  User,
  UserRole,
} from '../types/crm';
import {
  calculateAccountValue,
  calculateDealValue,
  calculateWeightedDealValue,
  convertToINR,
  deriveTaskStatus,
  deriveAdoptionCategory,
} from '../utils/calculations';

interface CrmContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  users: User[];
  onBehalfOfUser: User | null;
  setOnBehalfOfUser: (user: User | null) => void;

  // Data collections
  accounts: Account[];
  contacts: Contact[];
  tasks: Task[];
  demos: Demo[];
  collaterals: Collateral[];
  partnerSwotList: PartnerSWOT[];
  exchangeRates: ExchangeRates;

  // Filter state
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;

  // Derived / Scoped collections based on role & filters
  filteredAccounts: Account[];
  scopedAccounts: Account[]; // Pre-filter role-scoped

  // Aggregated Pipeline Metrics
  pipelineMetrics: {
    totalAccounts: number;
    totalWeightedDealValueINR: number;
    totalAccountValueINR: number;
    stageCounts: Record<AccountStage, number>;
    stageValuesINR: Record<AccountStage, number>;
  };

  // Actions
  addAccount: (account: Omit<Account, 'id' | 'fieldAuditTrail' | 'dateAdded' | 'lastActivityDate' | 'isStale' | 'aiEnrichedFields' | 'profileCompletion'>) => { success: boolean; duplicate?: Account; newAccount?: Account };
  updateAccount: (account: Account, changedField?: string, oldValue?: string, newValue?: string, effectiveDate?: string) => void;
  deleteAccount: (id: string) => void;
  enrichAccountWithAi: (accountId: string) => void;
  completeProfileField: (accountId: string, field: string, value: any) => void;

  // Contact actions
  addContact: (contact: Omit<Contact, 'id' | 'unmaskHistory'>) => void;
  updateContact: (contact: Contact) => void;
  unmaskContact: (contactId: string, purpose: string) => boolean;

  // Task actions
  addTask: (
    task: Omit<Task, 'id' | 'status' | 'comments' | 'documents'> & {
      comments?: TaskComment[];
      documents?: TaskDocument[];
    }
  ) => void;
  updateTask: (task: Task) => void;
  completeTask: (taskId: string) => void;
  addCommentToTask: (taskId: string, commentText: string, interactionTag?: InteractionTag) => void;
  createRfpSubtasks: (accountId: string) => void;
  addDocumentToTask: (taskId: string, document: TaskDocument) => void;

  // Account document actions
  addDocumentToAccount: (accountId: string, document: AccountDocument) => void;
  removeDocumentFromAccount: (accountId: string, documentId: string) => void;

  // Demo actions
  addDemo: (demo: Omit<Demo, 'id' | 'timeline'>) => void;
  updateDemo: (demo: Demo) => void;

  // Exchange rate action
  updateExchangeRate: (currency: 'USD' | 'EUR' | 'GBP' | 'SGD', newRate: number) => void;

  // Audit trail
  globalAuditTrail: AuditEntry[];

  // Reset to initial seed
  resetToSeedData: () => void;

  // Partner view helpers
  isPartnerMode: boolean;
  activePartnerName: string;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export const CrmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Vikram (Sales Owner)
  const [onBehalfOfUser, setOnBehalfOfUser] = useState<User | null>(null);

  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [demos, setDemos] = useState<Demo[]>(INITIAL_DEMOS);
  const [collaterals, setCollaterals] = useState<Collateral[]>(INITIAL_COLLATERAL);
  const [partnerSwotList, setPartnerSwotList] = useState<PartnerSWOT[]>(INITIAL_PARTNER_SWOT);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(INITIAL_EXCHANGE_RATES);

  // Initial Filter defaults to Financial Year to Date (April 1, 2026 to today)
  const defaultFilters: FilterState = {
    geographies: [],
    sectors: [],
    productFamily: undefined,
    products: [],
    partners: [],
    salesOwners: [],
    preSalesOwners: [],
    solutionEngineers: [],
    procurementTypes: [],
    startDate: '2026-04-01',
    endDate: '2026-10-31',
  };

  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const switchRole = (role: UserRole) => {
    const targetUser = users.find((u) => u.role === role) || users[0];
    setCurrentUser(targetUser);
    if (role === 'SalesOps') {
      setOnBehalfOfUser(users.find((u) => u.role === 'Sales Owner') || null);
    } else {
      setOnBehalfOfUser(null);
    }
  };

  const isPartnerMode = currentUser.role === 'Partner';
  const activePartnerName = currentUser.partnerOrganization || 'Wipro Technologies';

  // Role Scoping:
  // - Sales Owner: default assigned accounts
  // - Pre-Sales Owner: default assigned accounts
  // - Solution Engineer: default assigned accounts
  // - Leader / SalesOps / Admin: total view
  // - Partner: strictly accounts tagged with their partner org, with other partners sanitized
  const scopedAccounts = useMemo(() => {
    if (isPartnerMode) {
      return accounts
        .filter((acc) => acc.partners.includes(activePartnerName))
        .map((acc) => ({
          ...acc,
          // Sanitization requirement: Partner must NOT see other partner tags
          partners: [activePartnerName],
        }));
    }

    if (currentUser.role === 'Sales Owner') {
      return accounts.filter((acc) => acc.owners.sales === currentUser.name);
    }

    if (currentUser.role === 'Pre-Sales Owner') {
      return accounts.filter((acc) => acc.owners.preSales === currentUser.name);
    }

    if (currentUser.role === 'Solution Engineer') {
      return accounts.filter((acc) => acc.owners.solutionEngineer === currentUser.name);
    }

    // Leader, SalesOps, Administrator have total visibility
    return accounts;
  }, [accounts, currentUser, isPartnerMode, activePartnerName]);

  // Apply filters on top of role-scoped accounts
  const filteredAccounts = useMemo(() => {
    return scopedAccounts.filter((acc) => {
      if (filters.geographies.length > 0 && !filters.geographies.includes(acc.geography)) {
        return false;
      }
      if (filters.sectors.length > 0 && !filters.sectors.includes(acc.sector)) {
        return false;
      }
      if (filters.productFamily && acc.productFamily !== filters.productFamily) {
        return false;
      }
      if (filters.products.length > 0 && !filters.products.includes(acc.product)) {
        return false;
      }
      if (filters.partners.length > 0 && !acc.partners.some((p) => filters.partners.includes(p))) {
        return false;
      }
      if (filters.salesOwners.length > 0 && !filters.salesOwners.includes(acc.owners.sales)) {
        return false;
      }
      if (filters.preSalesOwners.length > 0 && !filters.preSalesOwners.includes(acc.owners.preSales)) {
        return false;
      }
      if (filters.solutionEngineers.length > 0 && !filters.solutionEngineers.includes(acc.owners.solutionEngineer)) {
        return false;
      }
      if (filters.publicPrivate && acc.publicPrivate !== filters.publicPrivate) {
        return false;
      }
      if (filters.procurementTypes.length > 0 && !filters.procurementTypes.includes(acc.procurementType)) {
        return false;
      }
      if (filters.startDate && acc.dateAdded < filters.startDate) {
        return false;
      }
      if (filters.endDate && acc.dateAdded > filters.endDate) {
        return false;
      }
      return true;
    });
  }, [scopedAccounts, filters]);

  // Pipeline metrics calculation (consistent across details, Kanban, dashboard)
  const pipelineMetrics = useMemo(() => {
    const stageCounts: Record<AccountStage, number> = {
      'New Account': 0,
      'Nurturing': 0,
      'Mature': 0,
      'Critical': 0,
      'Closed Won': 0,
      'Closed Lost': 0,
    };

    const stageValuesINR: Record<AccountStage, number> = {
      'New Account': 0,
      'Nurturing': 0,
      'Mature': 0,
      'Critical': 0,
      'Closed Won': 0,
      'Closed Lost': 0,
    };

    let totalWeightedDealValueINR = 0;
    let totalAccountValueINR = 0;

    filteredAccounts.forEach((acc) => {
      stageCounts[acc.stage] += 1;

      const dealVal = calculateDealValue(acc.annualRevenue, acc.dealValueOverride);
      const weightedDealVal = calculateWeightedDealValue(dealVal, acc.winningStance);
      const accVal = calculateAccountValue(dealVal, acc.winningStance, acc.adoptionCategory);

      const weightedINR = convertToINR(weightedDealVal, acc.revenueCurrency, exchangeRates);
      const accINR = convertToINR(accVal, acc.revenueCurrency, exchangeRates);

      stageValuesINR[acc.stage] += accINR;

      // Pipeline total weighted opportunity value includes live and won stages
      if (acc.stage !== 'Closed Lost') {
        totalWeightedDealValueINR += weightedINR;
        totalAccountValueINR += accINR;
      }
    });

    return {
      totalAccounts: filteredAccounts.length,
      totalWeightedDealValueINR,
      totalAccountValueINR,
      stageCounts,
      stageValuesINR,
    };
  }, [filteredAccounts, exchangeRates]);

  // Global audit entries collected from all accounts
  const globalAuditTrail = useMemo(() => {
    const list: AuditEntry[] = [];
    accounts.forEach((acc) => {
      acc.fieldAuditTrail.forEach((aud) => {
        list.push({ ...aud, field: `${acc.name} › ${aud.field}` });
      });
    });
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [accounts]);

  // Periodic check / sync for task statuses against current local time
  useEffect(() => {
    setTasks((prev) =>
      prev.map((t) => ({
        ...t,
        status: deriveTaskStatus(t.tct, t.completedAt),
      }))
    );
  }, []);

  // Account CRUD
  const addAccount: CrmContextType['addAccount'] = (accountData) => {
    // Duplicate Detection Check
    const normalizedName = accountData.name.trim().toLowerCase();
    const normalizedWebsite = accountData.website.trim().toLowerCase().replace(/^https?:\/\/(www\.)?/, '');

    const existingMatch = accounts.find((a) => {
      const aName = a.name.trim().toLowerCase();
      const aSite = a.website.trim().toLowerCase().replace(/^https?:\/\/(www\.)?/, '');
      return aName === normalizedName || (normalizedWebsite && aSite === normalizedWebsite);
    });

    if (existingMatch) {
      return { success: false, duplicate: existingMatch };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newId = `acc-${Date.now()}`;
    const initials = accountData.name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 3)
      .join('')
      .toUpperCase();

    const accountProducts =
      accountData.products && accountData.products.length > 0
        ? accountData.products
        : accountData.product
        ? [accountData.product]
        : [];
    const derivedAdoption = deriveAdoptionCategory(accountProducts);

    const createdAccount: Account = {
      ...accountData,
      adoptionCategory: derivedAdoption.category,
      products: accountProducts,
      id: newId,
      logoText: initials || 'NEW',
      logoBg: 'bg-indigo-600',
      dateAdded: todayStr,
      lastActivityDate: todayStr,
      isStale: false,
      aiEnrichedFields: {},
      fieldAuditTrail: [
        {
          id: `aud-${Date.now()}`,
          field: 'Account Record Created',
          actor: currentUser.name,
          actingOnBehalfOf: onBehalfOfUser?.name,
          timestamp: new Date().toISOString(),
          effectiveDate: todayStr,
          oldValue: 'None',
          newValue: accountData.name,
          provenance: 'Human-entered',
        },
      ],
      profileCompletion: { human: 60, ai: 0 },
    };

    setAccounts((prev) => [createdAccount, ...prev]);

    // If RFP procurement type, automatically create RFP subtasks
    if (accountData.procurementType === 'Open RFP' || accountData.procurementType === 'Closed RFP') {
      createRfpSubtasks(newId);
    }

    return { success: true, newAccount: createdAccount };
  };

  const updateAccount = (
    updated: Account,
    changedField?: string,
    oldValue?: string,
    newValue?: string,
    effectiveDate?: string
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const effDate = effectiveDate || todayStr;
    const isBackDated = effDate < todayStr;

    // Automatic Winning Stance adjustment if moved to Closed Lost
    let finalAccount = { ...updated, lastActivityDate: todayStr };
    if (updated.stage === 'Closed Lost' && updated.winningStance !== 'Lost/Not Started') {
      finalAccount.winningStance = 'Lost/Not Started';
    }

    // Automatically derive Adoption Category from products
    const accountProducts =
      finalAccount.products && finalAccount.products.length > 0
        ? finalAccount.products
        : finalAccount.product
        ? [finalAccount.product]
        : [];
    const derivedAdoption = deriveAdoptionCategory(accountProducts);
    finalAccount.adoptionCategory = derivedAdoption.category;

    if (changedField && oldValue !== undefined && newValue !== undefined) {
      const newAudit: AuditEntry = {
        id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        field: changedField,
        actor: currentUser.name,
        actingOnBehalfOf: onBehalfOfUser?.name,
        timestamp: new Date().toISOString(),
        effectiveDate: effDate,
        oldValue: String(oldValue),
        newValue: String(newValue),
        provenance: 'Human-entered',
        isBackDated,
      };
      finalAccount.fieldAuditTrail = [newAudit, ...finalAccount.fieldAuditTrail];
    }

    setAccounts((prev) => prev.map((a) => (a.id === updated.id ? finalAccount : a)));
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    setContacts((prev) => prev.filter((c) => c.accountId !== id));
    setTasks((prev) => prev.filter((t) => t.accountId !== id));
  };

  // AI-assisted profile enrichment (Deterministic Mock Adapter with purple badges)
  const enrichAccountWithAi = (accountId: string) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id !== accountId) return acc;

        const aiUpdates: Partial<Account> = {
          notes:
            acc.notes ||
            `AI Synthesis: High data governance sensitivity identified for ${acc.name}. Target architecture recommends PrivaSapien Differential Privacy Engine with zero-knowledge cryptographic keys.`,
          aiEnrichedFields: {
            ...acc.aiEnrichedFields,
            notes: true,
            procurementType: true,
            adoptionCategory: true,
          },
          profileCompletion: {
            human: acc.profileCompletion.human,
            ai: Math.min(100 - acc.profileCompletion.human, 35),
          },
        };

        const auditEntry: AuditEntry = {
          id: `aud-${Date.now()}`,
          field: 'AI Enrichment Triggered',
          actor: 'AI Adapter (Simulated)',
          timestamp: new Date().toISOString(),
          effectiveDate: new Date().toISOString().split('T')[0],
          oldValue: 'Unenriched',
          newValue: 'Enriched notes, procurement type, and adoption profile',
          provenance: 'AI-suggested',
        };

        return {
          ...acc,
          ...aiUpdates,
          fieldAuditTrail: [auditEntry, ...acc.fieldAuditTrail],
        };
      })
    );
  };

  const completeProfileField = (accountId: string, field: string, value: any) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id !== accountId) return acc;
        const updatedAiFields = { ...acc.aiEnrichedFields };
        delete updatedAiFields[field]; // Human confirmed, remove AI badge

        const auditEntry: AuditEntry = {
          id: `aud-${Date.now()}`,
          field: `Profile Field Confirmed: ${field}`,
          actor: currentUser.name,
          actingOnBehalfOf: onBehalfOfUser?.name,
          timestamp: new Date().toISOString(),
          effectiveDate: new Date().toISOString().split('T')[0],
          oldValue: String((acc as any)[field] ?? 'Empty'),
          newValue: String(value),
          provenance: 'Human-confirmed',
        };

        return {
          ...acc,
          [field]: value,
          aiEnrichedFields: updatedAiFields,
          profileCompletion: {
            human: Math.min(100, acc.profileCompletion.human + 10),
            ai: Math.max(0, acc.profileCompletion.ai - 5),
          },
          fieldAuditTrail: [auditEntry, ...acc.fieldAuditTrail],
        };
      })
    );
  };

  // Contacts & CBAC Mock
  const addContact: CrmContextType['addContact'] = (contactData) => {
    const newContact: Contact = {
      ...contactData,
      id: `con-${Date.now()}`,
      unmaskHistory: [],
    };
    setContacts((prev) => [newContact, ...prev]);
  };

  const updateContact = (updated: Contact) => {
    setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const unmaskContact = (contactId: string, purpose: string): boolean => {
    if (!purpose || purpose.trim().length < 5) return false;

    setContacts((prev) =>
      prev.map((c) => {
        if (c.id !== contactId) return c;
        const unmaskEntry = {
          id: `unmask-${Date.now()}`,
          actor: currentUser.name,
          purpose: purpose.trim(),
          timestamp: new Date().toISOString(),
        };
        return {
          ...c,
          isMasked: false,
          unmaskHistory: [unmaskEntry, ...c.unmaskHistory],
        };
      })
    );
    return true;
  };

  // Tasks & RFP workflows
  const addTask: CrmContextType['addTask'] = (taskData) => {
    const status = deriveTaskStatus(taskData.tct);
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      status,
      comments: taskData.comments || [],
      documents: taskData.documents || [],
    };
    setTasks((prev) => [newTask, ...prev]);

    // Update account lastActivityDate
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === taskData.accountId
          ? { ...acc, lastActivityDate: new Date().toISOString().split('T')[0], isStale: false }
          : acc
      )
    );
  };

  const addDocumentToTask = (taskId: string, document: TaskDocument) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          documents: [...(t.documents || []), document],
        };
      })
    );
  };

  const addDocumentToAccount = (accountId: string, document: AccountDocument) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id !== accountId) return acc;
        return {
          ...acc,
          documents: [...(acc.documents || []), document],
          lastActivityDate: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  const removeDocumentFromAccount = (accountId: string, documentId: string) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id !== accountId) return acc;
        return {
          ...acc,
          documents: (acc.documents || []).filter((d) => d.id !== documentId),
        };
      })
    );
  };

  const updateTask = (updated: Task) => {
    const status = deriveTaskStatus(updated.tct, updated.completedAt);
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? { ...updated, status } : t)));
  };

  const addCommentToTask = (taskId: string, commentText: string, interactionTag?: InteractionTag) => {
    if (!commentText.trim()) return;
    const newComment = {
      id: `tc-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      author: currentUser.name,
      timestamp: new Date().toISOString(),
      text: commentText.trim(),
      interactionTag,
    };
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const currentTags: InteractionTag[] = Array.from(
          new Set([
            ...(t.interactionTags || []),
            ...(t.interactionTag ? [t.interactionTag] : []),
            ...(interactionTag ? [interactionTag] : []),
          ])
        );
        return {
          ...t,
          interactionTag: currentTags[0] || t.interactionTag,
          interactionTags: currentTags,
          comments: [...(t.comments || []), newComment],
        };
      })
    );
  };

  const completeTask = (taskId: string) => {
    const nowIso = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const status = deriveTaskStatus(t.tct, nowIso);
        return {
          ...t,
          completedAt: nowIso,
          status,
        };
      })
    );
  };

  const createRfpSubtasks = (accountId: string) => {
    const baseDate = new Date();
    const rfpSteps = [
      {
        stage: 'Eligibility Validation & Mandatory Criteria Checklist',
        offsetDays: 3,
        role: 'user-presales-1',
        section: 'Technical Proposal' as const,
      },
      {
        stage: 'Technical Scoring Matrix & Compliance Evaluation',
        offsetDays: 6,
        role: 'user-se-1',
        section: 'Technical Proposal' as const,
      },
      {
        stage: 'Scope of Work (SoW) Response Preparation & Context Matching',
        offsetDays: 9,
        role: 'user-presales-1',
        section: 'Technical Proposal' as const,
      },
      {
        stage: 'Infra & SBOM Architecture Review & Security Attestation',
        offsetDays: 12,
        role: 'user-se-1',
        section: 'Infra & SBOM' as const,
      },
      {
        stage: 'Submission Documents Final Sign-off & Commercial Seal',
        offsetDays: 15,
        role: 'user-sales-1',
        section: 'Commercial Proposal' as const,
      },
    ];

    const newSubtasks: Task[] = rfpSteps.map((step, idx) => {
      const tctDate = new Date(baseDate);
      tctDate.setDate(tctDate.getDate() + step.offsetDays);

      return {
        id: `rfp-task-${Date.now()}-${idx}`,
        accountId,
        relatedSection: step.section,
        description: `[RFP Stage ${idx + 1}] ${step.stage}`,
        creatorId: currentUser.id,
        assigneeId: step.role,
        tct: tctDate.toISOString(),
        status: 'Pending',
        priority: 'High',
        isActivity: false,
        comments: [],
        documents: [],
        rfpSubtask: {
          stage: step.stage,
          stepIndex: idx + 1,
          requiredRole: step.role,
        },
      };
    });

    setTasks((prev) => [...newSubtasks, ...prev]);
  };

  // Demo management
  const addDemo: CrmContextType['addDemo'] = (demoData) => {
    const newDemo: Demo = {
      ...demoData,
      id: `demo-${Date.now()}`,
      timeline: [
        {
          date: new Date().toISOString().split('T')[0],
          note: `Demo created by ${currentUser.name}`,
        },
      ],
    };
    setDemos((prev) => [newDemo, ...prev]);
  };

  const updateDemo = (updated: Demo) => {
    setDemos((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  // Exchange rate config
  const updateExchangeRate = (currency: 'USD' | 'EUR' | 'GBP' | 'SGD', newRate: number) => {
    setExchangeRates((prev) => ({
      ...prev,
      rates: {
        ...prev.rates,
        [currency]: newRate,
      },
      lastUpdated: new Date().toISOString().split('T')[0],
    }));
  };

  // Reset to initial seed
  const resetToSeedData = () => {
    setAccounts(INITIAL_ACCOUNTS);
    setContacts(INITIAL_CONTACTS);
    setTasks(INITIAL_TASKS);
    setDemos(INITIAL_DEMOS);
    setCollaterals(INITIAL_COLLATERAL);
    setPartnerSwotList(INITIAL_PARTNER_SWOT);
    setExchangeRates(INITIAL_EXCHANGE_RATES);
    setFilters(defaultFilters);
  };

  return (
    <CrmContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        users,
        onBehalfOfUser,
        setOnBehalfOfUser,
        accounts,
        contacts,
        tasks,
        demos,
        collaterals,
        partnerSwotList,
        exchangeRates,
        filters,
        setFilters,
        resetFilters,
        filteredAccounts,
        scopedAccounts,
        pipelineMetrics,
        addAccount,
        updateAccount,
        deleteAccount,
        enrichAccountWithAi,
        completeProfileField,
        addContact,
        updateContact,
        unmaskContact,
        addTask,
        updateTask,
        completeTask,
        addCommentToTask,
        addDocumentToTask,
        addDocumentToAccount,
        removeDocumentFromAccount,
        createRfpSubtasks,
        addDemo,
        updateDemo,
        updateExchangeRate,
        globalAuditTrail,
        resetToSeedData,
        isPartnerMode,
        activePartnerName,
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
};
