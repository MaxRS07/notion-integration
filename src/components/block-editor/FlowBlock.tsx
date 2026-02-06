import React, { DragEvent, Dispatch, SetStateAction } from "react";
import { EditorBlock } from "./types";
import { BlockRenderer } from "./BlockRenderer";
import { VariableGroup, RuntimeVars } from "../../models/shared/mapvar";

interface FlowBlockProps {
    block: EditorBlock;
    index: number;
    isCollapsed: boolean;
    isDragging: boolean;
    onToggleCollapse: () => void;
    onRemove: () => void;
    onUpdate: (data: any) => void;
    onDragStart: (e: DragEvent) => void;
    onDragEnd: () => void;
    displayVariableGroups: VariableGroup[];
    setDisplayVariableGroups: Dispatch<SetStateAction<VariableGroup[]>>;
    runtimeVars: RuntimeVars;
    setRuntimeVars: Dispatch<SetStateAction<RuntimeVars>>;
}

export const FlowBlock: React.FC<FlowBlockProps> = ({
    block,
    index,
    isCollapsed,
    isDragging,
    onToggleCollapse,
    onRemove,
    onUpdate,
    onDragStart,
    onDragEnd,
    displayVariableGroups,
    setDisplayVariableGroups,
    runtimeVars,
    setRuntimeVars,
}) => {
    return (
        <div
            className={`flow-block ${isDragging ? "dragging" : ""} ${isCollapsed || !block.definition.isExpandable ? "collapsed" : ""
                }`}
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            <div className="block-controls">
                <button onClick={onToggleCollapse} className="block-control-btn">
                    {isCollapsed ? "▼" : "▲"}
                </button>
                <button className="block-control-btn block-remove" onClick={onRemove}>
                    ✕
                </button>
            </div>

            <div className="block-content">
                {block.definition.renderHeader ? (
                    block.definition.renderHeader({
                        data: block.data,
                        onChange: onUpdate,
                        displayVariableGroups,
                        setDisplayVariableGroups,
                        runtimeVars,
                        setRuntimeVars,
                        blockIndex: index,
                    })
                ) : isCollapsed ? (
                    <h3>{block.definition.label}</h3>
                ) : (
                    <BlockRenderer
                        block={block}
                        index={0}
                        onUpdate={onUpdate}
                        displayVariableGroups={displayVariableGroups}
                        setDisplayVariableGroups={setDisplayVariableGroups}
                        runtimeVars={runtimeVars}
                        setRuntimeVars={setRuntimeVars}
                        blockIndex={index}
                    />
                )}
            </div>

            {/* Render child blocks if they exist and block is expanded */}
            {block.children && block.children.length > 0 && !isCollapsed && (
                <div className="block-children" style={{ marginLeft: '20px', marginTop: '12px', paddingLeft: '12px', borderLeft: '2px solid var(--border-color)' }}>
                    {block.children.map((childBlock) => (
                        <FlowBlock
                            key={childBlock.id}
                            block={childBlock}
                            index={index}
                            isCollapsed={false}
                            isDragging={false}
                            onToggleCollapse={() => { }}
                            onRemove={() => { }}
                            onUpdate={() => { }}
                            onDragStart={() => { }}
                            onDragEnd={() => { }}
                            displayVariableGroups={displayVariableGroups}
                            setDisplayVariableGroups={setDisplayVariableGroups}
                            runtimeVars={runtimeVars}
                            setRuntimeVars={setRuntimeVars}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
