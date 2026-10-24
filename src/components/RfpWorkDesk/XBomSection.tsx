import React, { useState } from 'react';
import { useRfp } from '../../context/RfpContext';
import {
  FileCode,
  Key,
  Server,
  Cpu,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  Search,
} from 'lucide-react';
import { SectionTasksComments } from './SectionTasksComments';

export const XBomSection: React.FC = () => {
  const [activeBomTab, setActiveBomTab] = useState<'sbom' | 'cbom' | 'hbom' | 'aibom'>('sbom');

  const sbomComponents = [
    { name: 'privasapien-dp-core', version: '4.2.1', license: 'Proprietary OEM', purl: 'pkg:npm/@privasapien/dp-core@4.2.1', cveCount: 0, status: 'Verified Clean' },
    { name: 'ctgan-synthetic-engine', version: '2.8.0', license: 'Apache-2.0', purl: 'pkg:pypi/ctgan-synthetic@2.8.0', cveCount: 0, status: 'Verified Clean' },
    { name: 'snarkjs-verifier-runtime', version: '0.7.3', license: 'GPL-3.0 with Classpath Exception', purl: 'pkg:npm/snarkjs@0.7.3', cveCount: 0, status: 'Compliant' },
    { name: 'openssl-fips-provider', version: '3.0.8', license: 'Apache-2.0', purl: 'pkg:deb/debian/openssl@3.0.8', cveCount: 0, status: 'FIPS Attested' },
  ];

  const cbomEntries = [
    { algorithm: 'AES-256-GCM', purpose: 'Rest & Transit Symmetric Encryption', fipsCert: 'NIST CAVP #A2845', pqcReady: 'Ready (Kyber hybrid)' },
    { algorithm: 'SHA-384 & SHA-512', purpose: 'Audit Trail Merkle Hashing', fipsCert: 'NIST SHS #4112', pqcReady: 'PQC Quantum Safe' },
    { algorithm: 'zk-SNARK Groth16', purpose: 'Zero-Knowledge Privacy Attestation', fipsCert: 'Internal Cryptographic Proof', pqcReady: 'ZK Verification' },
    { algorithm: 'PKCS#11 v2.40', purpose: 'Hardware Security Module Key Derivation', fipsCert: 'FIPS-140-3 Level 3 (Thales Luna)', pqcReady: 'Hardware Enclave' },
  ];

  const hbomEntries = [
    { component: 'Enterprise 2U Rack Chassis', specs: 'Dual Intel Xeon Gold 6338 (64 vCPUs)', quantity: 2, vendor: 'Dell PowerEdge R750' },
    { component: 'Hardware Security Module', specs: 'PCIe FIPS-140-3 Level 3 Cryptographic Appliance', quantity: 2, vendor: 'Thales Luna PCIe HSM 7000' },
    { component: 'AI Acceleration Accelerators', specs: 'NVIDIA A100 Tensor Core 80GB NVLink', quantity: 4, vendor: 'NVIDIA Enterprise' },
    { component: 'Enterprise NVMe RAID Array', specs: '12x 3.84TB PCIe Gen4 U.2 SSDs (RAID 10)', quantity: 2, vendor: 'Samsung PM1733 Enterprise' },
  ];

  const aibomEntries = [
    { modelName: 'CTGAN-Banking-v4', architecture: 'Conditional Tabular GAN', epsilonTarget: 'ε <= 0.5', deltaTarget: 'δ <= 10^-5', lineage: 'SBI Transaction Anonymized Seed Matrix' },
    { modelName: 'PrivaSapien-Diffusion-Gen', architecture: 'Generative Denoising Diffusion Probabilistic Model', epsilonTarget: 'ε <= 0.35', deltaTarget: 'δ <= 10^-6', lineage: 'Synthetic Fraud Signal Generator' },
    { modelName: 'Laplace-Noise-Calibrator', architecture: 'Dynamic Privacy Budget Differential Engine', epsilonTarget: 'Global ε Budget Ledger', deltaTarget: 'Pure ε-DP', lineage: 'Mathematical Noise Kernel' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Technical & Architecture BOM Suite (X-BOM)
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
              Cluster 2 · Sections 9–12
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Unified Bill of Materials suite covering Software (CycloneDX SBOM), Cryptography (FIPS-140-3 CBOM), Hardware/Appliance (HBOM), and AI Models (AIBOM with ε and δ parameters).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>FIPS-140-3 & CycloneDX Certified</span>
          </span>
        </div>
      </div>

      {/* BOM Sub-Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveBomTab('sbom')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeBomTab === 'sbom'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>SBOM (CycloneDX)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveBomTab('cbom')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeBomTab === 'cbom'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>CBOM (FIPS-140-3)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveBomTab('hbom')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeBomTab === 'hbom'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>HBOM (Hardware/HSM)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveBomTab('aibom')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeBomTab === 'aibom'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>AIBOM (AI & ε/δ Parameters)</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Standard Technical Tender Annexure B
          </div>
        </div>

        {/* Tab 1: SBOM */}
        {activeBomTab === 'sbom' && (
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Component Package</th>
                  <th className="py-2.5 px-3">Version</th>
                  <th className="py-2.5 px-3">License Model</th>
                  <th className="py-2.5 px-3 font-mono">Package URL (purl)</th>
                  <th className="py-2.5 px-3 text-center">Vulnerabilities</th>
                  <th className="py-2.5 px-3 text-right">Attestation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sbomComponents.map((c) => (
                  <tr key={c.name} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{c.name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{c.version}</td>
                    <td className="py-2.5 px-3 text-slate-700">{c.license}</td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">{c.purl}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        0 CVEs
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-600 font-bold text-[11px]">
                      {c.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: CBOM */}
        {activeBomTab === 'cbom' && (
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Cryptographic Primitive</th>
                  <th className="py-2.5 px-3">Application Purpose</th>
                  <th className="py-2.5 px-3">FIPS-140-3 Certificate</th>
                  <th className="py-2.5 px-3 text-right">Post-Quantum Readiness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cbomEntries.map((c) => (
                  <tr key={c.algorithm} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-bold text-slate-900 font-mono">{c.algorithm}</td>
                    <td className="py-2.5 px-3 text-slate-700">{c.purpose}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 font-semibold">{c.fipsCert}</td>
                    <td className="py-2.5 px-3 text-right text-indigo-600 font-bold">{c.pqcReady}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: HBOM */}
        {activeBomTab === 'hbom' && (
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Hardware Appliance</th>
                  <th className="py-2.5 px-3">Technical Specifications</th>
                  <th className="py-2.5 px-3 text-center">Unit Count</th>
                  <th className="py-2.5 px-3 text-right">OEM / Vendor Specification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hbomEntries.map((c) => (
                  <tr key={c.component} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{c.component}</td>
                    <td className="py-2.5 px-3 text-slate-700">{c.specs}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-900 tabular-nums">
                      {c.quantity} Units
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-600">{c.vendor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: AIBOM */}
        {activeBomTab === 'aibom' && (
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">AI / PET Model</th>
                  <th className="py-2.5 px-3">Model Architecture</th>
                  <th className="py-2.5 px-3 font-mono">Epsilon (ε) Ceiling</th>
                  <th className="py-2.5 px-3 font-mono">Delta (δ) Floor</th>
                  <th className="py-2.5 px-3 text-right">Training Lineage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {aibomEntries.map((c) => (
                  <tr key={c.modelName} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{c.modelName}</td>
                    <td className="py-2.5 px-3 text-slate-700">{c.architecture}</td>
                    <td className="py-2.5 px-3 font-mono text-indigo-700 font-bold">{c.epsilonTarget}</td>
                    <td className="py-2.5 px-3 font-mono text-purple-700 font-bold">{c.deltaTarget}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500 text-[11px]">{c.lineage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Embedded Tasks & Comments for X-BOM Section */}
      <SectionTasksComments sectionId="xbom" sectionTitle="Technical & Architecture BOMs" />
    </div>
  );
};
