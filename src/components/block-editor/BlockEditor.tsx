import React, { useState, DragEvent } from "react";
import { BLOCKS } from "./blocks/registry";
import { BlockSidebar } from "./BlockSidebar";
import { BlockHeader } from "./EditorHeader";
import { BlockFlow } from "./Flow";
import { BlockData, EditorBlock } from "./types";
import "./BlockEditor.css";
import { DisplayVariable, Variable, VariableGroup } from "../../models/shared/mapvar";

interface BlockEditorProps {
  initialBlocks?: BlockData[];
  initialActionName?: string;
  onSave: (blocks: BlockData[], actionName: string) => void;
  onCancel: () => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  initialBlocks = [],
  initialActionName = "Untitled Action",
  onSave,
  onCancel,
}) => {
  const [blocks, setBlocks] = useState<EditorBlock[]>(() =>
    initialBlocks.map(b => {
      const def = BLOCKS[b.type];
      return {
        id: crypto.randomUUID(),
        type: b.type,
        definition: def,
        data: b.data ?? def.defaultData,
      };
    })
  );

  const [actionName, setActionName] = useState(initialActionName);
  const [editingName, setEditingName] = useState(false);

  const [draggedType, setDraggedType] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const [environmentVars, setEnvironmentVars] = useState<Record<string, DisplayVariable>>({});

  const [runtimeVars, setRuntimeVars] = useState<Record<string, Variable<any>>>({});

  /* ---------------- block ops ---------------- */

  const addBlock = (cat: string, type: string, index?: number) => {
    const def = BLOCKS[cat][type];
    const block: EditorBlock = {
      id: crypto.randomUUID(),
      type,
      definition: def,
      data: def.defaultData,
    };

    block.definition.onAdd?.(block.data, { environmentVars, setEnvironmentVars });

    setBlocks(prev =>
      index === undefined
        ? [...prev, block]
        : [...prev.slice(0, index), block, ...prev.slice(index)]
    );
  };

  const updateBlock = (id: string, data: any) =>
    setBlocks(prev => prev.map(b => (b.id === id ? { ...b, data } : b)));

  const removeBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));

    const block = blocks.find(b => b.id === id);
    block?.definition.onRemove?.(block.data, { environmentVars, setEnvironmentVars });

    setCollapsed(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const moveBlock = (from: number, to: number) => {
    setBlocks(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      return copy;
    });
  };

  const toggleCollapse = (id: string) =>
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  /* ---------------- drag & drop ---------------- */

  const onDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    setDropIndex(index);
  };

  const onDrop = (e: DragEvent, index: number) => {
    e.preventDefault();

    if (draggedType) {
      addBlock(draggedType, index);
    } else if (draggedId) {
      const from = blocks.findIndex(b => b.id === draggedId);
      if (from !== -1 && from !== index) moveBlock(from, index);
    }

    setDraggedType(null);
    setDraggedId(null);
    setDropIndex(null);
  };

  /* ---------------- save ---------------- */

  const canSave =
    blocks.length > 0 &&
    blocks.every(b =>
      b.definition.validate ? !b.definition.validate(b.data) : true
    );

  const handleSave = () =>
    onSave(
      blocks.map(b => ({ type: b.type, data: b.data })),
      actionName.trim() || "Untitled Action"
    );

  /* ---------------- render ---------------- */

  return (
    <div className="block-editor">
      <BlockSidebar
        onAdd={addBlock}
        onDragStart={setDraggedType}
        onDragEnd={() => setDraggedType(null)}
      />

      <div className="block-editor-main">
        <BlockHeader
          name={actionName}
          isEditing={editingName}
          canSave={canSave}
          onNameChange={setActionName}
          onStartEdit={() => setEditingName(true)}
          onFinishEdit={() => setEditingName(false)}
          onCancelEdit={() => {
            setActionName(initialActionName);
            setEditingName(false);
          }}
          onSave={handleSave}
          onCancel={onCancel}
        />

        <BlockFlow
          blocks={blocks}
          collapsed={collapsed}
          draggedId={draggedId}
          dropIndex={dropIndex}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onBlockDragStart={(e, id) => {
            setDraggedId(id);
            e.dataTransfer.effectAllowed = "move";
          }}
          onBlockDragEnd={() => setDraggedId(null)}
          onUpdateBlock={updateBlock}
          onRemoveBlock={removeBlock}
          onToggleCollapse={toggleCollapse}
          environmentVars={environmentVars}
          setEnvironmentVars={setEnvironmentVars}
        />
      </div>
    </div>
  );
};
