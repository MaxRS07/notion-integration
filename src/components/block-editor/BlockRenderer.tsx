import React, { Dispatch, SetStateAction } from "react";
import { EditorBlock } from "./types";
import { VariableGroup } from "../../models/shared/mapvar";

interface BlockRendererProps {
    block: EditorBlock;
    index: number;
    onUpdate: (data: any) => void;
    environmentVars: Record<string, VariableGroup>;
    setEnvironmentVars: Dispatch<SetStateAction<Record<string, VariableGroup>>>;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
    block,
    onUpdate,
    environmentVars,
    setEnvironmentVars,
}) => {
    const { definition, data } = block;
    const error = definition.validate?.(data);

    return (
        <>
            <div className="block-fields">
                {definition.render({
                    data,
                    onChange: onUpdate,
                    environmentVars,
                    setEnvironmentVars,
                })}
            </div>

            {error && <div className="form-error">{error}</div>}
        </>
    );
};
