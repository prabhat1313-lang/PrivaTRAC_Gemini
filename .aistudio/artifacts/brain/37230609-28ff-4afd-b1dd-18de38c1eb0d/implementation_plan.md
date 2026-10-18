# RFP Ingestion, SoW AI Compliance Engine & Enterprise Product Requirements Matrix

A comprehensive end-to-end blueprint for automating RFP & Corrigendum document triage, generating task-linked review schedules (Submission Checklist, Legal, Delivery, Commercial, Architecture/SBOM), powering AI-driven Scope of Work (SoW) compliance analysis with version-controlled product context across all accounts, and consolidating client requirements into a unified cross-account Product Requirements Matrix with FRD linkage.

---

## User Review & Confirmed Decisions

> [!IMPORTANT]
> **All Architectural & UX Decisions Confirmed:**
> 1. **Universal Scope of Work (All Accounts)**:
>    - The "Scope of Work / Requirements" section is available for every account (RFP and non-RFP).
>    - Full AI Convert-to-Excel, Preliminary Remarks from Knowledge Base, QA Review, Final Response, and sync to the Product Matrix are universal.
>    - For RFP accounts, a third section **"RFP / Corrigendum"** is available with automated scanning into specialized review tasks.
> 2. **Submission Docs Checklist Ownership**:
>    - "Bidder" is completely removed. Ownership options are: **OEM**, **SI Partner**, or **Both**.
>    - When SI Partner or Both is selected, users can pick from the account's tagged SI partners or add a new partner directly.
> 3. **Top-Right Header Notification Center**:
>    - Dedicated notifications icon button in the top-right header with unread badge counter.
>    - Categorized tabbed panel: **"Product & FRD Updates"**, **"Task Changes"**, and **"Account Updates"**.
>    - Tracks updates made by other users, admin changes, and automated triggers (such as when an FRD moves to `Shipped`).
> 4. **Complementary Tool Recommendations (DLP, EDR, WAF, DAM, CASB)**:
>    - Pre-filled top enterprise vendor (e.g., Cloudflare WAF, Palo Alto Prisma, CrowdStrike Falcon, Splunk, HashiCorp Vault) with capability rationale.
>    - Editable inline so pre-sales engineers can adjust or customize the recommended partner.
> 5. **Product Matrix Hierarchy**:
>    - Implemented as a 3-tier structure (`Product Family` $\rightarrow$ `Product` $\rightarrow$ `Module`) as an assumption for the prototype, made fully configurable in the Admin section for future production readiness.
> 6. **1-Click Source Citation Drawer**:
>    - Displays on hover and stays open on click, showing the exact product context knowledge base excerpt backing the compliance rationale.
> 7. **Interactive In-Browser Spreadsheet**:
>    - Inline cell editing, column filtering, search, and `.xlsx` / `.csv` export and import.
> 8. **Semantic Duplicate Detection**:
>    - Merges near-identical requirements across client tenders into single matrix rows with dynamic account columns.
> 9. **Context File Governance**:
>    - Approved Final SoWs spawn draft versions of the knowledge base in Admin with side-by-side diff comparison and a mandatory "Commit Version" action before becoming active.

---

## 1. Overview & Core Concept

### What It Does
- **Multi-Category Account Document Storage**:
  - *Scope of Work / Requirements*: Available on **all accounts**. Ingests SoWs, RFIs, client requirement sheets, technical questionnaires.
  - *Other Documents*: General collateral, pitch decks, NDAs, architecture diagrams across all accounts.
  - *RFP / Corrigendum*: Specialized section available for RFP-driven accounts.
- **Automated RFP & Corrigendum Extraction (RFP Accounts)**:
  - *Submission Docs Checklist Task*: Tabular checklist mapping tender annexures to owners (`OEM`, `SI Partner`, `Both`) with tagged partner links.
  - *Scope of Work / Requirements*: Automatically routed to the account's SoW section (not a detached generic task).
  - *Specialized Review Tasks*: Legal Clauses Review, Delivery & Manpower Timelines Review, Commercial Format & Terms Review, Infrastructure / Architecture / SBOM Review, and Other Requirements Review.
- **SoW AI Transformation & Preliminary Remarks (All Accounts)**:
  - *Convert to Excel*: Structures unstructured SoWs into standard spreadsheet rows with columns: `Requirement ID`, `Category / Module`, `Requirement Text`, `Compliance Status`, `Preliminary Remarks`, `QA Review`, `Final Response`, and `Complementary Tool`.
  - *Preliminary Remarks Engine*: Ingests the active version of the Product Context Knowledge Base to pre-populate compliance rationale and auto-detects unfulfilled/partially fulfilled gaps, pairing them with top enterprise partner tools.
- **Cross-Account Product Requirements Matrix**:
  - Top-level navigational view (`Product Matrix` tab) with accounts represented across dynamic columns and requirements mapped along rows.
  - Grouped by configurable hierarchy: *Product Family* $\rightarrow$ *Product* $\rightarrow$ *Module*.
  - Configurable Availability Status (`Fully Available`, `Partially Available`, `Not Available`) and Implementation Tags (`Requires Configuration`, `Requires Integration`, `Requires Customization`, `Not Applicable`, `Architecturally Infeasible`).
  - Native Functional Requirements Document (FRD) mapping linking engineering specs to client tenders.
- **Continuous Knowledge Feedback Loop**: Final approved SoW responses automatically propose an incremental version bump to the product context knowledge base with diff auditing.
- **Cross-System Notification Center**: Real-time notifications for FRD status changes, team assignments, and tender updates.

### Target Audience & Persona
- **Pre-Sales / Solution Architects**: Accelerate tender and questionnaire responses across RFP and enterprise direct deals while standardizing product assertions.
- **Bid Managers & Legal Counsel**: Oversee mandatory submission checklists, commercial terms, and RFP risk clauses.
- **Product Management & Engineering Leads**: Analyze the cross-account Product Matrix to detect high-demand product gaps across all customer segments, prioritize roadmap features, and link FRDs to pipeline revenue.

---

## 2. User Experience & Visual Design

### Key User Flows

#### Flow 1: Uploading & Triaging Documents (Universal + RFP Accounts)
1. In the Account Detail modal, under the Documents tab, users see segregated upload dropzones:
   - **"Scope of Work / Requirements"** (All Accounts)
   - **"Other Documents"** (All Accounts)
   - **"RFP / Corrigendum"** (RFP Accounts)
2. Uploading an RFP or Corrigendum file triggers a rapid extraction progress indicator followed by an **Extraction Review Dialog**.
3. The dialog previews detected sections:
   - *Submission Checklist* (mapped to OEM, SI Partner, or Both, with linked SI partner selector).
   - *Legal Clauses* (indemnity caps, liquidated damages, termination clauses).
   - *Delivery & Timelines* (UAT schedule, milestones, penalty thresholds).
   - *Commercial Terms* (payment milestones, BG validity).
   - *Infrastructure / Architecture / SBOM* (OS compatibility, DB requirements, open-source compliance).
4. Clicking **"Generate Review Tasks & Populate SoW"** creates tasks with embedded review tables and automatically routes the technical requirements into the account's SoW section.

#### Flow 2: SoW-to-Excel Conversion & Preliminary AI Responses (Universal across all accounts)
1. In the "Scope of Work / Requirements" section of any account, the user clicks **"Convert to Excel"**.
2. The AI parses the document into structured requirement line items with standard columns (`Compliance Status`, `Preliminary Remarks`, `QA Review`, `Final Response`).
3. The user clicks **"Generate Preliminary Remarks"**:
   - The engine queries the active version of the **Product Context Knowledge Base**.
   - Compliance statuses (`Fully Compliant`, `Partially Compliant`, `Non-Compliant`) and justifications are populated.
   - For non-compliant or partially compliant items, the engine queries the **Curated Partner Matrix** (DLP, DAM, EDR, WAF, CASB) and pre-fills top recommended enterprise vendors with capability rationale.
   - Hovering over a requirement displays a **"View Citation"** pill; clicking it keeps the source citation drawer open for reference.
4. Users can review, adjust cells inline, approve QA, and finalize responses.

#### Flow 3: Cross-Account Product Requirements Matrix
1. Users navigate to the **"Product Matrix"** tab from the main navigation bar.
2. The matrix displays a high-density, clean grid:
   - Vertical grouping: Product Family $\rightarrow$ Product $\rightarrow$ Module.
   - Horizontal headers: Requirement Details, Availability Status, Tags, Linked FRD, and dynamic columns for each client account (e.g. *Reserve Bank*, *Ministry of Finance*, *HDFC*, *Airbus*, *Global FinTech*).
   - Cell values indicate the account's tender requirement level and compliance commitment.
3. Pre-sales or Product Managers can link an FRD (e.g., `FRD-2026-084: Dual-Region High Availability Automation`), update implementation tags, or export the roadmap gap report.

#### Flow 4: Header Notification Center
1. Users click the notification bell icon in the top-right header.
2. An interactive flyout panel appears with three tabs:
   - **Product & FRD Updates**: Notifies when FRDs are updated or shipped (e.g., "FRD-2026-084 marked Shipped: Review compliance on 3 accounts").
   - **Task Changes**: Alerts when tasks or sub-tasks are assigned, reassigned, or commented on.
   - **Account Updates**: Alerts when documents, SoWs, or account statuses are modified by colleagues.
3. Users can click any notification to jump directly to the target account, task, or matrix row, or click **"Mark All as Read"**.

#### Flow 5: Admin Knowledge Base & Version Diff
1. In the **Admin** tab under **"Product Knowledge Base"**, administrators view active product capability specifications.
2. Admins can edit markdown/JSON context blocks, review version history with side-by-side diffs, revert to prior versions, or view versions spawned by approved Final SoWs.
3. Admins can configure availability statuses, implementation tags, and matrix hierarchy levels.

### Visual Identity & Theme
- **Design Constitution Compliance**: Strictly adheres to the SaaS Dashboard reference guidelines (`references/3_saas_dashboard.md`).
- **Surface & Hierarchy**: Clean, high-density data tables ($36\text{px}$–$40\text{px}$ row height), subtle 1px dividers (`border-slate-200 dark:border-slate-800`), neutral slate backgrounds (`#F8FAFC` to `#0F172A`), zero decorative pill boxes for static metadata, tabular numerals (`tabular-nums font-mono`).
- **Color System (60-30-10)**:
  - 60% Canvas: Crisp slate/white surface.
  - 30% Structural: Subdued borders, table headers, breadcrumb bars.
  - 10% Accent: High-intent indigo/blue (`#2563EB` / `#4F46E5`) for primary actions, emerald (`#16A34A`) for Compliant/Available, amber (`#D97706`) for Partially Compliant/Requires Customization, rose (`#DC2626`) for Non-Compliant/Infeasible.

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Chosen Approach | Rationale | Alternatives Considered |
| :--- | :--- | :--- | :--- |
| **Checklist Ownership Model** | OEM, SI Partner, or Both (with account partner selector) | Reflects real-world government and enterprise bidding structures where prime SIs hold specific annexure obligations. | Generic "Bidder" label (vague and detached from actual partner records). |
| **Header Notification Hub** | Tabbed flyout (Product/FRD, Tasks, Accounts) in top-right header | Keeps users alerted to cross-cutting product and task changes without cluttering main work areas. | Uncategorized list or intrusive popup modals. |
| **Complementary Tools Strategy** | Pre-filled top enterprise vendor with editable rationale | Gives pre-sales immediate, actionable compliance wording while preserving flexibility to substitute custom vendor agreements. | Plain text search without vendor suggestions or uneditable static suggestions. |
| **Configurable Hierarchy** | 3-tier hierarchy (Family > Product > Module) with Admin customization | Provides immediate structure for the prototype while enabling effortless reconfiguration for production schemas. | Hardcoded rigid taxonomy or flat unorganized list. |

---

## 4. Technical Architecture & Data Strategy

### System & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                  TOP BAR HEADER                                        │
│  [Logo] [Context Breadcrumbs]          [Notifications (Tabs: Product/Task/Acct)] [User]│
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
┌───────────────────────────────────────────┴────────────────────────────────────────────┐
│                               PRIMARY NAVIGATION                                       │
│  [Dashboard] [Accounts] [Contacts] [Tasks] [Product Matrix] [Partners] [Admin] ...     │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
        ┌───────────────────────────────────┴───────────────────────────────────┐
        ▼                                                                       ▼
┌───────────────────────────────────────┐   ┌───────────────────────────────────┐
│      ACCOUNT DETAIL / DOCUMENTS       │   │       PRODUCT MATRIX VIEW         │
│  • Scope of Work / Requirements (All) │   │  • Configurable Hierarchy         │
│  • Other Documents (All)              │   │  • Dynamic Account Columns        │
│  • RFP / Corrigendum (RFP Accounts)   │   │  • Availability Status & Tags     │
│  • Convert to Excel & Prelim Remarks  │   │  • FRD Mapping & Gap Analytics    │
│  • Hover/Click Citation Drawer        │   │  • Export to XLSX/CSV             │
└───────────────────┬───────────────────┘   └─────────────────▲─────────────────┘
                    │                                         │
                    ▼ (RFP Upload)                            │ Appends Requirements
┌───────────────────────────────────────┐                     │ & Gaps
│      EXTRACTION REVIEW MODAL          │                     │
│  • Submission Docs (OEM/SI Partner)   │                     │
│  • Legal, Delivery, Commercial Items  │                     │
│  • Architecture & SBOM Clauses        │                     │
└───────────────────┬───────────────────┘                     │
                    │ Generates Tasks                         │
                    ▼                                         │
┌───────────────────────────────────────┐                     │
│             TASKS MODULE              │                     │
│  • Submission Docs Checklist Task     │                     │
│  • Legal / Delivery / Terms Tasks     │                     │
│  • SoW routed to SoW Section          │                     │
└───────────────────────────────────────┘                     │
                    │                                         │
                    ▼ (Final SoW Approved)                    │
┌─────────────────────────────────────────────────────────────┴─────────────────┐
│                    ADMIN PRODUCT KNOWLEDGE BASE                               │
│  • Versioned Markdown/JSON Store (v1.0, v1.1, v1.2...)                        │
│  • Visual Diff & One-Click Revert Engine                                      │
│  • Configurable Hierarchy, Availability Status & Tag Registry                 │
│  • Curated Partner Integration Directory (DLP, DAM, EDR, WAF, CASB)           │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Data Models & State Additions

```typescript
// Document Category Expansion
export type DocumentCategory =
  | 'General'
  | 'Scope of Work / Requirements'
  | 'RFP / Corrigendum'
  | 'Other Documents'
  | 'Legal Review'
  | 'Delivery Review'
  | 'Commercial Review'
  | 'Technical Architecture'
  | 'Contract';

// Submission Checklist Item with SI Partner integration
export interface SubmissionChecklistItem {
  id: string;
  documentName: string;
  description: string;
  mandatory: boolean;
  owner: 'OEM' | 'SI Partner' | 'Both';
  assignedPartnerId?: string;
  assignedPartnerName?: string;
  status: 'Pending' | 'In Progress' | 'Ready' | 'Submitted';
  uploadedDocId?: string;
}

// SoW Requirement Row (Spreadsheet structure)
export interface SowRequirementRow {
  id: string;
  clauseNumber: string;
  category: string;
  requirementText: string;
  complianceStatus: 'Fully Compliant' | 'Partially Compliant' | 'Non-Compliant' | 'Not Applicable';
  preliminaryRemarks: string;
  qaReview: string;
  finalResponse: string;
  complementaryTool?: string;
  complementaryToolRationale?: string;
  matrixRequirementId?: string;
  confidenceScore?: 'High' | 'Medium' | 'Partner Inferred';
  citationSnippet?: string;
}

// Product Matrix Requirement
export interface ProductMatrixRequirement {
  id: string;
  productFamily: string;
  product: string;
  module: string;
  title: string;
  description: string;
  availabilityStatus: 'Fully Available' | 'Partially Available' | 'Not Available';
  tags: Array<'Requires Configuration' | 'Requires Integration' | 'Requires Customization' | 'Not Applicable' | 'Architecturally Infeasible'>;
  linkedFrd?: {
    id: string;
    title: string;
    linkUrl?: string;
    status: 'Draft' | 'Approved' | 'In Development' | 'Shipped';
  };
  accountMappings: Record<string, {
    accountId: string;
    accountName: string;
    complianceStatus: string;
    tenderRef: string;
  }>;
}

// System Notification Model
export interface CrmNotification {
  id: string;
  category: 'product' | 'task' | 'account';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetId?: string;
  targetType?: 'account' | 'task' | 'matrix' | 'frd';
}

// Product Context Knowledge Base Version
export interface ProductContextVersion {
  id: string;
  version: string;
  createdAt: string;
  createdBy: string;
  changeSummary: string;
  sourceSoWAccountId?: string;
  content: string; // Markdown / JSON specification
  isActive: boolean;
  isDraft?: boolean;
}
```

---

## 5. Pertinent Implications & Risk Mitigation

1. **RFP vs Non-RFP Experience**: For non-RFP accounts, the "RFP / Corrigendum" bucket is gracefully hidden or displayed with a helpful prompt, while the "Scope of Work / Requirements" and "Other Documents" buckets remain active with full AI Excel conversion and Matrix synchronization.
2. **SI Partner Consistency**: When an SI partner is chosen in the Submission Docs Checklist, the system automatically checks the account's existing partners and allows 1-click addition if not yet linked.
3. **Audit Guardrails**: Reverting a knowledge base version in Admin strictly determines the starting template for subsequent new preliminary remarks, preserving previously finalized tender submissions.
4. **Notification Latency & Polish**: The header notification hub provides instant visual feedback with unread counts and 1-click navigation to relevant accounts or tasks.

---

## 6. Execution Stages Summary

1. **Stage 1 (Types & State Context)**: Define types for RFP Extraction, SoW Spreadsheet Rows, Product Matrix Requirements, Notifications, and Context Versions in `src/types/crm.ts` and `CrmContext.tsx`.
2. **Stage 2 (Account Documents & RFP Ingestion)**: Update `AccountDetailModal.tsx` with the 3 document categories, automated scanner dialog, and review-before-task generation for Checklist, Legal, Delivery, Commercial, Architecture, and SoW across both RFP and non-RFP accounts.
3. **Stage 3 (SoW-to-Excel & Preliminary Remarks AI)**: Implement interactive Excel view with `Convert to Excel`, `Preliminary Remarks` calculation from the Knowledge Base, hover/click source citation drawer, and editable enterprise partner tool suggestions.
4. **Stage 4 (Product Matrix Main Tab)**: Build the dedicated `ProductMatrixView.tsx` with dynamic account columns, availability tags, and FRD link management, registered in `Navigation.tsx`.
5. **Stage 5 (Header Notifications Hub)**: Implement the top-right header notification center with categorized tabs for Product & FRD Updates, Task Changes, and Account Updates.
6. **Stage 6 (Admin Knowledge Base & Versioning)**: Implement the version diff and restore editor in `AdminView.tsx` along with status/tag/hierarchy configuration settings.
