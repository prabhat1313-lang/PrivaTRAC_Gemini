import React, { useState } from 'react';
import { Contact } from '../../types/crm';
import { useCrm } from '../../context/CrmContext';
import { ShieldAlert, Lock, X, CheckCircle2 } from 'lucide-react';

interface CbacUnmaskModalProps {
  contact: Contact;
  onClose: () => void;
  onSuccess: () => void;
}

export const CbacUnmaskModal: React.FC<CbacUnmaskModalProps> = ({
  contact,
  onClose,
  onSuccess,
}) => {
  const { unmaskContact, currentUser } = useCrm();
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState('');

  const standardPurposes = [
    'Scheduled discovery call with Decision Maker',
    'Pre-sales RFP clarification on cryptographic compliance',
    'Follow-up commercial proposal delivery',
    'Customer support escalation response',
  ];

  const handleUnmask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose || purpose.trim().length < 8) {
      setError('Please provide a legitimate commercial or pre-sales justification (min 8 characters).');
      return;
    }

    const ok = unmaskContact(contact.id, purpose);
    if (ok) {
      onSuccess();
    } else {
      setError('Failed to record CBAC access token.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-700" />
            <div>
              <h3 className="font-bold text-amber-950 text-sm">
                CBAC Access Control • Mandatory Purpose Capture
              </h3>
              <p className="text-[11px] text-amber-800">
                Contact Data Privacy Protection Rule CON-04
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-amber-700 hover:bg-amber-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleUnmask} className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="font-bold text-slate-800">
              {contact.firstName} {contact.lastName} ({contact.designation})
            </div>
            <div className="text-[11px] text-slate-500">
              Target Field: Direct Email & Mobile Numbers
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Select or Enter Business Purpose for Data Unmasking: *
            </label>
            <div className="space-y-1.5 mb-2">
              {standardPurposes.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPurpose(p);
                    setError('');
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded border text-[11px] transition ${
                    purpose === p
                      ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              placeholder="Or type specific purpose justification..."
              value={purpose}
              onChange={(e) => {
                setPurpose(e.target.value);
                setError('');
              }}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-blue-500"
            />
            {error && <p className="text-red-600 font-medium text-[11px] mt-1">{error}</p>}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1 font-semibold text-slate-800">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
              <span>Audit Logging Notice:</span>
            </div>
            <p>
              Actor <strong>{currentUser.name}</strong> will be logged permanently in the
              access audit log along with the timestamp and purpose provided.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-600 font-semibold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs"
            >
              Verify Purpose & Unmask
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
