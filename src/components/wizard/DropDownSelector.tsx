import { SearchDropdown } from './SearchDropdown';

interface DropdownSelectorProps<T extends { id: string; name: string }> {
    searchQuery: string;
    selectedValue: string;
    showDropdown: boolean;
    placeholder: string;
    label?: string;
    icon?: string;
    options: T[];
    getOptionId: (option: T) => string;
    getOptionName: (option: T) => string;
    onSearchChange: (value: string) => void;
    onSelect: (id: string) => void;
    onFocus: () => void;
    onBlur: (e: React.FocusEvent<HTMLDivElement>) => void;
    onClear: () => void;
    showCreateOptions?: boolean;
}

function DropdownSelector<T extends { id: string; name: string }>({
    searchQuery,
    selectedValue,
    showDropdown,
    placeholder,
    label,
    icon,
    options,
    getOptionId,
    getOptionName,
    onSearchChange,
    onSelect,
    onFocus,
    onBlur,
    onClear,
    showCreateOptions,
}: DropdownSelectorProps<T>) {
    const selectedOption = options.find(o => getOptionId(o) === selectedValue);

    return (
        <SearchDropdown
            searchQuery={searchQuery}
            selectedValue={selectedValue}
            showDropdown={showDropdown}
            placeholder={placeholder}
            label={label}
            icon={icon}
            options={options.map(o => ({
                id: getOptionId(o),
                name: getOptionName(o),
                description: (o as any).description,
            }))}
            onSearchChange={onSearchChange}
            onSelect={onSelect}
            onFocus={onFocus}
            onBlur={onBlur}
            onClear={onClear}
            getSelectedName={() => selectedOption?.name || ''}
            showCreateOptions={showCreateOptions}
        />
    );
}
export default DropdownSelector;