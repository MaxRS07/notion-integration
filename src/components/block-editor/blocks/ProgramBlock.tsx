import { BlockDefinition, BlockRenderProps, BlockRuntimeContext, BlockType } from "./types";
import functionIcon from '../../../assets/icons/function.svg';
import { TokenizedInput } from "./TokenizedInput";
import React, { useState, useEffect } from "react";

export const LoggingBlock: BlockDefinition<string> = {
    type: BlockType.FUNCTION,
    label: "Log data to console output",
    img: functionIcon,

    defaultData: "",

    onRun: async (data: String, context: BlockRuntimeContext) => console.log(data),


    render: (props: BlockRenderProps<string>) => {
        return (
            <div>
                <div className="block-header">
                    <img src={functionIcon} className="block-icon" />
                    <div className="block-info">
                        <h3 className="block-title">Log To Console</h3>
                        <p className="block-description">Log a message to the console</p>
                    </div>
                </div>
                <div className="block-fields">
                    <div className="field-group">
                        <label className="field-label">
                            Message to log
                        </label>
                        <p className="field-hint">Logs program data to the console</p>
                        <TokenizedInput
                            value={props.data}
                            variableGroups={props.displayVariableGroups}
                            setVariableGroups={props.setDisplayVariableGroups}
                            onChange={(s) => props.onChange(s)}
                            blockIndex={props.blockIndex}
                        />
                    </div>
                </div>
            </div>
        );
    },
    summarize: (data) => "Log data to the console at runtime",
    validate: (data: string) => null
}