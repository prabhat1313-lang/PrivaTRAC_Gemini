# Implementation Plan: Outlook Integration, Enterprise Mailbox & Smart Dual-Destination Task Creation

Expanding the enterprise **Mailbox Module & Microsoft Outlook (Graph API) Integration** with an intelligent, context-aware **Create Task Engine**. Automatically distinguishes between **RFP Deals/Accounts** (routing tasks directly into the targeted RFP Work Desk section) and **Non-RFP Deals/Accounts** (routing tasks into the parent Account workspace), pre-populating email subjects, highlighted snippet descriptions, and thread references with direct-jump toast confirmations.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were established and confirmed in Phase 1:
> - **Task Destination Routing**: Automatically routes tasks based on the matched Account's procurement type (`Open RFP` / `Closed RFP` vs `Direct Opportunity`) and active tender presence. For tender accounts, tasks dispatch directly into the RFP Work Desk (`RfpSectionTask`); for standard commercial deals, tasks dispatch into the Account CRM workspace (`Task`).
> - **Pre-Populated Task Content**: Automatically extracts the email subject as the task title, captures user-highlighted text or snippet as the task description/justification, and embeds a source backlink to the email thread.
> - **User Feedback & Deep Linking**: Displays an inline toast notification featuring an interactive direct jump link to the created task (e.g. `Jump to RFP Work Desk (SoW Review) →` or `View in Account Workspace →`).
> - **Outlook Sync & Mailbox Core**: OAuth 2.0 with Microsoft Graph API coupled with a comprehensive Simulated Fallback Sandbox, Webhook + Delta Query sync pipeline, and DPDP 2023 compliant data boundaries.

---

## 1. Overview & Dual-Destination Task Architecture

### 1.1 The Operational Challenge
In enterprise sales, inbound emails range from complex tender clarification letters (e.g., State Bank of India requesting PKCS#11 HSM compliance reports) to direct commercial deal inquiries (e.g., Apollo Hospitals requesting a clinical demo or NDA signing). Forcing all emails into a generic task list creates noise for account reps and deprives pre-sales engineers of clause-level RFP tracking.

### 1.2 Smart Task Routing Engine
```
                                Inbound Outlook Email
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │   Account & Domain Detection Engine   │
                     │  - Matches @domain to CRM Accounts   │
                     │  - Identifies Contacts & Tenders     │
                     └───────────────────┬───────────────────┘
                                         │
                    Is Account linked to an Active Tender?
                                    /         \
                             YES   /           \   NO
                                  ▼             ▼
  ┌─────────────────────────────────────┐  ┌─────────────────────────────────────┐
  │         RFP WORK DESK ROUTE         │  │       ACCOUNT WORKSPACE ROUTE       │
  │  - Dispatches `RfpSectionTask`      │  │  - Dispatches CRM Account `Task`    │
  │  - Target Section: SoW / Integrations│  │  - Related Section: Demo / Prop /   │
  │  - Links: Tender ID & Clause Number │  │    Commercial / Technical           │
  │  - Assignee: Solution Engineer      │  │  - Assignee: Account Executive      │
  │  - Visible in RFP Cluster & Chapter │  │  - Scoped strictly to Account       │
  └──────────────────┬──────────────────┘  └──────────────────┬──────────────────┘
                     │                                        │
                     └───────────────────┬────────────────────┘
                                         ▼
                     ┌───────────────────────────────────────┐
                     │       Inline Toast Notification       │
                     │  "Task Created Successfully"          │
                     │  [Jump to RFP Work Desk →]            │
                     │  [View in Account Workspace →]        │
                     └───────────────────────────────────────┘
```

---

## 2. Information Architecture & Key Mailbox Features

### 2.1 3-Pane High-Density Enterprise Layout
```
┌─────────────────┬──────────────────────────────┬────────────────────────────────────────────┐
│ FOLDERS & TAGS  │ THREAD / MESSAGE LIST        │ MESSAGE DETAIL & PRE-SALES RADAR          │
│                 │                              │                                            │
│ • Unified Inbox │ [SBI Tender] Tech Clarif...  │ From: arvind.venkatesh@sbi.co.in           │
│ • Tender Corresp│  Today 10:24 AM · SOW-004    │ To: Ananya Sharma (Pre-Sales Lead)         │
│ • Client PBQs   │  "Can you clarify PKCS#11... │ Linked: State Bank of India (RFP/SBI/04)   │
│ • Outbox / Sent │                              ├────────────────────────────────────────────┤
│ • Drafts        │ [Apollo] Clinical Demo       │ Thread Content:                            │
│                 │  Yesterday 04:15 PM          │ "...Please provide the Thales HSM firmware │
│ CONNECT ACCT    │  "We reserved boardroom..."  │  validation test report for Clause 6.2.1." │
│ [M365 Status]   │                              ├────────────────────────────────────────────┤
│                 │ [DBS Bank] MAS FEAT Review   │ ⚡ Context-Aware Action Bar:               │
│                 │  08 Oct 2026                 │ [+ Create Task] ──▶ (Auto-Routes to RFP)   │
│                 │  "AI ethics committee..."    │ [+ Convert to PBQ]  [Reply with Attest]    │
└─────────────────┴──────────────────────────────┴────────────────────────────────────────────┘
```

### 2.2 Interactive "Create Task" Modal
When the user clicks `[+ Create Task]` or highlights text within an email:
1. **Destination Auto-Detection Badge**:
   - If tender exists: `Destination: RFP Work Desk · SBI RFP (Cluster 1 / SoW)`
   - If non-tender: `Destination: Account Workspace · Apollo Hospitals (Commercial Deal)`
   - Includes an override toggle button (`Switch to Account Task` / `Switch to RFP Task`) for manual pre-sales control.
2. **Pre-Populated Fields**:
   - *Title*: Pre-filled with email subject (e.g. `Clarify HSM PKCS#11 firmware validation`).
   - *Description*: Pre-filled with highlighted email text or selected snippet with source reference.
   - *Target Due Date (TCT)*: Defaulted to 3 business days or RFP cutoff date.
   - *Assignee*: Pre-selected based on role (Solution Engineer for RFP tasks, Sales Owner for Account tasks).
   - *Section*: For RFP tasks, selectable work desk section (`sow`, `integrations`, `pbq`, `legal`, `projectPlan`); for Account tasks, selectable CRM section (`Technical Proposal`, `Demo`, `Commercial Proposal`, `General`).

### 2.3 Post-Creation Toast & Navigation Feedback
- Toast message: `✓ Task logged in RFP Work Desk: "Clarify HSM PKCS#11..."`
- Action button: `[Jump to SoW Review →]` which switches active view to the RFP Work Desk and navigates to the target section with the new task highlighted.
- For Account tasks: `[View in Account Workspace →]` which opens the Account Detail Modal with the Tasks tab active.

---

## 3. Technical Architecture & Component Structure

### 3.1 Component Hierarchy
```
src/components/Mailbox/
├── MailboxView.tsx                     # Main 3-pane layout, folder navigation & state orchestrator
├── EmailThreadList.tsx                 # Searchable, filterable list with unboxed tender tags
├── EmailDetailPane.tsx                 # Full message view, thread history, and Pre-Sales Action Bar
├── EmailComposerModal.tsx              # Rich compose modal with collateral and FRD attachments
├── OutlookConnectModal.tsx             # OAuth 2.0 M365 authentication & permissions modal
├── CreateTaskFromEmailModal.tsx        # Smart Dual-Destination Task Creation Modal
└── ToastNotification.tsx               # Deep-linking toast with jump triggers
```

### 3.2 Routing Data Model (`src/types/mailbox.ts`)
```typescript
export interface TaskCreationDraft {
  emailId: string;
  sourceSubject: string;
  sourceSender: string;
  selectedTextSnippet?: string;
  matchedAccountId?: string;
  matchedAccountName?: string;
  matchedTenderId?: string;
  matchedTenderNumber?: string;
  routingDestination: 'rfp_workdesk' | 'account_workspace';
  targetSection: string; // RFP section key OR CRM task section
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low' | 'Urgent';
  assigneeName: string;
  dueDate: string;
}
```

---

## 4. Implementation Steps & Work Plan

1. **Step 1: Mailbox Data Types & Seed Data**
   - Create `src/types/mailbox.ts` with `EmailMessage`, `OutlookConnectionStatus`, and `TaskCreationDraft`.
   - Create `src/data/mailboxSeedData.ts` populated with realistic enterprise RFP and non-RFP email threads for State Bank of India, Apollo Hospitals, DBS Bank, and National Health Authority.

2. **Step 2: Outlook & Mailbox Context (`MailboxContext.tsx`)**
   - Implement messages state with delta query simulator and live Microsoft Graph OAuth configuration.
   - Implement dual-destination task dispatcher:
     - Calls `useRfp().addTask` when destination is `rfp_workdesk`.
     - Calls `useCrm().addTask` when destination is `account_workspace`.
   - Provides deep-link navigation triggers back to the target view.

3. **Step 3: Smart Dual-Destination Task Creation Modal (`CreateTaskFromEmailModal.tsx`)**
   - Inspects matched account procurement type and active tenders.
   - Pre-populates title, highlighted snippet, and backlink.
   - Provides destination override toggle with dynamic role assignment.

4. **Step 4: High-Density 3-Pane Mailbox View (`MailboxView.tsx`)**
   - Left pane: System folders, tender/account filter tags, and Outlook connection status badge.
   - Middle pane: Thread list with unboxed metadata and search.
   - Right pane: Detailed conversation view with **Pre-Sales Action Bar** (`[+ Create Task]`, `[+ Convert to PBQ]`, `[Reply with Attestation]`).

5. **Step 5: Interactive Email Composer & Collateral Picker**
   - Implement `EmailComposerModal.tsx` allowing solution engineers to attach verified FIPS-140-3 whitepapers, DPDP 2023 compliance matrices, and roadmap FRDs directly into outgoing tenders.

6. **Step 6: Verification & Quality Assurance**
   - Run `lint_applet` and `compile_applet` to ensure zero compilation or typing errors.

---

## 5. Verification Checkpoints

- [ ] Mailbox automatically identifies whether an email belongs to an active RFP tender account (`SBI`, `NHA`) or a direct commercial account (`Apollo`, `DBS`).
- [ ] Clicking `[+ Create Task]` for an RFP email routes the task to the RFP Work Desk with target section selection.
- [ ] Clicking `[+ Create Task]` for a non-RFP email routes the task to the Account CRM workspace with related section selection.
- [ ] Created tasks pre-populate email subject as title, highlighted text as description, and embed the source email reference.
- [ ] Inline toast notification renders an actionable jump link that smoothly redirects to the created task in its target view.
- [ ] Outgoing email composer supports attaching verified PrivaSapien collaterals and FRD specs.
- [ ] Strict defensive TypeScript, clean build, zero lint warnings.
