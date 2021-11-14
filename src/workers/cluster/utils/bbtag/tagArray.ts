import { BBTagContext } from '@cluster/bbtag';
import { BBTagArray } from '@cluster/types';
import { getRange, mapping, parse } from '@core/utils';

export function serialize(array: JArray | BBTagArray, varName?: string): string {
    if (Array.isArray(array)) {
        if (varName === undefined || varName.length === 0)
            return JSON.stringify(array);
        return JSON.stringify({ n: varName, v: array });
    }

    if (varName === undefined || varName.length === 0)
        return JSON.stringify(array);
    return JSON.stringify({ v: array.v, n: varName });
}

export function deserialize(value: string, preserveRef?: boolean): BBTagArray | JArray | undefined
export function deserialize(value: string, preserveRef: false): JArray | undefined
export function deserialize(value: string, preserveRef = true): BBTagArray | JArray | undefined {
    let result = mapBBArray(value);
    if (!result.valid) {
        value = value.replace(
            /([[,]\s*)(\d+)\s*\.\.\.\s*(\d+)(\s*[\],])/gi,
            (_, ...[before, from, to, after]: string[]) =>
                before + getRange(parse.int(from), parse.int(to)).join(',') + after);
        result = mapBBArray(value);
    }

    if (!result.valid)
        return undefined;
    if (Array.isArray(result.value))
        return result.value;
    if (!preserveRef || result.value.n === undefined)
        return result.value.v;
    return { n: result.value.n, v: result.value.v };
}

export async function getArray(context: BBTagContext, arrName: string, preserveRef?: boolean): Promise<BBTagArray | JArray | undefined>
export async function getArray(context: BBTagContext, arrName: string, preserveRef: false): Promise<JArray | undefined>
export async function getArray(context: BBTagContext, arrName: string, preserveRef = true): Promise<BBTagArray | JArray | undefined> {
    const obj = deserialize(arrName, preserveRef);
    if (obj !== undefined)
        return obj;
    try {
        const arr = await context.variables.get(arrName);
        if (Array.isArray(arr))
            return preserveRef ? { v: arr, n: arrName } : arr;
    } catch {
        // NOOP
    }
    return undefined;
}

export function flattenArray(array: JArray): JArray {
    return [...flattenArrayIter(array)];
}

const mapBBArray = mapping.json(
    mapping.choice(
        mapping.array(mapping.jToken),
        mapping.object({
            n: mapping.string.optional,
            v: mapping.array(mapping.jToken)
        })
    )
);

function* flattenArrayIter(array: JArray): Iterable<JToken> {
    for (const arg of array) {
        switch (typeof arg) {
            case 'string': {
                const arr = deserialize(arg) ?? [arg];
                yield* Array.isArray(arr) ? arr : arr.v;
                break;
            }
            case 'object': if (Array.isArray(arg)) {
                yield* arg;
                break;
            }
            //fallthrough
            default:
                yield arg;
        }
    }
}
