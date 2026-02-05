import React, { useState, useEffect } from 'react';
import { Settings } from '../types';
import { getPageList } from '../utils/notion';
import { NotionDestination } from './wizard/DestinationSelector';
import { BlockEditor, BlockData } from './block-editor/BlockEditor';

interface CanvasActionsProps {
  settings: Settings;
  onAction: (action: string) => Promise<void>;
}

interface SavedAction {
  id: string;
  name: string;
  blocks: BlockData[];
  enabled: boolean;
  createdAt: string;
}

const ACTIONS_STORAGE_KEY = 'canvas-actions';

export const CanvasActions: React.FC<CanvasActionsProps> = ({ settings, onAction }) => {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [savedActions, setSavedActions] = useState<SavedAction[]>([]);
  const [notionDestinations, setNotionDestinations] = useState<NotionDestination[]>([]);
  const [editingAction, setEditingAction] = useState<SavedAction | null>(null);

  const hasTokens = !!settings.canvasToken && !!settings.notionToken;

  // Load saved actions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(ACTIONS_STORAGE_KEY);
    if (stored) {
      setSavedActions(JSON.parse(stored));
    }
  }, []);

  // Save actions to localStorage
  const saveActionsToStorage = (actions: SavedAction[]) => {
    localStorage.setItem(ACTIONS_STORAGE_KEY, JSON.stringify(actions));
    setSavedActions(actions);
  };

  useEffect(() => {
    const fetchPages = async () => {
      const pages = await getPageList(settings.notionToken, '', 10);
      setNotionDestinations(
        pages?.results
          .filter(p => p.id && p.id !== '0')
          .map(p => new NotionDestination(p)) || []
      );
    };
    if (hasTokens) fetchPages();
  }, [settings.notionToken, hasTokens]);

  const handleSaveAction = (blocks: BlockData[], actionName: string) => {
    const newAction: SavedAction = {
      id: editingAction?.id || Date.now().toString(),
      name: actionName,
      blocks,
      enabled: true,
      createdAt: editingAction?.createdAt || new Date().toISOString(),
    };

    const updatedActions = editingAction
      ? savedActions.map(a => a.id === editingAction.id ? newAction : a)
      : [...savedActions, newAction];

    saveActionsToStorage(updatedActions);
    setView('list');
    setEditingAction(null);
  };

  const deleteAction = (id: string) => {
    const updatedActions = savedActions.filter(a => a.id !== id);
    saveActionsToStorage(updatedActions);
  };

  const toggleAction = (id: string) => {
    const updatedActions = savedActions.map(a =>
      a.id === id ? { ...a, enabled: !a.enabled } : a
    );
    saveActionsToStorage(updatedActions);
  };

  const startCreateFlow = () => {
    setEditingAction(null);
    setView('create');
  };

  const startEditFlow = (action: SavedAction) => {
    setEditingAction(action);
    setView('edit');
  };

  // Get summary from blocks
  const getActionSummary = (blocks: BlockData[]) => {
    const trigger = blocks.find(b => b.type === 'trigger');
    const action = blocks.find(b => b.type === 'action');
    const mapping = blocks.find(b => b.type === 'field-mapping');

    const parts: string[] = [];

    if (trigger?.data?.dataType) {
      parts.push(`${trigger.data.dataType}`);
    }

    if (trigger?.data?.pollInterval) {
      parts.push(`every ${trigger.data.pollInterval}min`);
    }

    if (action?.data?.actionType) {
      const actionName = action.data.actionType.replace(/_/g, ' ');
      parts.push(`→ ${actionName}`);
    }

    if (action?.data?.destination) {
      const dest = action.data.destination as NotionDestination;
      parts.push(`to ${dest.getName()}`);
    }

    if (mapping?.data?.mappings) {
      const count = Object.keys(mapping.data.mappings).length;
      if (count > 0) parts.push(`(${count} field${count > 1 ? 's' : ''})`);
    }

    return parts.join(' ');
  };

  if (!hasTokens) {
    return (
      <div className="integration-actions">
        <div className="actions-empty-state">
          <div className="empty-icon">⚠️</div>
          <h3 className="empty-title">Configuration Required</h3>
          <p className="empty-description">
            Please configure your Canvas and Notion tokens in Settings before syncing data.
          </p>
        </div>
      </div>
    );
  }

  if (view === 'create' || view === 'edit') {
    return (
      <div className="integration-actions" style={{ padding: 0, height: '100%' }}>
        <BlockEditor
          notionDestinations={notionDestinations}
          onSave={handleSaveAction}
          onCancel={() => {
            setView('list');
            setEditingAction(null);
          }}
          initialBlocks={editingAction?.blocks}
          initialActionName={editingAction?.name}
        />
      </div>
    );
  }

  return (
    <div className="integration-actions">
      <div className="automations-container">
        <div className="automations-header">
          <div>
            <h2 className="automations-title">Canvas Actions</h2>
            <p className="automations-description">
              Automated workflows to sync Canvas data to Notion
            </p>
          </div>
          <button
            className="button button-primary accent"
            onClick={startCreateFlow}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span style={{ fontSize: '18px' }}>+</span> Create Action
          </button>
        </div>

        {savedActions.length === 0 ? (
          <div className="automations-empty">
            <h3 className="empty-title">No actions yet</h3>
            <p className="empty-description">
              Create your first action to start syncing Canvas data to Notion
            </p>
            <button
              className="button button-primary accent"
              onClick={startCreateFlow}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '200px' }}
            >
              <span style={{ fontSize: '18px' }}>+</span> Create Action
            </button>
          </div>
        ) : (
          <div className="automations-list">
            {savedActions.map((action) => (
              <div key={action.id} className="automation-card">
                <div className="automation-header">
                  <div className="automation-info">
                    <h3 className="automation-name">{action.name}</h3>
                    <p className="automation-trigger">
                      {getActionSummary(action.blocks)}
                    </p>
                  </div>
                  <div className="automation-controls">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={action.enabled}
                        onChange={() => toggleAction(action.id)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <button
                      className="button-icon"
                      onClick={() => startEditFlow(action)}
                      title="Edit action"
                    >
                      ✏️
                    </button>
                    <button
                      className="button-icon button-danger"
                      onClick={() => deleteAction(action.id)}
                      title="Delete action"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="automation-actions">
                  <div className="actions-count">
                    {action.blocks.length} block{action.blocks.length > 1 ? 's' : ''} configured
                  </div>
                  <div className="actions-preview">
                    <div className="action-preview">
                      📅 Created: {new Date(action.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
