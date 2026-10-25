import {
  RfpTender,
  SowLineItem,
  IntegrationConnector,
  RfpConflictFlag,
  RfpSectionTask,
  PreBidQueryItem,
} from '../types/rfp';

export interface WinBlockerItem {
  id: string;
  title: string;
  impact: string;
  sectionId: string;
}

export interface WinRecommendationItem {
  id: string;
  title: string;
  actionText: string;
  sectionId: string;
  winGain: number; // estimated Win Probability point increase
}

export interface TenderWinMetrics {
  overallWinScore: number; // 0 - 100
  competitiveStance: 'Dominant / High Probability' | 'Strong Contender' | 'Moderate / Gaps Present' | 'High Risk / Unqualified';
  technicalScore: number;
  integrationsScore: number;
  infraScore: number;
  slaVelocityScore: number;
  consortiumScore: number;
  complianceCounts: {
    complied: number;
    partial: number;
    exception: number;
    notComplied: number;
    total: number;
    nativeOrFrdCovered: number;
  };
  keyBlockers: WinBlockerItem[];
  recommendedActions: WinRecommendationItem[];
}

export interface SentinelWarningItem {
  id: string;
  type: 'cutoff_approaching' | 'task_overdue' | 'unapproved_scope' | 'conflict_active' | 'pbq_pending';
  title: string;
  subtitle: string;
  urgency: 'critical' | 'warning' | 'advisory';
  targetSectionId: string;
  targetLabel: string;
}

export const calculateTenderWinMetrics = (
  tender: RfpTender,
  sowList: SowLineItem[],
  integrationsList: IntegrationConnector[],
  conflictFlags: RfpConflictFlag[],
  tasks: RfpSectionTask[],
  pbqList: PreBidQueryItem[]
): TenderWinMetrics => {
  const tenderSow = sowList.filter((s) => s.rfpId === tender.id || !s.rfpId);
  const tenderConnectors = integrationsList.filter((c) => c.rfpId === tender.id || !c.rfpId);
  const tenderTasks = tasks.filter((t) => t.rfpId === tender.id || !t.rfpId);
  const activeConflicts = conflictFlags.filter(
    (c) => (c.rfpId === tender.id || !c.rfpId) && c.status === 'Active'
  );

  // 1. Technical Compliance Score (0-100)
  const totalSow = tenderSow.length || 1;
  let sowScoreSum = 0;
  let complied = 0;
  let partial = 0;
  let exception = 0;
  let notComplied = 0;
  let coveredByFrdOrTool = 0;

  tenderSow.forEach((s) => {
    const hasFrd = s.mappedFrdIds && s.mappedFrdIds.length > 0;
    const has3P = s.requiresThirdPartyTool && s.suggestedThirdPartyTool;

    if (s.complianceStatus === 'Complied') {
      sowScoreSum += 100;
      complied += 1;
      coveredByFrdOrTool += 1;
    } else if (s.complianceStatus === 'Partially Complied') {
      // Partial compliance gets 60, but if mapped to a roadmap FRD or valid 3P tool gets 80
      const score = hasFrd || has3P ? 80 : 60;
      sowScoreSum += score;
      partial += 1;
      if (hasFrd || has3P) coveredByFrdOrTool += 1;
    } else if (s.complianceStatus === 'Exception / Deviation') {
      // Exception gets 30, but if backed by 3P partner pass-through gets 70
      const score = has3P ? 70 : 35;
      sowScoreSum += score;
      exception += 1;
      if (has3P) coveredByFrdOrTool += 1;
    } else {
      notComplied += 1;
      sowScoreSum += 0;
    }
  });

  const technicalScore = Math.min(100, Math.round(sowScoreSum / totalSow));

  // 2. Integration Scope Validation Score (0-100)
  const totalConnectors = tenderConnectors.length || 1;
  const approvedCount = tenderConnectors.filter((c) => {
    if (c.origin === 'Inferred from SoW') {
      return c.isScopeApproved;
    }
    return c.status === 'Validated';
  }).length;
  const integrationsScore = Math.min(100, Math.round((approvedCount / totalConnectors) * 100));

  // 3. Infrastructure & Sizing Integrity Score (0-100)
  // Each active cross-section conflict flag deducts 20 points
  const infraScore = Math.max(20, 100 - activeConflicts.length * 20);

  // 4. Task SLA & Velocity Score (0-100)
  const now = new Date();
  const totalTasks = tenderTasks.length || 1;
  const completedTasks = tenderTasks.filter((t) => t.status === 'Completed').length;
  const overdueTasks = tenderTasks.filter((t) => t.status !== 'Completed' && new Date(t.dueDate) < now).length;
  const inProgressTasks = tenderTasks.filter((t) => t.status === 'In Progress').length;

  const rawSlaScore =
    (completedTasks * 100 + inProgressTasks * 60 - overdueTasks * 40) / totalTasks;
  const slaVelocityScore = Math.max(25, Math.min(100, Math.round(rawSlaScore)));

  // 5. SI Consortium Alignment Score (0-100)
  let consortiumScore = 75;
  if (tender.primarySiPartner && tender.primarySiPartner.length > 0) {
    consortiumScore += 15;
  }
  if (tender.solutionEngineer && tender.preSalesLead) {
    consortiumScore += 10;
  }

  // Weighted Overall Win Probability:
  // Technical (35%) + Integrations (20%) + Infra (15%) + SLA Velocity (20%) + Consortium (10%)
  const overallWinScore = Math.round(
    technicalScore * 0.35 +
      integrationsScore * 0.2 +
      infraScore * 0.15 +
      slaVelocityScore * 0.2 +
      consortiumScore * 0.1
  );

  let competitiveStance: TenderWinMetrics['competitiveStance'] = 'Strong Contender';
  if (overallWinScore >= 80) {
    competitiveStance = 'Dominant / High Probability';
  } else if (overallWinScore >= 65) {
    competitiveStance = 'Strong Contender';
  } else if (overallWinScore >= 50) {
    competitiveStance = 'Moderate / Gaps Present';
  } else {
    competitiveStance = 'High Risk / Unqualified';
  }

  // Compute actionable blockers
  const keyBlockers: WinBlockerItem[] = [];
  const recommendedActions: WinRecommendationItem[] = [];

  // Check unapproved inferred connectors
  const unapprovedConnectors = tenderConnectors.filter(
    (c) => c.origin === 'Inferred from SoW' && !c.isScopeApproved
  );
  if (unapprovedConnectors.length > 0) {
    keyBlockers.push({
      id: 'blk-intg',
      title: `${unapprovedConnectors.length} Inferred SoW Integrations Awaiting Approval`,
      impact: 'Unapproved scope prevents technical review sign-off and adds delivery uncertainty.',
      sectionId: 'integrations',
    });
    recommendedActions.push({
      id: 'rec-intg',
      title: 'Confirm Inferred Integration Scope',
      actionText: `Review and approve ${unapprovedConnectors[0].name}`,
      sectionId: 'integrations',
      winGain: 5,
    });
  }

  // Check active conflict flags
  if (activeConflicts.length > 0) {
    keyBlockers.push({
      id: 'blk-conf',
      title: `${activeConflicts.length} Active Cross-Section Discrepancies`,
      impact: activeConflicts[0].description.slice(0, 80) + '...',
      sectionId: activeConflicts[0].targetSection?.toLowerCase().includes('infra')
        ? 'infraSizing'
        : 'volumeMetrics',
    });
    recommendedActions.push({
      id: 'rec-conf',
      title: 'Reconcile Volume vs Infra Sizing Capacity',
      actionText: 'Apply pending recalculation in Infra Sizing',
      sectionId: 'infraSizing',
      winGain: 6,
    });
  }

  // Check unmapped SoW clauses with Partial or Exception status
  const unmappedDeviations = tenderSow.filter(
    (s) =>
      (s.complianceStatus === 'Partially Complied' || s.complianceStatus === 'Exception / Deviation') &&
      (!s.mappedFrdIds || s.mappedFrdIds.length === 0) &&
      !s.suggestedThirdPartyTool
  );
  if (unmappedDeviations.length > 0) {
    keyBlockers.push({
      id: 'blk-sow',
      title: `${unmappedDeviations.length} SoW Clauses Require Roadmap FRD or 3P Tool Pairing`,
      impact: 'Unmitigated deviations risk disqualification during technical scoring.',
      sectionId: 'sow',
    });
    recommendedActions.push({
      id: 'rec-sow',
      title: 'Map Roadmap FRD or Suggest Alternate Tool',
      actionText: `Map FRD to clause ${unmappedDeviations[0].clauseNumber}`,
      sectionId: 'sow',
      winGain: 7,
    });
  }

  // Check PBQ responses pending
  const pendingPbqs = pbqList.filter(
    (p) => (p.rfpId === tender.id || !p.rfpId) && p.internalStatus !== 'Submitted to Client'
  );
  if (pendingPbqs.length > 0) {
    recommendedActions.push({
      id: 'rec-pbq',
      title: 'Submit Clarification Queries',
      actionText: `${pendingPbqs.length} PBQ drafts ready for client submission`,
      sectionId: 'pbq',
      winGain: 4,
    });
  }

  return {
    overallWinScore,
    competitiveStance,
    technicalScore,
    integrationsScore,
    infraScore,
    slaVelocityScore,
    consortiumScore,
    complianceCounts: {
      complied,
      partial,
      exception,
      notComplied,
      total: totalSow,
      nativeOrFrdCovered: coveredByFrdOrTool,
    },
    keyBlockers,
    recommendedActions,
  };
};

export const generateSentinelWarnings = (
  tender: RfpTender,
  conflictFlags: RfpConflictFlag[],
  integrationsList: IntegrationConnector[],
  tasks: RfpSectionTask[],
  pbqList: PreBidQueryItem[]
): SentinelWarningItem[] => {
  const warnings: SentinelWarningItem[] = [];
  const now = new Date();

  // 1. Check PBQ Cutoff Date
  if (tender.pbqCutoffDate) {
    const cutoff = new Date(tender.pbqCutoffDate);
    const diffDays = Math.ceil((cutoff.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= 7) {
      warnings.push({
        id: 'sent-pbq-cutoff',
        type: 'cutoff_approaching',
        title: `Pre-Bid Query Cutoff in ${diffDays === 0 ? 'Today' : `${diffDays} days`}`,
        subtitle: `Client submission window closes on ${tender.pbqCutoffDate}. Review pending queries.`,
        urgency: diffDays <= 3 ? 'critical' : 'warning',
        targetSectionId: 'pbq',
        targetLabel: 'View Pre-Bid Queries',
      });
    }
  }

  // 2. Check Submission Deadline
  if (tender.submissionDeadline) {
    const subDate = new Date(tender.submissionDeadline);
    const diffDays = Math.ceil((subDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= 14) {
      warnings.push({
        id: 'sent-submission-cutoff',
        type: 'cutoff_approaching',
        title: `Final Tender Submission in ${diffDays} days`,
        subtitle: `Tender seals freeze on ${tender.submissionDeadline}. Complete executive sign-offs.`,
        urgency: diffDays <= 5 ? 'critical' : 'warning',
        targetSectionId: 'dashboard',
        targetLabel: 'Review Tender Readiness',
      });
    }
  }

  // 3. Check Active Cross-Section Conflicts
  const activeConflicts = conflictFlags.filter(
    (c) => (c.rfpId === tender.id || !c.rfpId) && c.status === 'Active'
  );
  if (activeConflicts.length > 0) {
    warnings.push({
      id: 'sent-conflict',
      type: 'conflict_active',
      title: `${activeConflicts.length} Active Cross-Section Conflict Detected`,
      subtitle: activeConflicts[0].title,
      urgency: 'critical',
      targetSectionId: 'infraSizing',
      targetLabel: 'Resolve Inconsistencies',
    });
  }

  // 4. Check Unapproved Inferred Integrations
  const unapprovedInferred = integrationsList.filter(
    (c) => (c.rfpId === tender.id || !c.rfpId) && c.origin === 'Inferred from SoW' && !c.isScopeApproved
  );
  if (unapprovedInferred.length > 0) {
    warnings.push({
      id: 'sent-unapproved-intg',
      type: 'unapproved_scope',
      title: `${unapprovedInferred.length} Inferred SoW Integrations Awaiting Pre-Sales Scope Review`,
      subtitle: `e.g. ${unapprovedInferred[0].name} requires technical confirmation.`,
      urgency: 'warning',
      targetSectionId: 'integrations',
      targetLabel: 'Approve Scope',
    });
  }

  // 5. Check Overdue Tasks
  const overdueTasks = tasks.filter(
    (t) => (t.rfpId === tender.id || !t.rfpId) && t.status !== 'Completed' && new Date(t.dueDate) < now
  );
  if (overdueTasks.length > 0) {
    warnings.push({
      id: 'sent-overdue-tasks',
      type: 'task_overdue',
      title: `${overdueTasks.length} Tender Tasks Overdue SLA Target`,
      subtitle: `Urgent: "${overdueTasks[0].title}" assigned to ${overdueTasks[0].assignee}`,
      urgency: 'critical',
      targetSectionId: overdueTasks[0].sectionId || 'projectPlan',
      targetLabel: 'Inspect Task Delays',
    });
  }

  return warnings;
};
