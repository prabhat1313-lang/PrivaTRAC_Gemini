import React from 'react';
import { useMailbox } from '../../context/MailboxContext';
import {
  X,
  Mail,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Lock,
  ExternalLink,
  Sliders,
} from 'lucide-react';

interface OutlookConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OutlookConnectModal: React.FC<OutlookConnectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { outlookStatus, setOutlookStatus, triggerDeltaSync } = useMailbox();

  if (!isOpen) return null;

  const handleToggleSyncMode = (mode: 'live_graph' | 'simulated_sandbox') => {
    setOutlookStatus((prev) => ({
      ...prev,
      syncMode: mode,
    }));
  };

  const handleToggleConnection = () => {
    setOutlookStatus((prev) => ({
      ...prev,
      isConnected: !prev.isConnected,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 space-y-4 animate-in fade-in zoom-in-95 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Microsoft 365 Outlook Integration
              </h3>
              <p className="text-[11px] text-slate-500">
                Microsoft Graph API v1.0 & Webhooks Delta Sync
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Connection State Badge */}
        <div className="p-3.5 rounded-xl border bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                outlookStatus.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <div>
              <div className="font-bold text-slate-900">
                {outlookStatus.isConnected ? 'Connected & Synchronized' : 'Disconnected'}
              </div>
              <div className="text-[11px] text-slate-500">
                {outlookStatus.connectedAccountEmail} · {outlookStatus.connectedAccountName}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleConnection}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              outlookStatus.isConnected
                ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                : 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {outlookStatus.isConnected ? 'Disconnect' : 'Connect Account'}
          </button>
        </div>

        {/* Sync Mode Switcher */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-700 uppercase">
            Sync Engine Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleToggleSyncMode('simulated_sandbox')}
              className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                outlookStatus.syncMode === 'simulated_sandbox'
                  ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                  : 'border-slate-200 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900">Simulated Sandbox</span>
                {outlookStatus.syncMode === 'simulated_sandbox' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-900" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Zero network leakage. Realistic mock mailbox with pre-seeded tender threads.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleToggleSyncMode('live_graph')}
              className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                outlookStatus.syncMode === 'live_graph'
                  ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                  : 'border-slate-200 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900">Live Graph OAuth</span>
                {outlookStatus.syncMode === 'live_graph' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Connect directly to your corporate Entra ID tenant via OAuth 2.0 PKCE flow.
              </p>
            </button>
          </div>
        </div>

        {/* OAuth Granted Scopes & Security Info */}
        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Granted Entra ID Delegated Permissions</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <code className="font-mono text-[10px] bg-white px-1 py-0.5 rounded border border-slate-200">
                Mail.Read
              </code>
              <span className="text-slate-400">· Read inbox</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <code className="font-mono text-[10px] bg-white px-1 py-0.5 rounded border border-slate-200">
                Mail.Send
              </code>
              <span className="text-slate-400">· Send dispatch</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <code className="font-mono text-[10px] bg-white px-1 py-0.5 rounded border border-slate-200">
                User.Read
              </code>
              <span className="text-slate-400">· Profile info</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <code className="font-mono text-[10px] bg-white px-1 py-0.5 rounded border border-slate-200">
                offline_access
              </code>
              <span className="text-slate-400">· Refresh token</span>
            </div>
          </div>

          <div className="pt-1 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Tenant: {outlookStatus.tenantId}</span>
            <span>Last Delta Sync: {new Date(outlookStatus.lastDeltaSyncAt || Date.now()).toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Delta Query Simulation Action */}
        <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/40 flex items-center justify-between">
          <div>
            <div className="font-bold text-slate-900">Simulate Incoming Delta Sync</div>
            <p className="text-[11px] text-slate-600">
              Simulates receiving an official Corrigendum update from State Bank of India IT Procurement.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerDeltaSync();
              onClose();
            }}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Trigger Sync</span>
          </button>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
