import React from 'react';
import { useRfp } from '../../context/RfpContext';
import {
  Cpu,
  HardDrive,
  Database,
  Coins,
  Sparkles,
  Server,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { SectionTasksComments } from './SectionTasksComments';

export const InfraSizingSection: React.FC = () => {
  const { infraSizing, volumeMetrics, conflictFlags, selectedTender } = useRfp();

  const activeConflicts = conflictFlags.filter(
    (c) =>
      c.rfpId === selectedTender.id &&
      c.status === 'Active' &&
      (c.sourceSection === 'Infra Sizing' || c.targetSection === 'Infra Sizing')
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Infrastructure Sizing & Bare-Metal Hardware Baseline
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
              Cluster 2 · Section 8
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Dynamic computational sizing model based on Volume Metrics ingestion rates, differential privacy micro-batching overheads, and GPU diffusion synthetic generation loads.
          </p>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Annual Infra Cost Est.</div>
          <div className="text-base font-bold text-slate-900 tabular-nums">
            ₹{(infraSizing.annualInfraCostInr / 100000).toFixed(1)} Lakhs / yr
          </div>
        </div>
      </div>

      {/* Discrepancy Callout if active */}
      {activeConflicts.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 text-xs text-rose-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Capacity Discrepancy Active: </strong>
              {activeConflicts[0].description}
            </span>
          </div>
          <span className="font-bold text-rose-700 underline shrink-0 cursor-pointer">
            Adjust Volume or Recalculate Sizing &rarr;
          </span>
        </div>
      )}

      {/* Hardware Resource Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span>Compute Cores</span>
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">{infraSizing.vCpuCores} vCPUs</div>
          <div className="text-[10px] text-slate-400">Dual Xeon Gold 6338</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span>System Memory</span>
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">{infraSizing.ramGb} GB RAM</div>
          <div className="text-[10px] text-slate-400">DDR4 ECC 3200MHz</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5 text-indigo-600" />
            <span>NVMe Storage</span>
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">{infraSizing.nvmeStorageTb} TB</div>
          <div className="text-[10px] text-slate-400">PCIe Gen4 RAID 10</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Server className="w-3.5 h-3.5 text-indigo-600" />
            <span>GPU Acceleration</span>
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">{infraSizing.gpuUnits} Units</div>
          <div className="text-[10px] text-slate-400">NVIDIA A100 Tensor</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>DP Overhead</span>
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">{infraSizing.dpOverheadFactor}x</div>
          <div className="text-[10px] text-slate-400">Noise Calibration Factor</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-indigo-600" />
            <span>Egress Bandwidth</span>
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">{infraSizing.networkEgressTb} TB / Mo</div>
          <div className="text-[10px] text-slate-400">10 Gbps Redundant NICs</div>
        </div>
      </div>

      {/* Deployment Architecture Specs */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Deployment Model & High Availability Topology
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-800">Primary DC (Navi Mumbai)</div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              2x 2U Rack Servers (Active-Active clustering) with dual redundant power supplies, on-site hardware maintenance provided via TCS turnkey envelope.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-800">DR Site (Hyderabad)</div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              1:1 Warm standby replica with asynchronous encrypted database mirroring and automated RTO &lt; 15 mins / RPO &lt; 0 sec failover.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-800">Cryptographic Root of Trust</div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Thales Luna 7000 PCIe HSM appliance connected via PKCS#11 for all differential privacy seed generation and zk-SNARK attestation signing.
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
          <span>Last automated recalculation: {new Date(infraSizing.lastRecalculatedAt).toLocaleString()}</span>
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sizing Attested by Solution Architect</span>
          </span>
        </div>
      </div>

      {/* Embedded Tasks & Comments for Infra Sizing Section */}
      <SectionTasksComments sectionId="infraSizing" sectionTitle="Infrastructure Sizing" />
    </div>
  );
};
