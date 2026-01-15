import React from "react";
import { BLOCKS } from "./blocks/registry";

interface BlockSidebarProps {
    onAdd: (category: string, type: string) => void;
    onDragEnd: (dragEvent: React.DragEvent, cat: string, type: string) => void;
}

export const BlockSidebar: React.FC<BlockSidebarProps> = ({
    onAdd,
    onDragEnd,
}) => {
    const [draggingBlock, setDraggingBlock] = React.useState<{ category: string; type: string } | null>(null);

    return (
        <div className="block-sidebar">
            <h3 className="sidebar-title">Blocks</h3>
            {Object.entries(BLOCKS).map(([cat, sub]) => (
                <div key={cat}>
                    <h1>{cat}</h1>
                    <div className="sidebar-blocks">
                        {Object.entries(sub).map(([type, def]) => (
                            <div
                                key={type}
                                className="sidebar-block"
                                draggable
                                onDragStart={() => setDraggingBlock({ category: cat, type })}
                                onDragEnd={(e) => onDragEnd(e, draggingBlock!.category, draggingBlock!.type)}
                                onDoubleClick={() => onAdd(cat, type)}
                            >
                                <div className="sidebar-block-icon">
                                    {def.img ? <img src={def.img}></img> : def.icon && <>{def.icon}</>}
                                </div>
                                <div className="sidebar-block-label">{def.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
