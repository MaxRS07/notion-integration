import { Variable } from "lucide-react";
import { NotionType } from "../notion/types";

export interface Variable<T> {
    name: string;
    value: T;
    icon?: string;
    img?: string;
    description?: string;
}

export interface VariableGroup {
    label: string;
    variables: Record<string, Variable<any>>;
}
