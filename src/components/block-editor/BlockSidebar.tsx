import React from "react";
import { BLOCKS } from "./blocks/registry";

interface BlockSidebarProps {
    onAdd: (category: string, type: string) => void;
    onDragStart: (type: string) => void;
    onDragEnd: () => void;
}

export const BlockSidebar: React.FC<BlockSidebarProps> = ({
    onAdd,
    onDragStart,
    onDragEnd,
}) => {
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
                                onDragStart={() => onDragStart(type)}
                                onDragEnd={onDragEnd}
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
