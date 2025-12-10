import React, { useRef } from 'react';
import { DropdownOption } from './DestinationSelector';

interface SearchDropdownProps {
  searchQuery: string;
  selectedValue: string | null;
  showDropdown: boolean;
  placeholder: string;
  icon?: string;
  label?: string;
  options: DropdownOption[] | Map<string, DropdownOption[]>;
  buttonStyle?: React.CSSProperties[] | React.CSSProperties;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  onFocus: () => void;
  onBlur: (e: React.FocusEvent<HTMLDivElement>) => void;
  onClear: () => void;
  getSelectedName: () => string;
}

declare global {
  interface Map<K, V> {
    mapEntries<T>(callbackFn: (key: K, value: V) => T): T[];
  }
}
Map.prototype.mapEntries = function <K, V, T>(
  this: Map<K, V>,
  callbackFn: (key: K, value: V) => T
): T[] {
  const result: T[] = [];
  for (const [key, value] of this.entries()) {
    result.push(callbackFn(key, value));
  }
  return result;
};

export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  searchQuery,
  selectedValue,
  showDropdown,
  placeholder,
  icon,
  label,
  options,
  buttonStyle,
  onSearchChange,
  onSelect,
  onFocus,
  onBlur,
  getSelectedName,
}) => {
  const searchRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={searchRef} tabIndex={0} onBlur={onBlur}>
      <div className="search-container">
        <label className="form-label">{label}</label>
        <div className="search-input-wrapper">
          <input
            type="text"
            className="form-input search-input"
            placeholder={placeholder}
            value={selectedValue ? getSelectedName() : searchQuery}
            onChange={e => {
              if (selectedValue) {
                // Clear selection when user starts typing
                onSearchChange(e.target.value);
              } else {
                onSearchChange(e.target.value);
              }
            }}
            onFocus={() => {
              if (selectedValue) {
                // Clear selection on focus so user can search again
              }
              onFocus();
            }}
          />
          <span className="search-icon">{icon}</span>
        </div>

        {showDropdown && !selectedValue && (
          <div className="search-dropdown">
            {Array.isArray(options) ? (
              options.length > 0 && (
                <div className="dropdown-section">
                  {options.map((option, i) => (
                    <button
                      key={option.id}
                      className="dropdown-item"
                      style={Array.isArray(buttonStyle) ? buttonStyle[i] ?? { backgroundColor: "red" } : buttonStyle ?? { color: "red" }}
                      onClick={() => onSelect(option.id)}
                    >
                      <div className="dropdown-info">
                        <div className="dropdown-name">
                          {option.name}
                        </div>
                        <div className="dropdown-type">{option.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )
            ) : options instanceof Map ? (
              options.mapEntries((groupName, groupOptions) => (
                <div key={groupName} className="dropdown-section">
                  <div className="dropdown-heading">{groupName}</div>
                  {groupOptions.map((option, i) => (
                    <button
                      key={option.id}
                      className="dropdown-item"
                      onClick={() => onSelect(option.id)}
                    >
                      <div className="dropdown-info">
                        <div
                          className="dropdown-name"
                          style={Array.isArray(buttonStyle) ? buttonStyle[i] ?? {} : buttonStyle ?? {}}
                        >
                          {option.name}
                        </div>
                        <div className="dropdown-type">{option.description}</div>
                      </div>
                    </button>
                  )
                  )}
                </div>
              ))
            ) : null}

            {
              (Array.isArray(options) && options.length === 0) ||
              (options instanceof Map && options.size === 0) &&
              searchQuery.length > 0 && (
                <div className="dropdown-empty">
                  No results found for "{searchQuery}"
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};
