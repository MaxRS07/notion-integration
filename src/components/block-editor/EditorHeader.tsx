import React, { useRef, useState } from "react";
import runIcon from '../../assets/icons/play.png'
import stopIcon from '../../assets/icons/stop.png'

const ICON_OPTIONS = [
    '⚙️', '🔄', '📝', '📊', '🎯', '💾',
    '🔗', '📧', '⏰', '✅', '❌', '🚀'
];

interface BlockHeaderProps {
    name: string;
    isEditing: boolean;
    canSave: boolean;
    running: boolean;
    onNameChange: (v: string) => void;
    onStartEdit: () => void;
    onFinishEdit: () => void;
    onCancelEdit: () => void;
    onRun: () => void;
    onStop: () => void;
    onSave: () => void;
    onCancel: () => void;
}

export const BlockHeader: React.FC<BlockHeaderProps> = ({
    name,
    isEditing,
    canSave,
    running,
    onNameChange,
    onStartEdit,
    onFinishEdit,
    onCancelEdit,
    onRun,
    onStop,
    onSave,
    onCancel,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0]);
    const [showIconPicker, setShowIconPicker] = useState(false);

    return (
        <div className="block-editor-header">
            <div className="editor-header-left">
                <div className="icon-selector-wrapper">
                    <button
                        className="icon-selector-btn"
                        onClick={() => setShowIconPicker(!showIconPicker)}
                        title="Select icon"
                    >
                        {selectedIcon}
                    </button>
                    {showIconPicker && (
                        <div className="icon-picker">
                            {ICON_OPTIONS.map((icon) => (
                                <button
                                    key={icon}
                                    className={`icon-option ${icon === selectedIcon ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedIcon(icon);
                                        setShowIconPicker(false);
                                    }}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <input
                        className="editor-name-input"
                        ref={inputRef}
                        value={name}
                        onChange={e => onNameChange(e.target.value)}
                        onBlur={onFinishEdit}
                        onKeyDown={e => {
                            if (e.key === "Enter") onFinishEdit();
                            if (e.key === "Escape") onCancelEdit();
                        }}
                        autoFocus
                    />
                ) : (
                    <h1 className="editor-name" onClick={onStartEdit}>
                        {name}
                    </h1>
                )}
            </div>

            <div className="editor-header-actions">
                <button className="block-run-btn" onClick={running ? onStop : onRun}>
                    <img src={running ? stopIcon : runIcon} alt={running ? "Stop" : "Run"} />
                </button>
                <button className="button button-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button
                    className="button button-primary accent"
                    disabled={!canSave}
                    onClick={onSave}
                >
                    Save Action
                </button>
            </div>
        </div>
    );
};
