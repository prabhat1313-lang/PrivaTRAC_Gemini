# Architecture Plan: Guided Profile Creation & Header Help/Query System

Architectural evaluation and implementation roadmap for introducing **Guided Profile Creation** and a **Header Help / Query System**, comparing the **Unified Dual-Mode Copilot** versus the **Decoupled Help Center & Command Utility**.

***

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your confirmed choices in Phase 1:
> - **Primary Architectural Model**: **Unified Copilot with Help and SalesOps dual modes** — consolidating operational CRM updates and contextual guidance into a single, cohesive experience.
> - **Profile Creation Triggers**: Multi-step guided wizard triggered on **first-time user onboarding** AND via a **"Complete Profile"** button inside the Account's bubble view.
> - **Query Guidance Depth**: Context-aware answers equipped with **one-click actionable shortcuts** (e.g., direct navigation, autofilled Copilot actions, or instant drawer launches).

***

## 1. Overview & Core Concept

Users in the PrivaSapien CRM require two capabilities:
1. **Guided Profile Setup**: Sales reps, pre-sales architects, and executives need a frictionless 4-step wizard to configure their operational profile (role designation, territory/industry focus, default currency, and PrivaTRAC delegation preferences). This must trigger on first login and on demand via a "Complete Profile" badge/button within an Account's bubble view.
2. **Header Help / Query Module**: A top-bar query interface where users can ask questions ("How do I submit an RFP annexure?", "What is Privacy Epsilon?", "Why is HDFC deal marked stale?") and immediately receive grounded guidance with one-click actions.

Below are the **2 best approaches** for implementing this system.

***

## 2. Approach 1: Unified Dual-Mode Copilot (Recommended)

### Concept & UX Architecture
Transform the existing `SalesOps Copilot` in the header into an omni-channel **PrivaSapien AI Copilot** with two distinct yet interconnected tabs/modes:
- **Tab 1: Action & SalesOps Mode** (Current capability): Natural language parsing of operational CRM mutations (stage transitions, deal values, stances, follow-up tasks) with PrivaTRAC human-in-the-loop review.
- **Tab 2: Help & Knowledge Guide Mode** (New capability): Answers "How to...", product capabilities, compliance rules, and RFP workflows, responding with rich markdown cards and one-click interactive action buttons.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       HEADER (TOP NAVIGATION BAR)                           │
│  [PrivaSapien Logo]   [Quick Search / Ask Query... 🔍]   [✨ Copilot] [User] │
└──────────────────────────────────────┬──────────────────────────────┬───────┘
                                       │                              │
                     ┌─────────────────┴──────────────────────────────┴───────┐
                     ▼                                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      UNIFIED SALESOPS & HELP COPILOT MODAL                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  [ ✨ SalesOps Actions ]          [ 💡 Help & Knowledge Guide (Active) ]    │
├─────────────────────────────────────────────────────────────────────────────┤
│  "How do I configure Differential Privacy Epsilon for State Bank of India?" │
├─────────────────────────────────────────────────────────────────────────────┤
│  💡 Copilot Answer:                                                         │
│  Differential Privacy Epsilon (ε) controls the mathematical privacy budget. │
│  In PrivaSapien CRM, configure this in the Account's Product Matrix tab.    │
│                                                                             │
│  ⚡ One-Click Actionable Shortcuts:                                         │
│  ┌───────────────────────────────────┐ ┌──────────────────────────────────┐ │
│  │ 📂 Open SBI Product Matrix Tab    │ │ 🚀 Start Guided Profile Wizard   │ │
│  └───────────────────────────────────┘ └──────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ ┌──────────────────────────────────┐ │
│  │ 🤖 Switch to SalesOps Action Plan │ │ 📋 View SBI Submission Checklist │ │
│  └───────────────────────────────────┘ └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Guided Profile Creation Integration
- **First-Time Detection**: Checks `currentUser.profileCompleted` in `CrmContext`. If false, auto-opens the `ProfileWizardModal`.
- **Account Bubble View Trigger**: Inside `AccountBubbleView` / `AccountDetailModal`, an ambient status banner renders:
  `Profile Incomplete (60%) · [Complete Profile →]`. Clicking it opens the wizard with the current account pre-linked.
- **Wizard Steps (4-Step Stepper)**:
  1. *Identity & Persona*: Name, designation, business email, and photo/avatar initials.
  2. *Territory & Product Specialization*: Primary region (India, APAC, EMEA, US) and product focus (PETs Core, Synthetic Data Studio).
  3. *Currency & Regional Formatting*: Default display currency (INR ₹ Cr/Lakhs, USD $, SGD S$, EUR €).
  4. *PrivaTRAC Delegation & Governance*: Set authorized "On Behalf Of" delegation permissions and notification preferences.

---

## 3. Approach 2: Decoupled Copilot & Dedicated Command Center Utility

### Concept & UX Architecture
Keep `SalesOps Copilot` strictly focused on CRM state modifications, and introduce a separate, dedicated **Help & Command Center** (`HelpCenterModal` / `Cmd+K` palette) triggered by a `HelpCircle` icon in the header.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       HEADER (TOP NAVIGATION BAR)                           │
│  [PrivaSapien Logo]             [? Help Center]   [✨ SalesOps Copilot]      │
└────────────────────────────────────────┬──────────────────────┬─────────────┘
                                         ▼                      ▼
                     ┌───────────────────────────┐  ┌─────────────────────────┐
                     │   HELP & COMMAND CENTER   │  │   SALESOPS COPILOT      │
                     │ • Search Knowledge Base   │  │ • Parse operational CRM│
                     │ • Feature Documentation   │  │ • Stage & deal values   │
                     │ • Launch Profile Wizard   │  │ • Strict Human Gate     │
                     │ • Handoff to Copilot ───►─┼──┤ • Audit trail logging   │
                     └───────────────────────────┘  └─────────────────────────┘
```

### Guided Profile Creation Integration
- Uses a standalone reusable modal `UserProfileOnboardingModal` that can be triggered independently from:
  1. Header Help Center ("Launch Profile Tour").
  2. First-time login banner.
  3. "Complete Profile" button inside Account detail bubbles.

---

## 4. Architectural Comparison & Trade-Off Analysis

| Criteria | Approach 1: Unified Dual-Mode Copilot (Recommended) | Approach 2: Decoupled Help Center Utility |
| :--- | :--- | :--- |
| **Cognitive Load** | **Low**: Single entry point for both "Help me understand" and "Do this for me". | **Medium**: User must decide whether their question is a "help query" or an "agent command". |
| **Header Real Estate** | **High Density**: Saves header space; unified search bar or clean Copilot button with query input. | **Medium**: Requires adding another icon/button in the top header bar. |
| **Actionable Guidance** | **Superior**: Direct bridge from asking a question to staging a CRM update in the same window. | **Moderate**: Requires explicit cross-modal handoff state or deep-linking. |
| **Code Separation** | Modular within sub-components (`SalesOpsModeView.tsx` & `HelpGuideModeView.tsx`). | Completely separate files and modal roots. |
| **Implementation Complexity** | **Low–Medium**: Extends existing `SalesOpsAgentModal` with a tabbed interface and static KB embeddings. | **Medium**: Requires building a whole new modal, search engine, and handoff bridge. |

***

## 5. Proposed Implementation Specification (Approach 1)

### Component Hierarchy
```
src/
├── components/
│   ├── Header.tsx                         <-- Updated: Omni query input / Copilot trigger
│   ├── SalesOps/
│   │   ├── SalesOpsAgentModal.tsx         <-- Dual-mode tabs: [Actions] & [Help & Guide]
│   │   ├── SalesOpsHelpTab.tsx            <-- Context-aware query responder & 1-click shortcuts
│   │   └── helpKnowledgeBase.ts           <-- Grounded CRM docs, PETs definitions, FAQ dataset
│   ├── Profile/
│   │   ├── ProfileWizardModal.tsx         <-- 4-step guided onboarding wizard
│   │   └── ProfileCompletionBadge.tsx     <-- Reusable "Complete Profile" CTA for Account bubbles
│   └── Accounts/
│       └── AccountDetailModal.tsx         <-- Embedded ProfileCompletionBadge in header
└── context/
    └── CrmContext.tsx                     <-- User profile status state & openHelpQuery()
```

### Next Steps & Decision Gate
Upon approval, we will proceed with implementing **Approach 1 (Unified Dual-Mode Copilot with Guided Profile Creation Wizard)** without disrupting any existing operational workflows.
