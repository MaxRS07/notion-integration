import React, { useState, useMemo } from 'react';
import { SearchDropdown } from './SearchDropdown';
import { DatabaseColumn } from '../../models/notion/types';
import _, { Result } from "../../models/notion/page_query"

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

type PollingInterval = '5' | '10' | '15' | '30' | '60';

export interface DropdownOption {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

interface DestinationSelectorProps {
  notionDestinations: NotionDestination[];
  initialSelectedDestination?: NotionDestination | null;
  initialSelectedActionType?: string;
  initialSelectedDataType?: CanvasDataType | '';
  onContinue: (destination: NotionDestination, actionType: string, dataType: CanvasDataType | '', pollType: string) => void;
}

const canvasDataTypes: DropdownOption[] = [
  { id: 'courses', name: 'Courses', icon: '📚', description: 'Import your enrolled courses from Canvas' },
  { id: 'assignments', name: 'Assignments', icon: '✅', description: 'Sync assignments and due dates' },
  { id: 'announcements', name: 'Announcements', icon: '📢', description: 'Get course announcements' },
  { id: 'grades', name: 'Grades', icon: '📊', description: 'Track your grades and scores' },
];

const pollingIntervals: DropdownOption[] = [
  { id: '5', name: '5 minutes' },
  { id: '10', name: '10 minutes' },
  { id: '15', name: '15 minutes' },
  { id: '30', name: '30 minutes' },
  { id: '60', name: '60 minutes' },
]

const actionTypes: DropdownOption[] = [
  { id: 'add_block', name: 'Add Block', description: 'Add content blocks to the page' },
  { id: 'edit_page', name: 'Edit Page', description: 'Update existing page properties' },
  { id: 'make_comment', name: 'Make Comment', description: 'Add comments to the page' },
  { id: 'add_child_page', name: 'Add Child Page', description: 'Create new child pages' },
  { id: 'add_database_entry', name: 'Add Database Entry', description: 'Add new rows to database' },
];

export const DestinationSelector: React.FC<DestinationSelectorProps> = ({
  notionDestinations,
  initialSelectedDestination = null,
  initialSelectedActionType = '',
  initialSelectedDataType = '',
  onContinue,
}) => {
  // internal state
  const [selectedDestination, setSelectedDestination] = useState<NotionDestination | null>(initialSelectedDestination);
  const [selectedActionType, setSelectedActionType] = useState(initialSelectedActionType);
  const [selectedDataType, setSelectedDataType] = useState<CanvasDataType | ''>(initialSelectedDataType);
  const [selectedPollType, setSelectedPollType] = useState<PollingInterval | ''>('30');

  const [actionName, setActionName] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [actionQuery, setActionQuery] = useState('');
  const [dataQuery, setDataQuery] = useState('');
  const [pollQuery, setPollQuery] = useState('');

  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [showDataDropdown, setShowDataDropdown] = useState(false);
  const [showPollDropdown, setShowPollDropdown] = useState(false);

  const filteredDestinations = useMemo(() => {
    return notionDestinations
      .filter(d => d.getName().toLowerCase().includes(destinationQuery.toLowerCase()))
      .sort((a, b) => {
        const _a = a.getName();
        const _b = b.getName();
        if (_a === '(no title)' && _b !== '(no title)') return 1;
        if (_a !== '(no title)' && _b === '(no title)') return -1;
        return _a.localeCompare(_b)
      });
  }, [destinationQuery, notionDestinations]);

  const filteredActions = useMemo(() => {
    return actionTypes.filter(a => a.name.toLowerCase().includes(actionQuery.toLowerCase()));
  }, [actionQuery]);

  const filteredDataTypes = useMemo(() => {
    return canvasDataTypes.filter(d => d.name.toLowerCase().includes(dataQuery.toLowerCase()));
  }, [dataQuery]);

  const canContinue = !!selectedDestination && !!selectedActionType && !!selectedDataType;

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2 className="step-title">Where?</h2>
        <p className="step-description">Choose action source and target</p>
      </div>

      <div className="destination-selector" style={{ maxWidth: '900px', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className='form-group'>
          <label className='form-label'>Action Name</label>
          <input className='form-input' type='text' placeholder='New Action' onChange={(e) => setActionName(e.target.value)}></input>
        </div>
      </div>
      <SearchDropdown
        label="Select Canvas Type"
        placeholder="Select data to get from Canvas..."
        searchQuery={dataQuery}
        selectedValue={selectedDataType}
        showDropdown={showDataDropdown}
        options={filteredDataTypes}
        getSelectedName={() => filteredDataTypes.find(d => d.id === selectedDataType)?.name || ''}
        onSearchChange={(value) => {
          setDataQuery(value);
          if (selectedDataType) {
            setSelectedDataType('');
          }
        }}
        onSelect={(id) => {
          setSelectedDataType(id as CanvasDataType);
          setShowDataDropdown(false);
        }}
        onFocus={() => setShowDataDropdown(true)}
        onBlur={() => setTimeout(() => setShowDataDropdown(false), 200)}
        onClear={() => setSelectedDataType('')}
      />

      <SearchDropdown
        label="Polling Interval"
        placeholder="Select polling interval..."
        searchQuery={pollQuery}
        selectedValue={selectedPollType}
        showDropdown={showPollDropdown}
        options={pollingIntervals}
        getSelectedName={() => pollingIntervals.find(d => d.id === selectedPollType)?.name || ''}
        onSearchChange={(value) => {
          setPollQuery(value);
          if (selectedDataType) {
            setSelectedPollType('');
          }
        }}
        onSelect={(id) => {
          setSelectedPollType(id as PollingInterval);
          setShowPollDropdown(false);
        }}
        onFocus={() => setShowPollDropdown(true)}
        onBlur={() => setTimeout(() => setShowPollDropdown(false), 200)}
        onClear={() => setSelectedPollType('')}
      />


      <SearchDropdown
        label="Action Type"
        placeholder="Select action type..."
        searchQuery={actionQuery}
        selectedValue={selectedActionType}
        showDropdown={showActionDropdown}
        options={filteredActions}
        getSelectedName={() => filteredActions.find(a => a.id === selectedActionType)?.name || ''}
        onSearchChange={(value) => {
          setActionQuery(value);
          if (selectedActionType) {
            setSelectedActionType('');
          }
        }}
        onSelect={(id) => {
          setSelectedActionType(id);
          setShowActionDropdown(false);
        }}
        onFocus={() => setShowActionDropdown(true)}
        onBlur={() => setTimeout(() => setShowActionDropdown(false), 200)}
        onClear={() => setSelectedActionType('')}
      />

      <SearchDropdown
        label="Notion Destination"
        placeholder="Search pages and databases..."
        searchQuery={destinationQuery}
        selectedValue={selectedDestination?.getId() || ''}
        showDropdown={showDestinationDropdown}
        options={filteredDestinations.map(d => ({
          id: d.getId(),
          name: d.getName(),
          description: d.getDisplayType(),
        }))}
        getSelectedName={() => selectedDestination?.getName() || ''}
        onSearchChange={(value) => {
          setDestinationQuery(value);
          if (selectedDestination) {
            setSelectedDestination(null);
          }
        }}
        onSelect={(id) => {
          const dest = notionDestinations.find(d => d.getId() === id);
          if (dest) {
            setSelectedDestination(dest);
            setShowDestinationDropdown(false);
          }
        }}
        onFocus={() => setShowDestinationDropdown(true)}
        onBlur={() => setTimeout(() => setShowDestinationDropdown(false), 200)}
        onClear={() => setSelectedDestination(null)}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
        <button
          className="button button-primary accent button-large"
          disabled={!canContinue}
          onClick={() => {
            if (selectedDestination && selectedActionType && selectedDataType) {
              onContinue(selectedDestination, selectedActionType, selectedDataType, selectedPollType);
            }
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};
