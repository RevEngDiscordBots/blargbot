import { BBTagContext } from '@cluster/bbtag';
import { BBTagArray } from '@cluster/types';

import { getArray } from './tagArray';

export interface ReturnObject {
    variable?: string;
    object: JObject | JArray;
}

export async function parse(context: BBTagContext, input: string): Promise<ReturnObject> {
    let obj: JToken | undefined;
    let variable: string | undefined;
    const arr = await getArray(context, input);
    if (arr !== undefined) {
        obj = Array.isArray(arr) ? arr : arr.v;
    } else {
        try {
            obj = JSON.parse(input);
        } catch (err: unknown) {
            const v = await context.variables.get(input);
            if (v !== undefined) {
                variable = input;
                if (typeof v === 'object') obj = v;
                else {
                    try {
                        if (typeof v === 'string')
                            obj = JSON.parse(v);
                    } catch (err2: unknown) {
                        obj = {};
                    }
                }
            } else {
                obj = {};
            }
        }
    }
    if (typeof obj !== 'object' || obj === null)
        obj = {};
    return {
        variable,
        object: obj
    };
}

export function parseSync(input: string): JObject | JArray {
    let obj: BBTagArray | JToken;
    try {
        obj = JSON.parse(input);
    } catch (err: unknown) {
        obj = {};
    }

    if (typeof obj !== 'object' || obj === null)
        obj = {};
    return obj;
}
export function get(token: JToken | undefined, path: string | string[]): JToken | undefined {
    if (typeof path === 'string')
        path = path.split('.');
    for (const part of path) {
        if (typeof token === 'string') {
            try {
                token = JSON.parse(token);
            } catch (err: unknown) {
                // NOOP
            }
        }

        if (typeof token === 'object' && !Array.isArray(token) && token !== null) {
            const keys = Object.keys(token);
            if (keys.length === 2 && keys.includes('v') && keys.includes('n') && /^\d+$/.test(part)) {
                token = token.v;
            }
        }
        if (token === undefined)
            throw Error(`Cannot read property ${part} of undefined`);
        else if (token === null)
            throw Error(`Cannot read property ${part} of null`);
        else if (typeof token === 'object' && Object.prototype.hasOwnProperty.call(token, part)) {
            if (Array.isArray(token))
                token = token[parseInt(part)];
            else
                token = token[part];
        } else if (typeof token === 'string')
            token = token[parseInt(part)];
        else
            token = undefined;
    }
    return token;
}

export function set<T extends JToken>(input: T, path: string | string[], value: JToken | undefined, forceCreate = false): void {
    if (typeof path === 'string')
        path = path.split('.');
    const comps = path;
    let obj: undefined | JToken = input;
    if (forceCreate) {
        for (let i = 0; i < comps.length - 1; i++) {
            const p = comps[i];
            if (Object.prototype.hasOwnProperty.call(obj, p)) {
                let _c;
                if (Array.isArray(obj))
                    _c = obj[parseInt(p)];
                else if (typeof obj === 'object' && obj !== null)
                    _c = obj[p];
                // first ensure that it's not json encoded
                if (typeof _c === 'string') {
                    try {
                        _c = JSON.parse(_c);
                    } catch (err: unknown) {
                        // NOOP
                    }
                }
                // set to an object if it's a primative
                if (typeof _c !== 'object' || _c === null)
                    _c = {};
                if (Array.isArray(obj))
                    obj[parseInt(p)] = _c;
                else if (typeof obj === 'object' && obj !== null)
                    obj[p] = _c;
            } else if (Array.isArray(obj))
                obj[parseInt(p)] = {};
            else if (typeof obj === 'object' && obj !== null)
                obj[p] = {};

            if (Array.isArray(obj))
                obj = obj[parseInt(p)];
            else if (typeof obj === 'object' && obj !== null)
                obj = obj[p];
        }
    }
    obj = input;
    try {
        for (let i = 0; i < comps.length - 1; i++) {
            const p = comps[i];
            if (obj === null)
                throw Error(`Cannot set property ${p} of null`);

            if (Array.isArray(obj))
                obj = obj[parseInt(p)];
            else if (typeof obj === 'object')
                obj = obj[p];
        }
        const finalPart = comps[comps.length - 1];
        if (value === undefined) {
            if (Array.isArray(obj))
                obj.splice(parseInt(finalPart), 1);
            else if (typeof obj === 'object' && obj !== null)
                delete obj[finalPart];
        } else if (Array.isArray(obj))
            obj[parseInt(finalPart)] = value;
        else if (typeof obj === 'object' && obj !== null)
            obj[finalPart] = value;

    } catch (err: unknown) {
        if (err instanceof Error)
            throw err;
    }
}

export function clean(input: JToken): JToken {
    if (typeof input === 'string') {
        try {
            // don't parse ints, because it will break snowflakes
            if (/^\d+$/.test(input)) {
                return input;
            }
            const raw = JSON.parse(input);

            return clean(raw);
        } catch (err: unknown) {
            return input;
        }
    } else if (Array.isArray(input)) {
        for (let i = 0; i < input.length; i++) {
            input[i] = clean(input[i]);
        }
    } else if (typeof input === 'object' && input !== null) {
        if ('n' in input && 'v' in input) {
            return clean(input.v);
        }

        for (const [key, value] of Object.entries(input))
            input[key] = clean(value);

    }
    return input;
}
