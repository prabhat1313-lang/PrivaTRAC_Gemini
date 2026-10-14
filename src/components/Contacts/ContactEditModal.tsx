import React, { useState } from 'react';
import { Contact, ContactTag } from '../../types/crm';
import { useCrm } from '../../context/CrmContext';
import {
  X,
  User,
  Building,
  Mail,
  Phone,
  Shield,
  Tag,
  Calendar,
  Save,
  CheckCircle2,
  Lock,
  Unlock,
} from 'lucide-react';

interface ContactEditModalProps {
  contact: Contact;
  onClose: () => void;
}

const AVAILABLE_TAGS: ContactTag[] = [
  'Champion',
  'Decision Maker',
  'Influencer',
  'Detractor',
  'Observer',
];

export const ContactEditModal: React.FC<ContactEditModalProps> = ({ contact, onClose }) => {
  const { updateContact, updateAccount, accounts, currentUser, onBehalfOfUser } = useCrm();

  const [firstName, setFirstName] = useState(contact.firstName);
  const [lastName, setLastName] = useState(contact.lastName);
  const [designation, setDesignation] = useState(contact.designation);
  const [email, setEmail] = useState(contact.email);
  const [phone1, setPhone1] = useState(contact.phone1);
  const [phone2, setPhone2] = useState(contact.phone2 || '');
  const [accountId, setAccountId] = useState(contact.accountId);
  const [tags, setTags] = useState<ContactTag[]>(contact.tags || []);
  const [source, setSource] = useState(contact.source);
  const [consentState, setConsentState] = useState(contact.consentState);
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isSaved, setIsSaved] = useState(false);

  const toggleTag = (t: ContactTag) => {
    setTags((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return;

    const updatedContact: Contact = {
      ...contact,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      designation: designation.trim(),
      email: email.trim(),
      phone1: phone1.trim(),
      phone2: phone2.trim() || undefined,
      accountId,
      tags: tags.length > 0 ? tags : ['Observer'],
      source,
      consentState,
    };

    updateContact(updatedContact, undefined, undefined, undefined, effectiveDate);

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Edit Contact Details</h3>
              <p className="text-xs text-slate-500">
                Update stakeholder info, designation, consent state, and stakeholder tags
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Audit Attribution Callout */}
          <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-900 text-[11px] flex items-start gap-2">
            <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>Audit Trail Notice:</strong> Every modification to this contact is tracked with an immutable change record.
              {onBehalfOfUser ? (
                <span> Logged by <strong>{currentUser.name}</strong> on behalf of <strong>{onBehalfOfUser.name}</strong>.</span>
              ) : (
                <span> Logged by <strong>{currentUser.name}</strong>.</span>
              )}
            </div>
          </div>

          {/* Name Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">First Name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                placeholder="e.g. Arvind"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                placeholder="e.g. Venkatesh"
              />
            </div>
          </div>

          {/* Associated Account & Account Type Field */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>Associated Account *</span>
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-white font-medium"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.stage})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Account Type
              </label>
              <select
                value={accounts.find((a) => a.id === accountId)?.publicPrivate || 'Private'}
                onChange={(e) => {
                  const targetAcc = accounts.find((a) => a.id === accountId);
                  if (!targetAcc) return;
                  const newType = e.target.value as 'Public' | 'Private';
                  updateAccount(
                    { ...targetAcc, publicPrivate: newType },
                    'Account Type',
                    targetAcc.publicPrivate || 'Private',
                    newType,
                    effectiveDate
                  );
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-white font-semibold"
                title="Select Account Type (Public/Private)"
              >
                <option value="Private">Private</option>
                <option value="Public">Public</option>
              </select>
            </div>
          </div>

          {/* Designation */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Professional Designation / Role *</label>
            <input
              type="text"
              required
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
              placeholder="e.g. Chief Information Security Officer (CISO)"
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Address *</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-mono"
                placeholder="name@company.com"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Primary Phone *</span>
              </label>
              <input
                type="text"
                required
                value={phone1}
                onChange={(e) => setPhone1(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-mono"
                placeholder="+91 98201 44521"
              />
            </div>
          </div>

          {/* Secondary Phone (Optional) */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Secondary / Direct Line (Optional)</label>
            <input
              type="text"
              value={phone2}
              onChange={(e) => setPhone2(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-mono"
              placeholder="+91 22 2274 0811"
            />
          </div>

          {/* Stakeholder Role Tags */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Stakeholder Influence Tags</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TAGS.map((t) => {
                const isSelected = tags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/70'
                    }`}
                  >
                    {isSelected ? `✓ ${t}` : `+ ${t}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Consent State & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Consentium Consent State</label>
              <select
                value={consentState}
                onChange={(e) => setConsentState(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-white"
              >
                <option value="Deemed Consent">Deemed Consent</option>
                <option value="Notice Sent">Notice Sent</option>
                <option value="Explicit Opt-in">Explicit Opt-in</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Acquisition Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-white"
              >
                <option value="Email Received">Email Received</option>
                <option value="In-person Meeting">In-person Meeting</option>
                <option value="Public Registry">Public Registry</option>
                <option value="Web Inquiry">Web Inquiry</option>
              </select>
            </div>
          </div>

          {/* Effective Date (Supports back-dating for audit trail!) */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Effective Date of Change</span>
            </label>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full sm:w-1/2 px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              If recording historical updates, select the effective date. System timestamp will reflect current time.
            </p>
          </div>

          {isSaved && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Contact details updated and logged to immutable audit trail!</span>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition text-xs flex items-center gap-1.5 shadow-2xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Record Audit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
