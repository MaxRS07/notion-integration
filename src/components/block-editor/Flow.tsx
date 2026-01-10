import React, { DragEvent, Dispatch, SetStateAction } from "react";
import { EditorBlock } from "./types";
import { FlowBlock } from "./FlowBlock";
import { VariableGroup, RuntimeVars } from "../../models/shared/mapvar";

interface BlockFlowProps {
    blocks: EditorBlock[];
    collapsed: Set<string>;
    draggedId: string | null;
    dropIndex: number | null;
    onDragOver: (e: DragEvent, index: number) => void;
    onDrop: (e: DragEvent, index: number) => void;
    onBlockDragStart: (e: DragEvent, id: string) => void;
    onBlockDragEnd: () => void;
    onUpdateBlock: (id: string, data: any) => void;
    onRemoveBlock: (id: string) => void;
    onToggleCollapse: (id: string) => void;
    displayVariableGroups: VariableGroup[];
    setDisplayVariableGroups: Dispatch<SetStateAction<VariableGroup[]>>;
    runtimeVars: RuntimeVars;
    setRuntimeVars: Dispatch<SetStateAction<RuntimeVars>>;
}

export const BlockFlow: React.FC<BlockFlowProps> = ({
    blocks,
    collapsed,
    draggedId,
    dropIndex,
    onDragOver,
    onDrop,
    onBlockDragStart,
    onBlockDragEnd,
    onUpdateBlock,
    onRemoveBlock,
    onToggleCollapse,
    displayVariableGroups,
    setDisplayVariableGroups,
    runtimeVars,
    setRuntimeVars,
}) => {
    return (
        <div className="block-flow">
            {blocks.map((block, index) => (
                <React.Fragment key={block.id}>
                    <div
                        className={`drop-zone ${dropIndex === index ? "active" : ""}`}
                        onDragOver={e => onDragOver(e, index)}
                        onDrop={e => onDrop(e, index)}
                    />

                    <FlowBlock
                        block={block}
                        index={index}
                        isCollapsed={collapsed.has(block.id)}
                        isDragging={draggedId === block.id}
                        onToggleCollapse={() => onToggleCollapse(block.id)}
                        onRemove={() => onRemoveBlock(block.id)}
                        onUpdate={data => onUpdateBlock(block.id, data)}
                        onDragStart={e => onBlockDragStart(e, block.id)}
                        onDragEnd={onBlockDragEnd}
                        displayVariableGroups={displayVariableGroups}
                        setDisplayVariableGroups={setDisplayVariableGroups}
                        runtimeVars={runtimeVars}
                        setRuntimeVars={setRuntimeVars}
                    />
                </React.Fragment>
            ))}

            <div
                className={`drop-zone ${dropIndex === blocks.length ? "active" : ""
                    }`}
                onDragOver={e => onDragOver(e, blocks.length)}
                onDrop={e => onDrop(e, blocks.length)}
            />
        </div>
    );
};
