import { GoogleGenAI } from '@google/genai';

export interface PlannedUpdateItem {
  id: string;
  type:
    | 'update_account'
    | 'add_contact'
    | 'add_task'
    | 'add_account'
    | 'complete_task'
    | 'admin_restricted';
  title: string;
  description: string;
  targetEntityName: string;
  details: {
    accountId?: string;
    accountName?: string;
    field?: string;
    oldValue?: any;
    newValue?: any;
    contactData?: {
      firstName: string;
      lastName: string;
      email: string;
      designation: string;
      tags: string[];
      accountId: string;
    };
    taskData?: {
      description: string;
      accountId: string;
      assigneeName?: string;
      priority: 'High' | 'Medium' | 'Low';
      tct: string;
      relatedSection?: string;
    };
    accountData?: {
      name: string;
      stage: string;
      dealValue?: number;
      product?: string;
      sector?: string;
    };
  };
  confirmed: boolean;
  isBlocked?: boolean;
  blockedReason?: string;
}

export interface SalesOpsPlanResult {
  summary: string;
  items: PlannedUpdateItem[];
  suggestedFollowUp?: string;
  hasBlockedAdminItems?: boolean;
}

export async function parseSalesOpsInstruction(
  prompt: string,
  context: {
    accounts: Array<{
      id: string;
      name: string;
      stage: string;
      annualRevenue: number;
      owners: { sales: string; preSales: string; leader: string };
    }>;
    contacts: Array<{
      id: string;
      accountId: string;
      firstName: string;
      lastName: string;
      designation: string;
    }>;
    tasks: Array<{ id: string; accountId: string; description: string; status: string }>;
    currentUser: { name: string; role: string };
    onBehalfOfUser?: { name: string; role: string } | null;
  }
): Promise<SalesOpsPlanResult> {
  const apiKey =
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (typeof process !== 'undefined' ? (process as any).env?.GEMINI_API_KEY : '');

  const accountsSummary = context.accounts
    .slice(0, 15)
    .map(
      (a) =>
        `[Account ID: "${a.id}", Name: "${a.name}", Stage: "${a.stage}", AnnualRevenue: ${a.annualRevenue}, SalesOwner: "${a.owners?.sales}"]`
    )
    .join('\n');

  const systemInstruction = `You are an expert enterprise SalesOps AI Agent in PrivaTRAC (a CRM for Privacy & AI Governance technologies).
Your role is SalesOps. Users (Sales Leaders, Account Execs, Solution Engineers) give you natural language instructions to update the CRM.

STRICT SECURITY RESTRICTION:
SalesOps Copilot is strictly scoped to Operational CRM updates (Accounts, Contacts, Follow-up Tasks).
SalesOps Copilot CANNOT make changes to the Admin section.
The Admin section includes:
1. Users & Teams Management (adding users, deleting users, team assignments)
2. Roles & RBAC Matrix Permissions (adding roles, modifying permissions)
3. Field Configurations & Custom Schemas (adding custom fields, changing attributes)
4. Workflows & SLAs (SLA rules, trigger conditions)
5. Partner Ecosystem SWOT & Configurations
6. Marketing Collaterals library
7. Currency Exchange Rates (USD/EUR/GBP/SGD/INR rates)
8. Bulk Data Ingestion (CSV bulk import)
9. General System Settings & Retention Policies

If the user's instruction asks for ANY change belonging to the Admin section:
You MUST output an item with:
- "type": "admin_restricted"
- "isBlocked": true
- "confirmed": false
- "title": "Admin Change Blocked: [Requested Admin Action]"
- "description": "SalesOps Copilot cannot make changes to the Admin section. Administrative configurations must be managed directly in the Admin tab by an Administrator."
- "targetEntityName": "Admin Section"
- "blockedReason": "SalesOps Copilot cannot make changes to Admin section."

For operational CRM requests:
1. Parse the command into atomic update action items ("update_account", "add_contact", "add_task", "add_account", "complete_task").
2. Match existing accounts from the provided list.
3. Return pure valid JSON strictly matching the requested schema.

Available Accounts in CRM:
${accountsSummary}

Acting User: ${context.currentUser.name} (${context.currentUser.role})
On Behalf Of: ${context.onBehalfOfUser?.name || 'Self'}
Current Date: ${new Date().toISOString().split('T')[0]}`;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Parse this SalesOps instruction into planned update items:
"${prompt}"

Output MUST be a JSON object with this exact structure:
{
  "summary": "Brief 1-line summary of what was planned",
  "items": [
    {
      "id": "item-1",
      "type": "update_account" | "add_contact" | "add_task" | "add_account" | "complete_task" | "admin_restricted",
      "title": "Short title",
      "description": "Clear explanation of change",
      "targetEntityName": "Account or Contact name",
      "details": {
        "accountId": "existing account id if applicable",
        "accountName": "account name",
        "field": "stage" | "annualRevenue" | "dealValueOverride" | "winningStance" | "notes" | "product",
        "oldValue": "previous value if known",
        "newValue": "new value",
        "contactData": { "firstName": "...", "lastName": "...", "email": "...", "designation": "...", "tags": ["Champion"], "accountId": "..." },
        "taskData": { "description": "...", "accountId": "...", "priority": "High" | "Medium" | "Low", "tct": "YYYY-MM-DD", "relatedSection": "General" },
        "accountData": { "name": "...", "stage": "New Account", "dealValue": 100000 }
      },
      "confirmed": true,
      "isBlocked": false,
      "blockedReason": ""
    }
  ],
  "suggestedFollowUp": "Optional follow-up recommendation from SalesOps"
}`,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
          systemInstruction,
        },
      });

      const responseText = response.text?.trim() || '';
      if (responseText) {
        const parsed = JSON.parse(responseText);
        if (parsed.items && Array.isArray(parsed.items)) {
          // Hard security enforcement filter on all returned items
          const sanitizedItems = parsed.items.map((it: any, idx: number) => {
            const isAdm =
              it.type === 'admin_restricted' ||
              /admin|user management|role permission|workflow|exchange rate|field config|bulk import|retention policy/i.test(
                `${it.title} ${it.description} ${it.targetEntityName || ''}`
              );

            if (isAdm) {
              return {
                ...it,
                id: it.id || `item-${Date.now()}-${idx}`,
                type: 'admin_restricted' as const,
                isBlocked: true,
                confirmed: false,
                blockedReason:
                  it.blockedReason ||
                  'Security Policy: SalesOps Copilot cannot make changes to the Admin section.',
              };
            }

            return {
              ...it,
              id: it.id || `item-${Date.now()}-${idx}`,
              confirmed: it.confirmed !== undefined ? it.confirmed : true,
              isBlocked: false,
            };
          });

          return {
            summary:
              parsed.summary ||
              `Parsed ${sanitizedItems.length} proposed updates from your instruction.`,
            items: sanitizedItems,
            suggestedFollowUp: parsed.suggestedFollowUp,
            hasBlockedAdminItems: sanitizedItems.some((it: PlannedUpdateItem) => it.isBlocked),
          };
        }
      }
    } catch (err) {
      console.warn(
        'Gemini live parsing failed or timed out, falling back to local deterministic heuristic parser:',
        err
      );
    }
  }

  // Robust deterministic local fallback parser
  return fallbackLocalParser(prompt, context);
}

function fallbackLocalParser(
  prompt: string,
  context: {
    accounts: Array<{
      id: string;
      name: string;
      stage: string;
      annualRevenue: number;
      owners: { sales: string; preSales: string; leader: string };
    }>;
    currentUser: { name: string; role: string };
  }
): SalesOpsPlanResult {
  const p = prompt.toLowerCase();
  const items: PlannedUpdateItem[] = [];

  // 1. STRICT ADMIN RESTRICTION INTERCEPTION
  const adminPatterns = [
    /\b(admin|administration)\b/i,
    /\b(add|create|delete|remove|modify|edit|update)\s+(user|team|role|workflow|sla|custom\s*field|field\s*config|exchange\s*rate|currency\s*rate|collateral|whitepaper|datasheet)\b/i,
    /\b(user|team|role)\s+(permission|management|settings|config|matrix)\b/i,
    /\b(exchange\s*rate|currency\s*rate|inr\s*rate|usd\s*rate|conversion\s*rate)\b/i,
    /\b(workflow|sla)\s+(rule|config|trigger|turnaround)\b/i,
    /\b(bulk\s*import|data\s*import|ingestion|csv\s*import)\b/i,
    /\b(system\s*settings|retention\s*policy|retention\s*period)\b/i,
    /\b(rbac|role-based\s*access)\b/i,
  ];

  const matchedAdmin = adminPatterns.some((pattern) => pattern.test(prompt));
  if (matchedAdmin) {
    items.push({
      id: `item-${Date.now()}-admin-blocked`,
      type: 'admin_restricted',
      title: 'Admin Action Blocked: Administrative Configuration Restricted',
      description:
        'SalesOps Copilot is restricted from modifying the Admin section. Users, Teams, Roles, Workflows, Field Configurations, Exchange Rates, Collaterals, and System Settings must be managed directly in the Admin tab.',
      targetEntityName: 'Admin Section',
      details: {
        accountName: 'Admin Configuration',
      },
      confirmed: false,
      isBlocked: true,
      blockedReason:
        'Security Policy: SalesOps Copilot cannot make changes to the Admin section. Only Administrators can modify administrative settings in the Admin tab.',
    });
  }

  // Match existing account if mentioned
  let matchedAccount = context.accounts.find((a) => p.includes(a.name.toLowerCase()));
  if (!matchedAccount) {
    matchedAccount = context.accounts.find((a) => {
      const words = a.name.toLowerCase().split(/\s+/);
      return words.some((w) => w.length > 3 && p.includes(w));
    });
  }

  const nextWeekStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Stage change detection
  if (
    p.includes('stage') ||
    p.includes('move') ||
    p.includes('advance') ||
    p.includes('closed won') ||
    p.includes('closed lost') ||
    p.includes('mature') ||
    p.includes('critical') ||
    p.includes('nurturing')
  ) {
    let newStage: string | undefined;
    if (p.includes('closed won') || p.includes('won')) newStage = 'Closed Won';
    else if (p.includes('closed lost') || p.includes('lost')) newStage = 'Closed Lost';
    else if (p.includes('critical')) newStage = 'Critical';
    else if (p.includes('mature')) newStage = 'Mature';
    else if (p.includes('nurturing')) newStage = 'Nurturing';
    else if (p.includes('new account')) newStage = 'New Account';

    if (newStage && matchedAccount) {
      items.push({
        id: `item-${Date.now()}-1`,
        type: 'update_account',
        title: `Update Stage for ${matchedAccount.name}`,
        description: `Transition lifecycle stage from "${matchedAccount.stage}" to "${newStage}"`,
        targetEntityName: matchedAccount.name,
        details: {
          accountId: matchedAccount.id,
          accountName: matchedAccount.name,
          field: 'stage',
          oldValue: matchedAccount.stage,
          newValue: newStage,
        },
        confirmed: true,
      });
    }
  }

  // Deal value / revenue update
  const valueMatch = prompt.match(
    /(?:value|deal|revenue|amount|pipeline)\s*(?:to|of|as|=)?\s*(?:₹|\$|inr|usd)?\s*([\d,]+(?:\.\d+)?)\s*(k|lakh|crore|m|cr)?/i
  );
  if (valueMatch && matchedAccount) {
    let num = parseFloat(valueMatch[1].replace(/,/g, ''));
    const unit = (valueMatch[2] || '').toLowerCase();
    if (unit === 'k') num *= 1000;
    if (unit === 'lakh') num *= 100000;
    if (unit === 'cr' || unit === 'crore') num *= 10000000;
    if (unit === 'm') num *= 1000000;

    items.push({
      id: `item-${Date.now()}-2`,
      type: 'update_account',
      title: `Update Deal Value for ${matchedAccount.name}`,
      description: `Set deal value to ${num.toLocaleString('en-IN')}`,
      targetEntityName: matchedAccount.name,
      details: {
        accountId: matchedAccount.id,
        accountName: matchedAccount.name,
        field: 'dealValueOverride',
        oldValue: matchedAccount.annualRevenue,
        newValue: num,
      },
      confirmed: true,
    });
  }

  // Winning stance update
  if (
    p.includes('stance') ||
    p.includes('prefers us') ||
    p.includes('negotiation') ||
    p.includes('equal') ||
    p.includes('initial')
  ) {
    let stance = 'Customer Prefers Us';
    if (p.includes('negotiation') || p.includes('po negotiation'))
      stance = 'Under PO Negotiations';
    else if (p.includes('won') || p.includes('received')) stance = 'Won/PO Received';
    else if (p.includes('equal')) stance = 'All are Equal';
    else if (p.includes('initial')) stance = 'Initial Stages';

    if (matchedAccount) {
      items.push({
        id: `item-${Date.now()}-3`,
        type: 'update_account',
        title: `Update Competitive Stance for ${matchedAccount.name}`,
        description: `Set winning stance to "${stance}"`,
        targetEntityName: matchedAccount.name,
        details: {
          accountId: matchedAccount.id,
          accountName: matchedAccount.name,
          field: 'winningStance',
          newValue: stance,
        },
        confirmed: true,
      });
    }
  }

  // Add task / follow-up item
  if (
    p.includes('task') ||
    p.includes('follow up') ||
    p.includes('follow-up') ||
    p.includes('remind') ||
    p.includes('rfp') ||
    p.includes('schedule') ||
    p.includes('send proposal')
  ) {
    const taskDesc =
      prompt.replace(/add\s+task|schedule|follow\s*up/gi, '').trim() ||
      `Follow up on deal status with ${matchedAccount ? matchedAccount.name : 'client'}`;
    items.push({
      id: `item-${Date.now()}-4`,
      type: 'add_task',
      title: `Create Follow-up Task for ${matchedAccount ? matchedAccount.name : 'Account'}`,
      description: taskDesc,
      targetEntityName: matchedAccount ? matchedAccount.name : 'General Task',
      details: {
        accountId: matchedAccount ? matchedAccount.id : context.accounts[0]?.id || 'acc-1',
        taskData: {
          description: taskDesc,
          accountId: matchedAccount ? matchedAccount.id : context.accounts[0]?.id || 'acc-1',
          priority: p.includes('urgent') || p.includes('high') ? 'High' : 'Medium',
          tct: nextWeekStr,
          relatedSection: p.includes('rfp') ? 'Technical Proposal' : 'General',
        },
      },
      confirmed: true,
    });
  }

  // Add contact item
  if (
    p.includes('contact') ||
    p.includes('stakeholder') ||
    p.includes('decision maker') ||
    p.includes('champion')
  ) {
    items.push({
      id: `item-${Date.now()}-5`,
      type: 'add_contact',
      title: `Add Stakeholder Contact for ${matchedAccount ? matchedAccount.name : 'Account'}`,
      description: `Create stakeholder contact with Champion designation`,
      targetEntityName: matchedAccount ? matchedAccount.name : 'Account',
      details: {
        accountId: matchedAccount ? matchedAccount.id : context.accounts[0]?.id || 'acc-1',
        contactData: {
          firstName: 'New',
          lastName: 'Stakeholder',
          designation: p.includes('ciso')
            ? 'CISO'
            : p.includes('dpo')
            ? 'Data Protection Officer'
            : 'VP of Technology',
          email: 'stakeholder@enterprise.com',
          tags: [p.includes('decision') ? 'Decision Maker' : 'Champion'],
          accountId: matchedAccount ? matchedAccount.id : context.accounts[0]?.id || 'acc-1',
        },
      },
      confirmed: true,
    });
  }

  // If nothing matched and it wasn't an admin prompt, generate a strategic note update
  if (items.length === 0 && !matchedAdmin) {
    const targetAcc = matchedAccount || context.accounts[0];
    items.push({
      id: `item-${Date.now()}-general`,
      type: 'update_account',
      title: `Record Strategic Note on ${targetAcc.name}`,
      description: `SalesOps Note: "${prompt}"`,
      targetEntityName: targetAcc.name,
      details: {
        accountId: targetAcc.id,
        accountName: targetAcc.name,
        field: 'notes',
        oldValue: '',
        newValue: prompt,
      },
      confirmed: true,
    });
  }

  const hasBlocked = items.some((it) => it.isBlocked);

  return {
    summary: hasBlocked
      ? `SalesOps identified action items, including ${items.filter((it) => it.isBlocked).length} blocked Admin configuration action(s).`
      : `SalesOps identified ${items.length} structured updates from your command.`,
    items,
    suggestedFollowUp: hasBlocked
      ? 'Note: Administrative changes cannot be executed by SalesOps Copilot and must be performed in the Admin tab.'
      : 'Would you like to auto-notify the Sales Owner once confirmed?',
    hasBlockedAdminItems: hasBlocked,
  };
}
