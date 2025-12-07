import React, { useState } from 'react';
import { Settings } from '../types';

interface CanvasActionsProps {
  settings: Settings;
  onAction: (action: string) => Promise<void>;
}

interface Automation {
  id: string;
  name: string;
  trigger: string;
  actions: AutomationAction[];
  enabled: boolean;
}

interface AutomationAction {
  type: string;
  config: Record<string, any>;
}

export const CanvasActions: React.FC<CanvasActionsProps> = ({ settings, onAction }) => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);

  // Builder state
  const [automationName, setAutomationName] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState('');
  const [automationActions, setAutomationActions] = useState<AutomationAction[]>([]);

  const hasTokens = settings.canvasToken && settings.notionToken;

  const actionTypes = [
    {
      id: 'create-page',
      name: 'Create Notion Page',
      fields: [
        { name: 'database', label: 'Target Database', type: 'select', options: ['Courses', 'Assignments', 'Tasks'] },
        { name: 'title', label: 'Page Title', type: 'text', placeholder: 'e.g., {{course.name}}' },
      ]
    },
    {
      id: 'update-page',
      name: 'Update Notion Page',
      fields: [
        { name: 'database', label: 'Target Database', type: 'select', options: ['Courses', 'Assignments', 'Tasks'] },
        { name: 'property', label: 'Property to Update', type: 'text' },
        { name: 'value', label: 'New Value', type: 'text' },
      ]
    },
    {
      id: 'add-property',
      name: 'Add Database Property',
      fields: [
        { name: 'database', label: 'Target Database', type: 'select', options: ['Courses', 'Assignments', 'Tasks'] },
        { name: 'propertyName', label: 'Property Name', type: 'text' },
        { name: 'propertyType', label: 'Property Type', type: 'select', options: ['Text', 'Number', 'Date', 'Select', 'Multi-select', 'Checkbox'] },
      ]
    },
    {
      id: 'send-notification',
      name: 'Send Notification',
      fields: [
        { name: 'message', label: 'Message', type: 'textarea', placeholder: 'Assignment "{{assignment.name}}" is due soon!' },
      ]
    },
  ];

  const handleStartCreating = () => {
    setIsCreating(true);
    setEditingAutomation(null);
    setAutomationName('');
    setSelectedTrigger('');
    setAutomationActions([]);
  };

  const handleAddAction = () => {
    setAutomationActions([...automationActions, { type: '', config: {} }]);
  };

  const handleRemoveAction = (index: number) => {
    setAutomationActions(automationActions.filter((_, i) => i !== index));
  };

  const handleUpdateAction = (index: number, type: string, config: Record<string, any>) => {
    const updated = [...automationActions];
    updated[index] = { type, config };
    setAutomationActions(updated);
  };

  const handleSaveAutomation = () => {
    const newAutomation: Automation = {
      id: Date.now().toString(),
      name: automationName,
      trigger: selectedTrigger,
      actions: automationActions,
      enabled: true,
    };

    setAutomations([...automations, newAutomation]);
    setIsCreating(false);
    setAutomationName('');
    setSelectedTrigger('');
    setAutomationActions([]);
  };

  const handleToggleAutomation = (id: string) => {
    setAutomations(automations.map(a =>
      a.id === id ? { ...a, enabled: !a.enabled } : a
    ));
  };

  const handleDeleteAutomation = (id: string) => {
    if (confirm('Delete this automation?')) {
      setAutomations(automations.filter(a => a.id !== id));
    }
  };

  if (!hasTokens) {
    return (
      <div className="integration-actions">
        <div className="actions-empty-state">
          <div className="empty-icon">⚠️</div>
          <h3 className="empty-title">Configuration Required</h3>
          <p className="empty-description">
            Please configure your Canvas and Notion tokens in Settings before creating automations.
          </p>
        </div>
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="integration-actions">
        <div className="automation-builder">
          <div className="builder-header">
            <h2 className="builder-title">Create Automation</h2>
            <button className="button button-secondary" onClick={() => setIsCreating(false)}>
              Cancel
            </button>
          </div>

          <div className="builder-section">
            <label className="builder-label">Automation Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Create Notion page for new assignments"
              value={automationName}
              onChange={(e) => setAutomationName(e.target.value)}
            />
          </div>
          <div className="builder-section">
            <div className="section-header">
              <div>
                <label className="builder-label">Actions</label>
                <p className="builder-description">What should happen when triggered?</p>
              </div>
              <button className="button button-secondary" onClick={handleAddAction}>
                + Add Action
              </button>
            </div>

            <div className="actions-list">
              {automationActions.map((action, index) => (
                <div key={index} className="action-builder-card">
                  <div className="action-builder-header">
                    <span className="action-number">Action {index + 1}</span>
                    <button
                      className="button-icon"
                      onClick={() => handleRemoveAction(index)}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Action Type</label>
                    <select
                      className="form-select"
                      value={action.type}
                      onChange={(e) => {
                        const type = e.target.value;
                        handleUpdateAction(index, type, {});
                      }}
                    >
                      <option value="">Select action type...</option>
                      {actionTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>

                  {action.type && actionTypes.find(t => t.id === action.type)?.fields.map(field => (
                    <div key={field.name} className="form-group">
                      <label className="form-label">{field.label}</label>
                      {field.type === 'select' ? (
                        <select
                          className="form-select"
                          value={action.config[field.name] || ''}
                          onChange={(e) => {
                            const newConfig = { ...action.config, [field.name]: e.target.value };
                            handleUpdateAction(index, action.type, newConfig);
                          }}
                        >
                          <option value="">Select...</option>
                          {field.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          className="form-textarea"
                          value={action.config[field.name] || ''}
                          onChange={(e) => {
                            const newConfig = { ...action.config, [field.name]: e.target.value };
                            handleUpdateAction(index, action.type, newConfig);
                          }}
                          rows={3}
                        />
                      ) : (
                        <input
                          type="text"
                          className="form-input"
                          value={action.config[field.name] || ''}
                          onChange={(e) => {
                            const newConfig = { ...action.config, [field.name]: e.target.value };
                            handleUpdateAction(index, action.type, newConfig);
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {automationActions.length === 0 && (
                <div className="empty-actions">
                  Click "Add Action" to define what happens when this automation triggers
                </div>
              )}
            </div>
          </div>

          <div className="builder-footer">
            <button
              className="button button-primary button-large"
              onClick={handleSaveAutomation}
              disabled={!automationName || !selectedTrigger || automationActions.length === 0}
            >
              Create Automation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="integration-actions">
      <div className="automations-container">
        <div className="automations-header">
          <div>
            <h2 className="automations-title">Automations</h2>
            <p className="automations-description">
              Create automated workflows between Canvas and Notion
            </p>
          </div>
          <button className="button button-primary" onClick={handleStartCreating}>
            + New Automation
          </button>
        </div>

        {automations.length === 0 ? (
          <div className="automations-empty">
            <div className="empty-icon">⚡</div>
            <h3 className="empty-title">No Automations Yet</h3>
            <p className="empty-description">
              Create your first automation to automatically sync data between Canvas and Notion
            </p>
            <button className="button button-primary" onClick={handleStartCreating}>
              Create Your First Automation
            </button>
          </div>
        ) : (
          <div className="automations-list">
            {automations.map(automation => {
              return (
                <div key={automation.id} className="automation-card">
                  <div className="automation-header">
                    <div className="automation-info">
                      <h3 className="automation-name">{automation.name}</h3>
                    </div>
                    <div className="automation-controls">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={automation.enabled}
                          onChange={() => handleToggleAutomation(automation.id)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                      <button
                        className="button-icon button-danger"
                        onClick={() => handleDeleteAutomation(automation.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="automation-actions">
                    <div className="actions-count">
                      {automation.actions.length} action{automation.actions.length !== 1 ? 's' : ''}
                    </div>
                    <div className="actions-preview">
                      {automation.actions.map((action, idx) => {
                        const actionType = actionTypes.find(t => t.id === action.type);
                        return (
                          <div key={idx} className="action-preview">
                            {idx + 1}. {actionType?.name || action.type}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
