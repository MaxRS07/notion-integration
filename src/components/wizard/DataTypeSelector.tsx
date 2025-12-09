import React from 'react';

type CanvasDataType = 'courses' | 'assignments' | 'announcements' | 'grades' | '';

interface DataTypeSelectorProps {
  selectedDataType: CanvasDataType;
  onSelectDataType: (type: CanvasDataType) => void;
}

export const DataTypeSelector: React.FC<DataTypeSelectorProps> = ({
  selectedDataType,
  onSelectDataType,
}) => {
  const canvasDataTypes = [
    { id: 'courses' as CanvasDataType, name: 'Courses', icon: '📚', description: 'Import your enrolled courses from Canvas' },
    { id: 'assignments' as CanvasDataType, name: 'Assignments', icon: '✅', description: 'Sync assignments and due dates' },
    { id: 'announcements' as CanvasDataType, name: 'Announcements', icon: '📢', description: 'Get course announcements' },
    { id: 'grades' as CanvasDataType, name: 'Grades', icon: '📊', description: 'Track your grades and scores' },
  ];

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2 className="step-title">What would you like to sync from Canvas?</h2>
        <p className="step-description">Select the type of data you want to import into Notion</p>
      </div>
      <div className="data-type-grid">
        {canvasDataTypes.map(dataType => (
          <button
            key={dataType.id}
            className={`data-type-card ${selectedDataType === dataType.id ? 'selected' : ''}`}
            onClick={() => onSelectDataType(dataType.id)}
          >
            <div className="data-type-icon">{dataType.icon}</div>
            <div className="data-type-info">
              <h3 className="data-type-name">{dataType.name}</h3>
              <p className="data-type-description">{dataType.description}</p>
            </div>
            <div className="data-type-arrow">→</div>
          </button>
        ))}
      </div>
    </div>
  );
};
