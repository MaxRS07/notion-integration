import { BlockDefinition } from "./blocks/types";

export interface BlockData {
    type: string;
    data?: any;
}

export interface EditorBlock<T = any> {
    id: string;
    type: string;
    definition: BlockDefinition<T>;
    data: T;
    // child blocks contained within this block's scope (for control flow blocks like loops)
    children?: EditorBlock[];
}
