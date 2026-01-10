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

import { VariableOption } from '../../../models/shared/mapvar';

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
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: String) => void;
  onFocus?: (el: React.FocusEvent<Element>) => void;
  onBlur?: () => void;
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export const TokenizedInput = forwardRef<TokenizedInputHandle, TokenizedInputProps>((props, ref) => {
  const { placeholder, disabled, onChange, onFocus, onBlur } = props;

  const [editor] = useState(() =>
    withDeletableVariables(withVariables(withReact(createEditor())))
  );

  const [value, setValue] = useState<Descendant[]>([
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ]);

  useImperativeHandle(ref, () => ({
    insertVariable: variable => {
      insertVariable(editor, variable);
      ReactEditor.focus(editor);
    },
  }));

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
        return <p {...attributes}>{children}</p>;
    }
  };

  return (
    <Slate
      editor={editor}
      initialValue={value}
      value={value}
      onChange={(desc) => { setValue(desc); onChange?.(serializeValue(desc)); }}
    >
      <Editable
        disabled={disabled}
        role="textbox"
        aria-multiline
        spellCheck
        placeholder={placeholder}
        renderElement={renderElement}
        className='mapping-input mapping-field-input'
        onFocus={(el) => onFocus?.(el)}
        onBlur={() => onBlur?.()}
      />
    </Slate>
  );
});

TokenizedInput.displayName = 'TokenizedInput';
