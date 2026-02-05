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
    const [searchQuery, setSearchQuery] = React.useState("");
    const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

    const categories = Object.keys(BLOCKS);

    // Filter blocks based on search and category
    const getVisibleBlocks = () => {
        const query = searchQuery.toLowerCase();
        const results: { [key: string]: { [key: string]: any } } = {};

        Object.entries(BLOCKS).forEach(([cat, sub]) => {
            if (selectedCategory && cat !== selectedCategory) return;

            const filtered = Object.entries(sub).filter(([type, def]) => {
                return def.label.toLowerCase().includes(query) || type.toLowerCase().includes(query);
            });

            if (filtered.length > 0) {
                results[cat] = Object.fromEntries(filtered);
            }
        });

        return results;
    };

    const visibleBlocks = getVisibleBlocks();

    return (
        <div className="block-sidebar">
            <div className="sidebar-search">
                <input
                    type="text"
                    placeholder="Search blocks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="sidebar-search-input"
                />
            </div>

            <div className="sidebar-categories">
                <button
                    className={`category-btn ${selectedCategory === null ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(null)}
                >
                    All
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="sidebar-blocks-container">
                {Object.entries(visibleBlocks).length === 0 ? (
                    <div className="no-blocks-message">No blocks found</div>
                ) : (
                    Object.entries(visibleBlocks).map(([cat, sub]) => (
                        <div key={cat}>
                            {!selectedCategory && <h4 className="category-heading">{cat}</h4>}
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
                    ))
                )}
            </div>
        </div>
    );
};
