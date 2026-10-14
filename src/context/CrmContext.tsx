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
  INITIAL_TEAMS,
  INITIAL_ROLES,
  INITIAL_WORKFLOWS,
  INITIAL_FIELD_CONFIGS,
  INITIAL_UPLOAD_HISTORY,
  INITIAL_ADMIN_AUDIT_TRAIL,
} from '../data/adminSeedData';
import {
  UserTeam,
  RoleDefinition,
  RolePermissions,
  WorkflowDefinition,
  WorkflowStep,
  CustomFieldConfig,
  UploadHistoryEntry,
} from '../types/admin';
import {
  Account,
  AccountStage,
  AccountDocument,
  AuditEntry,
  AuditMeta,
  Collateral,
  Contact,
  Demo,
  DemoComment,
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
  addAccount: (
    account: Omit<Account, 'id' | 'fieldAuditTrail' | 'dateAdded' | 'lastActivityDate' | 'isStale' | 'aiEnrichedFields' | 'profileCompletion'>,
    auditMeta?: AuditMeta
  ) => { success: boolean; duplicate?: Account; newAccount?: Account };
  updateAccount: (
    account: Account,
    changedField?: string,
    oldValue?: string,
    newValue?: string,
    effectiveDate?: string,
    auditMeta?: AuditMeta
  ) => void;
  deleteAccount: (id: string) => void;
  enrichAccountWithAi: (accountId: string) => void;
  completeProfileField: (accountId: string, field: string, value: any) => void;

  // Contact actions
  addContact: (
    contact: Omit<Contact, 'id' | 'unmaskHistory' | 'fieldAuditTrail'>,
    auditMeta?: AuditMeta
  ) => void;
  updateContact: (
    contact: Contact,
    changedField?: string,
    oldValue?: string,
    newValue?: string,
    effectiveDate?: string,
    auditMeta?: AuditMeta
  ) => void;
  unmaskContact: (contactId: string, purpose: string) => boolean;

  // Task actions
  addTask: (
    task: Omit<Task, 'id' | 'status' | 'comments' | 'documents' | 'fieldAuditTrail'> & {
      comments?: TaskComment[];
      documents?: TaskDocument[];
      fieldAuditTrail?: AuditEntry[];
      parentTaskId?: string;
    },
    auditMeta?: AuditMeta
  ) => void;
  updateTask: (
    task: Task,
    changedField?: string,
    oldValue?: string,
    newValue?: string,
    effectiveDate?: string,
    auditMeta?: AuditMeta
  ) => void;
  completeTask: (taskId: string, auditMeta?: AuditMeta) => boolean;
  canCompleteTask: (taskId: string) => { canComplete: boolean; incompleteSubTasks: Task[] };
  getSubTasks: (taskId: string) => Task[];
  addCommentToTask: (taskId: string, commentText: string, interactionTag?: InteractionTag) => void;
  createRfpSubtasks: (accountId: string) => void;
  addDocumentToTask: (taskId: string, document: TaskDocument) => void;

  // Account document actions
  addDocumentToAccount: (accountId: string, document: AccountDocument) => void;
  removeDocumentFromAccount: (accountId: string, documentId: string) => void;

  // Demo actions
  addDemo: (demo: Omit<Demo, 'id' | 'timeline'>) => void;
  updateDemo: (demo: Demo) => void;
  addCommentToDemo: (demoId: string, commentText: string) => void;

  // Exchange rate action
  updateExchangeRate: (currency: 'USD' | 'EUR' | 'GBP' | 'SGD', newRate: number) => void;

  // Audit trail
  globalAuditTrail: AuditEntry[];
  adminAuditTrail: AuditEntry[];
  recordAdminAudit: (
    field: string,
    oldValue: string,
    newValue: string,
    effectiveDate?: string,
    auditMeta?: AuditMeta
  ) => void;

  // Reset to initial seed
  resetToSeedData: () => void;

  // Partner view helpers
  isPartnerMode: boolean;
  activePartnerName: string;

  // Users administration
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;

  // Teams administration
  teams: UserTeam[];
  addTeam: (team: Omit<UserTeam, 'id' | 'createdDate'>) => void;
  updateTeam: (team: UserTeam) => void;
  deleteTeam: (teamId: string) => void;

  // Roles administration
  roles: RoleDefinition[];
  addRole: (role: Omit<RoleDefinition, 'id' | 'createdDate' | 'userCount'>) => void;
  updateRole: (role: RoleDefinition) => void;
  deleteRole: (roleId: string) => void;
  updateRolePermissions: (roleId: string, permissions: RolePermissions) => void;

  // Collaterals administration
  addCollateral: (collateral: Omit<Collateral, 'id' | 'updatedDate'>) => void;
  updateCollateral: (collateral: Collateral) => void;
  deleteCollateral: (collateralId: string) => void;

  // Workflows administration
  workflows: WorkflowDefinition[];
  addWorkflow: (wf: Omit<WorkflowDefinition, 'id'>) => void;
  updateWorkflow: (wf: WorkflowDefinition) => void;
  deleteWorkflow: (wfId: string) => void;
  addWorkflowStep: (wfId: string, step: Omit<WorkflowStep, 'id'>) => void;
  deleteWorkflowStep: (wfId: string, stepId: string) => void;

  // Field configurations administration
  customFields: CustomFieldConfig[];
  addCustomField: (field: Omit<CustomFieldConfig, 'id'>) => void;
  updateCustomField: (field: CustomFieldConfig) => void;
  deleteCustomField: (fieldId: string) => void;

  // Partners administration
  addPartner: (partner: Omit<PartnerSWOT, 'id' | 'lastUpdated'>) => void;
  updatePartner: (partner: PartnerSWOT) => void;
  deletePartner: (partnerId: string) => void;

  // Uploads administration
  uploadHistory: UploadHistoryEntry[];
  recordUpload: (entry: Omit<UploadHistoryEntry, 'id' | 'timestamp'>) => void;
  bulkImportAccounts: (importedAccounts: any[]) => number;
  bulkImportContacts: (importedContacts: any[]) => number;
  bulkImportTasks: (importedTasks: any[]) => number;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export const CrmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [teams, setTeams] = useState<UserTeam[]>(INITIAL_TEAMS);
  const [roles, setRoles] = useState<RoleDefinition[]>(INITIAL_ROLES);
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>(INITIAL_WORKFLOWS);
  const [customFields, setCustomFields] = useState<CustomFieldConfig[]>(INITIAL_FIELD_CONFIGS);
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryEntry[]>(INITIAL_UPLOAD_HISTORY);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Vikram (Sales Owner)
  const [onBehalfOfUser, setOnBehalfOfUser] = useState<User | null>(null);

  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [demos, setDemos] = useState<Demo[]>(INITIAL_DEMOS);
  const [collaterals, setCollaterals] = useState<Collateral[]>(INITIAL_COLLATERAL);
  const [partnerSwotList, setPartnerSwotList] = useState<PartnerSWOT[]>(INITIAL_PARTNER_SWOT);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(INITIAL_EXCHANGE_RATES);
  const [adminAuditTrail, setAdminAuditTrail] = useState<AuditEntry[]>(INITIAL_ADMIN_AUDIT_TRAIL);

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

  // Global audit entries collected from all editable items: Accounts, Contacts, Tasks, Admin Controls
  const globalAuditTrail = useMemo(() => {
    const list: AuditEntry[] = [];

    // 1. Accounts audit entries
    accounts.forEach((acc) => {
      (acc.fieldAuditTrail || []).forEach((aud) => {
        list.push({
          ...aud,
          field: `${acc.name} › ${aud.field}`,
          entityType: 'Account',
          entityId: acc.id,
          entityName: acc.name,
        });
      });
    });

    // 2. Contacts audit entries
    contacts.forEach((c) => {
      const acc = accounts.find((a) => a.id === c.accountId);
      const accName = acc?.name || 'Unassigned';
      const cName = `${c.firstName} ${c.lastName}`.trim();
      (c.fieldAuditTrail || []).forEach((aud) => {
        list.push({
          ...aud,
          field: `${cName} (${accName}) › ${aud.field}`,
          entityType: 'Contact',
          entityId: c.id,
          entityName: cName,
        });
      });
    });

    // 3. Tasks audit entries
    tasks.forEach((t) => {
      const acc = accounts.find((a) => a.id === t.accountId);
      const accName = acc?.name || 'Workspace';
      const descBrief = t.description ? (t.description.length > 36 ? t.description.slice(0, 36) + '...' : t.description) : 'Task';
      (t.fieldAuditTrail || []).forEach((aud) => {
        list.push({
          ...aud,
          field: `${descBrief} (${accName}) › ${aud.field}`,
          entityType: 'Task',
          entityId: t.id,
          entityName: descBrief,
        });
      });
    });

    // 4. Admin controls audit entries
    (adminAuditTrail || []).forEach((aud) => {
      list.push({
        ...aud,
        field: `Admin Control › ${aud.field}`,
        entityType: 'Admin',
        entityId: aud.id,
        entityName: 'Admin Setting',
      });
    });

    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [accounts, contacts, tasks, adminAuditTrail]);

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
  const addAccount: CrmContextType['addAccount'] = (accountData, auditMeta) => {
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
          actor: auditMeta?.actor || currentUser.name,
          actingOnBehalfOf:
            auditMeta?.actingOnBehalfOf !== undefined
              ? auditMeta.actingOnBehalfOf
              : onBehalfOfUser?.name,
          timestamp: new Date().toISOString(),
          effectiveDate: auditMeta?.effectiveDate || todayStr,
          oldValue: 'None',
          newValue: accountData.name,
          provenance: auditMeta?.provenance || 'Human-entered',
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

  const updateAccount: CrmContextType['updateAccount'] = (
    updated: Account,
    changedField?: string,
    oldValue?: string,
    newValue?: string,
    effectiveDate?: string,
    auditMeta?: AuditMeta
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const effDate = auditMeta?.effectiveDate || effectiveDate || todayStr;
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
      const actor = auditMeta?.actor || currentUser.name;
      const actingOnBehalfOf =
        auditMeta?.actingOnBehalfOf !== undefined
          ? auditMeta.actingOnBehalfOf
          : onBehalfOfUser?.name;

      const newAudit: AuditEntry = {
        id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        field: changedField,
        actor,
        actingOnBehalfOf,
        timestamp: new Date().toISOString(),
        effectiveDate: effDate,
        oldValue: String(oldValue),
        newValue: String(newValue),
        provenance: auditMeta?.provenance || 'Human-entered',
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

  // Contacts & CBAC
  const addContact: CrmContextType['addContact'] = (contactData, auditMeta) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const effDate = auditMeta?.effectiveDate || todayStr;
    const isBackDated = effDate < todayStr;
    const actor = auditMeta?.actor || currentUser.name;
    const actingOnBehalfOf = auditMeta?.actingOnBehalfOf || onBehalfOfUser?.name;
    const provenance = auditMeta?.provenance || (onBehalfOfUser ? 'Human-confirmed' : 'Human-entered');

    const creationAudit: AuditEntry = {
      id: `aud-con-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      field: 'Contact Created',
      actor,
      actingOnBehalfOf,
      timestamp: new Date().toISOString(),
      effectiveDate: effDate,
      oldValue: 'None',
      newValue: `${contactData.firstName} ${contactData.lastName} (${contactData.designation})`,
      provenance,
      isBackDated,
      entityType: 'Contact',
    };

    const newContact: Contact = {
      ...contactData,
      id: `con-${Date.now()}`,
      unmaskHistory: [],
      fieldAuditTrail: [creationAudit],
    };
    setContacts((prev) => [newContact, ...prev]);
  };

  const updateContact: CrmContextType['updateContact'] = (
    updated: Contact,
    changedField?: string,
    oldValue?: string,
    newValue?: string,
    effectiveDate?: string,
    auditMeta?: AuditMeta
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const effDate = effectiveDate || auditMeta?.effectiveDate || todayStr;
    const isBackDated = effDate < todayStr;
    const actor = auditMeta?.actor || currentUser.name;
    const actingOnBehalfOf = auditMeta?.actingOnBehalfOf || onBehalfOfUser?.name;
    const provenance = auditMeta?.provenance || (onBehalfOfUser ? 'Human-confirmed' : 'Human-entered');

    setContacts((prev) =>
      prev.map((c) => {
        if (c.id !== updated.id) return c;

        const newAuditEntries: AuditEntry[] = [];

        if (changedField && oldValue !== undefined && newValue !== undefined) {
          newAuditEntries.push({
            id: `aud-con-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            field: changedField,
            actor,
            actingOnBehalfOf,
            timestamp: new Date().toISOString(),
            effectiveDate: effDate,
            oldValue: String(oldValue),
            newValue: String(newValue),
            provenance,
            isBackDated,
            entityType: 'Contact',
          });
        } else {
          // Auto-detect diffs
          if (c.firstName !== updated.firstName || c.lastName !== updated.lastName) {
            newAuditEntries.push({
              id: `aud-con-${Date.now()}-name`,
              field: 'Full Name',
              actor,
              actingOnBehalfOf,
              timestamp: new Date().toISOString(),
              effectiveDate: effDate,
              oldValue: `${c.firstName} ${c.lastName}`.trim(),
              newValue: `${updated.firstName} ${updated.lastName}`.trim(),
              provenance,
              isBackDated,
              entityType: 'Contact',
            });
          }
          if (c.designation !== updated.designation) {
            newAuditEntries.push({
              id: `aud-con-${Date.now()}-desig`,
              field: 'Designation',
              actor,
              actingOnBehalfOf,
              timestamp: new Date().toISOString(),
              effectiveDate: effDate,
              oldValue: c.designation || 'None',
              newValue: updated.designation || 'None',
              provenance,
              isBackDated,
              entityType: 'Contact',
            });
          }
          if (c.email !== updated.email) {
            newAuditEntries.push({
              id: `aud-con-${Date.now()}-email`,
              field: 'Email Address',
              actor,
              actingOnBehalfOf,
              timestamp: new Date().toISOString(),
              effectiveDate: effDate,
              oldValue: c.email || 'None',
              newValue: updated.email || 'None',
              provenance,
              isBackDated,
              entityType: 'Contact',
            });
          }
          if (c.phone1 !== updated.phone1) {
            newAuditEntries.push({
              id: `aud-con-${Date.now()}-phone`,
              field: 'Primary Phone',
              actor,
              actingOnBehalfOf,
              timestamp: new Date().toISOString(),
              effectiveDate: effDate,
              oldValue: c.phone1 || 'None',
              newValue: updated.phone1 || 'None',
              provenance,
              isBackDated,
              entityType: 'Contact',
            });
          }
          if (c.consentState !== updated.consentState) {
            newAuditEntries.push({
              id: `aud-con-${Date.now()}-consent`,
              field: 'Consent State',
              actor,
              actingOnBehalfOf,
              timestamp: new Date().toISOString(),
              effectiveDate: effDate,
              oldValue: c.consentState,
              newValue: updated.consentState,
              provenance,
              isBackDated,
              entityType: 'Contact',
            });
          }
          if (c.source !== updated.source) {
            newAuditEntries.push({
              id: `aud-con-${Date.now()}-source`,
              field: 'Acquisition Source',
              actor,
              actingOnBehalfOf,
              timestamp: new Date().toISOString(),
              effectiveDate: effDate,
              oldValue: c.source,
              newValue: updated.source,
              provenance,
              isBackDated,
              entityType: 'Contact',
            });
          }
          if (c.accountId !== updated.accountId) {
            const oldAcc = accounts.find((a) => a.id === c.accountId)?.name || c.accountId;
            const newAcc = accounts.find((a) => a.id === updated.accountId)?.name || updated.accountId;
            newAuditEntries.push({
              id: `aud-con-${Date.now()}-acc`,
              field: 'Associated Account',
              actor,
              actingOnBehalfOf,
              timestamp: new Date().toISOString(),
              effectiveDate: effDate,
              oldValue: oldAcc,
              newValue: newAcc,
              provenance,
              isBackDated,
              entityType: 'Contact',
            });
          }
          if (JSON.stringify(c.tags || []) !== JSON.stringify(updated.tags || [])) {
            newAuditEntries.push({
              id: `aud-con-${Date.now()}-tags`,
              field: 'Stakeholder Role Tags',
              actor,
              actingOnBehalfOf,
              timestamp: new Date().toISOString(),
              effectiveDate: effDate,
              oldValue: (c.tags || []).join(', ') || 'None',
              newValue: (updated.tags || []).join(', ') || 'None',
              provenance,
              isBackDated,
              entityType: 'Contact',
            });
          }
        }

        const existingAudit = c.fieldAuditTrail || [];
        return {
          ...updated,
          fieldAuditTrail: [...newAuditEntries, ...existingAudit],
        };
      })
    );
  };

  const unmaskContact = (contactId: string, purpose: string): boolean => {
    if (!purpose || purpose.trim().length < 5) return false;

    setContacts((prev) =>
      prev.map((c) => {
        if (c.id !== contactId) return c;
        const nowIso = new Date().toISOString();
        const unmaskEntry = {
          id: `unmask-${Date.now()}`,
          actor: currentUser.name,
          purpose: purpose.trim(),
          timestamp: nowIso,
        };
        const unmaskAudit: AuditEntry = {
          id: `aud-con-unmask-${Date.now()}`,
          field: 'PII Unmasked',
          actor: currentUser.name,
          actingOnBehalfOf: onBehalfOfUser?.name,
          timestamp: nowIso,
          effectiveDate: nowIso.split('T')[0],
          oldValue: 'Masked',
          newValue: `Unmasked with Purpose: ${purpose.trim()}`,
          provenance: 'Human-confirmed',
          entityType: 'Contact',
        };
        return {
          ...c,
          isMasked: false,
          unmaskHistory: [unmaskEntry, ...c.unmaskHistory],
          fieldAuditTrail: [unmaskAudit, ...(c.fieldAuditTrail || [])],
        };
      })
    );
    return true;
  };

  // Tasks & RFP workflows
  const addTask: CrmContextType['addTask'] = (taskData, auditMeta) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const effDate = auditMeta?.effectiveDate || todayStr;
    const isBackDated = effDate < todayStr;
    const actor = auditMeta?.actor || currentUser.name;
    const actingOnBehalfOf = auditMeta?.actingOnBehalfOf || onBehalfOfUser?.name;
    const provenance = auditMeta?.provenance || (onBehalfOfUser ? 'Human-confirmed' : 'Human-entered');

    const status = deriveTaskStatus(taskData.tct);

    const creationAudit: AuditEntry = {
      id: `aud-tsk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      field: 'Task Created',
      actor,
      actingOnBehalfOf,
      timestamp: new Date().toISOString(),
      effectiveDate: effDate,
      oldValue: 'None',
      newValue: `[Priority: ${taskData.priority}] ${taskData.description.slice(0, 40)}`,
      provenance,
      isBackDated,
      entityType: 'Task',
    };

    const newTask: Task = {
      ...taskData,
      name:
        taskData.name?.trim() ||
        (taskData.description.length > 50
          ? taskData.description.slice(0, 50).trim() + '...'
          : taskData.description),
      id: `task-${Date.now()}`,
      status,
      comments: taskData.comments || [],
      documents: taskData.documents || [],
      fieldAuditTrail: [creationAudit],
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

  const updateTask: CrmContextType['updateTask'] = (
    updated: Task,
    changedField?: string,
    oldValue?: string,
    newValue?: string,
    effectiveDate?: string,
    auditMeta?: AuditMeta
  ) => {
    const status = deriveTaskStatus(updated.tct, updated.completedAt);
    const todayStr = new Date().toISOString().split('T')[0];
    const effDate = effectiveDate || auditMeta?.effectiveDate || todayStr;
    const isBackDated = effDate < todayStr;
    const actor = auditMeta?.actor || currentUser.name;
    const actingOnBehalfOf = auditMeta?.actingOnBehalfOf || onBehalfOfUser?.name;
    const provenance = auditMeta?.provenance || (onBehalfOfUser ? 'Human-confirmed' : 'Human-entered');

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== updated.id) return t;

        const newAuditEntries: AuditEntry[] = [];

        if (changedField && oldValue !== undefined && newValue !== undefined) {
          newAuditEntries.push({
            id: `aud-tsk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            field: changedField,
            actor,
            actingOnBehalfOf,
            timestamp: new Date().toISOString(),
            effectiveDate: effDate,
            oldValue: String(oldValue),
            newValue: String(newValue),
            provenance,
            isBackDated,
            entityType: 'Task',
          });
        } else {
          // Auto-detect diffs
          if (t.priority !== updated.priority) {
            newAuditEntries.push({
              id: `aud-tsk-${Date.now()}-pri`,
              field: 'Priority Level',
              actor,
              actingOnBehalfOf,
              timestamp: new Date().toISOString(),
              effectiveDate: effDate,
              oldValue: t.priority,
              newValue: updated.priority,
              provenance,
              isBackDated,
              entityType: 'Task',
            });
          }
          if (t.tct !== updated.tct) {
            newAuditEntries.push({
              id: `aud-tsk-${Date.now()}-tct`,
              field: 'Target Completion Time (TCT)',
              actor,
              actingOnBehalfOf,
              timestamp: new Date().toISOString(),
              effectiveDate: effDate,
              oldValue: t.tct ? new Date(t.tct).toLocaleDateString() : 'Unset',
              newValue: updated.tct ? new Date(updated.tct).toLocaleDateString() : 'Unset',
              provenance,
              isBackDated,
              entityType: 'Task',
            });
          }
          if (t.description !== updated.description) {
            newAuditEntries.push({
              id: `aud-tsk-${Date.now()}-desc`,
              field: 'Task Description',
              actor,
              actingOnBehalfOf,
              timestamp: new Date().toISOString(),
              effectiveDate: effDate,
              oldValue: t.description.slice(0, 36) + '...',
              newValue: updated.description.slice(0, 36) + '...',
              provenance,
              isBackDated,
              entityType: 'Task',
            });
          }
          if (t.status !== status) {
            newAuditEntries.push({
              id: `aud-tsk-${Date.now()}-status`,
              field: 'Task Status',
              actor,
              actingOnBehalfOf,
              timestamp: new Date().toISOString(),
              effectiveDate: effDate,
              oldValue: t.status,
              newValue: status,
              provenance,
              isBackDated,
              entityType: 'Task',
            });
          }
          if (JSON.stringify(t.partnerTags || []) !== JSON.stringify(updated.partnerTags || [])) {
            newAuditEntries.push({
              id: `aud-tsk-${Date.now()}-partners`,
              field: 'Tagged SI Partners',
              actor,
              actingOnBehalfOf,
              timestamp: new Date().toISOString(),
              effectiveDate: effDate,
              oldValue: (t.partnerTags || []).join(', ') || 'None',
              newValue: (updated.partnerTags || []).join(', ') || 'None',
              provenance,
              isBackDated,
              entityType: 'Task',
            });
          }
          if (t.relatedSection !== updated.relatedSection) {
            newAuditEntries.push({
              id: `aud-tsk-${Date.now()}-sec`,
              field: 'Related Section',
              actor,
              actingOnBehalfOf,
              timestamp: new Date().toISOString(),
              effectiveDate: effDate,
              oldValue: t.relatedSection || 'None',
              newValue: updated.relatedSection || 'None',
              provenance,
              isBackDated,
              entityType: 'Task',
            });
          }
        }

        const existingAudit = t.fieldAuditTrail || [];
        return {
          ...updated,
          status,
          fieldAuditTrail: [...newAuditEntries, ...existingAudit],
        };
      })
    );
  };

  const getSubTasks = (taskId: string): Task[] => {
    return tasks.filter((t) => t.parentTaskId === taskId);
  };

  const canCompleteTask = (taskId: string): { canComplete: boolean; incompleteSubTasks: Task[] } => {
    const subTasks = tasks.filter((t) => t.parentTaskId === taskId);
    const incompleteSubTasks = subTasks.filter(
      (t) => !t.completedAt && t.status !== 'Completed' && t.status !== 'Completed Late'
    );
    return {
      canComplete: incompleteSubTasks.length === 0,
      incompleteSubTasks,
    };
  };

  const completeTask: CrmContextType['completeTask'] = (taskId, auditMeta) => {
    // Validation: Task with incomplete sub-task cannot be completed
    const check = canCompleteTask(taskId);
    if (!check.canComplete) {
      return false;
    }

    const nowIso = new Date().toISOString();
    const actor = auditMeta?.actor || currentUser.name;
    const actingOnBehalfOf = auditMeta?.actingOnBehalfOf || onBehalfOfUser?.name;
    const todayStr = nowIso.split('T')[0];

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const status = deriveTaskStatus(t.tct, nowIso);
        const auditEntry: AuditEntry = {
          id: `aud-tsk-comp-${Date.now()}`,
          field: 'Task Status',
          actor,
          actingOnBehalfOf,
          timestamp: nowIso,
          effectiveDate: todayStr,
          oldValue: t.status,
          newValue: status,
          provenance: 'Human-confirmed',
          entityType: 'Task',
        };
        return {
          ...t,
          completedAt: nowIso,
          status,
          fieldAuditTrail: [auditEntry, ...(t.fieldAuditTrail || [])],
        };
      })
    );
    return true;
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

  const addCommentToDemo: CrmContextType['addCommentToDemo'] = (demoId, commentText) => {
    if (!commentText.trim()) return;
    const newComment: DemoComment = {
      id: `dcom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      author: currentUser.name,
      timestamp: new Date().toISOString(),
      text: commentText.trim(),
    };
    setDemos((prev) =>
      prev.map((d) => {
        if (d.id !== demoId) return d;
        const currentComments = d.comments || [];
        return {
          ...d,
          comments: [...currentComments, newComment],
          timeline: [
            ...d.timeline,
            {
              date: new Date().toISOString().split('T')[0],
              note: `Comment added by ${currentUser.name}`,
            },
          ],
        };
      })
    );
  };

  // Admin Audit Recording
  const recordAdminAudit = (
    field: string,
    oldValue: string,
    newValue: string,
    effectiveDate?: string,
    auditMeta?: AuditMeta
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const effDate = effectiveDate || auditMeta?.effectiveDate || todayStr;
    const isBackDated = effDate < todayStr;
    const actor = auditMeta?.actor || currentUser.name;
    const actingOnBehalfOf = auditMeta?.actingOnBehalfOf || onBehalfOfUser?.name;
    const provenance = auditMeta?.provenance || (onBehalfOfUser ? 'Human-confirmed' : 'Human-entered');

    const newAudit: AuditEntry = {
      id: `adm-aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      field,
      actor,
      actingOnBehalfOf,
      timestamp: new Date().toISOString(),
      effectiveDate: effDate,
      oldValue: String(oldValue ?? ''),
      newValue: String(newValue ?? ''),
      provenance,
      isBackDated,
      entityType: 'Admin',
    };

    setAdminAuditTrail((prev) => [newAudit, ...prev]);
  };

  // Exchange rate config
  const updateExchangeRate = (currency: 'USD' | 'EUR' | 'GBP' | 'SGD', newRate: number) => {
    const prevRate = exchangeRates.rates[currency];
    setExchangeRates((prev) => ({
      ...prev,
      rates: {
        ...prev.rates,
        [currency]: newRate,
      },
      lastUpdated: new Date().toISOString().split('T')[0],
    }));
    recordAdminAudit(
      `Exchange Rate (${currency})`,
      `₹${prevRate}`,
      `₹${newRate}`
    );
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
    setTeams(INITIAL_TEAMS);
    setRoles(INITIAL_ROLES);
    setWorkflows(INITIAL_WORKFLOWS);
    setCustomFields(INITIAL_FIELD_CONFIGS);
    setUploadHistory(INITIAL_UPLOAD_HISTORY);
    setAdminAuditTrail(INITIAL_ADMIN_AUDIT_TRAIL);
    setFilters(defaultFilters);
    recordAdminAudit('Workspace Database Reset', 'Current State', 'Benchmark Seed Data Baseline');
  };

  // User Actions
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    };
    setUsers((prev) => [...prev, newUser]);
    recordAdminAudit('User Directory › New User Added', 'None', `${userData.name} (${userData.role}, ${userData.team})`);
  };

  const updateUser = (updatedUser: User) => {
    const prevUser = users.find((u) => u.id === updatedUser.id);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    recordAdminAudit(
      `User Profile Updated › ${updatedUser.name}`,
      prevUser ? `${prevUser.role} | ${prevUser.team}` : 'Previous Profile',
      `${updatedUser.role} | ${updatedUser.team}`
    );
  };

  const deleteUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    recordAdminAudit('User Deleted', user?.name || userId, 'Deactivated / Removed');
  };

  // Team Actions
  const addTeam = (teamData: Omit<UserTeam, 'id' | 'createdDate'>) => {
    const newTeam: UserTeam = {
      ...teamData,
      id: `team-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setTeams((prev) => [...prev, newTeam]);
    recordAdminAudit('Team Created', 'None', `${teamData.name} (${teamData.department})`);
  };

  const updateTeam = (updatedTeam: UserTeam) => {
    const prevTeam = teams.find((t) => t.id === updatedTeam.id);
    setTeams((prev) => prev.map((t) => (t.id === updatedTeam.id ? updatedTeam : t)));
    recordAdminAudit(
      `Team Updated › ${updatedTeam.name}`,
      prevTeam ? `${prevTeam.department}` : 'Previous Details',
      `${updatedTeam.department} (${updatedTeam.description.slice(0, 30)})`
    );
  };

  const deleteTeam = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    recordAdminAudit('Team Deleted', team?.name || teamId, 'Removed');
  };

  // Role Actions
  const addRole = (roleData: Omit<RoleDefinition, 'id' | 'createdDate' | 'userCount'>) => {
    const newRole: RoleDefinition = {
      ...roleData,
      id: `role-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
      userCount: 0,
    };
    setRoles((prev) => [...prev, newRole]);
    recordAdminAudit('Role Created', 'None', `${roleData.name} (${roleData.focusArea})`);
  };

  const updateRole = (updatedRole: RoleDefinition) => {
    const prevRole = roles.find((r) => r.id === updatedRole.id);
    setRoles((prev) => prev.map((r) => (r.id === updatedRole.id ? updatedRole : r)));
    recordAdminAudit(
      `Role Definition Updated › ${updatedRole.name}`,
      prevRole ? prevRole.description.slice(0, 30) : 'Previous Role',
      updatedRole.description.slice(0, 30)
    );
  };

  const deleteRole = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    setRoles((prev) => prev.filter((r) => r.id !== roleId));
    recordAdminAudit('Role Deleted', role?.name || roleId, 'Removed');
  };

  const updateRolePermissions = (roleId: string, permissions: RolePermissions) => {
    const role = roles.find((r) => r.id === roleId);
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, permissions } : r))
    );
    recordAdminAudit(
      `Role Permissions Modified › ${role?.name || roleId}`,
      'Previous RBAC Matrix',
      'Updated Access & Field Scopes'
    );
  };

  // Collateral Actions
  const addCollateral = (collateralData: Omit<Collateral, 'id' | 'updatedDate'>) => {
    const newCol: Collateral = {
      ...collateralData,
      id: `col-${Date.now()}`,
      updatedDate: new Date().toISOString().split('T')[0],
    };
    setCollaterals((prev) => [newCol, ...prev]);
    recordAdminAudit('Marketing Collateral Added', 'None', `${collateralData.title} (${collateralData.category})`);
  };

  const updateCollateral = (updatedCol: Collateral) => {
    setCollaterals((prev) => prev.map((c) => (c.id === updatedCol.id ? updatedCol : c)));
    recordAdminAudit('Marketing Collateral Updated', 'Previous Version', `${updatedCol.title}`);
  };

  const deleteCollateral = (colId: string) => {
    const col = collaterals.find((c) => c.id === colId);
    setCollaterals((prev) => prev.filter((c) => c.id !== colId));
    recordAdminAudit('Marketing Collateral Deleted', col?.title || colId, 'Archived / Removed');
  };

  // Workflow Actions
  const addWorkflow = (wfData: Omit<WorkflowDefinition, 'id'>) => {
    const newWf: WorkflowDefinition = {
      ...wfData,
      id: `wf-${Date.now()}`,
    };
    setWorkflows((prev) => [...prev, newWf]);
    recordAdminAudit('Governance Workflow Added', 'None', `${wfData.name} (${wfData.category})`);
  };

  const updateWorkflow = (updatedWf: WorkflowDefinition) => {
    setWorkflows((prev) => prev.map((w) => (w.id === updatedWf.id ? updatedWf : w)));
    recordAdminAudit('Governance Workflow Updated', 'Previous Config', `${updatedWf.name} [Active: ${updatedWf.active}]`);
  };

  const deleteWorkflow = (wfId: string) => {
    const wf = workflows.find((w) => w.id === wfId);
    setWorkflows((prev) => prev.filter((w) => w.id !== wfId));
    recordAdminAudit('Governance Workflow Deleted', wf?.name || wfId, 'Removed');
  };

  const addWorkflowStep = (wfId: string, stepData: Omit<WorkflowStep, 'id'>) => {
    const newStep: WorkflowStep = {
      ...stepData,
      id: `wf-step-${Date.now()}`,
    };
    setWorkflows((prev) =>
      prev.map((w) => {
        if (w.id !== wfId) return w;
        return {
          ...w,
          steps: [...w.steps, newStep],
        };
      })
    );
    recordAdminAudit(`Workflow Step Added › WF ${wfId}`, 'None', `${stepData.name} (SLA: ${stepData.slaDays}d)`);
  };

  const deleteWorkflowStep = (wfId: string, stepId: string) => {
    setWorkflows((prev) =>
      prev.map((w) => {
        if (w.id !== wfId) return w;
        return {
          ...w,
          steps: w.steps.filter((s) => s.id !== stepId),
        };
      })
    );
    recordAdminAudit(`Workflow Step Deleted › WF ${wfId}`, stepId, 'Step Removed');
  };

  // Custom Field Actions
  const addCustomField = (fieldData: Omit<CustomFieldConfig, 'id'>) => {
    const newField: CustomFieldConfig = {
      ...fieldData,
      id: `field-${Date.now()}`,
    };
    setCustomFields((prev) => [...prev, newField]);
    recordAdminAudit('Field Configuration Added', 'None', `${fieldData.fieldName} (${fieldData.entity}, ${fieldData.fieldType})`);
  };

  const updateCustomField = (updatedField: CustomFieldConfig) => {
    setCustomFields((prev) =>
      prev.map((f) => (f.id === updatedField.id ? updatedField : f))
    );
    recordAdminAudit(
      `Field Configuration Updated › ${updatedField.fieldName}`,
      'Previous Config',
      `Audit Tracked: ${updatedField.auditTracked}, Required: ${updatedField.required}`
    );
  };

  const deleteCustomField = (fieldId: string) => {
    const f = customFields.find((cf) => cf.id === fieldId);
    setCustomFields((prev) => prev.filter((field) => field.id !== fieldId));
    recordAdminAudit('Field Configuration Deleted', f?.fieldName || fieldId, 'Removed');
  };

  // Partner Actions
  const addPartner = (partnerData: Omit<PartnerSWOT, 'id' | 'lastUpdated'>) => {
    const newPartner: PartnerSWOT = {
      ...partnerData,
      id: `swot-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setPartnerSwotList((prev) => [newPartner, ...prev]);
    recordAdminAudit('Partner Ecosystem Profile Added', 'None', `${partnerData.partnerName} (${partnerData.tier})`);
  };

  const updatePartner = (updatedPartner: PartnerSWOT) => {
    setPartnerSwotList((prev) =>
      prev.map((p) => (p.id === updatedPartner.id ? updatedPartner : p))
    );
    recordAdminAudit('Partner Ecosystem Profile Updated', 'Previous SWOT', `${updatedPartner.partnerName} (${updatedPartner.tier})`);
  };

  const deletePartner = (partnerId: string) => {
    const p = partnerSwotList.find((pt) => pt.id === partnerId);
    setPartnerSwotList((prev) => prev.filter((partner) => partner.id !== partnerId));
    recordAdminAudit('Partner Ecosystem Profile Deleted', p?.partnerName || partnerId, 'Removed');
  };

  // Upload Actions
  const recordUpload = (entryData: Omit<UploadHistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: UploadHistoryEntry = {
      ...entryData,
      id: `upl-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setUploadHistory((prev) => [newEntry, ...prev]);
  };

  const bulkImportAccounts = (importedList: any[]): number => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newAccounts: Account[] = importedList.map((item, idx) => {
      const prods =
        item.products && item.products.length > 0
          ? item.products
          : item.product
          ? [item.product]
          : ['PrivaSapien Anonymizer Pro & PETs Core'];
      const derivedAdoption = deriveAdoptionCategory(prods);
      return {
        id: `acc-bulk-${Date.now()}-${idx}`,
        name: item.name || `Imported Account ${idx + 1}`,
        website: item.website || 'https://enterprise.example.com',
        logoText: (item.name || 'NEW').slice(0, 3).toUpperCase(),
        logoBg: 'bg-indigo-600',
        stage: item.stage || 'New Account',
        annualRevenue: Number(item.annualRevenue || item.annualRevenueINR) || 5000000000,
        revenueCurrency: item.revenueCurrency || 'INR',
        dealValueOverride: item.dealValueOverride ? Number(item.dealValueOverride) : undefined,
        winningStance: item.winningStance || 'Initial Stages',
        adoptionCategory: derivedAdoption.category,
        owners: {
          sales: item.leadOwner || currentUser.name,
          preSales: item.preSalesOwner || 'Ananya Sharma',
          solutionEngineer: item.solutionEngineer || 'Rohan Deshmukh',
          leader: 'Rajesh Gopinath',
        },
        petsFlag: true,
        responsibleAiFlag: true,
        sector: item.sector || 'Banking & Financial Services',
        geography: item.geography || 'India (North)',
        publicPrivate: item.publicPrivate || 'Private',
        procurementType: item.procurementType || 'RFP Tender',
        productFamily: item.productFamily || 'Privacy Enhancing Technologies (PETs)',
        product: item.product || 'PrivaSapien Anonymizer Pro & PETs Core',
        products: prods,
        headOfficeAddress: item.headOfficeAddress || 'Corporate Office',
        partners: item.partners ? (Array.isArray(item.partners) ? item.partners : [item.partners]) : [],
        dateAdded: todayStr,
        lastActivityDate: todayStr,
        isStale: false,
        notes: item.notes || 'Imported via bulk CSV pipeline.',
        aiEnrichedFields: {},
        profileCompletion: {
          human: 80,
          ai: 60,
        },
        fieldAuditTrail: [
          {
            id: `audit-bulk-${Date.now()}-${idx}`,
            actor: currentUser.name,
            field: 'Record Ingestion',
            oldValue: 'N/A',
            newValue: 'Bulk CSV Ingested',
            timestamp: todayStr,
            effectiveDate: todayStr,
            provenance: 'Human-entered',
          },
        ],
      };
    });

    setAccounts((prev) => [...newAccounts, ...prev]);
    recordUpload({
      type: 'Accounts',
      fileName: 'bulk_accounts_ingestion.csv',
      uploadedBy: `${currentUser.name} (${currentUser.role})`,
      recordsCount: newAccounts.length,
      status: 'Success',
      summary: `Successfully imported ${newAccounts.length} accounts with auto-derived adoption categories.`,
    });
    return newAccounts.length;
  };

  const bulkImportContacts = (importedList: any[]): number => {
    const newContacts: Contact[] = importedList.map((item, idx) => ({
      id: `con-bulk-${Date.now()}-${idx}`,
      accountId: item.accountId || (accounts[0]?.id || 'acc-1'),
      firstName: item.firstName || item.name?.split(' ')[0] || 'Imported',
      lastName: item.lastName || item.name?.split(' ').slice(1).join(' ') || `Contact ${idx + 1}`,
      designation: item.designation || 'Data Protection Stakeholder',
      email: item.email || `contact${idx + 1}@imported-domain.com`,
      phone1: item.phone || item.phone1 || '+91 98000 00000',
      tags: ['Decision Maker'],
      source: 'Email Received',
      consentState: 'Explicit Opt-in',
      isMasked: false,
      unmaskHistory: [],
    }));

    setContacts((prev) => [...newContacts, ...prev]);
    recordUpload({
      type: 'Contacts',
      fileName: 'bulk_contacts_ingestion.csv',
      uploadedBy: `${currentUser.name} (${currentUser.role})`,
      recordsCount: newContacts.length,
      status: 'Success',
      summary: `Successfully imported ${newContacts.length} contacts with CBAC masking controls.`,
    });
    return newContacts.length;
  };

  const bulkImportTasks = (importedList: any[]): number => {
    const newTasks: Task[] = importedList.map((item, idx) => ({
      id: `task-bulk-${Date.now()}-${idx}`,
      accountId: item.accountId || (accounts[0]?.id || 'acc-1'),
      description: item.description || `Imported Deliverable ${idx + 1}`,
      creatorId: currentUser.id,
      assigneeId: item.assigneeId || currentUser.id,
      tct: item.tct || new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      status: 'Pending',
      priority: item.priority || 'Medium',
      comments: [],
      documents: [],
      isActivity: false,
    }));

    setTasks((prev) => [...newTasks, ...prev]);
    recordUpload({
      type: 'Tasks',
      fileName: 'bulk_tasks_ingestion.csv',
      uploadedBy: `${currentUser.name} (${currentUser.role})`,
      recordsCount: newTasks.length,
      status: 'Success',
      summary: `Successfully imported ${newTasks.length} tasks and deliverables.`,
    });
    return newTasks.length;
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
        canCompleteTask,
        getSubTasks,
        addCommentToTask,
        addDocumentToTask,
        addDocumentToAccount,
        removeDocumentFromAccount,
        createRfpSubtasks,
        addDemo,
        updateDemo,
        addCommentToDemo,
        updateExchangeRate,
        globalAuditTrail,
        adminAuditTrail,
        recordAdminAudit,
        resetToSeedData,
        isPartnerMode,
        activePartnerName,
        // Admin
        addUser,
        updateUser,
        deleteUser,
        teams,
        addTeam,
        updateTeam,
        deleteTeam,
        roles,
        addRole,
        updateRole,
        deleteRole,
        updateRolePermissions,
        addCollateral,
        updateCollateral,
        deleteCollateral,
        workflows,
        addWorkflow,
        updateWorkflow,
        deleteWorkflow,
        addWorkflowStep,
        deleteWorkflowStep,
        customFields,
        addCustomField,
        updateCustomField,
        deleteCustomField,
        addPartner,
        updatePartner,
        deletePartner,
        uploadHistory,
        recordUpload,
        bulkImportAccounts,
        bulkImportContacts,
        bulkImportTasks,
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
