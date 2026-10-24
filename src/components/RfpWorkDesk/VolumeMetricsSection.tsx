import React, { useState } from 'react';
import { useRfp } from '../../context/RfpContext';
import { useCrm } from '../../context/CrmContext';
import {
  BarChart3,
  Plus,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  Cpu,
  HardDrive,
  Coins,
  Tag,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { VolumeMetricItem } from '../../types/rfp';
import { SectionTasksComments } from './SectionTasksComments';

export const VolumeMetricsSection: React.FC = () => {
  const {
    volumeMetrics,
    updateVolumeMetric,
    pendingInfraDiff,
    applyPendingInfraRecalculation,
    discardPendingInfraRecalculation,
    selectedTender,
  } = useRfp();
  const { currentUser } = useCrm();

  const [isAddingMetric, setIsAddingMetric] = useState(false);
  const [newMetricName, setNewMetricName] = useState('');
  const [newTag, setNewTag] = useState<'Provided' | 'Assumed'>('Provided');
  const [newUnit, setNewUnit] = useState('Million Records / Year');
  const [newValue, setNewValue] = useState<number>(100);
  const [newNotes, setNewNotes] = useState('');

  const tenderMetrics = volumeMetrics.filter((v) => v.rfpId === selectedTender.id);

  const handleApplyDiff = () => {
    applyPendingInfraRecalculation(currentUser?.name || 'Pre-Sales Lead');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Volume Metrics & Workload Assumptions
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
              Cluster 2 · Section 7
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Quantify customer data scales, ingestion throughput, and synthetic generation loads. Every volume is strictly tagged as <strong className="text-slate-700">Provided</strong> (explicit in tender) or <strong className="text-slate-700">Assumed</strong> (pre-sales engineering estimation).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Tag Summary:</span>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
            {tenderMetrics.filter((m) => m.tag === 'Provided').length} Provided
          </span>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            {tenderMetrics.filter((m) => m.tag === 'Assumed').length} Assumed
          </span>
        </div>
      </div>

      {/* Live Recalculation Visual Impact Diff Card (Slide Down) */}
      {pendingInfraDiff && (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-xl p-5 shadow-lg border border-indigo-700/80 animate-in fade-in slide-in-from-top-4 duration-200 space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-700/60 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                Live Workload Impact Recalculation
              </h4>
            </div>
            <span className="text-[10px] text-amber-300 font-semibold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700">
              Pending Pre-Sales Confirmation
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-white/10 rounded-lg border border-white/10">
              <div className="text-[10px] text-indigo-300 uppercase font-medium">Compute Delta</div>
              <div className="text-base font-bold text-white tabular-nums">
                {pendingInfraDiff.vCpuDiff >= 0 ? `+${pendingInfraDiff.vCpuDiff}` : pendingInfraDiff.vCpuDiff} vCPUs
              </div>
            </div>

            <div className="p-3 bg-white/10 rounded-lg border border-white/10">
              <div className="text-[10px] text-indigo-300 uppercase font-medium">Memory Delta</div>
              <div className="text-base font-bold text-white tabular-nums">
                {pendingInfraDiff.ramDiff >= 0 ? `+${pendingInfraDiff.ramDiff}` : pendingInfraDiff.ramDiff} GB RAM
              </div>
            </div>

            <div className="p-3 bg-white/10 rounded-lg border border-white/10">
              <div className="text-[10px] text-indigo-300 uppercase font-medium">NVMe Storage Delta</div>
              <div className="text-base font-bold text-emerald-400 tabular-nums">
                {pendingInfraDiff.storageDiff >= 0 ? `+${pendingInfraDiff.storageDiff}` : pendingInfraDiff.storageDiff} TB
              </div>
            </div>

            <div className="p-3 bg-white/10 rounded-lg border border-white/10">
              <div className="text-[10px] text-indigo-300 uppercase font-medium">Annual Sizing Cost</div>
              <div className="text-base font-bold text-amber-400 tabular-nums">
                {pendingInfraDiff.costDiffInr >= 0 ? `+₹${(pendingInfraDiff.costDiffInr / 100000).toFixed(1)} Lakhs` : `-₹${(Math.abs(pendingInfraDiff.costDiffInr) / 100000).toFixed(1)} Lakhs`}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-300">
              Applying this update automatically updates Infra Sizing and resolves any capacity discrepancy flags.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={discardPendingInfraRecalculation}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleApplyDiff}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs shadow-md transition cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm & Propagate to Sizing & Pricing</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Volume Metrics Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tenderMetrics.map((metric) => (
          <div
            key={metric.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-slate-300 transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      metric.tag === 'Provided'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {metric.tag} by {metric.tag === 'Provided' ? 'Client Tender' : 'Pre-Sales Eng'}
                  </span>
                  {metric.tenderSourcePage && (
                    <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.2 rounded">
                      Page {metric.tenderSourcePage}
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-900">{metric.metricName}</h4>
              </div>

              <div className="text-right">
                <span className="text-base font-bold text-slate-900 tabular-nums">
                  {metric.currentValue.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500 block">{metric.unit}</span>
              </div>
            </div>

            {/* Slider to adjust & test recalculation */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Scale Adjuster</span>
                <span>Current: {metric.currentValue} {metric.unit}</span>
              </div>
              <input
                type="range"
                min={Math.max(10, Math.round(metric.currentValue * 0.4))}
                max={Math.round(metric.currentValue * 2.5)}
                value={metric.currentValue}
                onChange={(e) => updateVolumeMetric(metric.id, Number(e.target.value), currentUser?.name || 'Pre-Sales Lead')}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed font-sans">
              {metric.notes}
            </p>
          </div>
        ))}
      </div>

      {/* Embedded Tasks & Comments for Volume Metrics Section */}
      <SectionTasksComments sectionId="volumeMetrics" sectionTitle="Volume Metrics" />
    </div>
  );
};
