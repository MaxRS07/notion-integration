// NotionActionBlocks.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BlockDefinition, BlockRenderProps, BlockType, BlockRuntimeContext } from './types';
import { NotionDestination } from '../../wizard/DestinationSelector';
import notionIcon from '../../../assets/icons/notion.svg';
import './BlockStyles.css';
import { addDatabaseEntry, getPageList } from '../../../utils/notion';
import { storage } from '../../../utils/storage';
import { TokenizedInput } from './TokenizedInput';
import { DatabaseColumn, NotionType } from '../../../models/notion/types';
import { VariableGroup, VariableOption } from '../../../models/shared/mapvar';

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */

interface NotionActionData {
  // store the raw destination data (serializable) so it persists correctly
  destination?: NotionDestination;
  // when present these may be NotionDestination instances used for selection UI
  notionDestinations?: NotionDestination[] | any[];
  // properties: map column name to { column: DatabaseColumn, value: string }
  properties?: Record<string, { column: DatabaseColumn; value: string }>;

  destinationType?: 'page' | 'data_source'
}

/* ------------------------------------------------------------------ */
/* Shared Destination Picker */
/* ------------------------------------------------------------------ */

function NotionDestinationPicker({
  data,
  onChange,
  disabled,
  displayVariableGroups,
  setDisplayVariableGroups,
  blockIndex,
}: BlockRenderProps<NotionActionData>) {
  const [showDestinations, setShowDestinations] = useState(false);
  const [destinations, setDestinations] = useState<NotionDestination[]>(
    // ensure we have NotionDestination instances for the picker UI
    (data.notionDestinations || []).map((d: any) => (d instanceof NotionDestination ? d : new NotionDestination(d)))
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const tokenFieldRefs = useRef<Record<string, React.RefObject<any>>>({});

  const updateDestinations = () => {
    getPageList(storage.getSettings().notionToken, '', 100).then(pages => {
      let pageList = pages ? data.destinationType ? pages.results.filter(p => {
        return p.object === data.destinationType;
      })
        : pages.results
        : [];
      setDestinations(pageList.map(p => new NotionDestination(p)));
    });
  };

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
                  // initialize properties using destination columns
                  const initialProperties: Record<string, { column: DatabaseColumn; value: string }> = {};
                  dest.getColumns().forEach((col) => {
                    initialProperties[col.name] = {
                      column: col,
                      value: '',
                    };
                  });

                  // store the raw destination data so it's serializable
                  onChange({
                    ...data,
                    destination: dest,
                    properties: initialProperties,
                  });
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
                          value={data.properties?.[col.name]?.value ?? ''}
                          disabled={disabled}
                          placeholder={col.description || `Value for ${col.name}`}
                          column={col}
                          variableGroups={displayVariableGroups}
                          setVariableGroups={setDisplayVariableGroups}
                          blockIndex={blockIndex}
                          onChange={(serialized: string) => {
                            onChange({
                              ...data,
                              properties: {
                                ...data.properties,
                                [col.name]: {
                                  column: col,
                                  value: serialized,
                                },
                              },
                            });
                          }}
                        />
                      );
                    })()
                  }
                </div>
              ))}
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
        <NotionDestinationPicker {...renderProps} />
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
      properties: {},
      destinationType: config.destinationFilter,
    },
    onRun: config.onRun,

    render: (props: BlockRenderProps<NotionActionData>) => {
      // Ensure destinationType is set from the config filter
      const dataWithFilter = {
        ...props.data,
        destinationType: config.destinationFilter || props.data.destinationType,
      };

      return (
        <NotionActionRenderer
          title={config.label}
          description={config.description}
          renderProps={{ ...props, data: dataWithFilter }}
        />
      );
    },

    summarize: (data) =>
      data.destination
        ? `${config.label} → ${data.destination.getName()}`
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
  onRun: async (data: NotionActionData, context: BlockRuntimeContext) => {
  }
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
  onRun: async (data: NotionActionData, context: BlockRuntimeContext) => {
    if (!data.destination || !data.properties) return;

    console.log(data.destination.getColumns())

    const notionProperties: Record<string, any> = {};

    Object.entries(data.properties).forEach(([colName, { column, value }]) => {
      if (!value) return;

      if (value == "") {
        notionProperties[colName] = null;
      }

      switch (column.type) {
        case 'title':
          notionProperties[colName] = {
            title: [
              {
                text: {
                  content: value,
                },
              },
            ],
          };
          break;

        case 'rich_text':
          notionProperties[colName] = {
            rich_text: [
              {
                text: {
                  content: value,
                },
              },
            ],
          };
          break;

        case 'select':
          notionProperties[colName] = {
            select: {
              name: value,
            },
          };
          break;

        case 'multi_select':
          notionProperties[colName] = {
            multi_select: value
              .split(',')
              .map(v => v.trim())
              .filter(Boolean)
              .map(name => ({ name })),
          };
          break;

        default:
          notionProperties[colName] = {
            rich_text: [
              {
                text: {
                  content: value,
                },
              },
            ],
          };
      }
    });

    await addDatabaseEntry(
      storage.getSettings().notionToken,
      data.destination.getParentId(),
      notionProperties
    );
  }
});

export const NotionActionBlocks = [
  NotionAddBlock,
  NotionEditPage,
  NotionMakeComment,
  NotionAddChildPage,
  NotionAddDatabaseEntry,
];
