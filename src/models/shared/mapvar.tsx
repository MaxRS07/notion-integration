import { Variable } from "lucide-react";
import { NotionType } from "../notion/types";

export interface DisplayVariableGroup {
    label: string;
    variables: Record<string, DisplayVariable>;
}
export interface DisplayVariable {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    img?: string;
}
export interface Variable<T> {
    name: string;
    value: T;
}

export interface VariableGroup {
    label: string;
    variables: Record<string, Variable<any>>;
}
