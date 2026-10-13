/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CrmProvider, useCrm } from './context/CrmContext';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { DashboardView } from './components/Dashboard/DashboardView';
import { AccountsView } from './components/Accounts/AccountsView';
import { ContactsView } from './components/Contacts/ContactsView';
import { TasksView } from './components/Tasks/TasksView';
import { DemosView } from './components/Demos/DemosView';
import { PartnersView } from './components/Partners/PartnersView';
import { MailboxView } from './components/Mailbox/MailboxView';
import { ReportsView } from './components/Reports/ReportsView';
import { AdminView } from './components/Admin/AdminView';
import { AddAccountModal } from './components/Accounts/AddAccountModal';
import { AccountDetailModal } from './components/Accounts/AccountDetailModal';
import { AuditTrailModal } from './components/Accounts/AuditTrailModal';
import { Account } from './types/crm';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);
  const [auditAccount, setAuditAccount] = useState<Account | null>(null);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-900 antialiased selection:bg-slate-800 selection:text-white">
      {/* Global Top Header with Role Switcher & Persona Actions */}
      <Header
        onOpenAddAccount={() => setIsAddAccountOpen(true)}
        onOpenReminders={() => setActiveTab('reports')}
      />

      {/* Navigation Sub-Header */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'accounts' && <AccountsView />}
        {activeTab === 'contacts' && <ContactsView />}
        {activeTab === 'tasks' && <TasksView />}
        {activeTab === 'demos' && <DemosView />}
        {activeTab === 'partners' && <PartnersView />}
        {activeTab === 'mailbox' && <MailboxView />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'admin' && <AdminView />}
      </main>

      {/* Global Add Account Modal */}
      {isAddAccountOpen && (
        <AddAccountModal
          onClose={() => setIsAddAccountOpen(false)}
          onSuccess={(acc) => {
            setIsAddAccountOpen(false);
            setActiveAccount(acc);
          }}
        />
      )}

      {/* Account Details Modal */}
      {activeAccount && (
        <AccountDetailModal
          account={activeAccount}
          onClose={() => setActiveAccount(null)}
          onOpenAudit={(acc) => setAuditAccount(acc)}
        />
      )}

      {/* Field-level Audit Trail Modal */}
      {auditAccount && (
        <AuditTrailModal
          account={auditAccount}
          onClose={() => setAuditAccount(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">PrivaTRAC</span>
            <span>•</span>
            <span>PrivaSapien Responsible AI & Privacy Portfolio</span>
          </div>
          <div className="text-[11px] text-slate-400">
            PRD Baseline v1.0 • Isolated Local Mock Architecture • Human-in-Control Governance
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <CrmProvider>
      <AppContent />
    </CrmProvider>
  );
}
