import React, { useState, useRef, useEffect } from 'react';
import { VariableGroup, VariableOption } from '../../models/shared/mapvar';

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
    onSelect: (value: VariableOption) => void;
    query?: string;
    variableGroups: VariableGroup[];
    // can be an <input> or a contenteditable element
    inputElement?: HTMLElement | HTMLInputElement;
    // block index to filter variables from previous blocks only
    blockIndex?: number;
}

export const VariablePickerOverlay: React.FC<VariablePickerOverlayProps> = ({
    isOpen,
    onClose,
    onSelect,
    query,
    variableGroups,
    inputElement,
    blockIndex,
}) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const updatePosition = () => {
        if (isOpen && inputElement) {
            const rect = (inputElement as HTMLElement).getBoundingClientRect();
            setPosition({
                top: rect.bottom + 4, // Include the offset from the top of the document
                left: rect.left,
            });
        }
    };
    const handleSearch = (fullText: string) => {
        const i = lastIndexOf(fullText, (char) => char === '.' || char === " ")
        const result = i === -1 ? fullText : fullText.slice(i, fullText.length);
    }

    useEffect(() => {
        updatePosition();
    }, [inputElement]);

    useEffect(() => {
        const el = optionRefs.current[selectedIndex];
        if (el) {
            // Smooth scroll so the selected item is visible
            el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [selectedIndex]);

    // Filter variables based on search and block index
    const filteredGroups = variableGroups
        .map(group => ({
            ...group,
            options: group.options.filter(opt => {
                // Filter by search query
                const matchesQuery = opt.name.replace(" ", "").toLowerCase().includes((query ?? '').toLowerCase().replace(" ", ""));
                // Filter by block index - only show variables from earlier blocks
                const isAccessible = blockIndex === undefined || opt.sourceBlockIndex === undefined || opt.sourceBlockIndex < blockIndex;
                return matchesQuery && isAccessible;
            }),
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
                    onSelect(allOptions[selectedIndex]);
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
    }, [query]);

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
                                        ref={element => { optionRefs.current[globalIndex] = element; }}
                                        onClick={() => { setSelectedIndex(globalIndex); onSelect(option) }}
                                        className={`variable-option ${isSelected ? 'selected' : ''}`}
                                    >
                                        <div>
                                            {option.img ? <img src={option.img}></img> : option.icon ? <span className="variable-option-name">{option.icon}</span> : null}
                                            <span className="variable-option-name">
                                                {option.name}
                                            </span>
                                        </div>
                                        <code className="mapping-type-tag">{option.dataType}</code>
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