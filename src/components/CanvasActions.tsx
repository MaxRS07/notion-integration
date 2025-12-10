import React, { useState, useEffect } from 'react';
import { Settings } from '../types';
import { getPageList } from '../utils/notion';
import { DestinationSelector, NotionDestination } from './wizard/DestinationSelector';
import { FieldMappingForm } from './wizard/FieldMappingForm';

interface CanvasActionsProps {
  settings: Settings;
  onAction: (action: string) => Promise<void>;
}

export const CanvasActions: React.FC<CanvasActionsProps> = ({ settings, onAction }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDestination, setSelectedDestination] = useState<NotionDestination | null>(null);
  const [selectedActionType, setSelectedActionType] = useState('');
  const [selectedDataType, setSelectedDataType] = useState('');
  const [selectedPollType, setSelectedPollType] = useState('');

  const [notionDestinations, setNotionDestinations] = useState<NotionDestination[]>([]);
  const [databaseColumns, setDatabaseColumns] = useState<any[]>([]);
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({});

  const hasTokens = !!settings.canvasToken && !!settings.notionToken;

  useEffect(() => {
    const fetchPages = async () => {
      const pages = await getPageList(settings.notionToken, '', 10);
      setNotionDestinations(
        pages?.results
          .filter(p => p.id && p.id !== '0')
          .map(p => new NotionDestination(p)) || []
      );
    };
    if (hasTokens) fetchPages();
  }, [settings.notionToken, hasTokens]);

  const handleContinue = (dest: NotionDestination, action: string, dataType: string, pollType: string) => {
    setSelectedDestination(dest);
    setSelectedActionType(action);
    setSelectedDataType(dataType);
    setSelectedPollType(pollType)


    if (dest.isDatasource()) {
      setDatabaseColumns(dest.getColumns());
      setStep(3);
    } else {
      onAction(`sync-${dataType}-to-${dest.getId()}`);
    }
  };

  const handleSync = async (dest: NotionDestination, dataType: string) => {
    await onAction(`sync-${dataType}-to-${dest.getId()}`);
  };

  const handleTemplateChange = (columnId: string, value: string) => {
    setTemplateValues(prev => ({ ...prev, [columnId]: value }));
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
            notionDestinations={notionDestinations}
            onContinue={handleContinue}
            initialSelectedDestination={selectedDestination}
            initialSelectedActionType={selectedActionType}
          />
        )}

        {step === 3 && selectedDestination && (
          <FieldMappingForm
            databaseColumns={databaseColumns}
            templateValues={templateValues}
            onTemplateChange={handleTemplateChange}
            onBack={() => setStep(1)}
            onSync={() => handleSync(selectedDestination, selectedDataType)}
          />
        )}
      </div>
    </div>
  );
};
