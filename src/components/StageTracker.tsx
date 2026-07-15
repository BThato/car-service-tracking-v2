import { getStagesForServiceType } from '../config/serviceStages';

interface StageTrackerProps {
  currentStage: string;
  serviceType?: string;
  compact?: boolean;
}

function StageTracker({ currentStage, serviceType = 'other', compact = false }: StageTrackerProps) {
  const stages = getStagesForServiceType(serviceType);
  const currentIndex = stages.findIndex(s => s.key === currentStage);
  const totalStages = stages.length;
  const completedCount = currentIndex;
  const progressPercent = totalStages > 1 ? Math.round((currentIndex / (totalStages - 1)) * 100) : 0;

  if (compact) {
    return (
      <div className="stage-compact">
        <div className="stage-progress-bar">
          <div className="stage-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="stage-progress-info">
          <span className="stage-current-label">
            {stages[currentIndex]?.icon} {stages[currentIndex]?.label || currentStage}
          </span>
          <span className="stage-progress-text">{completedCount}/{totalStages - 1} steps</span>
        </div>
      </div>
    );
  }

  return (
    <div className="stage-tracker-v2">
      <div className="stage-track">
        <div className="stage-track-line" />
        <div className="stage-track-fill" style={{ width: `${progressPercent}%` }} />
        {stages.map((stage, index) => {
          let status = 'pending';
          if (index < currentIndex) status = 'completed';
          if (index === currentIndex) status = 'active';

          return (
            <div
              key={stage.key}
              className={`stage-dot ${status}`}
              style={{ left: `${totalStages > 1 ? (index / (totalStages - 1)) * 100 : 0}%` }}
              title={stage.label}
            >
              <div className="stage-dot-circle">{stage.icon}</div>
            </div>
          );
        })}
      </div>
      <div className="stage-labels-row">
        <span className="stage-label-start">{stages[0]?.label}</span>
        <span className="stage-label-current">
          {currentStage === 'completed' ? 'Completed' : `Step ${currentIndex + 1}/${totalStages}: ${stages[currentIndex]?.label}`}
        </span>
        <span className="stage-label-end">{stages[totalStages - 1]?.label}</span>
      </div>
    </div>
  );
}

export default StageTracker;
