import React, { useState, useEffect } from 'react';
import { useMailbox } from '../../context/MailboxContext';
import { useCrm } from '../../context/CrmContext';
import { useRfp } from '../../context/RfpContext';
import { EmailMessage } from '../../types/mailbox';
import {
  X,
  Send,
  Paperclip,
  ShieldCheck,
  FileText,
  FileSpreadsheet,
  Check,
  ChevronDown,
} from 'lucide-react';

interface EmailComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  replyToEmail?: EmailMessage;
  initialTo?: string;
  initialSubject?: string;
}

export const EmailComposerModal: React.FC<EmailComposerModalProps> = ({
  isOpen,
  onClose,
  replyToEmail,
  initialTo,
  initialSubject,
}) => {
  const { sendMessage } = useMailbox();
  const { collaterals, currentUser } = useCrm();
  const { frdList } = useRfp();

  const [to, setTo] = useState(initialTo || replyToEmail?.from.email || '');
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState(
    initialSubject || (replyToEmail ? `Re: ${replyToEmail.subject}` : '')
  );
  const [body, setBody] = useState(
    replyToEmail
      ? `\n\n--- On ${new Date(replyToEmail.receivedDateTime).toLocaleString()}, ${replyToEmail.from.name} <${replyToEmail.from.email}> wrote:\n> ${replyToEmail.bodyPreview}`
      : ''
  );
  const [selectedSignature, setSelectedSignature] = useState<'confidential' | 'standard'>('confidential');
  const [attachedCollateralIds, setAttachedCollateralIds] = useState<string[]>([]);
  const [attachedFrdIds, setAttachedFrdIds] = useState<string[]>([]);
  const [showAttachmentDrawer, setShowAttachmentDrawer] = useState(false);
  const [attachmentTab, setAttachmentTab] = useState<'collaterals' | 'frds'>('collaterals');

  useEffect(() => {
    if (replyToEmail) {
      setTo(replyToEmail.from.email);
      setSubject(
        replyToEmail.subject.startsWith('Re:')
          ? replyToEmail.subject
          : `Re: ${replyToEmail.subject}`
      );
      setBody(
        `Dear ${replyToEmail.from.name.split(' ')[0]},\n\nThank you for your inquiry regarding ${replyToEmail.matchedAccountName || 'the technical evaluation'}.\n\n\n\n--- On ${new Date(replyToEmail.receivedDateTime).toLocaleString()}, ${replyToEmail.from.name} wrote:\n> ${replyToEmail.bodyPreview}`
      );
    } else if (initialTo || initialSubject) {
      if (initialTo) setTo(initialTo);
      if (initialSubject) setSubject(initialSubject);
    }
  }, [replyToEmail, initialTo, initialSubject]);

  if (!isOpen) return null;

  const getSignatureText = () => {
    if (selectedSignature === 'confidential') {
      return `\n\n---\n${currentUser.name}\n${currentUser.role} | PrivaSapien Technologies\nteam: ${currentUser.team}\nNotice: This communication contains confidential & proprietary PETs technical documentation under DPDP Act 2023 and FIPS-140-3 boundary controls.`;
    }
    return `\n\n---\n${currentUser.name}\nPrivaSapien Responsible AI Solutions\nprivasapien.com`;
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!to.trim() || !subject.trim()) return;

    sendMessage({
      to: to.trim(),
      cc: cc.trim() || undefined,
      subject: subject.trim(),
      body: body + getSignatureText(),
      attachedCollateralIds,
      attachedFrdIds,
    });

    onClose();
  };

  const toggleCollateral = (id: string) => {
    setAttachedCollateralIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleFrd = (id: string) => {
    setAttachedFrdIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const totalAttachments = attachedCollateralIds.length + attachedFrdIds.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 text-xs">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 rounded-t-xl shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">
              {replyToEmail ? 'Reply via Microsoft 365 Outlook' : 'New Enterprise Sales Message'}
            </h3>
            <span className="text-[11px] text-slate-400">· Graph API Dispatch</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSend} className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {/* Recipients */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="w-12 text-[11px] font-bold text-slate-500 uppercase">To</label>
              <input
                type="text"
                required
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@enterprise.com"
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-12 text-[11px] font-bold text-slate-500 uppercase">CC</label>
              <input
                type="text"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="presales@privasapien.com, tender-biddesk@privasapien.com"
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-12 text-[11px] font-bold text-slate-500 uppercase">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Tender clarification / Architecture response..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
              />
            </div>
          </div>

          {/* Body */}
          <div>
            <textarea
              rows={8}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type your formal tender response or client correspondence here..."
              className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-xs text-slate-800 leading-relaxed resize-y"
            />
          </div>

          {/* Attached Artifacts Preview */}
          {totalAttachments > 0 && (
            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
              <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                <span>Certified Attachments Included ({totalAttachments}):</span>
                <span className="text-[10px] text-slate-400">Cryptographically Attested</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {attachedCollateralIds.map((id) => {
                  const col = collaterals.find((c) => c.id === id);
                  if (!col) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white border border-slate-300 text-[11px] text-slate-800"
                    >
                      <FileText className="w-3 h-3 text-blue-600" />
                      <span className="font-medium">{col.title}</span>
                      <button
                        type="button"
                        onClick={() => toggleCollateral(id)}
                        className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  );
                })}

                {attachedFrdIds.map((id) => {
                  const frd = frdList.find((f) => f.id === id);
                  if (!frd) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white border border-slate-300 text-[11px] text-indigo-800"
                    >
                      <FileSpreadsheet className="w-3 h-3 text-indigo-600" />
                      <span className="font-medium">{frd.id}: {frd.title}</span>
                      <button
                        type="button"
                        onClick={() => toggleFrd(id)}
                        className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Attachment Selector Drawer */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAttachmentDrawer(!showAttachmentDrawer)}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 transition cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                <span>Attach Certified Collaterals or Tender FRD Specifications</span>
                {totalAttachments > 0 && (
                  <span className="text-[10px] text-blue-600">({totalAttachments} selected)</span>
                )}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  showAttachmentDrawer ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showAttachmentDrawer && (
              <div className="p-3 bg-white space-y-2 border-t border-slate-200">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAttachmentTab('collaterals')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                      attachmentTab === 'collaterals'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Marketing & Whitepapers ({collaterals.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttachmentTab('frds')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                      attachmentTab === 'frds'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Tender FRD Specifications ({frdList.length})
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {attachmentTab === 'collaterals' ? (
                    collaterals.map((col) => {
                      const isSelected = attachedCollateralIds.includes(col.id);
                      return (
                        <div
                          key={col.id}
                          onClick={() => toggleCollateral(col.id)}
                          className={`p-2 rounded border text-xs cursor-pointer flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-blue-50/70 border-blue-400 text-blue-900'
                              : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/50'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-slate-800">{col.title}</div>
                            <div className="text-[10px] text-slate-500">
                              {col.category} · {col.fileSize} · {col.fileName}
                            </div>
                          </div>
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    frdList.map((frd) => {
                      const isSelected = attachedFrdIds.includes(frd.id);
                      return (
                        <div
                          key={frd.id}
                          onClick={() => toggleFrd(frd.id)}
                          className={`p-2 rounded border text-xs cursor-pointer flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-indigo-50/70 border-indigo-400 text-indigo-900'
                              : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/50'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-slate-800">
                              {frd.id}: {frd.title}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {frd.module} · Status: {frd.status} · Author: {frd.createdBy}
                            </div>
                          </div>
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Signature Selection */}
          <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-600" />
              <span className="font-semibold text-slate-700">Presales Legal Signature:</span>
            </div>
            <select
              value={selectedSignature}
              onChange={(e) => setSelectedSignature(e.target.value as any)}
              className="px-2.5 py-1 rounded border border-slate-300 bg-white text-xs font-medium"
            >
              <option value="confidential">DPDP 2023 & FIPS-140-3 Confidential Notice</option>
              <option value="standard">Standard Enterprise Presales Signature</option>
            </select>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="text-[11px] text-slate-400">
              Authenticated via Microsoft Graph OAuth 2.0
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send via Microsoft Outlook</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
