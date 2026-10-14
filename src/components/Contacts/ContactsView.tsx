import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Contact, ContactTag } from '../../types/crm';
import { CbacUnmaskModal } from './CbacUnmaskModal';
import { ContactEditModal } from './ContactEditModal';
import { ItemAuditTrailModal } from '../common/ItemAuditTrailModal';
import {
  Lock,
  Unlock,
  ShieldCheck,
  Search,
  Plus,
  Mail,
  Phone,
  Building,
  Edit2,
  History,
  Sparkles,
} from 'lucide-react';

export const ContactsView: React.FC = () => {
  const { contacts, accounts, addContact, updateAccount, currentUser } = useCrm();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [unmaskTargetContact, setUnmaskTargetContact] = useState<Contact | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [auditTargetContact, setAuditTargetContact] = useState<Contact | null>(null);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);

  // New Contact form state
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newDesignation, setNewDesignation] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAccountId, setNewAccountId] = useState(accounts[0]?.id || '');
  const [newTag, setNewTag] = useState<ContactTag>('Decision Maker');
  const [newSource, setNewSource] = useState<'Email Received' | 'Public Registry' | 'In-person Meeting' | 'Web Inquiry'>('In-person Meeting');

  const accountMap = useMemo(() => {
    const map = new Map();
    accounts.forEach((a) => map.set(a.id, a));
    return map;
  }, [accounts]);

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      if (selectedTag !== 'all' && !c.tags.includes(selectedTag as ContactTag)) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
        const accName = (accountMap.get(c.accountId)?.name || '').toLowerCase();
        return (
          fullName.includes(q) ||
          c.designation.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          accName.includes(q)
        );
      }
      return true;
    });
  }, [contacts, searchQuery, selectedTag, accountMap]);

  const maskEmail = (email: string) => {
    const [user, domain] = email.split('@');
    if (!domain) return '••••••@••••••';
    const maskedUser = user.slice(0, 2) + '••••' + user.slice(-1);
    return `${maskedUser}@${domain}`;
  };

  const maskPhone = (phone: string) => {
    return phone.slice(0, 4) + ' •••• ••' + phone.slice(-2);
  };

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    addContact({
      accountId: newAccountId,
      firstName: newFirstName.trim(),
      lastName: newLastName.trim(),
      designation: newDesignation.trim(),
      email: newEmail.trim(),
      phone1: newPhone.trim(),
      tags: [newTag],
      source: newSource,
      consentState: newSource === 'Email Received' ? 'Deemed Consent' : 'Notice Sent',
      isMasked: true,
    });
    setIsAddContactOpen(false);
    setNewFirstName('');
    setNewLastName('');
    setNewDesignation('');
    setNewEmail('');
    setNewPhone('');
  };

  return (
    <div className="space-y-5">
      {/* Search & Actions Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search contacts by name, designation, account, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="all">All Stakeholder Tags</option>
            <option value="Decision Maker">Decision Maker</option>
            <option value="Champion">Champion</option>
            <option value="Influencer">Influencer</option>
            <option value="Detractor">Detractor</option>
            <option value="Observer">Observer</option>
          </select>

          {currentUser.role !== 'Partner' && (
            <button
              onClick={() => setIsAddContactOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Contact</span>
            </button>
          )}
        </div>
      </div>

      {/* Privacy Notice Banner - Subtle Tone */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="text-slate-700">
            <strong>Mock CBAC & Consentium Guardrails:</strong> Sensitive PII fields are masked by default. Access requires purposeful business justification and is recorded to the audit log.
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 text-[10px] font-medium shrink-0">
          Synthetic Records
        </span>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => {
          const account = accountMap.get(contact.accountId);
          return (
            <div
              key={contact.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">
                      {contact.firstName} {contact.lastName}
                    </h4>
                    <p className="text-[11px] text-slate-500">{contact.designation}</p>
                  </div>

                  <div className="flex flex-wrap gap-1 justify-end max-w-[130px]">
                    {contact.tags.map((t) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Account Name & Account Type Field */}
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-3 pb-2 border-b border-slate-100 gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{account?.name || 'Unassigned Account'}</span>
                  </div>

                  {account && (
                    <div className="flex items-center gap-1 text-[11px] shrink-0">
                      <span className="text-[10px] text-slate-400 font-medium">Type:</span>
                      <select
                        value={account.publicPrivate || 'Private'}
                        onChange={(e) => {
                          const newType = e.target.value as 'Public' | 'Private';
                          updateAccount(
                            { ...account, publicPrivate: newType },
                            'Account Type',
                            account.publicPrivate || 'Private',
                            newType
                          );
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer shadow-2xs ${
                          account.publicPrivate === 'Public'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                        title="Change Account Type (Public/Private)"
                      >
                        <option value="Private">Private</option>
                        <option value="Public">Public</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Sensitive Details (CBAC Masked / Unmasked) */}
                <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-[11px]">
                        {contact.isMasked ? maskEmail(contact.email) : contact.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-[11px]">
                        {contact.isMasked ? maskPhone(contact.phone1) : contact.phone1}
                      </span>
                    </div>
                  </div>

                  {/* Consent state */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                    <span>
                      Consent: <strong className="text-slate-700 font-medium">{contact.consentState}</strong>
                    </span>
                    <span>Source: {contact.source}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Edit Contact & Audit Trail */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingContact(contact)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 text-white hover:bg-slate-800 text-[11px] font-semibold transition shadow-2xs"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setAuditTargetContact(contact)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-semibold transition"
                    title="Inspect immutable audit trail of changes"
                  >
                    <History className="w-3 h-3 text-slate-500" />
                    <span>Audit ({contact.fieldAuditTrail?.length || 0})</span>
                  </button>
                </div>

                {contact.isMasked ? (
                  <button
                    onClick={() => setUnmaskTargetContact(contact)}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium text-[11px] transition"
                  >
                    <Lock className="w-3 h-3 text-slate-500" />
                    <span>Unmask</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-600 font-medium text-[10px]">
                    <Unlock className="w-3 h-3 text-slate-500" />
                    <span>Unmasked</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Contact Modal */}
      {editingContact && (
        <ContactEditModal
          contact={editingContact}
          onClose={() => setEditingContact(null)}
        />
      )}

      {/* Item Audit Trail Modal */}
      {auditTargetContact && (
        <ItemAuditTrailModal
          title={`${auditTargetContact.firstName} ${auditTargetContact.lastName}`}
          subtitle={`Audit trail history for ${accountMap.get(auditTargetContact.accountId)?.name || 'Account'} contact`}
          entityType="Contact"
          entries={auditTargetContact.fieldAuditTrail || []}
          onClose={() => setAuditTargetContact(null)}
        />
      )}

      {/* Unmask Modal */}
      {unmaskTargetContact && (
        <CbacUnmaskModal
          contact={unmaskTargetContact}
          onClose={() => setUnmaskTargetContact(null)}
          onSuccess={() => setUnmaskTargetContact(null)}
        />
      )}

      {/* Add Contact Modal */}
      {isAddContactOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-5">
            <h3 className="font-semibold text-slate-900 text-base mb-3">Add New Contact</h3>
            <form onSubmit={handleCreateContact} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Designation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chief Information Security Officer"
                  value={newDesignation}
                  onChange={(e) => setNewDesignation(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="font-medium text-slate-700 block mb-1">Linked Account</label>
                  <select
                    value={newAccountId}
                    onChange={(e) => setNewAccountId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Account Type</label>
                  <select
                    value={accounts.find((a) => a.id === newAccountId)?.publicPrivate || 'Private'}
                    onChange={(e) => {
                      const targetAcc = accounts.find((a) => a.id === newAccountId);
                      if (!targetAcc) return;
                      const newType = e.target.value as 'Public' | 'Private';
                      updateAccount(
                        { ...targetAcc, publicPrivate: newType },
                        'Account Type',
                        targetAcc.publicPrivate || 'Private',
                        newType
                      );
                    }}
                    className="w-full p-2 border border-slate-300 rounded text-xs bg-white font-medium"
                  >
                    <option value="Private">Private</option>
                    <option value="Public">Public</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Stakeholder Role Tag</label>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value as ContactTag)}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    <option value="Decision Maker">Decision Maker</option>
                    <option value="Champion">Champion</option>
                    <option value="Influencer">Influencer</option>
                    <option value="Detractor">Detractor</option>
                    <option value="Observer">Observer</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Provenance Source</label>
                  <select
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    <option value="Email Received">Email Received (Deemed Consent)</option>
                    <option value="Public Registry">Public Registry</option>
                    <option value="In-person Meeting">In-person Meeting</option>
                    <option value="Web Inquiry">Web Inquiry</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddContactOpen(false)}
                  className="px-3 py-1.5 rounded text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-slate-900 text-white font-medium hover:bg-slate-800"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
