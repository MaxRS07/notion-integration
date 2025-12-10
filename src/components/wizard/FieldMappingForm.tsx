import React from "react";
import { SearchDropdown } from "./SearchDropdown";
import { DropdownOption } from "./DestinationSelector";

export interface DatabaseColumn {
  id: string;
  name: string;
  description: string;
  type:
  | "title"
  | "text"
  | "number"
  | "status"
  | "select"
  | "multi_select"
  | "date"
  | "checkbox"
  | "url"
  | "email"
  | "phone";
  select?: any;
  text?: any;
  date?: any;
  number?: any;
  formula?: any;
  rich_text?: any;
  status?: any;
}

interface Group {
  color: string;
  name: string;
  id: string;
  option_ids: string[];
}
interface Option {
  color: string;
  id: string;
  name: string;
  description?: string;
}

const getSelectionOptions = (
  col: DatabaseColumn
): Option[] | Map<string, Option[]> => {
  if (col.status?.groups && col.status?.options) {
    const map = new Map<string, Option[]>();
    (col.status.groups as Group[]).forEach((group) => {
      const groupOptions = group.option_ids
        .map((id) => col.status.options.find((opt: Option) => opt.id === id))
        .filter((opt): opt is Option => !!opt);
      map.set(group.name, groupOptions);
    });
    return map;
  }

  if (col.select?.options && Array.isArray(col.select.options)) {
    return col.select.options;
  }

  if (Array.isArray(col.select)) {
    return col.select;
  }

  return [];
};
function filterMapByValue(
  data: Map<string, Option[]>,
  search: string
): Map<string, Option[]> {
  const lower = search.toLowerCase();

  const result = new Map<string, Option[]>();

  for (const [category, values] of data.entries()) {
    const filteredValues = values.filter(v =>
      v.name.toLowerCase().includes(lower)
    );

    if (filteredValues.length > 0) {
      result.set(category, filteredValues);
    }
  }

  return result;
}

interface FieldMappingFormProps {
  databaseColumns: DatabaseColumn[];
  templateValues: Record<string, string>;
  onTemplateChange: (columnId: string, value: string) => void;
  onBack: () => void;
  onSync: () => void;
}

export const FieldMappingForm: React.FC<FieldMappingFormProps> = ({
  databaseColumns,
  templateValues,
  onTemplateChange,
  onBack,
  onSync,
}) => {
  const renderField = (col: DatabaseColumn) => {
    const value = templateValues[col.id] || "";
    const isMulti = col.type === "multi_select";

    const notionOptionsRaw = getSelectionOptions(col);

    const [searchQuery, setSearchQuery] = React.useState("");
    const [showDropdown, setShowDropdown] = React.useState(false);

    const filteredOptions = Array.isArray(notionOptionsRaw) ? notionOptionsRaw.filter(o =>
      o.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) : filterMapByValue(notionOptionsRaw, searchQuery.toLowerCase());

    const backcolors =
      Array.isArray(filteredOptions)
        ? filteredOptions.map(o => o.color)
        : Array.from(filteredOptions.values()).flatMap(v => v.map(o1 => o1.color));

    const selectStyles = backcolors.map(c => ({ color: c } as React.CSSProperties));
    console.log(col.name, selectStyles)
    // --- MULTI SELECT ---
    if (isMulti) {
      const selectedValues = value ? value.split(",") : [];

      return (
        <SearchDropdown
          placeholder="Select one or more..."
          searchQuery={searchQuery}
          selectedValue={null}
          showDropdown={showDropdown}
          options={filteredOptions}
          buttonStyle={selectStyles}
          icon="▼"
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setShowDropdown(false)}
          onSearchChange={setSearchQuery}
          onClear={() => setSearchQuery("")}
          getSelectedName={() => ""}
          onSelect={(name) => {
            const updated = selectedValues.includes(name)
              ? selectedValues.filter((v) => v !== name)
              : [...selectedValues, name];
            onTemplateChange(col.id, updated.join(","));
          }}
        />
      );
    }

    // --- SINGLE SELECT / STATUS ---
    if (col.type === "select" || col.type === "status") {
      return (
        <SearchDropdown
          placeholder="Select..."
          searchQuery={searchQuery}
          selectedValue={value || null}
          showDropdown={showDropdown}
          options={filteredOptions}
          icon="▼"
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setShowDropdown(false)}
          onSearchChange={setSearchQuery}
          onClear={() => {
            setSearchQuery("");
            onTemplateChange(col.id, "");
          }}
          getSelectedName={() => value}
          onSelect={(name) => {
            onTemplateChange(col.id, name);
            setShowDropdown(false);
          }}
        />
      );
    }

    // --- CHECKBOX ---
    if (col.type === "checkbox") {
      return (
        <input
          type="checkbox"
          checked={value === "true"}
          onChange={(e) =>
            onTemplateChange(col.id, e.target.checked ? "true" : "false")
          }
        />
      );
    }

    // --- NUMBER ---
    if (col.type === "number") {
      return (
        <input
          type="number"
          className="form-input"
          value={value}
          placeholder="Enter number or {variable}"
          onChange={(e) => onTemplateChange(col.id, e.target.value)}
        />
      );
    }

    // --- DATE ---
    if (col.type === "date") {
      return (
        <input
          type="text"
          className="form-input"
          placeholder="YYYY-MM-DD or {assignment.due_at}"
          value={value}
          onChange={(e) => onTemplateChange(col.id, e.target.value)}
        />
      );
    }

    // --- URL / EMAIL / PHONE ---
    if (col.type === "url" || col.type === "email" || col.type === "phone") {
      const type = col.type === "phone" ? "text" : col.type;
      return (
        <input
          type={type}
          className="form-input"
          placeholder={`Enter ${col.type} or {variable}`}
          value={value}
          onChange={(e) => onTemplateChange(col.id, e.target.value)}
        />
      );
    }

    // --- TITLE / TEXT / RICH TEXT (default textarea) ---
    return (
      <textarea
        className="form-input form-textarea"
        rows={2}
        placeholder="Enter value... e.g. {assignment.name}"
        value={value}
        onChange={(e) => onTemplateChange(col.id, e.target.value)}
      />
    );
  };

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2 className="step-title">
          Map Canvas fields to your Notion database
        </h2>
        <p className="step-description">
          Enter text or use variables like <code>{`{course.name}`}</code>,{" "}
          <code>{`{assignment.due_at}`}</code>, etc.
        </p>
      </div>

      <form className="mapping-form">
        {databaseColumns.map((col) => (
          <div key={col.id + col.name} className="mapping-field">
            <div style={{ 'marginBottom': "8px" }}>
              <label className="mapping-label">
                {col.name}
                <span className="mapping-type-tag">{col.type}</span>
              </label>

              {col.description && (
                <label className="mapping-label description">
                  {col.description}
                </label>
              )}
            </div>
            {renderField(col)}
          </div>
        ))}
      </form>

      <div className="wizard-actions">
        <button
          className="button button-primary button-large"
          onClick={onBack}
          type="button"
        >
          Back
        </button>

        <button
          className="button button-primary accent button-large"
          onClick={onSync}
          type="button"
        >
          Sync Now
        </button>
      </div>
    </div>
  );
};
