// NotionActionBlocks.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BlockDefinition, BlockRenderProps, BlockType, BlockRuntimeContext } from './types';
import { NotionDestination } from '../../wizard/DestinationSelector';
import notionIcon from '../../../assets/icons/notion.svg';
import './BlockStyles.css';
import { getPageList } from '../../../utils/notion';
import { storage } from '../../../utils/storage';
import { VariablePickerOverlay } from '../../wizard/VariablePickerOverlay';
import { TokenizedInput } from './TokenizedInput';

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */

interface NotionActionData {
  // store the raw destination data (serializable) so it persists correctly
  destination?: any;
  // when present these may be NotionDestination instances used for selection UI
  notionDestinations?: NotionDestination[] | any[];
  // column mappings: map column name to user-provided value
  columnMappings?: Record<string, string>;
}

/* ------------------------------------------------------------------ */
/* Shared Destination Picker */
/* ------------------------------------------------------------------ */

function NotionDestinationPicker({
  data,
  onChange,
  disabled,
  destinationFilter,
  displayVariableGroups,
}: BlockRenderProps<NotionActionData> & { destinationFilter?: 'page' | 'data_source' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [variableQuery, setVariableQuery] = useState('');
  const [showDestinations, setShowDestinations] = useState(false);
  const [destinations, setDestinations] = useState<NotionDestination[]>(
    // ensure we have NotionDestination instances for the picker UI
    (data.notionDestinations || []).map((d: any) => (d instanceof NotionDestination ? d : new NotionDestination(d)))
  );
  const [fieldFocused, setFieldFocused] = useState<HTMLElement | null>(null);
  const tokenFieldRefs = useRef<Record<string, React.RefObject<any>>>({});

  useEffect(() => {
    console.log("variable groups updated:", displayVariableGroups);
  }, []);
  const updateDestinations = (filter?: 'page' | 'data_source') => {
    const effectiveFilter = filter ?? destinationFilter;
    getPageList(storage.getSettings().notionToken, '', 100).then(pages => {
      let pageList = pages
        ? effectiveFilter
          ? pages.results.filter(p => {
            return p.object === effectiveFilter;
          })
          : pages.results
        : [];
      setDestinations(pageList.map(p => new NotionDestination(p)));
    });
  };

  // tokenized behavior moved to TokenizedField component
  const filtered = useMemo(() => {
    return destinations
      .filter(d =>
        d.getName().toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.getName().localeCompare(b.getName()));
  }, [searchQuery, destinations]);

  const selectedDest = data.destination
    ? (data.destination instanceof NotionDestination ? data.destination : new NotionDestination(data.destination))
    : undefined;

  return (
    <div className="field-group">
      <label className="field-label">Notion Destination</label>
      <p className="field-hint">Select the page or database to update</p>

      <div className="destination-selector">
        {data.destination ? (
          (() => {
            const selected = data.destination instanceof NotionDestination ? data.destination : new NotionDestination(data.destination);
            return (
              <div className="selected-destination">
                <div className="destination-info">
                  <div className="destination-name">{selected.getName()}</div>
                  <div className="destination-type">{selected.getDisplayType()}</div>
                </div>
                <button
                  className="clear-btn"
                  onClick={() => onChange({ ...data, destination: undefined })}
                  disabled={disabled}
                >
                  ✕
                </button>
              </div>
            );
          })()
        ) : (
          <button
            className="select-destination-btn"
            onClick={() => {
              updateDestinations();
              setShowDestinations(v => !v);
            }}
            disabled={disabled}
          >
            <span>Select destination...</span>
            <span className="chevron">{showDestinations ? '▲' : '▼'}</span>
          </button>
        )}

        {showDestinations && !data.destination && (
          <div className="destination-dropdown">
            <input
              className="search-input"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => updateDestinations()}
              autoFocus
              disabled={disabled}
            />

            {filtered.map(dest => (
              <button
                key={dest.getId()}
                className="destination-item"
                onClick={() => {
                  // store the raw destination data so it's serializable
                  onChange({ ...data, destination: dest.data });
                  setShowDestinations(false);
                  setSearchQuery('');
                }}
                disabled={disabled}
              >
                <div>{dest.getName()}</div>
                <div>{dest.getDisplayType()}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedDest && (
        <div className="selected-destination-details">
          {selectedDest.getColumns().length ? (
            <form className="mapping-form">
              {selectedDest.getColumns().map((col) => (
                <div key={col.name} className="mapping-field">
                  <label className="mapping-label">
                    <span>{col.name}</span>
                    <span className="mapping-type-tag">{col.type}</span>
                  </label>
                  {/* Tokenized field component */}
                  {
                    (() => {
                      // ensure a ref object exists for this column
                      if (!tokenFieldRefs.current[col.name]) tokenFieldRefs.current[col.name] = React.createRef();
                      return (
                        <TokenizedInput
                          ref={tokenFieldRefs.current[col.name]}
                          onChange={(serialized: string) => {
                            onChange({
                              ...data,
                              columnMappings: {
                                ...data.columnMappings,
                                [col.name]: serialized,
                              },
                            });
                            let lastWord = serialized.split(" ").pop() || "";
                            if (serialized.endsWith("}")) lastWord = "";
                            setVariableQuery(lastWord);
                          }}
                          disabled={disabled}
                          placeholder={`${col.description || "Value for " + col.name}`}
                          onFocus={(el) => {
                            const target = el.target as HTMLElement;
                            target.dataset.fieldKey = col.name;
                            setFieldFocused(target);
                          }}
                          onBlur={() => {
                            setFieldFocused(null);
                          }}
                        />
                      );
                    })()
                  }
                </div>
              ))}
              <VariablePickerOverlay
                isOpen={fieldFocused !== null}
                onClose={() => { }}
                onSelect={(variable) => {
                  // delegate insertion to the focused tokenized field's imperative handle
                  if (!fieldFocused) return;
                  const key = fieldFocused.dataset.fieldKey;
                  if (!key) return;
                  const ref = tokenFieldRefs.current[key];
                  if (ref && ref.current && typeof ref.current.insertVariable === 'function') {
                    ref.current.insertVariable(variable);
                  }
                }}
                query={variableQuery}
                variableGroups={displayVariableGroups}
                inputElement={fieldFocused ?? undefined}
              />
            </form>
          ) : (
            <div className="no-columns">No columns available</div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared Renderer */
/* ------------------------------------------------------------------ */

function NotionActionRenderer(props: {
  title: string;
  description: string;
  destinationFilter?: 'page' | 'data_source';
  renderProps: BlockRenderProps<NotionActionData>;
}) {
  const { title, description, renderProps } = props;

  return (
    <div>
      <div className="block-header">
        <img src={notionIcon} className="block-icon" />
        <div className="block-info">
          <h3 className="block-title">{title}</h3>
          <p className="block-description">{description}</p>
        </div>
      </div>

      <div className="block-fields">
        <NotionDestinationPicker {...renderProps} destinationFilter={props.destinationFilter} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Block Factory */
/* ------------------------------------------------------------------ */

function createNotionActionBlock(config: {
  label: string;
  description: string;
  destinationFilter?: 'page' | 'data_source';
  onRun: (data: NotionActionData, context: BlockRuntimeContext) => Promise<any>;
}): BlockDefinition<NotionActionData> {
  return {
    type: BlockType.POST,
    label: config.label,
    img: notionIcon,

    defaultData: {
      destination: undefined,
      notionDestinations: [],
      columnMappings: {},
    },
    onRun: config.onRun,

    render: (props: BlockRenderProps<NotionActionData>) => (
      <NotionActionRenderer
        title={config.label}
        description={config.description}
        destinationFilter={config.destinationFilter}
        renderProps={props}
      />
    ),

    summarize: (data) =>
      data.destination
        ? `${config.label} → ${new NotionDestination(data.destination).getName()}`
        : 'Not configured',

    validate: (data) => {
      if (!data.destination) return 'Please select a destination';
      return null;
    },
  };
}

/* ------------------------------------------------------------------ */
/* Concrete Notion Blocks */
/* ------------------------------------------------------------------ */

export const NotionAddBlock = createNotionActionBlock({
  label: 'Add Block to Notion',
  description: 'Add content blocks to a Notion page',
  destinationFilter: 'page',
  onRun: async (data: NotionActionData, context: BlockRuntimeContext) => { }
});

export const NotionEditPage = createNotionActionBlock({
  label: 'Edit Notion Page',
  description: 'Update existing page properties',
  destinationFilter: 'page',
  onRun: async (data: NotionActionData, context: BlockRuntimeContext) => { }
});

export const NotionMakeComment = createNotionActionBlock({
  label: 'Add Comment in Notion',
  description: 'Add a comment to a Notion page',
  onRun: async (data: NotionActionData, context: BlockRuntimeContext) => { }
});

export const NotionAddChildPage = createNotionActionBlock({
  label: 'Add Child Page in Notion',
  description: 'Create a new child page',
  destinationFilter: 'page',
  onRun: async (data: NotionActionData, context: BlockRuntimeContext) => { }
});

export const NotionAddDatabaseEntry = createNotionActionBlock({
  label: 'Add Database Entry in Notion',
  description: 'Add a new row to a Notion database',
  destinationFilter: 'data_source',
  onRun: async (data: NotionActionData, context: BlockRuntimeContext) => { }
});

export const NotionActionBlocks = [
  NotionAddBlock,
  NotionEditPage,
  NotionMakeComment,
  NotionAddChildPage,
  NotionAddDatabaseEntry,
];
