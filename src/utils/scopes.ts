import { RuntimeVars, RuntimeVariable, ScopePath, ScopeContext, VariableOption } from '../models/shared/mapvar';

/**
 * Get a variable from RuntimeVars, handling nested scope access
 * e.g., getVariable(vars, "item", ["loop-0"]) gets the loop variable
 */
export function getVariable(vars: RuntimeVars, varId: string, scopePath?: ScopePath): RuntimeVariable<any> | undefined {
    if (!scopePath || scopePath.length === 0) {
        const val = vars[varId];
        if (val && typeof val === 'object' && 'value' in val) {
            return val as RuntimeVariable<any>;
        }
        return undefined;
    }

    // Navigate through nested scopes
    let current: any = vars;
    for (const scope of scopePath) {
        if (typeof current !== 'object' || !(scope in current)) {
            return undefined;
        }
        current = current[scope];
    }

    if (typeof current === 'object' && varId in current) {
        const val = current[varId];
        if (typeof val === 'object' && 'value' in val) {
            return val as RuntimeVariable<any>;
        }
    }

    return undefined;
}

/**
 * Set a variable in RuntimeVars, creating nested scopes if needed
 */
export function setVariable(
    vars: RuntimeVars,
    varId: string,
    value: RuntimeVariable<any>,
    scopePath?: ScopePath
): RuntimeVars {
    if (!scopePath || scopePath.length === 0) {
        return {
            ...vars,
            [varId]: value,
        };
    }

    const newVars = JSON.parse(JSON.stringify(vars)) as RuntimeVars;
    let current: any = newVars;

    // Navigate/create nested scopes
    for (const scope of scopePath) {
        if (!(scope in current)) {
            current[scope] = {};
        }
        current = current[scope];
    }

    current[varId] = value;
    return newVars;
}

/**
 * Check if a variable is accessible from the current scope
 * Variables are accessible if:
 * 1. They have no scope (global variables)
 * 2. They're from an earlier block (sourceBlockIndex < currentBlockIndex)
 * 3. They're in the current scope or a parent scope
 */
export function isVariableAccessible(
    variable: VariableOption,
    currentBlockIndex: number,
    currentScopePath?: ScopePath,
    loopScopePaths?: ScopePath[]
): boolean {
    // Check block index - must be from earlier block
    if (variable.sourceBlockIndex !== undefined && variable.sourceBlockIndex >= currentBlockIndex) {
        return false;
    }

    // If variable has no scope, it's globally accessible
    if (!variable.scopePath || variable.scopePath.length === 0) {
        return true;
    }

    // If we're not in a scope, we can't access scoped variables
    if (!currentScopePath || currentScopePath.length === 0) {
        return false;
    }

    // Variable is accessible if its scope path is a prefix of our current scope path
    // e.g., ["loop-0", "item"] is accessible from ["loop-0", "loop-1"]
    return currentScopePath.length >= variable.scopePath.length &&
        variable.scopePath.every((scope, idx) => currentScopePath[idx] === scope);
}

/**
 * Create a new scope ID for a loop or other container block
 */
export function createScopeId(blockIndex: number, blockType: string, depth: number = 0): string {
    return `${blockType}-${blockIndex}${depth > 0 ? `-${depth}` : ''}`;
}

/**
 * Get the parent scope path (removes the last scope)
 */
export function getParentScopePath(scopePath: ScopePath): ScopePath {
    return scopePath.slice(0, -1);
}

/**
 * Check if a scope path is nested inside another scope path
 */
export function isScopeNested(scopePath: ScopePath, parentScopePath: ScopePath): boolean {
    if (parentScopePath.length >= scopePath.length) {
        return false;
    }
    return parentScopePath.every((scope, idx) => scopePath[idx] === scope);
}

/**
 * Merge scope context changes while preserving existing scopes
 */
export function mergeScopeContext(current: ScopeContext, updates: Partial<ScopeContext>): ScopeContext {
    return {
        currentScopePath: updates.currentScopePath ?? current.currentScopePath,
        scopeItems: {
            ...current.scopeItems,
            ...updates.scopeItems,
        },
        scopeIndices: {
            ...current.scopeIndices,
            ...updates.scopeIndices,
        },
    };
}

/**
 * Create an initial scope context
 */
export function createScopeContext(): ScopeContext {
    return {
        currentScopePath: [],
        scopeItems: {},
        scopeIndices: {},
    };
}
