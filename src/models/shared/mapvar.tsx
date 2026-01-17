import { NotionType } from "../notion/types";

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
}

// Helper map of runtime variables
export type RuntimeVars = Record<string, RuntimeVariable<any>>;
