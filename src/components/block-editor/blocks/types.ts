import { JSX, Dispatch, SetStateAction } from "react";
import { NotionType } from "../../../models/notion/types";
import { VariableGroup, RuntimeVars, ScopePath, ScopeContext } from "../../../models/shared/mapvar";

export enum BlockType {
    GET = "get",
    POST = "post",
    FUNCTION = "function",
}
export interface BlockEditorContext {
    // display groups used by renderers (pickers, overlays)
    displayVariableGroups: VariableGroup[];
    setDisplayVariableGroups: Dispatch<SetStateAction<VariableGroup[]>>;
    // runtime vars are populated at run-time and are separate from display vars
    runtimeVars: RuntimeVars;
    setRuntimeVars: Dispatch<SetStateAction<RuntimeVars>>;
    // the index of the current block being edited
    blockIndex?: number;
    // scope context for nested blocks (loops, conditions, etc.)
    scopeContext?: ScopeContext;
    setScopeContext?: Dispatch<SetStateAction<ScopeContext>>;
}
export interface BlockRuntimeContext {
    runtimeVars: RuntimeVars;
    setRuntimeVars: Dispatch<SetStateAction<RuntimeVars>>;
}

export interface BlockDefinition<TData = any> {
    type: BlockType;
    label: string;
    icon?: React.ReactNode;
    img?: string;
    // whether this block can be expanded/collapsed (default: true)
    // optional custom header for collapsed view (default: shows label)
    renderHeader?: (props: BlockRenderProps<TData>) => JSX.Element;
    // whether this block can contain child blocks (default: false)
    canHaveChildren?: boolean;

    defaultData: TData;

    render: (props: BlockRenderProps<TData>) => JSX.Element;

    onRun: (data: TData, context: BlockRuntimeContext) => Promise<any>;

    onAdd?: (data: TData, context: BlockEditorContext) => void;

    onRemove?: (data: TData, context: BlockEditorContext) => void;

    summarize?: (data: TData) => string;

    validate?: (data: TData) => string | null;
}

export interface BlockRenderProps<TData> {
    data: TData;
    onChange: (data: TData) => void;
    disabled?: boolean;
    // display groups for pickers / overlays
    displayVariableGroups: VariableGroup[];
    setDisplayVariableGroups: Dispatch<SetStateAction<VariableGroup[]>>;
    // runtime vars available for preview or other render-time needs
    runtimeVars: RuntimeVars;
    setRuntimeVars: Dispatch<SetStateAction<RuntimeVars>>;
    // block index to filter variables from previous blocks only
    blockIndex: number;
}

export const pollIntervals = [
    { id: '5', name: '5 minutes' },
    { id: '10', name: '10 minutes' },
    { id: '15', name: '15 minutes' },
    { id: '30', name: '30 minutes' },
    { id: '60', name: '60 minutes' },
];

// export const functionGroups: Record<string, VariableGroup> = {
//     "math": {
//         label: 'Math',
//         variables: {
//             "abs": { name: 'abs(x)', value: 'abs()', dataType: NotionType.Number },
//             "round": { name: 'round(x)', value: 'round()', dataType: NotionType.Number },
//             "floor": { name: 'floor(x)', value: 'floor()', dataType: NotionType.Number },
//             "ciel": { name: 'ceil(x)', value: 'ceil()', dataType: NotionType.Number },
//             "min": { name: 'min(a, b)', value: 'min()', dataType: NotionType.Number },
//             "max": { name: 'max(a, b)', value: 'max()', dataType: NotionType.Number },
//         },
//     },
//     "text": {
//         label: 'Text',
//         variables: {
//             "concat": { name: 'concat(a, b)', value: 'concat()', dataType: NotionType.Text },
//             "length": { name: 'length(text)', value: 'length()', dataType: NotionType.Number },
//             "lower": { name: 'lower(text)', value: 'lower()', dataType: NotionType.Text },
//             "upper": { name: 'upper(text)', value: 'upper()', dataType: NotionType.Text },
//             "replace": { name: 'replace(text, a, b)', value: 'replace()', dataType: NotionType.Text },
//         },
//     },
//     "date": {
//         label: 'Date & Time',
//         variables: {
//             "now": { name: 'now()', value: 'now()', dataType: NotionType.Date },
//             "formatDate": { name: 'formatDate(date)', value: 'formatDate()', dataType: NotionType.Text },
//             "dateAdd": { name: 'dateAdd(date, n)', value: 'dateAdd()', dataType: NotionType.Date },
//             "dateDiff": { name: 'dateDiff(a, b)', value: 'dateDiff()', dataType: NotionType.Number },
//         },
//     },
//     "logic": {
//         label: 'Logic',
//         variables: {
//             "if": { name: 'if(cond, a, b)', value: 'if()', dataType: NotionType.Text },
//             "and": { name: 'and(a, b)', value: 'and()', dataType: NotionType.Boolean },
//             "or": { name: 'or(a, b)', value: 'or()', dataType: NotionType.Boolean },
//             "not": { name: 'not(x)', value: 'not()', dataType: NotionType.Boolean },
//         },
//     },
// };