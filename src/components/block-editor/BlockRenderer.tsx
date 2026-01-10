import React, { Dispatch, SetStateAction } from "react";
import { EditorBlock } from "./types";
import { VariableGroup, RuntimeVars } from "../../models/shared/mapvar";

interface BlockRendererProps {
    block: EditorBlock;
    index: number;
    onUpdate: (data: any) => void;
    displayVariableGroups: VariableGroup[];
    setDisplayVariableGroups: Dispatch<SetStateAction<VariableGroup[]>>;
    runtimeVars: RuntimeVars;
    setRuntimeVars: Dispatch<SetStateAction<RuntimeVars>>;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
    block,
    onUpdate,
    displayVariableGroups,
    setDisplayVariableGroups,
    runtimeVars,
    setRuntimeVars,
}) => {
    const { definition, data } = block;
    const error = definition.validate?.(data);

    return (
        <>
            <div className="block-fields">
                {definition.render({
                    data,
                    onChange: onUpdate,
                    displayVariableGroups,
                    setDisplayVariableGroups,
                    runtimeVars,
                    setRuntimeVars,
                })}
            </div>

            {error && <div className="form-error">{error}</div>}
        </>
    );
};
