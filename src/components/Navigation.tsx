import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';

export type ActiveTab =
  | 'dashboard'
  | 'accounts'
  | 'contacts'
  | 'tasks'
  | 'productMatrix'
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
  const { isPartnerMode, tasks } = useCrm();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const overdueCount = tasks.filter((t) => t.status === 'Overdue').length;

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts' as ActiveTab, label: 'Accounts', icon: Building2 },
    { id: 'contacts' as ActiveTab, label: 'Contacts', icon: Users2 },
    {
      id: 'tasks' as ActiveTab,
      label: 'Tasks',
      icon: CheckSquare2,
      badge: overdueCount > 0 ? `${overdueCount}` : undefined,
    },
    { id: 'productMatrix' as ActiveTab, label: 'Product Matrix', icon: Layers },
    { id: 'demos' as ActiveTab, label: 'Demos & Gaps', icon: Presentation },
    { id: 'partners' as ActiveTab, label: isPartnerMode ? 'Partner Portal' : 'Partner Ecosystem', icon: Handshake },
    { id: 'mailbox' as ActiveTab, label: 'Mailbox & Collateral', icon: Mail },
    { id: 'reports' as ActiveTab, label: 'Reports & Audit', icon: BarChart3 },
    { id: 'admin' as ActiveTab, label: 'Admin', icon: Settings },
  ];

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

  // Ensure active tab is visible when switched
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const activeBtn = el.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    }
    const timer = setTimeout(checkScroll, 350);
    return () => clearTimeout(timer);
  }, [activeTab, checkScroll]);

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -220, behavior: 'smooth' });
    setTimeout(checkScroll, 300);
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 220, behavior: 'smooth' });
    setTimeout(checkScroll, 300);
  };

  return (
    <nav className="bg-slate-50/80 border-b border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Left Scroll Indicator & Button */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pl-2 pr-4 bg-gradient-to-r from-slate-50 via-slate-50/90 to-transparent pointer-events-none">
            <button
              type="button"
              onClick={scrollLeft}
              aria-label="Scroll navigation left"
              className="pointer-events-auto p-1 rounded-full bg-white text-slate-700 shadow-xs border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition flex items-center justify-center cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Items Scrollable Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none scroll-smooth"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                data-tab={item.id}
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

        {/* Right Scroll Indicator & Button */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pr-2 pl-4 bg-gradient-to-l from-slate-50 via-slate-50/90 to-transparent pointer-events-none">
            <button
              type="button"
              onClick={scrollRight}
              aria-label="Scroll navigation right"
              title="More modules (Reports & Admin)"
              className="pointer-events-auto p-1 rounded-full bg-white text-slate-700 shadow-xs border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition flex items-center justify-center cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
