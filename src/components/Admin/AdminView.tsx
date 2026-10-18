import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Settings,
  Users,
  ShieldCheck,
  Sliders,
  GitBranch,
  Handshake,
  FileText,
  Upload,
  Coins,
  Shield,
  Layers,
  Database,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { GeneralSettingsAdminTab } from './GeneralSettingsAdminTab';
import { UsersAdminTab } from './UsersAdminTab';
import { RolesAdminTab } from './RolesAdminTab';
import { FieldConfigsAdminTab } from './FieldConfigsAdminTab';
import { WorkflowsAdminTab } from './WorkflowsAdminTab';
import { PartnersAdminTab } from './PartnersAdminTab';
import { CollateralsAdminTab } from './CollateralsAdminTab';
import { DataImportAdminTab } from './DataImportAdminTab';
import { AdminAuditTab } from './AdminAuditTab';
import { ProductKnowledgeBaseAdminTab } from './ProductKnowledgeBaseAdminTab';
import { ProductMatrixConfigAdminTab } from './ProductMatrixConfigAdminTab';
import { History, BookOpen } from 'lucide-react';

export type AdminSubTab =
  | 'general'
  | 'knowledgeBase'
  | 'matrixConfig'
  | 'users'
  | 'roles'
  | 'fields'
  | 'workflows'
  | 'partners'
  | 'collaterals'
  | 'imports'
  | 'audit';

export const AdminView: React.FC = () => {
  const {
    currentUser,
    users,
    teams,
    roles,
    workflows,
    customFields,
    collaterals,
    partnerSwotList,
    adminAuditTrail,
    productContextVersions,
    productMatrixRequirements,
  } = useCrm();
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('general');

  const adminTabs: {
    id: AdminSubTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    badge?: string;
  }[] = [
    { id: 'general', label: 'General & Exchange Rates', icon: Coins, badge: 'Base: INR' },
    {
      id: 'knowledgeBase',
      label: 'Product Context & KB',
      icon: BookOpen,
      count: productContextVersions?.length,
      badge: 'v1.0',
    },
    {
      id: 'matrixConfig',
      label: 'Product Matrix Config',
      icon: Layers,
      count: productMatrixRequirements?.length,
    },
    { id: 'users', label: 'Users & Teams', icon: Users, count: users?.length },
    { id: 'roles', label: 'Roles & RBAC Matrix', icon: ShieldCheck, count: roles?.length },
    { id: 'fields', label: 'Field Configurations', icon: Sliders, count: customFields?.length },
    { id: 'workflows', label: 'Workflows & SLAs', icon: GitBranch, count: workflows?.length },
    { id: 'partners', label: 'Partner Ecosystem', icon: Handshake, count: partnerSwotList?.length },
    { id: 'collaterals', label: 'Marketing Collaterals', icon: FileText, count: collaterals?.length },
    { id: 'imports', label: 'Bulk Data Ingestion', icon: Upload, badge: 'CSV' },
    { id: 'audit', label: 'Admin Audit Trail', icon: History, count: adminAuditTrail?.length },
  ];

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll]);

  // Ensure active sub-tab is scrolled into view
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const activeBtn = el.querySelector(`[data-tab="${activeSubTab}"]`) as HTMLElement;
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    }
    const timer = setTimeout(checkScroll, 350);
    return () => clearTimeout(timer);
  }, [activeSubTab, checkScroll]);

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -220, behavior: 'smooth' });
    setTimeout(checkScroll, 300);
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 220, behavior: 'smooth' });
    setTimeout(checkScroll, 300);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-2xs">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                System Administration & Governance Console
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized management of security roles, 4-tier permissions, dynamic entity schemas, SLA workflows, and corporate settings
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs flex items-center gap-2">
            <span className="text-slate-500 text-[11px] font-medium">Active Session:</span>
            <span className="font-bold text-slate-800">{currentUser.name}</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
              {currentUser.role}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Navigation Strip with Scroll Indicators */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-2xs relative">
        {/* Left Scroll Arrow */}
        {canScrollLeft && (
          <div className="absolute left-1 top-0 bottom-0 z-10 flex items-center pl-1 pr-4 bg-gradient-to-r from-white via-white/95 to-transparent pointer-events-none rounded-l-xl">
            <button
              type="button"
              onClick={scrollLeft}
              aria-label="Scroll admin sub-tabs left"
              className="pointer-events-auto p-1 rounded-full bg-white text-slate-700 shadow-xs border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition flex items-center justify-center cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex space-x-1 overflow-x-auto scrollbar-none py-0.5 scroll-smooth"
        >
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                data-tab={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold tabular-nums ${
                      isActive
                        ? 'bg-slate-800 text-slate-200 border border-slate-700'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        {canScrollRight && (
          <div className="absolute right-1 top-0 bottom-0 z-10 flex items-center pr-1 pl-4 bg-gradient-to-l from-white via-white/95 to-transparent pointer-events-none rounded-r-xl">
            <button
              type="button"
              onClick={scrollRight}
              aria-label="Scroll admin sub-tabs right"
              className="pointer-events-auto p-1 rounded-full bg-white text-slate-700 shadow-xs border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition flex items-center justify-center cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Tab Panels */}
      <div>
        {activeSubTab === 'general' && <GeneralSettingsAdminTab />}
        {activeSubTab === 'knowledgeBase' && <ProductKnowledgeBaseAdminTab />}
        {activeSubTab === 'matrixConfig' && <ProductMatrixConfigAdminTab />}
        {activeSubTab === 'users' && <UsersAdminTab />}
        {activeSubTab === 'roles' && <RolesAdminTab />}
        {activeSubTab === 'fields' && <FieldConfigsAdminTab />}
        {activeSubTab === 'workflows' && <WorkflowsAdminTab />}
        {activeSubTab === 'partners' && <PartnersAdminTab />}
        {activeSubTab === 'collaterals' && <CollateralsAdminTab />}
        {activeSubTab === 'imports' && <DataImportAdminTab />}
        {activeSubTab === 'audit' && <AdminAuditTab />}
      </div>
    </div>
  );
};
