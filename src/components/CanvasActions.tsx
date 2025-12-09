import React, { useState, useEffect, useRef } from 'react';
import { Settings } from '../types';
import { getPageList } from '../utils/notion';
import _, { Result } from '../models/notion/page_query';

interface CanvasActionsProps {
  settings: Settings;
  onAction: (action: string) => Promise<void>;
}

type CanvasDataType = 'courses' | 'assignments' | 'announcements' | 'grades' | '';

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

interface DatabaseColumn {
  id: string;
  name: string;
  type: 'title' | 'text' | 'number' | 'select' | 'multi_select' | 'date' | 'checkbox' | 'url' | 'email' | 'phone';
}
export const CanvasActions: React.FC<CanvasActionsProps> = ({ settings, onAction }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDataType, setSelectedDataType] = useState<CanvasDataType>('');
  const [selectedDestination, setSelectedDestination] = useState<NotionDestination | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [notionDestinations, setNotionDestinations] = useState<(NotionDestination)[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const [databaseColumns, setDatabaseColumns] = useState<DatabaseColumn[]>([]);

  const [templateValues, setTemplateValues] = useState<Record<string, string>>({});

  useEffect(() => {
    handlePages();
  }, []);

  const nameSort = (a: NotionDestination, b: NotionDestination): number => {
    const aNoTitle = a.getName() === "(no title)";
    const bNoTitle = b.getName() === "(no title)";

    if (aNoTitle && !bNoTitle) return 1;
    if (!aNoTitle && bNoTitle) return -1;
    if (aNoTitle && bNoTitle) return 0;

    return a.getName().localeCompare(b.getName());
  }

  const handlePages = async () => {
    const pages = await getPageList(settings.notionToken, "", 10);

    if (pages) {
      const destinations: NotionDestination[] = pages.results
        .filter(p => p.id && p.id !== "0")
        .map(p => new NotionDestination(p));
      setNotionDestinations(destinations);
    } else {
      setNotionDestinations([]);
    }
  };

  const hasTokens = settings.canvasToken && settings.notionToken;

  const canvasDataTypes = [
    { id: 'courses' as CanvasDataType, name: 'Courses', icon: '📚', description: 'Import your enrolled courses from Canvas' },
    { id: 'assignments' as CanvasDataType, name: 'Assignments', icon: '✅', description: 'Sync assignments and due dates' },
    { id: 'announcements' as CanvasDataType, name: 'Announcements', icon: '📢', description: 'Get course announcements' },
    { id: 'grades' as CanvasDataType, name: 'Grades', icon: '📊', description: 'Track your grades and scores' },
  ];

  const filteredPages = notionDestinations
    .filter(dest => dest.getName().toLowerCase().includes(searchQuery.toLowerCase()))
  filteredPages.sort(nameSort);

  const handleSelectDataType = (type: CanvasDataType) => {
    setSelectedDataType(type);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedDestination(null);
    setSearchQuery('');
  };

  const handleSelectDestination = (destination: NotionDestination) => {
    setSelectedDestination(destination);
    setShowDropdown(false);
  };

  const handleContinueToMapping = () => {
    if (selectedDestination?.isDatasource()) {
      setDatabaseColumns(selectedDestination.getColumns());
      setStep(3);
    } else {
      handleSync();
    }
  };

  const getCanvasFieldOptions = (dataType: CanvasDataType) => {
    const baseOptions = [
      { value: '', label: 'Select field...' },
      { value: 'static:', label: 'Enter custom value' },
    ];

    const fieldsByType: Record<string, Array<{ value: string, label: string }>> = {
      courses: [
        ...baseOptions,
        { value: 'course.name', label: 'Course Name' },
        { value: 'course.code', label: 'Course Code' },
        { value: 'course.term', label: 'Term' },
        { value: 'course.start_date', label: 'Start Date' },
        { value: 'course.end_date', label: 'End Date' },
      ],
      assignments: [
        ...baseOptions,
        { value: 'assignment.name', label: 'Assignment Name' },
        { value: 'assignment.due_date', label: 'Due Date' },
        { value: 'assignment.points', label: 'Points Possible' },
        { value: 'assignment.description', label: 'Description' },
        { value: 'assignment.url', label: 'Assignment URL' },
        { value: 'assignment.course', label: 'Course Name' },
      ],
      announcements: [
        ...baseOptions,
        { value: 'announcement.title', label: 'Title' },
        { value: 'announcement.message', label: 'Message' },
        { value: 'announcement.posted_at', label: 'Posted Date' },
        { value: 'announcement.author', label: 'Author' },
      ],
      grades: [
        ...baseOptions,
        { value: 'grade.assignment', label: 'Assignment' },
        { value: 'grade.score', label: 'Score' },
        { value: 'grade.grade', label: 'Letter Grade' },
        { value: 'grade.submitted_at', label: 'Submitted Date' },
      ],
    };

    return fieldsByType[dataType] || baseOptions;
  };

  const handleSync = async () => {
    if (!selectedDataType || !selectedDestination) return;
    await onAction(`sync-${selectedDataType}-to-${selectedDestination.getId()}`);
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!searchRef.current?.contains(e.relatedTarget as Node)) {
      setShowDropdown(false);
    }
  };

  if (!hasTokens) {
    return (
      <div className="integration-actions">
        <div className="actions-empty-state">
          <div className="empty-icon">⚠️</div>
          <h3 className="empty-title">Configuration Required</h3>
          <p className="empty-description">
            Please configure your Canvas and Notion tokens in Settings before syncing data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="integration-actions">
      <div className="sync-wizard">
        {/* Step 1 */}
        {step === 1 && (
          <div className="wizard-step">
            <div className="step-header">
              <h2 className="step-title">What would you like to sync from Canvas?</h2>
              <p className="step-description">Select the type of data you want to import into Notion</p>
            </div>
            <div className="data-type-grid">
              {canvasDataTypes.map(dataType => (
                <button
                  key={dataType.id}
                  className={`data-type-card ${selectedDataType === dataType.id ? 'selected' : ''}`}
                  onClick={() => handleSelectDataType(dataType.id)}
                >
                  <div className="data-type-icon">{dataType.icon}</div>
                  <div className="data-type-info">
                    <h3 className="data-type-name">{dataType.name}</h3>
                    <p className="data-type-description">{dataType.description}</p>
                  </div>
                  <div className="data-type-arrow">→</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="wizard-step">
            <div className="step-header">
              <h2 className="step-title">
                Where should we add your {canvasDataTypes.find(t => t.id === selectedDataType)?.name}?
              </h2>
              <p className="step-description">Search for a Notion page or database</p>
            </div>

            <div className="destination-selector" ref={searchRef} tabIndex={0} onBlur={handleBlur}>
              <div className="search-container">
                <label className="form-label">Notion Destination</label>
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    className="form-input search-input"
                    placeholder="Search pages and databases..."
                    value={selectedDestination ? selectedDestination.getName() : searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value);
                      setSelectedDestination(null);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                  />
                  <span className="search-icon">🔍</span>
                </div>

                {showDropdown && !selectedDestination && (
                  <div className="search-dropdown">
                    {searchQuery.length === 0 &&
                      <div className="dropdown-section">
                        <div className="dropdown-heading">Create New</div>
                        <button className='dropdown-item'>
                          <div className="dropdown-info">
                            <div className="dropdown-name">New Page</div>
                            <div className="dropdown-type">Create a new page as the destination</div>
                          </div>
                        </button>
                        <button className='dropdown-item'>
                          <div className="dropdown-info">
                            <div className="dropdown-name">New Datasource</div>
                            <div className="dropdown-type">Create a new datasource as the destination</div>
                          </div>
                        </button>
                      </div>
                    }
                    {filteredPages.length > 0 && (
                      <div className="dropdown-section">
                        <div className="dropdown-heading">Pages</div>
                        {filteredPages.map(dest => (
                          <button
                            key={dest.getId()}
                            className={`dropdown-item`}
                            onClick={() => handleSelectDestination(dest)}
                          >
                            <div className="dropdown-info">
                              <div className="dropdown-name">{dest.getName()}</div>
                              <div className="dropdown-type">{dest.getDisplayType()}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {filteredPages.length === 0 && (
                      <div className="dropdown-empty">
                        No results found for "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selectedDestination && (
                <div className="selected-destination">
                  <div className="destination-preview">
                    <div className="destination-info">
                      <div className="destination-name">{selectedDestination.getName()}</div>
                      <div className="destination-type">{selectedDestination.getDisplayType()}</div>
                    </div>
                    <button
                      className="button-icon"
                      style={{ color: "#fff" }}
                      onClick={() => {
                        setSelectedDestination(null);
                        setShowDropdown(true);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              <div className="sync-info-box">
                <div className="info-icon">ℹ️</div>
                <div className="info-content">
                  <div className="info-text">
                    Your {canvasDataTypes.find(t => t.id === selectedDataType)?.name.toLowerCase()} will be
                    added to <strong>{selectedDestination?.getName() || 'the selected destination'}</strong>.
                    {selectedDestination?.isDatasource() && ' New entries will be created for each item.'}
                    {selectedDestination?.isPage() && ' Content will be added as child pages.'}
                  </div>
                </div>
              </div>
            </div>

            <div className="wizard-actions">
              <button
                className="button button-primary button-large"
                onClick={handleBack}
              >
                Go Back
              </button>
              <button
                className="button button-primary accent button-large"
                onClick={() => handleContinueToMapping()}
                disabled={!selectedDestination}
              >
                Next
              </button>
            </div>
          </div>
        )}
        { /* Step 3 */}
        {step === 3 && (
          <div className="wizard-step">

            <div className="step-header">
              <h2 className="step-title">Map Canvas fields to your Notion database</h2>
              <p className="step-description">
                Enter text or use variables like <code>{`{course.name}`}</code>,
                <code>{`{assignment.due_at}`}</code>, etc.
              </p>
            </div>

            {/* FORM */}
            <form className="mapping-form">

              {databaseColumns.map((col) => (
                <div key={col.id} className="mapping-field">

                  {/* Label */}
                  <label className="mapping-label">
                    {col.name}
                    <span className="mapping-type-tag">{col.type}</span>
                  </label>

                  {/* Template input */}
                  <textarea
                    className="mapping-input"
                    rows={2}
                    placeholder={`Enter value... e.g. {assignment.name}`}
                    value={templateValues[col.id] || ""}
                    onChange={(e) =>
                      setTemplateValues((prev) => ({
                        ...prev,
                        [col.id]: e.target.value,
                      }))
                    }
                  />

                  {/* Optional: Variable picker */}
                  {/* <div className="mapping-vars">
                    {canvasFields.map((field) => (
                      <button
                        key={field}
                        type="button"
                        className="var-button"
                        onClick={() => {
                          setTemplateValues((prev) => ({
                            ...prev,
                            [col.id]: (prev[col.id] || "") + `{${field}}`,
                          }));
                        }}
                      >
                        {`{${field}}`}
                      </button>
                    ))}
                  </div> */}

                </div>
              ))}

            </form>

            {/* BUTTONS */}
            <div className="wizard-actions">
              <button className="button button-primary button-large" onClick={() => setStep(2)}>
                Back
              </button>

              <button
                className="button button-primary accent button-large"
                onClick={() => { /* run sync */ }}
              >
                Sync Now
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
