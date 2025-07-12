import React from 'react';
import Spinner from '@/components/ui/Spinner';

interface AnalysisProgressProps {
  isAnalyzing: boolean;
  progress: number;
  analysisLog: string[];
  currentStage: 'prediction' | 'llm' | 'complete';
  predictionResult?: any;
  error?: string;
}

const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ isAnalyzing }) => {
  if (!isAnalyzing) return null;
  return (
    <div className="flex justify-center items-center w-full py-8">
      <Spinner size={48} />
    </div>
  );
};

export default AnalysisProgress; 