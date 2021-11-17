import { compare as compareFn, guard } from '@core/utils';

import { deserialize } from './tagArray';

export type StringCompareOperator = keyof typeof stringCompare;
export type OrdinalCompareOperator = keyof typeof ordinalCompare;
export type CompareOperator = keyof typeof compare;
export type NumericOperator = keyof typeof numeric;
export type LogicOperator = keyof typeof logic;

export function isStringCompareOperator(operator: string): operator is StringCompareOperator {
    return guard.hasProperty(stringCompare, operator);
}

export function isOrdinalCompareOperator(operator: string): operator is OrdinalCompareOperator {
    return guard.hasProperty(ordinalCompare, operator);
}

export function isCompareOperator(operator: string): operator is CompareOperator {
    return guard.hasProperty(compare, operator);
}

export function isNumericOperator(operator: string): operator is NumericOperator {
    return guard.hasProperty(numeric, operator);
}

export function isLogicOperator(operator: string): operator is LogicOperator {
    return guard.hasProperty(logic, operator);
}

export const stringCompare = {
    startswith(a: string, b: string): boolean {
        const arr = deserialize(a, false);
        if (arr !== undefined)
            return arr[0] === b;
        return a.startsWith(b);

    },
    endswith(a: string, b: string): boolean {
        const arr = deserialize(a, false);
        if (arr !== undefined)
            return arr.slice(-1)[0] === b;
        return a.endsWith(b);

    },
    includes(a: string, b: string): boolean {
        const arr = deserialize(a, false);
        if (arr !== undefined)
            return arr.find((v) => v === b) !== null;
        return a.includes(b);

    },
    contains(a: string, b: string): boolean {
        const arr = deserialize(a, false);
        if (arr !== undefined)
            return arr.find((v) => v === b) !== null;
        return a.includes(b);

    }
};

export const ordinalCompare = {
    '==': (a: string, b: string): boolean => compareFn(a, b) === 0,
    '!=': (a: string, b: string): boolean => compareFn(a, b) !== 0,
    '>=': (a: string, b: string): boolean => compareFn(a, b) >= 0,
    '>': (a: string, b: string): boolean => compareFn(a, b) > 0,
    '<=': (a: string, b: string): boolean => compareFn(a, b) <= 0,
    '<': (a: string, b: string): boolean => compareFn(a, b) < 0
};

export const compare = {
    ...ordinalCompare,
    ...stringCompare
};

export const numeric = {
    '+': (a: number, b: number): number => a + b,
    '-': (a: number, b: number): number => a - b,
    '*': (a: number, b: number): number => a * b,
    '/': (a: number, b: number): number => a / b,
    '%': (a: number, b: number): number => a % b,
    '^': (a: number, b: number): number => Math.pow(a, b)
};

export const logic = {
    '&&': (vals: boolean[]): boolean => vals.length > 0 && vals.filter(v => v).length === vals.length,
    '||': (vals: boolean[]): boolean => vals.filter(v => v).length > 0,
    'xor': (vals: boolean[]): boolean => vals.filter(v => v).length === 1,
    '^': (vals: boolean[]): boolean => vals.filter(v => v).length === 1, //* Alias of xor
    '!': (vals: boolean[]): boolean => !vals[0]
};

export const all: typeof compare & typeof numeric & typeof logic = Object.assign({}, compare, numeric, logic);
//TODO bitwise
