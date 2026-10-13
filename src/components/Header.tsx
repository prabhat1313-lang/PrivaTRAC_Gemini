import React, { useState } from 'react';
import {
  ShieldCheck,
  RotateCcw,
  Plus,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { UserRole } from '../types/crm';

interface HeaderProps {
  onOpenAddAccount: () => void;
  onOpenReminders: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddAccount }) => {
  const {
    currentUser,
    switchRole,
    users,
    onBehalfOfUser,
    setOnBehalfOfUser,
    resetToSeedData,
  } = useCrm();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [behalfMenuOpen, setBehalfMenuOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

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
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
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
                        className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 transition ${
                          isCurrent ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span>{role}</span>
                            {isCurrent && <span className="text-[10px] text-slate-400 font-medium">Active</span>}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {role === 'Sales Owner' && 'Default to assigned deals'}
                            {role === 'Pre-Sales Owner' && 'Technical & RFP proposals'}
                            {role === 'Solution Engineer' && 'Demos & architecture'}
                            {role === 'Leader' && 'Total enterprise pipeline'}
                            {role === 'SalesOps' && 'Attribution delegation'}
                            {role === 'Partner' && 'Scoped tagged accounts'}
                            {role === 'Administrator' && 'Master configurations'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add Account Action Button */}
            {currentUser.role !== 'Partner' && (
              <button
                onClick={onOpenAddAccount}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Account</span>
              </button>
            )}

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
