import React, { useRef } from 'react';

interface SearchDropdownProps {
  searchQuery: string;
  selectedValue: string;
  showDropdown: boolean;
  placeholder: string;
  icon?: string;
  label?: string;
  options: Array<{ id: string; name: string; description: string }>;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  onFocus: () => void;
  onBlur: (e: React.FocusEvent<HTMLDivElement>) => void;
  onClear: () => void;
  getSelectedName: () => string;
  showCreateOptions?: boolean;
}

export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  searchQuery,
  selectedValue,
  showDropdown,
  placeholder,
  icon,
  label,
  options,
  onSearchChange,
  onSelect,
  onFocus,
  onBlur,
  getSelectedName,
  showCreateOptions = false,
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
              onSearchChange(e.target.value);
            }}
            onFocus={onFocus}
          />
          <span className="search-icon">{icon}</span>
        </div>

        {showDropdown && !selectedValue && (
          <div className="search-dropdown">
            {searchQuery.length === 0 && showCreateOptions && (
              <div className="dropdown-section">
                <div className="dropdown-heading">Create New</div>
                <button className="dropdown-item">
                  <div className="dropdown-info">
                    <div className="dropdown-name">New Page</div>
                    <div className="dropdown-type">Create a new page as the destination</div>
                  </div>
                </button>
                <button className="dropdown-item">
                  <div className="dropdown-info">
                    <div className="dropdown-name">New Datasource</div>
                    <div className="dropdown-type">Create a new datasource as the destination</div>
                  </div>
                </button>
              </div>
            )}
            {options.length > 0 && (
              <div className="dropdown-section">
                <div className="dropdown-heading">{showCreateOptions ? 'Pages' : 'Available Options'}</div>
                {options.map(option => (
                  <button
                    key={option.id}
                    className="dropdown-item"
                    onClick={() => onSelect(option.id)}
                  >
                    <div className="dropdown-info">
                      <div className="dropdown-name">{option.name}</div>
                      <div className="dropdown-type">{option.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {options.length === 0 && searchQuery.length > 0 && (
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
