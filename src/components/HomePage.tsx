import React, { useState, useEffect } from 'react';
import { Settings } from '../types';
import { BlockEditor } from './block-editor/BlockEditor';
import { BlockData } from './block-editor/types';

interface HomePageProps {
    settings: Settings;
}

interface SavedAction {
    id: string;
    name: string;
    blocks: BlockData[];
    enabled: boolean;
    createdAt: string;
}

const ACTIONS_STORAGE_KEY = 'notion-actions';

export const HomePage: React.FC<HomePageProps> = ({ settings }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [savedActions, setSavedActions] = useState<SavedAction[]>([]);
    const [editingAction, setEditingAction] = useState<SavedAction | null>(null);

    // Load actions on mount
    useEffect(() => {
        const stored = localStorage.getItem(ACTIONS_STORAGE_KEY);
        if (stored) {
            setSavedActions(JSON.parse(stored));
        }
    }, []);

    const saveAction = (blocks: BlockData[], actionName: string) => {
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

        setSavedActions(updatedActions);
        localStorage.setItem(ACTIONS_STORAGE_KEY, JSON.stringify(updatedActions));
        setIsCreating(false);
        setEditingAction(null);
    };

    const deleteAction = (actionId: string) => {
        const updatedActions = savedActions.filter(a => a.id !== actionId);
        setSavedActions(updatedActions);
        localStorage.setItem(ACTIONS_STORAGE_KEY, JSON.stringify(updatedActions));
    };

    const toggleAction = (actionId: string) => {
        const updatedActions = savedActions.map(a =>
            a.id === actionId ? { ...a, enabled: !a.enabled } : a
        );
        setSavedActions(updatedActions);
        localStorage.setItem(ACTIONS_STORAGE_KEY, JSON.stringify(updatedActions));
    };

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
            const dest = action.data.destination as any;
            if (dest && typeof dest.getName === 'function') {
                parts.push(`to ${dest.getName()}`);
            }
        }

        if (mapping?.data?.mappings) {
            const count = Object.keys(mapping.data.mappings).length;
            if (count > 0) parts.push(`(${count} field${count > 1 ? 's' : ''})`);
        }

        return parts.join(' ');
    };

    // If creating or editing an action, show the editor
    if (isCreating) {
        return (
            <div className="home-page" style={{ padding: 0, height: '100%' }}>
                <button
                    className="back-button"
                    onClick={() => {
                        setIsCreating(false);
                        setEditingAction(null);
                    }}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        zIndex: 10,
                        padding: '8px 16px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                    }}
                >
                    ← Back
                </button>
                <div style={{ height: '100%', paddingTop: '60px' }}>
                    <BlockEditor
                        onSave={saveAction}
                        onCancel={() => {
                            setIsCreating(false);
                            setEditingAction(null);
                        }}
                        initialBlocks={editingAction?.blocks}
                        initialActionName={editingAction?.name}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="home-page">
            <div className="home-header" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '32px',
            }}>
                <div>
                    <h1 className="home-title">Actions</h1>
                    <p className="home-subtitle">Automate your workflow with custom actions</p>
                </div>
                <button
                    className="button button-primary accent"
                    onClick={() => {
                        setIsCreating(true);
                        setEditingAction(null);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <span style={{ fontSize: '18px' }}>+</span> Create Action
                </button>
            </div>

            {savedActions.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '64px 32px',
                    color: 'var(--text-secondary)',
                }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No actions yet</h3>
                    <p style={{ fontSize: '14px', marginBottom: '24px' }}>
                        Create your first action to automate your workflow
                    </p>
                    <button
                        className="button button-primary accent"
                        onClick={() => {
                            setIsCreating(true);
                            setEditingAction(null);
                        }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                        <span style={{ fontSize: '18px' }}>+</span> Create Action
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {savedActions.map((action) => (
                        <div key={action.id} className="automation-card" style={{
                            padding: '20px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-secondary)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: '0 0 8px 0' }}>{action.name}</h3>
                                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    {action.blocks.length} block{action.blocks.length > 1 ? 's' : ''} • Created {new Date(action.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                                    onClick={() => {
                                        setIsCreating(true);
                                        setEditingAction(action);
                                    }}
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
                    ))}
                </div>
            )}
        </div>
    );
};
