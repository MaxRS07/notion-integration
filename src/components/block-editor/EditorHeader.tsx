import React, { useRef } from "react";

interface BlockHeaderProps {
    name: string;
    isEditing: boolean;
    canSave: boolean;
    onNameChange: (v: string) => void;
    onStartEdit: () => void;
    onFinishEdit: () => void;
    onCancelEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
}

export const BlockHeader: React.FC<BlockHeaderProps> = ({
    name,
    isEditing,
    canSave,
    onNameChange,
    onStartEdit,
    onFinishEdit,
    onCancelEdit,
    onSave,
    onCancel,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="block-editor-header">
            <div className="editor-header-left">
                {isEditing ? (
                    <input
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
