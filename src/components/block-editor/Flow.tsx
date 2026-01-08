import React, { DragEvent, Dispatch, SetStateAction } from "react";
import { EditorBlock } from "./types";
import { FlowBlock } from "./FlowBlock";
import { VariableGroup } from "../../models/shared/mapvar";

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
    environmentVars: Record<string, VariableGroup>;
    setEnvironmentVars: Dispatch<SetStateAction<Record<string, VariableGroup>>>;
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
    environmentVars,
    setEnvironmentVars
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
                        environmentVars={environmentVars}
                        setEnvironmentVars={setEnvironmentVars}
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
