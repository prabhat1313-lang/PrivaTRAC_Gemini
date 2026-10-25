import React, { useState, useMemo } from 'react';
import { useRfp } from '../../context/RfpContext';
import { useCrm } from '../../context/CrmContext';
import {
  FileSpreadsheet,
  Layers,
  ShieldAlert,
  FileCheck,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Sliders,
  Award,
  FileText,
  Scale,
  HelpCircle,
  FileQuestion,
  BarChart3,
  Cpu,
  Truck,
  Users,
  Headphones,
  Coins,
  CreditCard,
  ChevronDown,
  Settings2,
  X,
  Network,
  AlertCircle,
  Bell,
  ArrowRight,
} from 'lucide-react';
import { generateSentinelWarnings, SentinelWarningItem } from '../../utils/rfpWinCalculations';
import { RfpDashboardTab } from './RfpDashboardTab';
import { PreBidQueriesSection } from './PreBidQueriesSection';
import { SoWReviewSection } from './SoWReviewSection';
import { VolumeMetricsSection } from './VolumeMetricsSection';
import { InfraSizingSection } from './InfraSizingSection';
import { XBomSection } from './XBomSection';
import { IntegrationsScopeReviewSection } from './IntegrationsScopeReviewSection';
import { EligibilityCriteriaSection } from './EligibilityCriteriaSection';
import { TechnicalScoringSection } from './TechnicalScoringSection';
import { LegalClausesSection } from './LegalClausesSection';
import { OtherConsiderationsSection } from './OtherConsiderationsSection';
import { ProjectPlanSection } from './ProjectPlanSection';
import { CriticalDeliverablesSection } from './CriticalDeliverablesSection';
import { TeamResourcesSection } from './TeamResourcesSection';
import { SupportManpowerSection } from './SupportManpowerSection';
import { CommercialPlanningSection } from './CommercialPlanningSection';
import { PaymentTermsSection } from './PaymentTermsSection';
import { ConflictFlagsModal } from './ConflictFlagsModal';
import { PreSalesReviewQueueModal } from './PreSalesReviewQueueModal';
import { ScrollableNavContainer } from '../Common/ScrollableNavContainer';

export type RfpSectionKey =
  | 'dashboard'
  | 'eligibility'
  | 'technicalScoring'
  | 'sow'
  | 'legal'
  | 'pbq'
  | 'otherConsiderations'
  | 'volumeMetrics'
  | 'infraSizing'
  | 'xbom'
  | 'integrations'
  | 'projectPlan'
  | 'criticalDeliverables'
  | 'projectTeam'
  | 'supportManpower'
  | 'commercialPlanning'
  | 'paymentTerms';

export const RfpWorkDeskView: React.FC = () => {
  const {
    tenders,
    selectedTenderId,
    setSelectedTenderId,
    selectedTender,
    activeConflictCount,
    reviewQueue,
    updateTenderActiveSections,
    conflictFlags,
    integrationsList,
    tasks,
    pbqList,
  } = useRfp();
  const { currentUser } = useCrm();

  const [activeSection, setActiveSection] = useState<RfpSectionKey>('dashboard');
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [isReviewQueueOpen, setIsReviewQueueOpen] = useState(false);
  const [isTemplatizingOpen, setIsTemplatizingOpen] = useState(false);

  // SLA Early-Warning Sentinel alerts
  const sentinelWarnings = useMemo(
    () => generateSentinelWarnings(selectedTender, conflictFlags, integrationsList, tasks, pbqList),
    [selectedTender, conflictFlags, integrationsList, tasks, pbqList]
  );

  const sectionsList: {
    id: RfpSectionKey;
    label: string;
    cluster: 'Overview' | 'Governance' | 'Architecture' | 'Delivery' | 'Commercials';
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'dashboard', label: 'RFP Central Dashboard', cluster: 'Overview', icon: Layers },
    // Cluster 1
    { id: 'eligibility', label: 'Eligibility Criteria', cluster: 'Governance', icon: Award },
    { id: 'technicalScoring', label: 'Technical Scoring Simulation', cluster: 'Governance', icon: Sliders },
    { id: 'sow', label: 'Scope of Work (SoW) Review', cluster: 'Governance', icon: FileText },
    { id: 'legal', label: 'Legal Clauses Review', cluster: 'Governance', icon: Scale },
    { id: 'pbq', label: 'Pre-Bid Queries (PBQ)', cluster: 'Governance', icon: HelpCircle },
    { id: 'otherConsiderations', label: 'Other Considerations', cluster: 'Governance', icon: FileQuestion },
    // Cluster 2
    { id: 'volumeMetrics', label: 'Volume Metrics', cluster: 'Architecture', icon: BarChart3 },
    { id: 'infraSizing', label: 'Infra Sizing', cluster: 'Architecture', icon: Cpu },
    { id: 'xbom', label: 'X-BOM Suite (SBOM/CBOM/AIBOM)', cluster: 'Architecture', icon: Layers },
    // Shared Sub-Section (Architecture & Delivery)
    { id: 'integrations', label: 'Integrations Scope Review', cluster: 'Architecture', icon: Network },
    // Cluster 3
    { id: 'projectPlan', label: 'Project Plan & Timelines', cluster: 'Delivery', icon: Calendar },
    { id: 'criticalDeliverables', label: 'Critical Deliverables', cluster: 'Delivery', icon: FileCheck },
    { id: 'projectTeam', label: 'Project Team / Resources', cluster: 'Delivery', icon: Users },
    { id: 'supportManpower', label: 'Support Manpower Planning', cluster: 'Delivery', icon: Headphones },
    // Cluster 4
    { id: 'commercialPlanning', label: 'Commercial Planning', cluster: 'Commercials', icon: Coins },
    { id: 'paymentTerms', label: 'Payment Terms Review', cluster: 'Commercials', icon: CreditCard },
  ];

  const formatValueInr = (val: number, curr: string) => {
    if (curr === 'INR') {
      const cr = val / 10000000;
      return `₹${cr.toFixed(2)} Cr`;
    }
    const prefix = curr === 'SGD' ? 'S$' : '$';
    return `${prefix}${(val / 1000000).toFixed(2)}M`;
  };

  const handleToggleSectionTemplate = (sectionId: string) => {
    const current = selectedTender.activeTemplateSections || [];
    const updated = current.includes(sectionId)
      ? current.filter((s) => s !== sectionId)
      : [...current, sectionId];
    updateTenderActiveSections(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Tender Selector, Metadata, and Primary Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Tender Selector */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded">
                Active Tender Workspace
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {selectedTender.tenderNumber}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedTenderId}
                onChange={(e) => setSelectedTenderId(e.target.value)}
                className="text-base font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 max-w-md truncate"
              >
                {tenders.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.clientName} · {t.title.slice(0, 48)}... ({formatValueInr(t.estimatedValue, t.currency)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Active Conflicts Button */}
            <button
              type="button"
              onClick={() => setIsConflictModalOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer ${
                activeConflictCount > 0
                  ? 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>{activeConflictCount} Conflict Flags</span>
              {activeConflictCount > 0 && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
              )}
            </button>

            {/* Pre-Sales Review Queue Button */}
            <button
              type="button"
              onClick={() => setIsReviewQueueOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-300 text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-indigo-600" />
              <span>Review Queue</span>
              {reviewQueue.length > 0 && (
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                  {reviewQueue.length}
                </span>
              )}
            </button>

            {/* Adaptive Template Customizer */}
            <button
              type="button"
              onClick={() => setIsTemplatizingOpen(true)}
              title="Customize active section template for this RFP"
              className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs transition cursor-pointer"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* High-Density Tender Metadata Strip */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Estimated TCV</div>
            <div className="font-bold text-slate-900 tabular-nums">
              {formatValueInr(selectedTender.estimatedValue, selectedTender.currency)}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Submission Deadline</div>
            <div className="font-bold text-slate-900 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-indigo-600" />
              <span>{selectedTender.submissionDeadline}</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">PBQ Cutoff</div>
            <div className="font-bold text-amber-700 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>{selectedTender.pbqCutoffDate}</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Pre-Sales Lead</div>
            <div className="font-bold text-slate-800">{selectedTender.preSalesLead}</div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Solution Engineer / SI</div>
            <div className="font-semibold text-slate-700 truncate">
              {selectedTender.solutionEngineer} · {selectedTender.primarySiPartner.split(' ')[0]}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Readiness Score</div>
            <div className="font-bold text-emerald-600 tabular-nums flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{selectedTender.overallCompletion}% Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* SLA Early-Warning Sentinel Ribbon */}
      {sentinelWarnings.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-200/90 shadow-xs p-3 space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-amber-100">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                PrivaTRAC SLA Sentinel · Early-Warning Radar
              </span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.2 rounded border border-amber-200">
                {sentinelWarnings.length} Active Items
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Automated delivery risk & milestone cutoff monitor
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {sentinelWarnings.slice(0, 4).map((warn: SentinelWarningItem) => {
              const isCrit = warn.urgency === 'critical';
              return (
                <div
                  key={warn.id}
                  className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 ${
                    isCrit
                      ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                      : 'bg-amber-50/60 border-amber-200/80 text-amber-950'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          isCrit ? 'bg-rose-600' : 'bg-amber-600'
                        }`}
                      />
                      <span>{warn.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 truncate max-w-sm sm:max-w-md">
                      {warn.subtitle}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveSection(warn.targetSectionId as RfpSectionKey)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold shrink-0 transition flex items-center gap-1 cursor-pointer shadow-2xs ${
                      isCrit
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    <span>{warn.targetLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cluster & Section Horizontal Tab Navigation with Standard Scroll Arrows */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-1.5">
        <ScrollableNavContainer innerClassName="flex items-center gap-1 text-xs">
          {sectionsList.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{sec.label}</span>
                {sec.id === 'integrations' && (
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                    Shared Sub-Section
                  </span>
                )}
              </button>
            );
          })}
        </ScrollableNavContainer>
      </div>

      {/* Active Section Content Renderer */}
      <div className="transition-all duration-150">
        {activeSection === 'dashboard' && (
          <RfpDashboardTab
            onSelectSection={(secId) => setActiveSection(secId as RfpSectionKey)}
            onOpenConflictModal={() => setIsConflictModalOpen(true)}
            onOpenReviewQueue={() => setIsReviewQueueOpen(true)}
          />
        )}
        {activeSection === 'eligibility' && <EligibilityCriteriaSection />}
        {activeSection === 'technicalScoring' && <TechnicalScoringSection />}
        {activeSection === 'sow' && <SoWReviewSection />}
        {activeSection === 'legal' && <LegalClausesSection />}
        {activeSection === 'pbq' && <PreBidQueriesSection />}
        {activeSection === 'otherConsiderations' && <OtherConsiderationsSection />}
        {activeSection === 'volumeMetrics' && <VolumeMetricsSection />}
        {activeSection === 'infraSizing' && <InfraSizingSection />}
        {activeSection === 'xbom' && <XBomSection />}
        {activeSection === 'integrations' && <IntegrationsScopeReviewSection />}
        {activeSection === 'projectPlan' && <ProjectPlanSection />}
        {activeSection === 'criticalDeliverables' && <CriticalDeliverablesSection />}
        {activeSection === 'projectTeam' && <TeamResourcesSection />}
        {activeSection === 'supportManpower' && <SupportManpowerSection />}
        {activeSection === 'commercialPlanning' && <CommercialPlanningSection />}
        {activeSection === 'paymentTerms' && <PaymentTermsSection />}
      </div>

      {/* Cross-Section Conflict Flags Modal */}
      {isConflictModalOpen && (
        <ConflictFlagsModal
          onClose={() => setIsConflictModalOpen(false)}
          onNavigateToSection={(sec) => {
            setIsConflictModalOpen(false);
            setActiveSection(sec as RfpSectionKey);
          }}
        />
      )}

      {/* Pre-Sales Actionable Review Queue Modal */}
      {isReviewQueueOpen && (
        <PreSalesReviewQueueModal onClose={() => setIsReviewQueueOpen(false)} />
      )}

      {/* Adaptive Section Templatizing Modal */}
      {isTemplatizingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Adaptive RFP Section Templatizing
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTemplatizingOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Customize active sections for <strong>{selectedTender.clientName}</strong>. Non-applicable sections can be hidden without deleting data.
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
              {sectionsList
                .filter((s) => s.id !== 'dashboard')
                .map((sec) => {
                  const isChecked = selectedTender.activeTemplateSections?.includes(sec.id);
                  return (
                    <label
                      key={sec.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      <span className="font-semibold text-slate-800">{sec.label}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSectionTemplate(sec.id)}
                        className="rounded text-indigo-600"
                      />
                    </label>
                  );
                })}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsTemplatizingOpen(false)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
