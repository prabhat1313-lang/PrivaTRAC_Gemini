import React, { useState } from 'react';
import { useRfp } from '../../context/RfpContext';
import {
  Award,
  Sliders,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  BarChart,
  Shield,
} from 'lucide-react';
import { SectionTasksComments } from './SectionTasksComments';

export const TechnicalScoringSection: React.FC = () => {
  const [scores, setScores] = useState({
    architecture: 28, // Max 30
    dpBenchmark: 24, // Max 25
    syntheticFidelity: 19, // Max 20
    caseStudies: 14, // Max 15
    presentation: 9, // Max 10
  });

  const totalTechScore =
    scores.architecture +
    scores.dpBenchmark +
    scores.syntheticFidelity +
    scores.caseStudies +
    scores.presentation;

  // QCBS 80:20 (Quality 80% / Commercial 20%)
  const commercialScoreEst = 92; // Assuming competitive L1 commercial quote
  const compositeQcbsScore = (totalTechScore * 0.8 + commercialScoreEst * 0.2).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Technical Scoring Simulation & QCBS Rank Forecaster
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
              Cluster 1 · Section 2
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Simulate technical evaluation panel scoring across architectural criteria, differential privacy benchmark retainment, and presentation defense to project T1 / L1 status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Simulated Tech Score</div>
            <div className="text-xl font-bold text-indigo-600 tabular-nums">{totalTechScore} / 100</div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Composite QCBS (80:20)</div>
            <div className="text-xl font-bold text-emerald-600 tabular-nums">{compositeQcbsScore} (Rank T1)</div>
          </div>
        </div>
      </div>

      {/* Simulator Sliders */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Evaluation Criteria Weightage Sliders
        </h4>

        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-800">1. Architecture & Native PETs Framework (Max 30)</span>
              <span className="font-mono font-bold text-indigo-600">{scores.architecture} Marks</span>
            </div>
            <input
              type="range"
              min={15}
              max={30}
              value={scores.architecture}
              onChange={(e) => setScores({ ...scores, architecture: Number(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-800">2. Differential Privacy Accuracy & Noise Budget ε &le; 0.5 (Max 25)</span>
              <span className="font-mono font-bold text-indigo-600">{scores.dpBenchmark} Marks</span>
            </div>
            <input
              type="range"
              min={10}
              max={25}
              value={scores.dpBenchmark}
              onChange={(e) => setScores({ ...scores, dpBenchmark: Number(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-800">3. Synthetic Data Studio Covariance Fidelity & CTGAN (Max 20)</span>
              <span className="font-mono font-bold text-indigo-600">{scores.syntheticFidelity} Marks</span>
            </div>
            <input
              type="range"
              min={10}
              max={20}
              value={scores.syntheticFidelity}
              onChange={(e) => setScores({ ...scores, syntheticFidelity: Number(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-800">4. Scheduled Commercial Banking References (Max 15)</span>
              <span className="font-mono font-bold text-indigo-600">{scores.caseStudies} Marks</span>
            </div>
            <input
              type="range"
              min={5}
              max={15}
              value={scores.caseStudies}
              onChange={(e) => setScores({ ...scores, caseStudies: Number(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-800">5. Technical PoC & Oral Defense (Max 10)</span>
              <span className="font-mono font-bold text-indigo-600">{scores.presentation} Marks</span>
            </div>
            <input
              type="range"
              min={4}
              max={10}
              value={scores.presentation}
              onChange={(e) => setScores({ ...scores, presentation: Number(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>

        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Projected Technical Standing: <strong>T1 Leader (94.0%)</strong>. Qualified for commercial envelope opening with highest technical margin over competitor bids.
          </span>
        </div>
      </div>

      <SectionTasksComments sectionId="technicalScoring" sectionTitle="Technical Scoring Simulation" />
    </div>
  );
};
