import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Collateral } from '../../types/crm';
import {
  Mail,
  Send,
  Paperclip,
  CheckCircle2,
  FileText,
  ShieldCheck,
  User,
  Inbox,
  AlertTriangle,
  X,
} from 'lucide-react';

export const MailboxView: React.FC = () => {
  const { collaterals, currentUser } = useCrm();

  const [toEmail, setToEmail] = useState('arvind.venkatesh@sbi.co.in');
  const [subject, setSubject] = useState(
    'PrivaSapien PETs Platform • Tier-1 FIPS-140-3 Cryptographic Attestation'
  );
  const [body, setBody] = useState(
    `Dear Arvind,\n\nFollowing up on our architecture board review for the State Bank of India differential privacy deployment, I have attached our official FIPS-140-3 cryptography attestation certificate and architecture whitepaper.\n\nPlease let me know when your security council is available to review the hardware security module (HSM) key boundaries.\n\nBest regards,`
  );
  const [selectedSignature, setSelectedSignature] = useState<'standard' | 'confidential'>('confidential');
  const [attachedCollateralIds, setAttachedCollateralIds] = useState<string[]>(['col-1', 'col-3']);
  const [isSent, setIsSent] = useState(false);
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);

  const syntheticInbox = [
    {
      id: 1,
      from: 'arvind.venkatesh@sbi.co.in',
      subject: 'Re: State Bank of India RFP Tender Technical Query Clarification',
      time: 'Today 10:24 AM',
      preview: 'Thank you for the differential privacy benchmark numbers. Can you also clarify...',
    },
    {
      id: 2,
      from: 'k.padmanabhan@apollohospitals.com',
      subject: 'Apollo Hospitals Clinical Informatics Council Demo Confirmation',
      time: 'Yesterday 04:15 PM',
      preview: 'We have reserved the oncology boardroom for Wednesday 2 PM. Please ensure...',
    },
    {
      id: 3,
      from: 'eileencheong@dbs.com',
      subject: 'MAS FEAT Compliance Checklist Sign-off',
      time: '08 Oct 2026',
      preview: 'Our AI ethics review committee has accepted the model card fairness metrics...',
    },
  ];

  const handleSimulateSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => setIsSent(false), 5000);
  };

  const getSignatureText = () => {
    if (selectedSignature === 'confidential') {
      return `\n\n---\n${currentUser.name}\n${currentUser.role} | PrivaSapien Technologies\nteam: ${currentUser.team}\nNotice: PrivaSapien Simulated Dispatch • No External Transfer Occurred.`;
    }
    return `\n\n---\n${currentUser.name}\nPrivaSapien Responsible AI Solutions`;
  };

  return (
    <div className="space-y-6">
      {/* Simulation Banner (MAIL-01 & MAIL-04) */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            <strong>Mock IMAP Mailbox Seam:</strong> External email dispatch is disabled. Message composition and attachments run locally in simulation mode.
          </span>
        </div>
        <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-medium shrink-0">
          Zero Outbound Network Calls
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Synthetic Inbox Column */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
              <Inbox className="w-4 h-4 text-slate-600" />
              <span>Simulated Inbox</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
              3 Messages
            </span>
          </div>

          <div className="space-y-2">
            {syntheticInbox.map((msg) => (
              <div
                key={msg.id}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-300 transition cursor-pointer text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-800 truncate">{msg.from}</span>
                  <span className="text-slate-400 text-[10px]">{msg.time}</span>
                </div>
                <div className="font-semibold text-slate-900 truncate">{msg.subject}</div>
                <div className="text-slate-500 text-[11px] line-clamp-1">{msg.preview}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Composer Column */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-slate-900 text-sm">Email Composer</h4>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Signature:</span>
              <select
                value={selectedSignature}
                onChange={(e) => setSelectedSignature(e.target.value as any)}
                className="px-2 py-1 rounded border border-slate-300 text-xs bg-white"
              >
                <option value="confidential">Confidential Disclaimer Signature</option>
                <option value="standard">Standard Business Signature</option>
              </select>
            </div>
          </div>

          <form onSubmit={handleSimulateSend} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">To: *</label>
              <input
                type="email"
                required
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Subject: *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Message Content:</label>
              <textarea
                rows={7}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded font-mono text-xs text-slate-800 leading-relaxed"
              />
            </div>

            {/* Signature Preview */}
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-500 font-mono">
              <div className="font-bold text-slate-400 text-[10px] uppercase mb-1">
                Appended User Signature Preview:
              </div>
              <pre className="whitespace-pre-wrap">{getSignatureText()}</pre>
            </div>

            {/* Attached Collaterals Strip (MAIL-03) */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                  Attached Marketing & Technical Collaterals ({attachedCollateralIds.length})
                </span>
                <button
                  type="button"
                  onClick={() => setIsAttachModalOpen(true)}
                  className="px-2.5 py-1 rounded bg-white text-blue-700 border border-slate-300 text-xs font-semibold hover:bg-slate-100"
                >
                  + Add from Repository
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {attachedCollateralIds.map((id) => {
                  const col = collaterals.find((c) => c.id === id);
                  if (!col) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-300 text-[11px] text-slate-800 font-medium"
                    >
                      <FileText className="w-3 h-3 text-blue-600" />
                      <span>{col.fileName}</span>
                      <span className="text-slate-400 text-[10px]">({col.fileSize})</span>
                      <button
                        type="button"
                        onClick={() =>
                          setAttachedCollateralIds((prev) => prev.filter((i) => i !== id))
                        }
                        className="text-slate-400 hover:text-red-600 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>

            {isSent && (
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  Message simulated successfully! Recorded to local demo activity stream.
                </span>
              </div>
            )}

            {/* Send Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send (Simulated Dispatch)</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Attach Collateral Modal */}
      {isAttachModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5">
            <h3 className="font-bold text-slate-900 text-base mb-3">
              Attach from Marketing Collaterals Repository
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto mb-4">
              {collaterals.map((col) => {
                const isAttached = attachedCollateralIds.includes(col.id);
                return (
                  <div
                    key={col.id}
                    onClick={() => {
                      setAttachedCollateralIds((prev) =>
                        isAttached ? prev.filter((i) => i !== col.id) : [...prev, col.id]
                      );
                    }}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between ${
                      isAttached ? 'bg-blue-50 border-blue-400 text-blue-900' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900">{col.title}</div>
                      <div className="text-[11px] text-slate-500">
                        {col.fileName} • {col.fileSize} • {col.category}
                      </div>
                    </div>
                    <input type="checkbox" checked={isAttached} readOnly className="rounded text-blue-600" />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setIsAttachModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded font-bold text-xs"
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
