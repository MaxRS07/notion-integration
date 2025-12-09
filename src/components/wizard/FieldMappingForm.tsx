import React from 'react';

interface DatabaseColumn {
  id: string;
  name: string;
  type: 'title' | 'text' | 'number' | 'select' | 'multi_select' | 'date' | 'checkbox' | 'url' | 'email' | 'phone';
}

interface FieldMappingFormProps {
  databaseColumns: DatabaseColumn[];
  templateValues: Record<string, string>;
  onTemplateChange: (columnId: string, value: string) => void;
  onBack: () => void;
  onSync: () => void;
}

export const FieldMappingForm: React.FC<FieldMappingFormProps> = ({
  databaseColumns,
  templateValues,
  onTemplateChange,
  onBack,
  onSync,
}) => {
  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2 className="step-title">Map Canvas fields to your Notion database</h2>
        <p className="step-description">
          Enter text or use variables like <code>{`{course.name}`}</code>,
          <code>{`{assignment.due_at}`}</code>, etc.
        </p>
      </div>

      <form className="mapping-form">
        {databaseColumns.map((col) => (
          <div key={col.id + col.name} className="mapping-field">
            <label className="mapping-label">
              {col.name}
              <span className="mapping-type-tag">{col.type}</span>
            </label>

            <textarea
              className="mapping-input"
              rows={2}
              placeholder={`Enter value... e.g. {assignment.name}`}
              value={templateValues[col.id] || ""}
              onChange={(e) => onTemplateChange(col.id, e.target.value)}
            />
          </div>
        ))}
      </form>

      <div className="wizard-actions">
        <button className="button button-primary button-large" onClick={onBack}>
          Back
        </button>

        <button
          className="button button-primary accent button-large"
          onClick={onSync}
        >
          Sync Now
        </button>
      </div>
    </div>
  );
};
