import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  createEditor,
  Descendant,
  Editor,
  Element as SlateElement,
  Node,
  Path,
  Range,
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
import { DatabaseColumn, NotionType, Option } from '../../../models/notion/types';
import { VariablePickerOverlay } from '../../wizard/VariablePickerOverlay';

/* ------------------------------------------------------------------ */
/* Custom Slate types                                                   */
/* ------------------------------------------------------------------ */

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
/* Editor plugins                                                       */
/* ------------------------------------------------------------------ */

/**
 * Marks variable elements as inline + void so Slate treats them as
 * atomic inline tokens that cannot be partially selected or edited.
 */
function withVariables(editor: Editor): Editor {
  const { isInline, isVoid } = editor;

  editor.isInline = (element) =>
    element.type === 'variable' ? true : isInline(element);

  editor.isVoid = (element) =>
    element.type === 'variable' ? true : isVoid(element);

  return editor;
}

/**
 * Normalizes the document after every operation to ensure:
 *  - There are no adjacent void nodes without a text node between them.
 *  - The paragraph always ends with a text node (so the cursor has a place to land).
 *
 * This eliminates the class of bugs where the cursor gets "stuck" or
 * backspace / delete don't work next to variable tokens.
 */
function withNormalizedVariables(editor: Editor): Editor {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    if (SlateElement.isElement(node) && node.type === 'paragraph') {
      const children = node.children;

      // Ensure text nodes exist between adjacent voids and at boundaries
      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i];
        const prev = i > 0 ? children[i - 1] : null;

        // Insert text node between two adjacent variables
        if (
          SlateElement.isElement(child) &&
          child.type === 'variable' &&
          prev &&
          SlateElement.isElement(prev) &&
          prev.type === 'variable'
        ) {
          Transforms.insertNodes(editor, { text: '' } as CustomText, {
            at: [...path, i],
          });
          return; // normalizeNode will be called again
        }

        // Insert text node before a leading variable
        if (i === 0 && SlateElement.isElement(child) && child.type === 'variable') {
          Transforms.insertNodes(editor, { text: '' } as CustomText, {
            at: [...path, 0],
          });
          return;
        }
      }

      // Ensure the paragraph ends with a text node
      const last = children[children.length - 1];
      if (last && SlateElement.isElement(last) && last.type === 'variable') {
        Transforms.insertNodes(editor, { text: '' } as CustomText, {
          at: [...path, children.length],
        });
        return;
      }
    }

    normalizeNode(entry);
  };

  return editor;
}

/**
 * Ensures single-line behavior: prevents Enter from creating new paragraphs.
 */
function withSingleLine(editor: Editor): Editor {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    // No-op: prevent newlines in this input
  };

  return editor;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

function insertVariable(editor: Editor, variable: VariableOption): void {
  const node: VariableElement = {
    type: 'variable',
    variable,
    children: [{ text: '' }],
  };

  Transforms.insertNodes(editor, node);
  Transforms.move(editor, { unit: 'offset' });
}

function serializeNodes(nodes: Descendant[]): string {
  return nodes
    .map((node: any) => {
      if (node.type === 'paragraph') {
        return (node.children as any[])
          .map((child) => {
            if (child.type === 'variable') {
              return `{{${child.variable.id}}}`;
            }
            return child.text ?? '';
          })
          .join('');
      }
      return '';
    })
    .join('');
}

function deserializeValue(
  value: string | undefined,
  variableGroups: VariableGroup[],
): Descendant[] {
  if (!value) {
    return [{ type: 'paragraph', children: [{ text: '' }] }];
  }

  const allVariables = variableGroups.flatMap((g) => g.options);
  const regex = /\{\{(.*?)\}\}/g;

  const children: Descendant[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(value)) !== null) {
    const before = value.slice(lastIndex, match.index);
    if (before) children.push({ text: before });

    const variable = allVariables.find((v) => v.id === match![1]);
    if (variable) {
      children.push({
        type: 'variable',
        variable,
        children: [{ text: '' }],
      } as VariableElement);
    } else {
      children.push({ text: match[0] });
    }

    lastIndex = regex.lastIndex;
  }

  const after = value.slice(lastIndex);
  if (after) children.push({ text: after });

  if (children.length === 0) children.push({ text: '' });

  return [{ type: 'paragraph', children }];
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

export const TokenizedInput = forwardRef<TokenizedInputHandle, TokenizedInputProps>(
  (props, ref) => {
    const {
      placeholder,
      disabled,
      onChange,
      column,
      variableGroups,
      setVariableGroups,
      blockIndex,
    } = props;

    const [focused, setFocused] = useState(false);
    const [fieldFocused, setFieldFocused] = useState<HTMLElement | null>(null);
    const [variableQuery, setVariableQuery] = useState('');

    // Track the last serialized value we sent upstream so we can detect
    // truly-external changes vs. our own onChange echoing back.
    const lastSerializedRef = useRef<string>(props.value ?? '');

    // Create the editor once and never recreate it.
    const [editor] = useState(() =>
      withSingleLine(
        withNormalizedVariables(
          withVariables(
            withReact(createEditor()),
          ),
        ),
      ),
    );

    // The initial value is computed once. After that, the editor is the
    // source of truth — we only reset from props when an *external*
    // change occurs (i.e. the serialized value differs from what we last
    // emitted).
    const [initialValue] = useState<Descendant[]>(() =>
      deserializeValue(props.value, variableGroups),
    );

    // Sync external value → editor (only when truly external)
    React.useEffect(() => {
      const incoming = props.value ?? '';
      if (incoming !== lastSerializedRef.current) {
        lastSerializedRef.current = incoming;
        const newValue = deserializeValue(incoming, variableGroups);

        // Replace the entire editor content without losing focus
        Editor.withoutNormalizing(editor, () => {
          // Remove all children
          while (editor.children.length > 0) {
            Transforms.removeNodes(editor, { at: [0] });
          }
          // Insert new content
          Transforms.insertNodes(editor, newValue, { at: [0] });
        });
        // Re-normalize after bulk replacement
        Editor.normalize(editor, { force: true });
      }
    }, [props.value, variableGroups, editor]);

    /* ------ Focus / blur handlers ------ */

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLElement>) => {
        setFocused(true);
        setFieldFocused(e.currentTarget);

        if (column?.select) {
          const selectGroup: VariableGroup = {
            label: 'Select',
            options: column.select.options.map((o: Option) => ({
              id: o.id,
              name: o.name,
              description: o.description,
              bgColor: o.color,
              dataType: NotionType.Select,
            })),
          };

          setVariableGroups((prev) =>
            prev.some((g) => g.label === 'Select') ? prev : [selectGroup, ...prev],
          );
        }
      },
      [column, setVariableGroups],
    );

    const handleBlur = useCallback(() => {
      setFocused(false);
      setFieldFocused(null);

      if (column?.select) {
        setVariableGroups((prev) => prev.filter((g) => g.label !== 'Select'));
      }
    }, [column, setVariableGroups]);

    /* ------ Imperative handle ------ */

    useImperativeHandle(ref, () => ({
      insertVariable: (variable) => {
        insertVariable(editor, variable);
        ReactEditor.focus(editor);
      },
    }));

    /* ------ onChange ------ */

    const handleChange = useCallback(
      (value: Descendant[]) => {
        const serialized = serializeNodes(value);
        lastSerializedRef.current = serialized;
        onChange(serialized);

        // Extract the trailing word (after the last space or variable) for
        // the variable picker query.
        let last = serialized.split(' ').pop() ?? '';
        const idx = last.lastIndexOf('}}');
        if (idx !== -1) last = last.substring(idx + 2);
        setVariableQuery(last);
      },
      [onChange],
    );

    /* ------ isEmpty (for placeholder) ------ */

    const isEmpty =
      editor.children.length === 1 &&
      SlateElement.isElement(editor.children[0]) &&
      editor.children[0].type === 'paragraph' &&
      editor.children[0].children.length === 1 &&
      !SlateElement.isElement(editor.children[0].children[0]) &&
      (editor.children[0].children[0] as CustomText).text === '';

    /* ------ renderElement ------ */

    const renderElement = useCallback(
      (props: RenderElementProps) => {
        const { attributes, children, element } = props;

        if (element.type === 'variable') {
          const v = (element as VariableElement).variable;
          return (
            <span
              {...attributes}
              className="variable-inline-block"
              contentEditable={false}
              data-var-id={v.id}
              data-var-name={v.name}
            >
              {v.img && (
                <img
                  src={v.img}
                  style={{ width: 14, height: 14, verticalAlign: 'middle' }}
                  alt={v.name}
                />
              )}
              <span>{v.name}</span>
              {/* Slate requires children to be rendered even for void nodes */}
              <span style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
                {children}
              </span>
            </span>
          );
        }

        // paragraph (default)
        return (
          <p {...attributes} style={{ position: 'relative', margin: 0 }}>
            {!focused && isEmpty && placeholder && (
              <span className="mapping-input-placeholder">{placeholder}</span>
            )}
            {children}
          </p>
        );
      },
      [focused, isEmpty, placeholder],
    );

    /* ------ Render ------ */

    return (
      <Slate editor={editor} initialValue={initialValue} onChange={handleChange}>
        <Editable
          readOnly={disabled}
          role="textbox"
          aria-multiline={false}
          spellCheck
          renderElement={renderElement}
          className="mapping-input mapping-field-input"
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
            insertVariable(editor, variable);
            ReactEditor.focus(editor);
          }}
        />
      </Slate>
    );
  },
);

TokenizedInput.displayName = 'TokenizedInput';

/* ================================================================== */
/* SingleVariableInput: Select exactly one variable                  */
/* ================================================================== */

interface SingleVariableInputProps {
  value?: VariableOption | null;
  onChange: (variable: VariableOption | null) => void;
  placeholder?: string;
  variableGroups: VariableGroup[];
  blockIndex: number;
}

export const SingleVariableInput = React.forwardRef<
  HTMLDivElement,
  SingleVariableInputProps
>(({ value, onChange, placeholder = 'Select variable...', variableGroups, blockIndex }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref || inputRef}
      className="single-variable-input"
      onClick={() => setIsOpen(true)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 8px',
        border: '1px solid var(--border-color)',
        borderRadius: '4px',
        cursor: 'pointer',
        backgroundColor: 'var(--bg-secondary)',
        minWidth: '120px',
      }}
    >
      {value ? (
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
          }}
        >
          {value.img && (
            <img
              src={value.img}
              style={{ width: 14, height: 14 }}
              alt={value.name}
            />
          )}
          <span>{value.name}</span>
        </span>
      ) : (
        <span style={{ color: 'var(--text-tertiary)' }}>{placeholder}</span>
      )}

      <VariablePickerOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        variableGroups={variableGroups}
        blockIndex={blockIndex}
        inputElement={inputRef.current || undefined}
        onSelect={(variable) => {
          onChange(variable);
          setIsOpen(false);
        }}
      />
    </div>
  );
});

SingleVariableInput.displayName = 'SingleVariableInput';
