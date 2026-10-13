import React, { useState } from 'react';
import { FunnelView } from './FunnelView';
import { FiltersBar } from './FiltersBar';
import { AiPipelineAdvice } from './AiPipelineAdvice';
import { FocusArea } from './FocusArea';
import { AccountStage } from '../../types/crm';

export const DashboardView: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<AccountStage | undefined>(undefined);

  return (
    <div className="space-y-6">
      {/* 1. Multi-Select Filters Bar */}
      <FiltersBar />

      {/* 2. Visual Pipeline Funnel & Stage Reconciliation */}
      <FunnelView
        selectedStage={selectedStage}
        onSelectStage={(stage) => setSelectedStage((prev) => (prev === stage ? undefined : stage))}
      />

      {/* 3. AI Pipeline Intelligence & Strategic Suggestions */}
      <AiPipelineAdvice />

      {/* 4. Focus Area with 70/30 Task Prioritization */}
      <FocusArea />
    </div>
  );
};
