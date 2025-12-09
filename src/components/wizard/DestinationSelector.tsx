import React from 'react';
import { Result } from '../../models/notion/page_query';
import { SearchDropdown } from './SearchDropdown';

interface DatabaseColumn {
  id: string;
  name: string;
  type: 'title' | 'text' | 'number' | 'select' | 'multi_select' | 'date' | 'checkbox' | 'url' | 'email' | 'phone';
}

class NotionDestination {
  data: Result

  constructor(result: Result) {
    this.data = result
  }
  getId(): string {
    return this.data.id ?? ""
  }
  isDatasource(): boolean {
    return !this.isPage()
  }
  isPage(): boolean {
    return this.data.object === "page";
  }
  getName(): string {
    return this.isPage() ?
      this.data.properties.title?.title?.[0]?.plain_text ?? "(no title)" :
      this.data.title?.map(t => t.plain_text).join('') ?? "_";
  }
  getDisplayType(): string {
    return this.isPage() ? "Page" : "Data Source"
  }
  getColumns(): DatabaseColumn[] {
    var objects: DatabaseColumn[] = [];
    if (this.isDatasource()) {
      for (const [k, v] of Object.entries(this.data.properties)) {
        objects.push({ name: k, id: "", type: 'text' });
      }
    }
    return objects;
  }
}

type CanvasDataType = 'courses' | 'assignments' | 'announcements' | 'grades' | '';

interface DestinationSelectorProps {
  selectedDataType: CanvasDataType;
  selectedDestination: NotionDestination | null;
  searchQuery: string;
  showDropdown: boolean;
  notionDestinations: NotionDestination[];
  selectedActionType: string;
  actionSearchQuery: string;
  showActionDropdown: boolean;
  onSearchChange: (value: string) => void;
  onSelectDestination: (destination: NotionDestination) => void;
  onFocus: () => void;
  onBlur: (e: React.FocusEvent<HTMLDivElement>) => void;
  onClearDestination: () => void;
  onActionSearchChange: (value: string) => void;
  onSelectActionType: (actionId: string) => void;
  onActionFocus: () => void;
  onActionBlur: (e: React.FocusEvent<HTMLDivElement>) => void;
  onClearActionType: () => void;
  onBack: () => void;
  onNext: () => void;
}

const canvasDataTypes = [
  { id: 'courses', name: 'Courses', icon: '📚', description: 'Import your enrolled courses from Canvas' },
  { id: 'assignments', name: 'Assignments', icon: '✅', description: 'Sync assignments and due dates' },
  { id: 'announcements', name: 'Announcements', icon: '📢', description: 'Get course announcements' },
  { id: 'grades', name: 'Grades', icon: '📊', description: 'Track your grades and scores' },
];

const actionTypes = [
  { id: 'add_block', name: 'Add Block', description: 'Add content blocks to the page' },
  { id: 'edit_page', name: 'Edit Page', description: 'Update existing page properties' },
  { id: 'make_comment', name: 'Make Comment', description: 'Add comments to the page' },
  { id: 'add_child_page', name: 'Add Child Page', description: 'Create new child pages' },
  { id: 'add_database_entry', name: 'Add Database Entry', description: 'Add new rows to database' },
];

export const DestinationSelector: React.FC<DestinationSelectorProps> = ({
  selectedDataType,
  selectedDestination,
  searchQuery,
  showDropdown,
  notionDestinations,
  selectedActionType,
  actionSearchQuery,
  showActionDropdown,
  onSearchChange,
  onSelectDestination,
  onFocus,
  onBlur,
  onClearDestination,
  onActionSearchChange,
  onSelectActionType,
  onActionFocus,
  onActionBlur,
  onClearActionType,
  onBack,
  onNext,
}) => {
  const nameSort = (a: NotionDestination, b: NotionDestination): number => {
    const aNoTitle = a.getName() === "(no title)";
    const bNoTitle = b.getName() === "(no title)";

    if (aNoTitle && !bNoTitle) return 1;
    if (!aNoTitle && bNoTitle) return -1;
    if (aNoTitle && bNoTitle) return 0;

    return a.getName().localeCompare(b.getName());
  };

  const filteredPages = notionDestinations
    .filter(dest => dest.getName().toLowerCase().includes(searchQuery.toLowerCase()));
  filteredPages.sort(nameSort);

  const filteredActionTypes = actionTypes.filter(action =>
    action.name.toLowerCase().includes(actionSearchQuery.toLowerCase())
  );

  const getSelectedActionName = () => {
    const action = actionTypes.find(a => a.id === selectedActionType);
    return action?.name || '';
  };

  const destinationOptions = filteredPages.map(dest => ({
    id: dest.getId(),
    name: dest.getName(),
    description: dest.getDisplayType(),
  }));

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2 className="step-title">
          Where should we add your {canvasDataTypes.find(t => t.id === selectedDataType)?.name}?
        </h2>
        <p className="step-description">Search for a Notion page or database</p>
      </div>

      <div className="destination-selector" style={{ maxWidth: '900px' }}>
        <div style={{ marginTop: '24px' }}>
          <SearchDropdown
            searchQuery={actionSearchQuery}
            selectedValue={selectedActionType}
            showDropdown={showActionDropdown}
            placeholder="Select action type..."
            icon="⚡"
            label="Action Type"
            options={filteredActionTypes}
            onSearchChange={(value) => {
              onActionSearchChange(value);
              onClearActionType();
              onActionFocus();
            }}
            onSelect={onSelectActionType}
            onFocus={onActionFocus}
            onBlur={onActionBlur}
            onClear={() => {
              onClearActionType();
              onActionFocus();
            }}
            getSelectedName={getSelectedActionName}
          />
        </div>
        <SearchDropdown
          searchQuery={searchQuery}
          selectedValue={selectedDestination?.getId() || ''}
          showDropdown={showDropdown}
          placeholder="Search pages and databases..."
          icon="🔍"
          label="Notion Destination"
          options={destinationOptions}
          onSearchChange={(value) => {
            onSearchChange(value);
            onClearDestination();
            onFocus();
          }}
          onSelect={(id) => {
            const dest = notionDestinations.find(d => d.getId() === id);
            if (dest) onSelectDestination(dest);
          }}
          onFocus={onFocus}
          onBlur={onBlur}
          onClear={() => {
            onClearDestination();
            onFocus();
          }}
          getSelectedName={() => selectedDestination?.getName() || ''}
          showCreateOptions={true}
        />

        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          <div className="selected-destination" style={{ flex: 1, opacity: selectedActionType ? 1 : 0.5 }}>
            <div className="destination-preview">
              {selectedActionType ? (
                <>
                  <div className="destination-info">
                    <div className="destination-name">{getSelectedActionName()}</div>
                    <div className="destination-type">{filteredActionTypes.find(o => o.id === selectedActionType)?.description}</div>
                  </div>
                  <button
                    className="button-icon"
                    style={{ color: "#fff" }}
                    onClick={() => {
                      onClearActionType();
                    }}
                  >
                    ✕
                  </button>
                </>
              ) : (
                <div className="destination-info">
                  <div className="destination-name" style={{ color: '#888' }}>No action selected</div>
                  <div className="destination-type">Choose an action type above</div>
                </div>
              )}
            </div>
          </div>
          <div className="selected-destination" style={{ flex: 1, opacity: selectedDestination ? 1 : 0.5 }}>
            <div className="destination-preview">
              {selectedDestination ? (
                <>
                  <div className="destination-info">
                    <div className="destination-name">{selectedDestination.getName()}</div>
                    <div className="destination-type">{selectedDestination.getDisplayType()}</div>
                  </div>
                  <button
                    className="button-icon"
                    style={{ color: "#fff" }}
                    onClick={() => {
                      onClearDestination();
                    }}
                  >
                    ✕
                  </button>
                </>
              ) : (
                <div className="destination-info">
                  <div className="destination-name" style={{ color: '#888' }}>No destination selected</div>
                  <div className="destination-type">Search for a page or database above</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      <div className="wizard-actions">
        <button
          className="button button-primary button-large"
          onClick={onBack}
        >
          Go Back
        </button>
        <button
          className="button button-primary accent button-large"
          onClick={onNext}
          disabled={!selectedDestination || !selectedActionType}
        >
          Next
        </button>
      </div>
    </div >
  );
};

export { NotionDestination };
