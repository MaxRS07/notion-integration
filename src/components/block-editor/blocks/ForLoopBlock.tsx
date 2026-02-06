import React from 'react';
import { BlockDefinition, BlockRenderProps } from './types';
import { VariableOption } from '../../../models/shared/mapvar';
import { SingleVariableInput } from './SingleVariableInput';

export interface ForLoopBlockData {
    variableOption: VariableOption | null;
    description?: string;
}

export const ForLoopBlock: BlockDefinition<ForLoopBlockData> = {
    type: 'for-loop' as any,
    label: 'For Loop',
    icon: '🔄',
    canHaveChildren: true,
    defaultData: {
        variableOption: null,
        description: 'Loops over items in an array',
    },

    renderHeader: (props) => {
        return (
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
                <h3>For each <span className='variable-inline-block large'>Item</span> in</h3>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ maxWidth: '30%' }}>
                        <SingleVariableInput
                            placeholder='any array'
                            value={props.data.variableOption}
                            variableGroups={props.displayVariableGroups}
                            onChange={(s) => props.onChange({ ...props.data, variableOption: s })}
                            blockIndex={props.blockIndex}
                        />
                    </div>
                </div>
            </div>
        )
    },

    render: (props: BlockRenderProps<ForLoopBlockData>) => { return <></> },

    onAdd: () => {
        // No scope setup needed - just a simple configuration block
    },

    onRemove: () => {
        // No cleanup needed
    },

    onRun: async (data) => {
        /*
        for (item in data.variableOption) {
            run child block with scope variable set to current item
        }
        */
    },

    validate: (data) => {
        if (!data.variableOption) {
            return 'Loop variable name is required';
        }
        return null;
    },

    summarize: (data) => {
        return `For each Item in ${data.variableOption?.name ?? 'array'}`;
    },
};
