import React, { useState, useRef, useEffect } from 'react';
import { VariableGroup } from '../../models/shared/mapvar';

function lastIndexOf(str: string, match: (char: string) => boolean) {
    for (var i = str.length; i > 0; i--) {
        const char = str[i]
        if (match(char)) {
            return i;
        }
    }
    return -1;
}

export interface VariablePickerOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (value: string) => void;
    variableGroups: VariableGroup[];
    inputElement?: HTMLInputElement;
}

export const VariablePickerOverlay: React.FC<VariablePickerOverlayProps> = ({
    isOpen,
    onClose,
    onSelect,
    variableGroups,
    inputElement,
}) => {
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const updatePosition = () => {
        if (isOpen && inputElement) {
            const rect = inputElement.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 4, // Include the offset from the top of the document
                left: rect.left,
            });
        }
    };
    const handleSearch = (query: string) => {
        const i = lastIndexOf(query, (char) => char === '.' || char === " ")
        const result = i === -1 ? query : query.slice(i, query.length);
        setSearch(result)
    }
    useEffect(() => {
        handleSearch(inputElement?.value ?? "")
        updatePosition();
    }, [isOpen, inputElement?.value]);

    useEffect(() => {
        const el = optionRefs.current[selectedIndex];
        if (el) {
            // Smooth scroll so the selected item is visible
            el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [selectedIndex]);

    // Filter variables based on search
    const filteredGroups = variableGroups
        .map(group => ({
            ...group,
            options: group.variables.filter(opt =>
                opt.name.replace(" ", "").toLowerCase().includes(search.toLowerCase().replace(" ", ""))
            ),
        }))
        .filter(group => group.options.length > 0);

    const allOptions = filteredGroups.flatMap(group => group.options);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % allOptions.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + allOptions.length) % allOptions.length);
            } else if (e.key === 'Enter' || e.key === 'Return') {
                e.preventDefault();
                if (allOptions[selectedIndex]) {
                    onSelect(allOptions[selectedIndex].value);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, allOptions, onSelect, onClose]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    let currentOptionIndex = 0;

    return (
        <div
            ref={overlayRef}
            className="variable-picker-overlay"
            style={{
                position: 'fixed',
                top: `${position.top}px`,
                left: `${position.left}px`,
                zIndex: 1000, // Ensure it's above other content
            }}
        >
            {/* Variable Groups */}
            <div className="variable-picker-groups">
                {filteredGroups.length === 0 ? (
                    <div className="variable-picker-empty">
                        No variables found
                    </div>
                ) : (
                    filteredGroups.map((group, groupIdx) => (
                        <div key={groupIdx} className="variable-group">
                            {/* Group Label */}
                            <div className="variable-group-label">
                                {group.label}
                            </div>

                            {/* Group Options */}
                            {group.options.map((option, optIdx) => {
                                const globalIndex = currentOptionIndex++;
                                const isSelected = globalIndex === selectedIndex;

                                return (
                                    <button
                                        key={optIdx}
                                        ref={element => optionRefs.current[globalIndex] = element}
                                        onClick={() => { setSelectedIndex(globalIndex); onSelect(option.value) }}
                                        className={`variable-option ${isSelected ? 'selected' : ''}`}
                                    >
                                        <span className="variable-option-name">{option.name}</span>
                                        <code className="mapping-type-tag">{option.dataType.toString()}</code>
                                    </button>
                                );
                            })}
                        </div>
                    ))
                )}
            </div>
            <div className="variable-picker-footer">
                <span>↑↓ to navigate</span>
                <span>↵ to select</span>
                <span>esc to close</span>
            </div>
        </div>
    );
};