import React from 'react';
import { CircleDot, Sprout, Sun, Wheat } from 'lucide-react';

export const StagePill = ({ stage }) => {
  const STAGES = ['Planted', 'Growing', 'Ready', 'Harvested'];
  const currentIndex = STAGES.indexOf(stage);

  return (
    <div className="flex items-center gap-2">
      {STAGES.map((s, idx) => {
        const isPast = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isFuture = idx > currentIndex;

        let iconColor = 'text-earth-200';
        if (isPast) iconColor = 'text-earth-600';
        if (isCurrent) iconColor = 'text-amber-dark';

        let Icon = CircleDot;
        if (s === 'Planted') Icon = Sprout;
        if (s === 'Growing') Icon = Sun;
        if (s === 'Harvested') Icon = Wheat;

        return (
          <div key={s} className="flex items-center" title={s}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
            {idx < STAGES.length - 1 && (
              <div 
                className={`w-4 h-0.5 mx-1 ${isPast ? 'bg-earth-600' : 'bg-earth-200'}`} 
              />
            )}
          </div>
        );
      })}
      <span className="ml-2 text-sm font-medium text-earth-700">{stage}</span>
    </div>
  );
};
