import { EmailMessage, OutlookConnectionStatus } from '../types/mailbox';

export const initialOutlookStatus: OutlookConnectionStatus = {
  isConnected: true,
  connectedAccountEmail: 'ananya.sharma@privasapien.com',
  connectedAccountName: 'Ananya Sharma (Pre-Sales Lead)',
  tenantId: 'privasapien-m365-tenant.onmicrosoft.com',
  lastDeltaSyncAt: '2026-10-25T02:00:00Z',
  syncMode: 'simulated_sandbox',
  unreadCount: 3,
};

export const initialEmailMessages: EmailMessage[] = [
  {
    id: 'msg-sbi-01',
    internetMessageId: '<sbi-rfp-2026-04-clarif-019@sbi.co.in>',
    conversationId: 'conv-sbi-hsm-01',
    from: {
      name: 'Arvind Venkatesh (Chief Technology Officer)',
      email: 'arvind.venkatesh@sbi.co.in',
    },
    to: [
      {
        name: 'Ananya Sharma',
        email: 'ananya.sharma@privasapien.com',
      },
    ],
    cc: [
      {
        name: 'Vikram Malhotra',
        email: 'vikram.malhotra@privasapien.com',
      },
      {
        name: 'SBI IT Procurement Desk',
        email: 'it.procurement@sbi.co.in',
      },
    ],
    subject: 'State Bank of India RFP: Clarification on Section 6.2.1 HSM PKCS#11 Validation',
    bodyPreview:
      'Following up on Section 6.2.1 of Tender RFP/SBI/IT/2026/04, please provide the Thales Luna 7.3 firmware test certificate...',
    bodyText: `Dear Ananya,

Following up on Section 6.2.1 of our tender specification (Tender Ref: RFP/SBI/IT/2026/04), the Bank's Information Security Review Council has evaluated your initial response.

While we note PrivaSapien's native support for PKCS#11 interfaces, we require explicit confirmation and firmware validation reports for the Thales Luna PCIe HSM 7000 appliance (firmware 7.3+).

Specifically, please clarify:
1. Does the Differential Privacy key generation engine store transient session keys in volatile RAM or directly within the HSM cryptographic partition?
2. Can your consortium partner (TCS) provide on-site installation support in our Belapur Tier-4 data center within the stipulated 5-week delivery window?

Please submit this clarification prior to the Pre-Bid Query cutoff date on October 28, 2026.

Sincerely,
Arvind Venkatesh
Chief Technology Officer & Head of IT Procurement
State Bank of India, Corporate Centre, Mumbai`,
    receivedDateTime: '2026-10-25T01:45:00Z',
    isRead: false,
    hasAttachments: true,
    folder: 'inbox',
    category: 'Client Clarification',
    matchedAccountId: 'acc-1',
    matchedAccountName: 'State Bank of India',
    matchedTenderId: 'rfp-sbi-01',
    matchedTenderNumber: 'RFP/SBI/IT/2026/04',
    detectedClauseRef: 'Section 6.2.1',
    attachments: [
      {
        id: 'att-sbi-01',
        name: 'SBI_RFP_IT_2026_04_Corrigendum_3_Annexure_B.pdf',
        size: '1.8 MB',
        type: 'application/pdf',
      },
    ],
  },
  {
    id: 'msg-nha-02',
    internetMessageId: '<abdm-pets-corrigendum-002@abdm.gov.in>',
    conversationId: 'conv-nha-sandbox-02',
    from: {
      name: 'Dr. Suresh R. (Director of Digital Health & Anonymization)',
      email: 'dr.suresh@abdm.gov.in',
    },
    to: [
      {
        name: 'Ananya Sharma',
        email: 'ananya.sharma@privasapien.com',
      },
    ],
    cc: [
      {
        name: 'Priya Iyer',
        email: 'priya.iyer@privasapien.com',
      },
    ],
    subject: 'NHA Health Data Sandbox: Pre-Bid Corrigendum #2 & Query Cutoff Extension',
    bodyPreview:
      'Notice is hereby given that the Pre-Bid Query cutoff date for Tender RFP/NHA/PETS/2026/09 has been extended to November 10, 2026...',
    bodyText: `Dear Bidders,

Notice is hereby given that the Pre-Bid Query (PBQ) cutoff date for Tender Ref: RFP/NHA/PETS/2026/09 (National Anonymized Health Data Sandbox & Synthetic Health Record Generation Engine) has been extended to November 10, 2026.

The Authority has published Corrigendum #2 addressing questions on Conditional Tabular GAN (CTGAN) generation volumes and Differential Privacy Renyi epsilon budget ledgering.

Please ensure all revised technical architecture annexures and SI partnership consortium letters (Infosys) are uploaded to the ABDM e-procurement portal.

Regards,
Dr. Suresh R.
Director of Digital Health
National Health Authority (ABDM), New Delhi`,
    receivedDateTime: '2026-10-24T18:20:00Z',
    isRead: false,
    hasAttachments: true,
    folder: 'inbox',
    category: 'RFP Tender',
    matchedAccountId: 'acc-2',
    matchedAccountName: 'National Health Authority (ABDM)',
    matchedTenderId: 'rfp-nha-02',
    matchedTenderNumber: 'RFP/NHA/PETS/2026/09',
    detectedClauseRef: 'Section 4.2.3',
    attachments: [
      {
        id: 'att-nha-01',
        name: 'NHA_Corrigendum_2_Technical_Specifications.pdf',
        size: '3.4 MB',
        type: 'application/pdf',
      },
    ],
  },
  {
    id: 'msg-apollo-03',
    internetMessageId: '<apollo-clinical-demo-2026@apollohospitals.com>',
    conversationId: 'conv-apollo-poc-03',
    from: {
      name: 'Dr. K. Padmanabhan (VP of Clinical Informatics)',
      email: 'k.padmanabhan@apollohospitals.com',
    },
    to: [
      {
        name: 'Ananya Sharma',
        email: 'ananya.sharma@privasapien.com',
      },
    ],
    cc: [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@privasapien.com',
      },
    ],
    subject: 'Apollo Hospitals Clinical Informatics Council: Differential Privacy Demo Scheduling & NDA',
    bodyPreview:
      'We have reserved the oncology boardroom for Wednesday at 2:00 PM for the PrivaSapien Differential Privacy Sandbox presentation...',
    bodyText: `Hi Ananya,

Our clinical informatics review board and medical ethics committee have reviewed your preliminary briefing on PrivaSapien's Differential Privacy Sandbox.

We have reserved the main oncology boardroom in Chennai for Wednesday at 2:00 PM IST for your technical demonstration. 

Before the session, our legal team requests an executed mutual Non-Disclosure Agreement (NDA) covering patient longitudinal records and synthetic cohort generation tests.

Please confirm if your pre-sales engineering team can demonstrate:
1. Epsilon composition budgeting on 1.2M oncology biopsy records.
2. Real-time re-identification risk metrics under DPDP 2023 deemed consent rules.

Looking forward to your team's presentation.

Best regards,
Dr. K. Padmanabhan
VP of Clinical Informatics
Apollo Hospitals Enterprise Limited`,
    receivedDateTime: '2026-10-24T16:15:00Z',
    isRead: false,
    hasAttachments: false,
    folder: 'inbox',
    category: 'PoC Scheduling',
    matchedAccountId: 'acc-3',
    matchedAccountName: 'Apollo Hospitals',
    // Non-RFP Commercial Deal
  },
  {
    id: 'msg-dbs-04',
    internetMessageId: '<dbs-mas-feat-ai-gov-2026@dbs.com>',
    conversationId: 'conv-dbs-mas-04',
    from: {
      name: 'Eileen Cheong (Head of Responsible AI & Model Risk)',
      email: 'eileencheong@dbs.com',
    },
    to: [
      {
        name: 'Ananya Sharma',
        email: 'ananya.sharma@privasapien.com',
      },
    ],
    subject: 'MAS FEAT AI Governance Review: Model Card & Fairness Attestation Requirements',
    bodyPreview:
      'Our AI Model Risk Committee in Singapore has reviewed PrivaSapien Synthetic Data Studio against the Monetary Authority of Singapore (MAS) FEAT principles...',
    bodyText: `Dear Ananya,

Our AI Model Risk Committee in Singapore has reviewed PrivaSapien Synthetic Data Studio against the Monetary Authority of Singapore (MAS) FEAT principles (Fairness, Ethics, Accountability, and Transparency).

We are prepared to proceed with the commercial proposal for the Singapore digital banking unit provided PrivaSapien delivers an automated Model Card generation module that certifies demographic parity across retail credit scoring models.

Please provide your standard commercial schedule and Master Service Agreement (MSA) rider by Friday.

Warm regards,
Eileen Cheong
Head of Responsible AI & Model Risk
DBS Bank Limited, Marina Bay Financial Centre, Singapore`,
    receivedDateTime: '2026-10-23T11:30:00Z',
    isRead: true,
    hasAttachments: false,
    folder: 'inbox',
    category: 'Commercial & Legal',
    matchedAccountId: 'acc-5',
    matchedAccountName: 'DBS Bank',
    // Non-RFP Commercial Deal
  },
  {
    id: 'msg-sent-01',
    internetMessageId: '<privasapien-outbound-sbi-attest-001@privasapien.com>',
    conversationId: 'conv-sbi-hsm-01',
    from: {
      name: 'Ananya Sharma (Pre-Sales Lead)',
      email: 'ananya.sharma@privasapien.com',
    },
    to: [
      {
        name: 'Arvind Venkatesh',
        email: 'arvind.venkatesh@sbi.co.in',
      },
    ],
    cc: [
      {
        name: 'Vikram Malhotra',
        email: 'vikram.malhotra@privasapien.com',
      },
    ],
    subject: 'PrivaSapien PETs Platform • Tier-1 FIPS-140-3 Cryptographic Attestation & Architecture Whitepaper',
    bodyPreview:
      'Following up on our architecture board review for the State Bank of India differential privacy deployment...',
    bodyText: `Dear Arvind,

Following up on our architecture board review for the State Bank of India differential privacy deployment (RFP/SBI/IT/2026/04), I have attached our official FIPS-140-3 cryptography attestation certificate and architecture whitepaper.

Please let me know when your security council is available to review the hardware security module (HSM) key boundaries.

Best regards,
Ananya Sharma
Pre-Sales Lead | PrivaSapien Technologies
Enterprise Security & Differential Privacy Architecture
Notice: PrivaSapien Enterprise Communications • Confidential & Proprietary`,
    receivedDateTime: '2026-10-23T09:15:00Z',
    isRead: true,
    hasAttachments: true,
    folder: 'sent',
    category: 'RFP Tender',
    matchedAccountId: 'acc-1',
    matchedAccountName: 'State Bank of India',
    matchedTenderId: 'rfp-sbi-01',
    matchedTenderNumber: 'RFP/SBI/IT/2026/04',
    attachedCollateralIds: ['col-1', 'col-3'],
    attachments: [
      {
        id: 'att-sent-01',
        name: 'PrivaSapien_FIPS140_3_Cryptographic_Attestation.pdf',
        size: '2.1 MB',
        type: 'application/pdf',
        isPrivasapienCollateral: true,
      },
      {
        id: 'att-sent-02',
        name: 'PrivaSapien_PETs_Core_Architecture_Whitepaper.pdf',
        size: '4.6 MB',
        type: 'application/pdf',
        isPrivasapienCollateral: true,
      },
    ],
  },
];
