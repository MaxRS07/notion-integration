import React, { useRef, useState } from 'react';
import { VariableGroup, VariableOption } from '../../../models/shared/mapvar';
import { VariablePickerOverlay } from '../../wizard/VariablePickerOverlay';

/* ================================================================== */
/* SingleVariableInput: Select exactly one variable                  */
/* ================================================================== */

export interface SingleVariableInputProps {
    value?: VariableOption | null;
    onChange: (variable: VariableOption | null) => void;
    placeholder?: string;
    variableGroups: VariableGroup[];
    blockIndex: number;
}

export const SingleVariableInput = React.forwardRef<
    HTMLDivElement,
    SingleVariableInputProps
>(({ value, onChange, placeholder = 'Select variable...', variableGroups, blockIndex }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const handleSelect = (variable: VariableOption) => {
        onChange(variable);
        setQuery('');
        setIsOpen(false);
    };

    const handleClear = () => {
        onChange(null);
        setQuery('');
    };

    return (
        <div
            ref={ref || inputRef}
            className="single-input-container"
        >
            {value ? (
                <>
                    {/* Selected Variable Badge */}
                    <span className="variable-inline-block">
                        {value.img && (
                            <img
                                src={value.img}
                                style={{ width: 12, height: 12 }}
                                alt={value.name}
                            />
                        )}
                        <span>{value.name}</span>
                    </span>

                    {/* Clear Button */}
                    <button
                        onClick={handleClear}
                        className='clear-input-btn'
                        title="Clear selection"
                    >
                        ✕
                    </button>
                </>
            ) : (
                <input
                    ref={searchInputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className='search-input-single'
                />
            )}

            {/* Picker Overlay */}
            <VariablePickerOverlay
                isOpen={isOpen}
                onClose={() => {
                    setIsOpen(false);
                    setQuery('');
                }}
                query={query}
                variableGroups={variableGroups}
                blockIndex={blockIndex}
                inputElement={inputRef.current || undefined}
                onSelect={handleSelect}
            />
        </div>
    );
});

SingleVariableInput.displayName = 'SingleVariableInput';
