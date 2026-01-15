import React, { useEffect, useRef, useState } from "react";
import { BLOCKS } from "./blocks/registry";
import { BlockSidebar } from "./BlockSidebar";
import { BlockHeader } from "./EditorHeader";
import { BlockFlow } from "./Flow";
import { BlockData, EditorBlock } from "./types";
import "./BlockEditor.css";
import { VariableGroup, RuntimeVars } from "../../models/shared/mapvar";
import { BlockRuntimeContext } from "./blocks";
import { FlaskConical } from "lucide-react";

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
  /* ---------------- state ---------------- */

  const [blocks, setBlocks] = useState<EditorBlock[]>([]);
  const [actionName, setActionName] = useState(initialActionName);
  const [editingName, setEditingName] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const [displayVariableGroups, setDisplayVariableGroups] = useState<VariableGroup[]>([]);
  const [runtimeVars, setRuntimeVars] = useState<RuntimeVars>({});

  const [running, setRunning] = useState(false);

  /* ---------------- refs ---------------- */

  const flowRef = useRef<HTMLDivElement | null>(null);
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  /* ---------------- helpers ---------------- */

  const handleRun = async () => {
    setRunning(true);
    const context: BlockRuntimeContext = {
      runtimeVars: runtimeVars,
      setRuntimeVars: setRuntimeVars
    }
    for (const block of blocks) {
      await block.definition.onRun(block.data, context)
    }
    setRunning(false)
  }

  const isInsideFlow = (x: number, y: number) => {
    const rect = flowRef.current?.getBoundingClientRect();
    if (!rect) return false;

    return (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    );
  };

  const getInsertIndexFromY = (clientY: number): number => {
    const entries = Array.from(blockRefs.current.values());

    for (let i = 0; i < entries.length; i++) {
      const rect = entries[i].getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;

      if (clientY < midpoint) {
        return i;
      }
    }

    return entries.length;
  };

  /* ---------------- block ops ---------------- */

  const addBlock = (cat: string, type: string, index?: number) => {
    const def = BLOCKS[cat][type];

    const block: EditorBlock = {
      id: crypto.randomUUID(),
      type,
      definition: def,
      data: def.defaultData,
    };

    const insertIndex = index ?? blocks.length;

    block.definition.onAdd?.(block.data, {
      displayVariableGroups,
      setDisplayVariableGroups,
      runtimeVars,
      setRuntimeVars,
      blockIndex: insertIndex,
    });

    setBlocks(prev =>
      index === undefined
        ? [...prev, block]
        : [...prev.slice(0, index), block, ...prev.slice(index)]
    );
  };

  const updateBlock = (id: string, data: any) =>
    setBlocks(prev => prev.map(b => (b.id === id ? { ...b, data } : b)));

  const removeBlock = (id: string) => {
    const index = blocks.findIndex(b => b.id === id);
    const block = blocks[index];

    setBlocks(prev => prev.filter(b => b.id !== id));

    block?.definition.onRemove?.(block.data, {
      displayVariableGroups,
      setDisplayVariableGroups,
      runtimeVars,
      setRuntimeVars,
      blockIndex: index,
    });

    setCollapsed(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const toggleCollapse = (id: string) =>
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

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

  /* ---------------- drag from sidebar ---------------- */

  const handleSidebarDragEnd = (
    event: React.DragEvent,
    cat: string,
    type: string
  ) => {
    event.preventDefault();

    const { clientX, clientY } = event;

    if (!isInsideFlow(clientX, clientY)) return;

    const index = getInsertIndexFromY(clientY);
    addBlock(cat, type, index);
  };

  /* ---------------- render ---------------- */

  return (
    <div className="block-editor">
      <BlockSidebar
        onAdd={addBlock}
        onDragEnd={handleSidebarDragEnd}
      />

      <div className="block-editor-main">
        <BlockHeader
          name={actionName}
          isEditing={editingName}
          canSave={canSave}
          running={running}
          onNameChange={setActionName}
          onStartEdit={() => setEditingName(true)}
          onFinishEdit={() => setEditingName(false)}
          onCancelEdit={() => {
            setActionName(initialActionName);
            setEditingName(false);
          }}
          onSave={handleSave}
          onCancel={onCancel}
          onRun={handleRun}
          onStop={() => { }}
        />

        <div
          ref={flowRef}
          className="block-flow-container"
        >
          <BlockFlow
            blocks={blocks}
            collapsed={collapsed}
            draggedId={draggedId}
            registerBlockRef={(id, el) => {
              if (el) blockRefs.current.set(id, el);
              else blockRefs.current.delete(id);
            }}
            onBlockDragStart={(e, id) => {
              setDraggedId(id);
              e.dataTransfer.effectAllowed = "move";
            }}
            onBlockDragEnd={() => setDraggedId(null)}
            onUpdateBlock={updateBlock}
            onRemoveBlock={removeBlock}
            onToggleCollapse={toggleCollapse}
            displayVariableGroups={displayVariableGroups}
            setDisplayVariableGroups={setDisplayVariableGroups}
            runtimeVars={runtimeVars}
            setRuntimeVars={setRuntimeVars}
          />
        </div>
      </div>
    </div>
  );
};
