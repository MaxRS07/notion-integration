import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import {
  createEditor,
  Descendant,
  Editor,
  Transforms,
} from 'slate';
import {
  Slate,
  Editable,
  RenderElementProps,
  withReact,
  ReactEditor,
} from 'slate-react';

import { VariableGroup, VariableOption } from '../../../models/shared/mapvar';
import { DatabaseColumn, NotionType } from '../../../models/notion/types';
import { VariablePickerOverlay } from '../../wizard/VariablePickerOverlay';

type VariableElement = {
  type: 'variable';
  variable: VariableOption;
  children: [{ text: '' }];
};

type ParagraphElement = {
  type: 'paragraph';
  children: Descendant[];
};

type CustomElement = VariableElement | ParagraphElement;
type CustomText = { text: string };

declare module 'slate' {
  interface CustomTypes {
    Editor: Editor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

/* ------------------------------------------------------------------ */
/* Editor behavior                                                      */
/* ------------------------------------------------------------------ */

function withVariables(editor: Editor) {
  const { isInline, isVoid } = editor;

  editor.isInline = element =>
    element.type === 'variable' ? true : isInline(element);

  editor.isVoid = element =>
    element.type === 'variable' ? true : isVoid(element);

  return editor;
}

function insertVariable(
  editor: Editor,
  variable: VariableOption
) {
  const node: VariableElement = {
    type: 'variable',
    variable,
    children: [{ text: '' }],
  };

  Transforms.insertNodes(editor, node);

  // Move cursor to the right of the void element
  Transforms.move(editor, { unit: 'character', distance: 1 });
}

function serializeValue(nodes: Descendant[]): string {
  return nodes
    .map(node => {
      if (node.type === 'paragraph') {
        return node.children
          .map(child => {
            if ('variable' in child && child.type === 'variable') {
              return `{{${child.variable.id}}}`;
            }
            return child.text || '';
          })
          .join('');
      }
      return '';
    })
    .join('');
}

function deserializeValue(
  value: string | undefined,
  variableGroups: VariableGroup[]
): Descendant[] {
  if (!value) {
    return [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ];
  }

  const allVariables = variableGroups.flatMap(g => g.options);
  const regex = /{{(.*?)}}/g;

  const children: Descendant[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(value)) !== null) {
    const before = value.slice(lastIndex, match.index);
    if (before) {
      children.push({ text: before });
    }

    const variable = allVariables.find(v => v.id === match![1]);
    if (variable) {
      children.push({
        type: 'variable',
        variable,
        children: [{ text: '' }],
      });
    } else {
      // Fallback to raw text if variable is missing
      children.push({ text: match![0] });
    }

    lastIndex = regex.lastIndex;
  }

  const after = value.slice(lastIndex);
  if (after) {
    children.push({ text: after });
  }

  return [
    {
      type: 'paragraph',
      children: children.length ? children : [{ text: '' }],
    },
  ];
}

function withDeletableVariables(editor: Editor) {
  const { deleteBackward, deleteForward } = editor;

  editor.deleteBackward = unit => {
    const { selection } = editor;

    if (selection) {
      // Try to find and delete a variable element before the cursor
      const [parentNode, parentPath] = Editor.node(editor, selection.anchor.path);

      if (parentNode && 'children' in parentNode && Array.isArray(parentNode.children)) {
        const children = parentNode.children;
        const offset = selection.anchor.offset;

        // Check if the previous sibling is a variable
        if (offset > 0) {
          const prevNode = children[offset - 1];
          if (prevNode && typeof prevNode === 'object' && 'type' in prevNode && prevNode.type === 'variable') {
            Transforms.removeNodes(editor, {
              at: [...selection.anchor.path.slice(0, -1), offset - 1],
            });
            return;
          }
        }
      }
    }

    deleteBackward(unit);
  };

  editor.deleteForward = unit => {
    const { selection } = editor;

    if (selection) {
      // Try to find and delete a variable element after the cursor
      const [parentNode, parentPath] = Editor.node(editor, selection.anchor.path);

      if (parentNode && 'children' in parentNode && Array.isArray(parentNode.children)) {
        const children = parentNode.children;
        const offset = selection.anchor.offset;

        // Check if the next sibling is a variable
        if (offset < children.length) {
          const nextNode = children[offset];
          if (nextNode && typeof nextNode === 'object' && 'type' in nextNode && nextNode.type === 'variable') {
            Transforms.removeNodes(editor, {
              at: [...selection.anchor.path.slice(0, -1), offset],
            });
            return;
          }
        }
      }
    }

    deleteForward(unit);
  };

  return editor;
}

/* ------------------------------------------------------------------ */
/* Public API                                                           */
/* ------------------------------------------------------------------ */

export interface TokenizedInputHandle {
  insertVariable: (variable: VariableOption) => void;
}

interface TokenizedInputProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;

  column?: DatabaseColumn;

  variableGroups: VariableGroup[];
  setVariableGroups: React.Dispatch<React.SetStateAction<VariableGroup[]>>;
  blockIndex: number;
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export const TokenizedInput = forwardRef<TokenizedInputHandle, TokenizedInputProps>((props, ref) => {
  const { placeholder, disabled, onChange, column, variableGroups, setVariableGroups, blockIndex } = props;
  const [focused, setFocused] = useState(false);

  const [editor] = useState(() =>
    withDeletableVariables(withVariables(withReact(createEditor())))
  );

  const [fieldFocused, setFieldFocused] = useState<HTMLElement | null>(null);
  const [variableQuery, setVariableQuery] = useState('');

  const handleFocus = (e: React.FocusEvent<HTMLElement>) => {
    setFocused(true);
    setFieldFocused(e.currentTarget);

    if (column?.select) {
      const selectGroup: VariableGroup = {
        label: 'Select',
        options: column.select.options.map(o => ({
          id: o.id,
          name: o.name,
          description: o.description,
          bgColor: o.color,
          dataType: NotionType.Select
        })),
      };

      setVariableGroups(prev =>
        prev.some(g => g.label === 'Select') ? prev : [selectGroup, ...prev]
      );
    }
  };

  const handleBlur = () => {
    setFocused(false);
    setFieldFocused(null);

    if (column?.select) {
      setVariableGroups(prev => prev.filter(g => g.label !== 'Select'));
    }
  };

  const [editorValue, setEditorValue] = useState<Descendant[]>(() =>
    deserializeValue(props.value, variableGroups)
  );


  useImperativeHandle(ref, () => ({
    insertVariable: variable => {
      insertVariable(editor, variable);
      ReactEditor.focus(editor);
    },
  }));

  React.useEffect(() => {
    setEditorValue(deserializeValue(props.value, variableGroups));
  }, [props.value, variableGroups]);

  const isEmpty =
    editorValue.length === 1 &&
    editorValue[0].type === 'paragraph' &&
    (editorValue[0] as ParagraphElement).children.length === 1 &&
    ((editorValue[0] as ParagraphElement).children[0] as CustomText).text === '';

  const renderElement = (props: RenderElementProps) => {
    const { attributes, children, element } = props;
    switch (element.type) {
      case 'variable':
        const varElement = element as VariableElement;
        return (
          <span
            {...attributes}
            className="variable-inline-block"
            contentEditable={false}
            data-var-id={varElement.variable.id}
            data-var-name={varElement.variable.name}
          >
            {varElement.variable.img && (
              <img
                src={varElement.variable.img}
                style={{
                  width: '14px',
                  height: '14px',
                  verticalAlign: 'middle',
                }}
                alt={varElement.variable.name}
              />
            )}
            <span>{varElement.variable.name}</span>
            <span style={{ position: 'absolute', pointerEvents: 'none' }}>{children}</span>
          </span>
        );
      default:
        return (
          <p {...attributes} style={{ position: 'relative' }}>
            {!focused && isEmpty && placeholder && (
              <span
                className='mapping-input-placeholder'
              >
                {placeholder}
              </span>
            )}
            {children}
          </p>
        );
    }
  };

  return (
    <Slate
      editor={editor}
      value={editorValue}
      onChange={(desc) => {
        setEditorValue(prev => (prev === desc ? prev : desc));
        const serialized = serializeValue(desc);
        onChange?.(serialized);

        let last = serialized.split(' ').pop() || '';
        const idx = last.lastIndexOf('}}');
        if (idx !== -1) last = last.substring(idx + 2);
        setVariableQuery(last);
      }}
      initialValue={[]}
    >
      <Editable
        disabled={disabled}
        role="textbox"
        aria-multiline
        spellCheck
        renderElement={renderElement}
        className='mapping-input mapping-field-input'
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      <VariablePickerOverlay
        isOpen={fieldFocused !== null}
        onClose={() => { }}
        query={variableQuery}
        variableGroups={variableGroups}
        blockIndex={blockIndex}
        inputElement={fieldFocused ?? undefined}
        onSelect={(variable) => {
          if (typeof ref === 'object' && ref?.current?.insertVariable) {
            ref.current.insertVariable(variable);
          }
        }}
      />
    </Slate>
  );
});

TokenizedInput.displayName = 'TokenizedInput';
