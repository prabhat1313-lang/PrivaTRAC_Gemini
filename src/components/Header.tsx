import React, { useState } from 'react';
import {
  ShieldCheck,
  RotateCcw,
  Plus,
  ChevronDown,
  UserCheck,
  Sparkles,
  Bell,
  CheckCheck,
  Layers,
  CheckSquare2,
  Building2,
  X,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { UserRole } from '../types/crm';
import { SalesOpsAgentModal } from './SalesOps/SalesOpsAgentModal';

interface HeaderProps {
  onOpenAddAccount?: () => void;
  onOpenReminders?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddAccount, onNavigateTab }) => {
  const {
    currentUser,
    setCurrentUser,
    switchRole,
    users,
    onBehalfOfUser,
    setOnBehalfOfUser,
    resetToSeedData,
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useCrm();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [behalfMenuOpen, setBehalfMenuOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [isSalesOpsModalOpen, setIsSalesOpsModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeNotifTab, setActiveNotifTab] = useState<'product' | 'task' | 'account'>('product');

  const availableRoles: UserRole[] = [
    'Sales Owner',
    'Pre-Sales Owner',
    'Solution Engineer',
    'Leader',
    'SalesOps',
    'Partner',
    'Administrator',
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-sm tracking-tight">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-900 tracking-tight">PrivaTRAC</span>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded">
                  v1.0
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.2 rounded">
                  <ShieldCheck className="w-3 h-3 text-slate-400" />
                  Isolated Mock Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">
                PrivaSapien Responsible AI & Privacy Portfolio
              </p>
            </div>
          </div>

          {/* Right Action Controls: Role Switcher & On-Behalf-Of & Reset */}
          <div className="flex items-center gap-2.5">
            {/* SalesOps On-Behalf-Of Switcher */}
            {currentUser.role === 'SalesOps' && (
              <div className="relative">
                <button
                  onClick={() => setBehalfMenuOpen(!behalfMenuOpen)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition"
                  title="Acting on behalf of"
                >
                  <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>On behalf of: <strong>{onBehalfOfUser?.name || 'Self'}</strong></span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {behalfMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 text-xs">
                    <div className="px-3 py-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      Delegate Work On Behalf Of
                    </div>
                    {users
                      .filter((u) => u.role === 'Sales Owner' || u.role === 'Leader')
                      .map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            setOnBehalfOfUser(u);
                            setBehalfMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${
                            onBehalfOfUser?.id === u.id ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600'
                          }`}
                        >
                          <span>{u.name} ({u.role})</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition"
                aria-label="Switch User Role"
              >
                <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <span className="font-medium text-slate-800">{currentUser.name}</span>
                  <span className="text-slate-400 ml-1.5">({currentUser.role})</span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs divide-y divide-slate-100">
                  <div>
                    <div className="px-3 py-1 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      Switch User
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {users.map((u) => {
                        const isCurrent = currentUser.id === u.id;
                        return (
                          <button
                            key={u.id}
                            onClick={() => {
                              setCurrentUser(u);
                              setRoleMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-50 transition ${
                              isCurrent ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-700'
                            }`}
                          >
                            <div>
                              <div>{u.name}</div>
                              <div className="text-[10px] text-slate-400 font-normal">
                                {u.role} · {u.team}
                              </div>
                            </div>
                            {isCurrent && <span className="text-[10px] text-sky-700 font-semibold">Active</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-1.5">
                    <div className="px-3 py-1 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      Switch Role Perspective
                    </div>
                    {availableRoles.map((role) => {
                      const isCurrent = currentUser.role === role;
                      return (
                        <button
                          key={role}
                          onClick={() => {
                            switchRole(role);
                            setRoleMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 transition ${
                            isCurrent ? 'bg-slate-50 text-slate-900 font-semibold' : 'text-slate-600'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span>{role}</span>
                              {isCurrent && <span className="text-[10px] text-slate-400 font-medium">Active</span>}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* SalesOps AI Agent Action Button */}
            <button
              onClick={() => setIsSalesOpsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white hover:from-slate-800 hover:to-indigo-900 border border-indigo-500/30 shadow-xs transition cursor-pointer"
              title="Instruct SalesOps AI Agent for quick updates"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">SalesOps Copilot</span>
              <span className="sm:hidden">AI Agent</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                AI
              </span>
            </button>

            {/* SalesOps Agent Confirmation Modal */}
            <SalesOpsAgentModal
              isOpen={isSalesOpsModalOpen}
              onClose={() => setIsSalesOpsModalOpen(false)}
            />

            {/* Top-Right Notifications Center */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                title="System and Update Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden text-xs">
                  {/* Header */}
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-slate-700" />
                      <span className="font-semibold text-slate-900">Notifications</span>
                      {unreadNotificationsCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-100 text-indigo-700 font-medium">
                          {unreadNotificationsCount} unread
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                        title="Mark all as read"
                      >
                        <CheckCheck className="w-3 h-3" />
                        Mark all read
                      </button>
                      <button
                        onClick={() => setNotificationsOpen(false)}
                        className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Categorized Tabs */}
                  <div className="flex items-center border-b border-slate-200 bg-white px-2 pt-1.5 gap-1">
                    <button
                      onClick={() => setActiveNotifTab('product')}
                      className={`px-3 py-1.5 text-xs font-medium border-b-2 transition flex items-center gap-1.5 ${
                        activeNotifTab === 'product'
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Product & FRD
                      {notifications.filter((n) => n.category === 'product' && !n.read).length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                      )}
                    </button>
                    <button
                      onClick={() => setActiveNotifTab('task')}
                      className={`px-3 py-1.5 text-xs font-medium border-b-2 transition flex items-center gap-1.5 ${
                        activeNotifTab === 'task'
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <CheckSquare2 className="w-3.5 h-3.5" />
                      Task Changes
                      {notifications.filter((n) => n.category === 'task' && !n.read).length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                      )}
                    </button>
                    <button
                      onClick={() => setActiveNotifTab('account')}
                      className={`px-3 py-1.5 text-xs font-medium border-b-2 transition flex items-center gap-1.5 ${
                        activeNotifTab === 'account'
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      Accounts
                      {notifications.filter((n) => n.category === 'account' && !n.read).length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                      )}
                    </button>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.filter((n) => n.category === activeNotifTab).length === 0 ? (
                      <div className="p-6 text-center text-slate-400">
                        <p className="text-xs">No notifications in this category.</p>
                      </div>
                    ) : (
                      notifications
                        .filter((n) => n.category === activeNotifTab)
                        .map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              markNotificationRead(notif.id);
                              if (notif.targetType === 'matrix' && onNavigateTab) {
                                onNavigateTab('productMatrix');
                                setNotificationsOpen(false);
                              } else if (notif.targetType === 'task' && onNavigateTab) {
                                onNavigateTab('tasks');
                                setNotificationsOpen(false);
                              } else if (notif.targetType === 'account' && onNavigateTab) {
                                onNavigateTab('accounts');
                                setNotificationsOpen(false);
                              }
                            }}
                            className={`p-3 hover:bg-slate-50 cursor-pointer transition flex items-start justify-between gap-3 ${
                              !notif.read ? 'bg-indigo-50/40' : ''
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-800 text-xs">
                                  {notif.title}
                                </span>
                                {!notif.read && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600 line-clamp-2">
                                {notif.message}
                              </p>
                              <span className="text-[10px] text-slate-400">
                                {new Date(notif.timestamp).toLocaleString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Reset Button */}
            <div className="relative">
              <button
                onClick={() => setResetConfirmOpen(true)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                title="Reset to clean baseline fixtures"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {resetConfirmOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 p-4 z-50 text-xs">
                  <h4 className="font-semibold text-slate-900 mb-1">Reset Baseline Data?</h4>
                  <p className="text-slate-500 mb-3 text-[11px]">
                    Restores all accounts, contacts, and tasks to the default synthetic fixtures.
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setResetConfirmOpen(false)}
                      className="px-2.5 py-1 text-slate-500 hover:bg-slate-100 rounded font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        resetToSeedData();
                        setResetConfirmOpen(false);
                      }}
                      className="px-2.5 py-1 bg-slate-900 text-white hover:bg-slate-800 rounded font-medium"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
