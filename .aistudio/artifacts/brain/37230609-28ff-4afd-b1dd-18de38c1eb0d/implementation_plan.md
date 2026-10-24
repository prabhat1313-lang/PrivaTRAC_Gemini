# Implementation Plan: Integrations Scope Review, Dedicated RFP Task Isolation & Cross-Module Reporting

Transforming the Integrations section into a comprehensive **Integrations Scope Review** in the RFP Work Desk (capturing explicit RFP requirements and auto-detected SoW-inferred integrations with approval toggles), isolating the general CRM Tasks module from RFP tasks while preserving full task execution parity within RFP sections, and unifying organizational reporting to aggregate tasks across both CRM and RFP Work Desk modules.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were clarified and confirmed with the user in Phase 1:
> - **Inferred Integrations Handling**: Integrations inferred from SoW line items (e.g., when an alternate solution or third-party ecosystem extension like Cyera DSPM, Thales HSM, or Splunk SIEM is planned) are auto-detected dynamically, rendered with a distinctive `Inferred from SoW` tag, and equipped with an interactive approval toggle (`[Approve Scope]` / `[Approved]`).
> - **Tasks Module Separation**: The general CRM Tasks module (`TasksView.tsx`) strictly excludes RFP tasks from display (zero visual clutter from tender clause sub-tasks), while RFP Work Desk sections and Account Detail RFP chapters retain the complete suite of task management features (creation, status transitions, role assignments, priority adjustments, due dates).
> - **Cross-Module Task Reporting**: All executive dashboard cards, pipeline health summaries, and reporting analytics compute unified total metrics across both CRM and RFP Work Desk tasks, displaying clean breakdown indicators (`Total Tasks (CRM · RFP)`).

---

## 1. Overview & Core Concept

### 1.1 What It Does
- **Integrations Scope Review Section**: Replaces the basic Integrations tab with an enterprise-grade scope review desk. It contrasts **Explicit RFP Requirements** (connectors requested by the client in technical specs) against **Inferred Integrations** (derived from SoW clause exceptions, third-party tool suggestions, or external API dependencies). Pre-Sales leads can approve, review, or reject inferred connectors with an explicit audit trail.
- **Strict Task Module Isolation**: Prevents RFP tender micro-tasks (e.g., "Verify PKCS#11 key size with Thales", "Validate DP epsilon budget with Infosec") from cluttering the standard CRM pipeline task board (`TasksView.tsx`). RFP tasks remain fully operational inside their respective RFP Work Desk sections and the Account Detail "RFP Chapter".
- **Unified Cross-Module Reporting**: Executive dashboards, workload analytics, and account summaries calculate true operational velocity by summing both CRM pipeline actions and RFP Work Desk deliverables, preventing blind spots during major tender bids.

### 1.2 Target Audience & Personas
- **Pre-Sales Lead / Solution Architect**: Reviews integration feasibility, confirms whether an alternate 3P tool planned in an SoW clause necessitates an active adapter or middleware, and controls the RFP task backlog.
- **Delivery Manager / SI Partner Lead**: Validates whether inferred integrations require custom build efforts, additional professional services (PS), or partner co-delivery.
- **Sales VP / Executive**: Views holistic organizational velocity across commercial account deals and active technical tender workloads in one unified reporting metric.

---

## 2. User Experience & Visual Design

Adhering strictly to B2B enterprise design standards: zero-pill metadata discipline, high density, and WCAG AA contrast.

### 2.1 Integrations Scope Review UI
- **Cluster Bar & Header**: Navigable in both Cluster 2 (Architecture) and Cluster 3 (Delivery) with clean horizontal scroll buttons. Displays key metrics cleanly without decorative pills:
  ```
  8 Connectors Tracked · 5 RFP Explicit · 3 Inferred from SoW · 2 Awaiting Solution Lead Approval
  ```
- **Filter Segmented Control**: Interactive `<button>` tabs for `All Connectors`, `RFP Requirements (5)`, `Inferred from SoW (3)`, and `Pending Review (2)`.
- **Connector Row / Card Composition**:
  - Title and vendor name with category kicker (`DSPM / Alternate Tool for Clause SOW-003`).
  - Source attribution: Unboxed text separator `RFP Requirement` vs `Inferred from Clause SOW-003 · Cyera Enterprise`.
  - Throughput, latency SLA, and protocol specifications (`REST / Webhook · 10,000 EPS · < 25ms`).
  - Interactive Actions: An approval toggle button `[Approve Scope]` / `[Scope Confirmed]` with instant audit logging (`actor: 'SalesOps Copilot'`, `onBehalfOf: current user`).

### 2.2 Tasks Module Strict Isolation
- In `TasksView.tsx`, ensure the task collection is filtered to strictly exclude any tasks originated from RFP tenders (`isRfpTask: true` or `rfpId !== undefined`).
- Full task capability (creation, status dropdown, priority selection, assignees, due dates, and completion checkmarks) remains 100% active in:
  - All 18 RFP Work Desk sections (`RfpTaskSection` drawer).
  - Account Detail Modal under the `RFP Chapter & Tenders` tab.

### 2.3 Cross-Module Reporting & Metrics
- **Executive Dashboard KPI Card**:
  - Main counter: `Total Tasks: 24`
  - Subtle breakdown subtitle: `16 CRM Deals · 8 RFP Work Desk`
  - Completion velocity bar aggregating completed CRM tasks + completed RFP tasks.
- **Account Health Card**: Integrates RFP task completion percentages into account engagement scores.

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Chosen Approach | Rationale & Trade-Offs |
| :--- | :--- | :--- |
| **Integrations Section Rebrand & Expansion** | Renamed to **Integrations Scope Review** with dual-source ingestion (RFP requirements + SoW clause inference) | Captures real-world enterprise procurement realities where SoW trade-offs introduce third-party integration overhead. |
| **Inferred Scope Approval Workflow** | Interactive toggle with Pre-Sales confirmation badge | Enforces Human-in-the-Loop governance: automated detection flags candidates, but engineers confirm before commercial freeze. |
| **RFP Task Display Isolation** | Filtered out of general CRM `TasksView.tsx` | Eliminates noise for account reps who do not manage technical tender line-items, while keeping RFP teams fully equipped. |
| **Unified Cross-Module Reporting** | Aggregate in `ExecutiveDashboardView` & reporting summaries with `(CRM · RFP)` breakdown | Provides executives with true organizational workload transparency without blending operational boards. |

---

## 4. Technical Architecture & Data Strategy

### 4.1 System Diagram
```
┌────────────────────────────────────────────────────────────────────────┐
│                        RFP WORK DESK ENGINE                            │
│                                                                        │
│  ┌───────────────────────┐              ┌───────────────────────────┐  │
│  │   SoW Review Section  │              │   RFP Requirements Parser │  │
│  │  - 3P Tool Suggested  ├──────────┐   │  - Explicit RFP Connectors│  │
│  │  - Partial Compliance │          │   └─────────────┬─────────────┘  │
│  └───────────────────────┘          │                 │                │
│                                     ▼                 ▼                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                 INTEGRATIONS SCOPE REVIEW SECTION                │  │
│  │  - Explicit Connectors (RFP Requirements)                        │  │
│  │  - Inferred Connectors (origin: SoW Clause, approval toggle)     │  │
│  │  - Universal Task & Comment Drawers                              │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│                 ┌───────────────────┴───────────────────┐              │
│                 ▼                                       ▼              │
│  ┌─────────────────────────────┐         ┌───────────────────────────┐ │
│  │   RFP Section Tasks State   │         │   Account Context Sync    │ │
│  │  - Task execution & status  │         │  - Account Detail Timeline│ │
│  │  - Isolated from CRM Tasks  │         │  - RFP Chapter Tab        │ │
│  └──────────────┬──────────────┘         └───────────────────────────┘ │
└─────────────────┼──────────────────────────────────────────────────────┘
                  │ Cross-Module Task Aggregator
                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   EXECUTIVE REPORTING & DASHBOARD                      │
│  - Total Tasks = CRM Tasks + RFP Tasks                                 │
│  - Breakdown: `X CRM · Y RFP` with completion velocity & SLA rates    │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Data Entity Schema Extensions
1. **IntegrationItem**:
   ```typescript
   export interface IntegrationItem {
     id: string;
     rfpId: string;
     name: string;
     category: 'Core Banking' | 'Cloud Storage' | 'SIEM & Logging' | 'HSM & KMS' | 'DSPM & Data Security' | 'IAM & SSO' | 'Other';
     vendor: string;
     protocol: string;
     throughputSla: string;
     latencySla: string;
     status: 'Verified' | 'In Progress' | 'Pending Review' | 'Flagged';
     origin: 'RFP Requirement' | 'Inferred from SoW';
     inferredFromSowId?: string; // e.g. 'sow-003'
     inferredRationale?: string;
     isApproved?: boolean;
     approvedBy?: string;
     approvedAt?: string;
   }
   ```
2. **Dynamic Inferred Connectors Generator**:
   - In `RfpContext.tsx`, evaluate `sowList`: whenever an item has `requiresThirdPartyTool: true` or `suggestedThirdPartyTool` present (or compliance is `Partially Compliant` with external tool), generate or expose an inferred `IntegrationItem`.
   - Provide `approveInferredIntegration(id: string, approver: string)` and `toggleIntegrationApproval(id: string)`.

3. **Tasks Filtering & Aggregation Strategy**:
   - In `TasksView.tsx`: apply `!task.isRfpTask && !task.rfpId` filter to ensure zero RFP tasks appear in the CRM list.
   - In `ExecutiveDashboardView.tsx` / `CrmContext.tsx`:
     ```typescript
     const totalCrmTasks = crmTasks.length;
     const totalRfpTasks = rfpTasks.length;
     const unifiedTotalTasks = totalCrmTasks + totalRfpTasks;
     const completedCrmTasks = crmTasks.filter(t => t.status === 'Completed').length;
     const completedRfpTasks = rfpTasks.filter(t => t.status === 'Completed').length;
     const unifiedCompletedTasks = completedCrmTasks + completedRfpTasks;
     ```

---

## 5. Implementation Steps & Work Plan

1. **Step 1: Extend RFP Types & Seed Data**
   - Update `src/types/rfp.ts` with `origin`, `inferredFromSowId`, `inferredRationale`, `isApproved`, `approvedBy`, `approvedAt` on `IntegrationItem`.
   - Update `src/data/rfpSeedData.ts` with explicit and inferred integration seeds linked to SoW clauses (e.g., Cyera DSPM for unstructured discovery, Thales Luna HSM for PKCS#11 root key storage).

2. **Step 2: Upgrade RfpContext with Inferred Integration Logic**
   - Add dynamic inference from `sowList` line items that have third-party tool suggestions.
   - Provide `approveInferredIntegration` and `toggleIntegrationApproval` actions with audit logs.

3. **Step 3: Create IntegrationsScopeReviewSection Component**
   - Rename and upgrade `src/components/RfpWorkDesk/IntegrationsSection.tsx` to `IntegrationsScopeReviewSection.tsx`.
   - Implement source filter tabs (`All`, `RFP Explicit`, `Inferred from SoW`, `Pending Approval`).
   - Add approval toggle button for inferred items with clause reference link.
   - Update navigation and section registry in `RfpWorkDeskView.tsx`.

4. **Step 4: Strictly Exclude RFP Tasks from CRM TasksView**
   - In `src/components/Tasks/TasksView.tsx`, ensure the active task filter excludes any task with `isRfpTask` or `rfpId`.
   - Verify that all task management capabilities (creation, editing, statuses, priorities) remain fully functional in `RfpWorkDesk` sections and `AccountDetailModal`.

5. **Step 5: Unified Cross-Module Task Reporting**
   - Update `ExecutiveDashboardView.tsx` and pipeline metrics to compute unified task counts (CRM + RFP) with clean `(CRM · RFP)` breakdown indicators.

6. **Step 6: Verification & Quality Assurance**
   - Run `lint_applet` and `compile_applet` to ensure zero compilation or typing errors.
   - Verify visual rendering in browser environment.
