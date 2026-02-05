import { NotionType } from "../notion/types";

// Scope path identifies a variable's location in nested scopes
// e.g., ["loop-0", "item"] for a loop variable, or ["loop-1", "loop-0", "item"] for nested loops
export type ScopePath = string[];

// A variable option shown in pickers (display layer)
export interface VariableOption {
    id: string;
    name: string;
    value?: string;
    dataType?: NotionType;
    description?: string;
    icon?: string;
    img?: string;
    bgColor?: string;
    // which block index produced this variable
    sourceBlockIndex?: number;
    // scope path if this variable is scoped (e.g., loop variables)
    scopePath?: ScopePath;
}

// A group of display variables used by the UI when constructing flows
export interface VariableGroup {
    label: string;
    options: VariableOption[];
}

// Runtime variable stored when the flow runs
export interface RuntimeVariable<T = any> {
    id: string;
    value: T;
    // scope path if this variable is scoped
    scopePath?: ScopePath;
}

// Helper map of runtime variables
// Can be flat or nested based on scopes
export type RuntimeVars = Record<string, RuntimeVariable<any> | Record<string, any>>;

// Scope context tracking the current execution scope
export interface ScopeContext {
    // Current scope path (e.g., ["loop-0"] when inside a loop)
    currentScopePath: ScopePath;
    // Map of scope IDs to their loop items (for iteration)
    scopeItems: Record<string, any[]>;
    // Current index in each scope
    scopeIndices: Record<string, number>;
}
