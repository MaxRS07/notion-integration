import React, { useState, useEffect } from 'react';
import { Settings } from '../types';
import { getPageList } from '../utils/notion';
import { Result } from '../models/notion/page_query';
import { DestinationSelector, NotionDestination } from './wizard/DestinationSelector';
import { FieldMappingForm } from './wizard/FieldMappingForm';

interface CanvasActionsProps {
  settings: Settings;
  onAction: (action: string) => Promise<void>;
}

type CanvasDataType = 'courses' | 'assignments' | 'announcements' | 'grades' | '';

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

  const [selectedActionType, setSelectedActionType] = useState<string>('');
  const [actionSearchQuery, setActionSearchQuery] = useState('');
  const [showActionDropdown, setShowActionDropdown] = useState(false);

  const [notionDestinations, setNotionDestinations] = useState<NotionDestination[]>([]);
  const [databaseColumns, setDatabaseColumns] = useState<DatabaseColumn[]>([]);
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({});

  useEffect(() => {
    handlePages();
  }, []);

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

  const handleSelectDataType = (type: CanvasDataType) => {
    setSelectedDataType(type);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedDestination(null);
    setSelectedActionType('');
    setSearchQuery('');
    setActionSearchQuery('');
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

  const handleSync = async () => {
    if (!selectedDataType || !selectedDestination) return;
    await onAction(`sync-${selectedDataType}-to-${selectedDestination.getId()}`);
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const relatedTarget = e.relatedTarget as Node;
    if (relatedTarget && e.currentTarget.contains(relatedTarget)) {
      return;
    }
    setShowDropdown(false);
  };

  const handleActionBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const relatedTarget = e.relatedTarget as Node;
    if (relatedTarget && e.currentTarget.contains(relatedTarget)) {
      return;
    }
    setShowActionDropdown(false);
  };

  const handleTemplateChange = (columnId: string, value: string) => {
    setTemplateValues((prev) => ({
      ...prev,
      [columnId]: value,
    }));
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
        {step === 1 && (
          <DestinationSelector
            selectedDataType={selectedDataType}
            selectedDestination={selectedDestination}
            searchQuery={searchQuery}
            showDropdown={showDropdown}
            notionDestinations={notionDestinations}
            selectedActionType={selectedActionType}
            actionSearchQuery={actionSearchQuery}
            showActionDropdown={showActionDropdown}
            onSearchChange={setSearchQuery}
            onSelectDestination={handleSelectDestination}
            onFocus={() => setShowDropdown(true)}
            onBlur={handleBlur}
            onClearDestination={() => setSelectedDestination(null)}
            onActionSearchChange={setActionSearchQuery}
            onSelectActionType={(actionId) => {
              setSelectedActionType(actionId);
              setShowActionDropdown(false);
            }}
            onActionFocus={() => setShowActionDropdown(true)}
            onActionBlur={handleActionBlur}
            onClearActionType={() => setSelectedActionType('')}
            onBack={handleBack}
            onNext={handleContinueToMapping}
          />
        )}

        {step === 2 && (
          <FieldMappingForm
            databaseColumns={databaseColumns}
            templateValues={templateValues}
            onTemplateChange={handleTemplateChange}
            onBack={() => setStep(2)}
            onSync={handleSync}
          />
        )}
      </div>
    </div>
  );
};
