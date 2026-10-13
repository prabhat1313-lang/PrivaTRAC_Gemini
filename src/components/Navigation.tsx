import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users2,
  CheckSquare2,
  Presentation,
  Handshake,
  Mail,
  BarChart3,
  Settings,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';

export type ActiveTab =
  | 'dashboard'
  | 'accounts'
  | 'contacts'
  | 'tasks'
  | 'demos'
  | 'partners'
  | 'mailbox'
  | 'reports'
  | 'admin';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, isPartnerMode, tasks } = useCrm();

  const overdueCount = tasks.filter((t) => t.status === 'Overdue').length;

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts' as ActiveTab, label: 'Accounts & Kanban', icon: Building2 },
    { id: 'contacts' as ActiveTab, label: 'Contacts (CBAC)', icon: Users2 },
    {
      id: 'tasks' as ActiveTab,
      label: 'Tasks & RFPs',
      icon: CheckSquare2,
      badge: overdueCount > 0 ? `${overdueCount}` : undefined,
    },
    { id: 'demos' as ActiveTab, label: 'Demos & Gaps', icon: Presentation },
    { id: 'partners' as ActiveTab, label: isPartnerMode ? 'Partner Portal' : 'Partner Ecosystem', icon: Handshake },
    { id: 'mailbox' as ActiveTab, label: 'Mailbox & Collateral', icon: Mail },
    { id: 'reports' as ActiveTab, label: 'Reports & Audit', icon: BarChart3 },
    ...(currentUser.role === 'Administrator' || currentUser.role === 'Leader'
      ? [{ id: 'admin' as ActiveTab, label: 'Admin', icon: Settings }]
      : []),
  ];

  return (
    <nav className="bg-slate-50/80 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200 font-semibold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-800' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 tabular-nums">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
