import React from 'react';
import { Result } from '../../models/notion/page_query';
import DropdownSelector from './DropDownSelector';
import DestinationPreview from './SelectionPreview';

interface DatabaseColumn {
  id: string;
  name: string;
  description: string;
  type:
  | 'title'
  | 'text'
  | 'number'
  | 'select'
  | 'multi_select'
  | 'date'
  | 'checkbox'
  | 'url'
  | 'email'
  | 'phone';
}

export class NotionDestination {
  data: Result;

  constructor(result: Result) {
    this.data = result;
  }

  getId(): string {
    return this.data.id ?? '';
  }

  isDatasource(): boolean {
    return !this.isPage();
  }

  isPage(): boolean {
    return this.data.object === 'page';
  }

  getName(): string {
    return this.isPage()
      ? this.data.properties.title?.title?.[0]?.plain_text ?? '(no title)'
      : this.data.title?.map(t => t.plain_text).join('') ?? '_';
  }

  getDisplayType(): string {
    return this.isPage() ? 'Page' : 'Data Source';
  }

  getColumns(): DatabaseColumn[] {
    if (!this.isDatasource()) return [];
    return Object.entries(this.data.properties).map(([k, v]) => {
      const o = v as DatabaseColumn;
      o.name = k;
      return o;
    });
  }
}

type CanvasDataType = 'courses' | 'assignments' | 'announcements' | 'grades' | '';

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

interface DestinationSelectorProps {
  selectedDestination: NotionDestination | null;
  searchQuery: string;
  showDropdown: boolean;
  notionDestinations: NotionDestination[];
  selectedActionType: string;
  actionSearchQuery: string;
  showActionDropdown: boolean;
  selectedDataType: CanvasDataType;
  dataSearchQuery: string;
  showDataDropdown: boolean;
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
  onDataSearchChange: (value: string) => void;
  onSelectDataType: (actionId: string) => void;
  onDataFocus: () => void;
  onDataBlur: (e: React.FocusEvent<HTMLDivElement>) => void;
  onClearDataType: () => void;
  onBack: () => void;
  onNext: () => void;
}

export const DestinationSelector: React.FC<DestinationSelectorProps> = props => {
  const sortedDestinations = [...props.notionDestinations].sort((a, b) => {
    const aNoTitle = a.getName() === '(no title)';
    const bNoTitle = b.getName() === '(no title)';
    if (aNoTitle && !bNoTitle) return 1;
    if (!aNoTitle && bNoTitle) return -1;
    return a.getName().localeCompare(b.getName());
  });

  const filteredDestinations = sortedDestinations.filter(dest =>
    dest.getName().toLowerCase().includes(props.searchQuery.toLowerCase())
  );

  const filteredActionTypes = actionTypes.filter(action =>
    action.name.toLowerCase().includes(props.actionSearchQuery.toLowerCase())
  );

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2 className="step-title">Where?</h2>
        <p className="step-description">Choose action source and target</p>
      </div>

      <div className="destination-selector" style={{ maxWidth: '900px', marginTop: '24px' }}>
        <DropdownSelector
          searchQuery={props.dataSearchQuery}
          selectedValue={props.selectedDataType}
          showDropdown={props.showDataDropdown}
          placeholder="Select data to get from Canvas..."
          label="Canvas Data Type"
          options={canvasDataTypes}
          getOptionId={o => o.id}
          getOptionName={o => o.name}
          onSearchChange={value => { props.onDataSearchChange(value); props.onClearDataType(); props.onDataFocus(); }}
          onSelect={id => props.onSelectDataType(id as CanvasDataType)}
          onFocus={props.onDataFocus}
          onBlur={props.onDataBlur}
          onClear={() => { props.onClearDataType(); props.onDataFocus(); }}
        />

        <DropdownSelector
          searchQuery={props.actionSearchQuery}
          selectedValue={props.selectedActionType}
          showDropdown={props.showActionDropdown}
          placeholder="Select action type..."
          label="Action Type"
          options={filteredActionTypes}
          getOptionId={o => o.id}
          getOptionName={o => o.name}
          onSearchChange={value => { props.onActionSearchChange(value); props.onClearActionType(); props.onActionFocus(); }}
          onSelect={props.onSelectActionType}
          onFocus={props.onActionFocus}
          onBlur={props.onActionBlur}
          onClear={() => { props.onClearActionType(); props.onActionFocus(); }}
        />

        <DropdownSelector
          searchQuery={props.searchQuery}
          selectedValue={props.selectedDestination?.getId() || ''}
          showDropdown={props.showDropdown}
          placeholder="Search pages and databases..."
          label="Notion Destination"
          options={filteredDestinations.map(dest => ({
            id: dest.getId(),
            name: dest.getName(),
            description: dest.getDisplayType(),
          }))}
          getOptionId={o => o.id}
          getOptionName={o => o.name}
          onSearchChange={value => { props.onSearchChange(value); props.onClearDestination(); props.onFocus(); }}
          onSelect={id => {
            const dest = props.notionDestinations.find(d => d.getId() === id);
            if (dest) props.onSelectDestination(dest);
          }}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          onClear={() => { props.onClearDestination(); props.onFocus(); }}
          showCreateOptions
        />

        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          <DestinationPreview
            name={actionTypes.find(a => a.id === props.selectedActionType)?.name || ''}
            description={actionTypes.find(a => a.id === props.selectedActionType)?.description || ''}
            onClear={props.onClearActionType}
            isActive={!!props.selectedActionType}
            placeholderName="No action selected"
            placeholderDescription="Choose an action type above"
          />
          <DestinationPreview
            name={props.selectedDestination?.getName() || ''}
            description={props.selectedDestination?.getDisplayType() || ''}
            onClear={props.onClearDestination}
            isActive={!!props.selectedDestination}
            placeholderName="No destination selected"
            placeholderDescription="Search for a page or database above"
          />
        </div>
      </div>

      <div className="wizard-actions">
        <button className="button button-primary button-large" onClick={props.onBack}>Go Back</button>
        <button
          className="button button-primary accent button-large"
          onClick={props.onNext}
          disabled={!props.selectedDestination || !props.selectedActionType}
        >
          Next
        </button>
      </div>
    </div>
  );
};
