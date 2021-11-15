import { Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { BBTagMaybeRef } from '@cluster/types';
import { bbtagUtil, compare, SubtagType } from '@cluster/utils';

const json = bbtagUtil.json;

export class JsonSortSubtag extends Subtag {
    public constructor() {
        super({
            name: 'jsonsort',
            category: SubtagType.JSON,
            aliases: ['jsort']
        });
    }

    @Subtag.signature('json[]', [
        Subtag.argument('array', 'json[]~'),
        Subtag.argument('path', 'string'),
        Subtag.argument('descending', 'boolean', { mode: 'tryParseOrNotEmpty' })
    ], {
        description: 'Sorts an array of objects based on the provided `path`.\n' +
            '`path` is a dot-noted series of properties.\n' +
            'If `descending` is provided, sorts in descending order.\n' +
            'If `array` is a variable, this will modify the original `array`.',
        exampleCode: '{set;~array;{json;[\n  {"points" : 10, "name" : "Blargbot"},\n  {"points" : 3, "name" : "UNO"},\n' +
            '  {"points" : 6, "name" : "Stupid cat"},\n  {"points" : 12, "name" : "Winner"}\n]}}\n' +
            '{jsonstringify;{jsonsort;{slice;{get;~array};0};points};2}',
        exampleOut: '[\n  "{\\"points\\":3,\\"name\\":\\"UNO\\"}",\n  "{\\"points\\":6,\\"name\\":\\"Stupid cat\\"}",' +
            '\n  "{\\"points\\":10,\\"name\\":\\"Blargbot\\"}",\n  "{\\"points\\":12,\\"name\\":\\"Winner\\"}"\n]'
    })
    public jsonSortLiteral(array: BBTagMaybeRef<JArray>, path: string, descending: boolean): JArray {
        if (path === '')
            throw new BBTagRuntimeError('No path provided');

        const mappedArray = array.value.map(item => {
            try {
                let baseObj: JObject | JArray;
                if (typeof item === 'string')
                    baseObj = json.parseSync(item);
                else if (typeof item !== 'object' || item === null)
                    baseObj = {};
                else
                    baseObj = item;

                const valueAtPath = json.get(baseObj, path);
                return valueAtPath;
            } catch (e: unknown) {
                return undefined;
            }
        });

        const undefinedItems = mappedArray.filter(v => v === undefined);
        if (undefinedItems.length !== 0)
            throw new BBTagRuntimeError(`Cannot read property ${path} at index ${mappedArray.indexOf(undefined).toString()}, ${undefinedItems.length.toString()} total failures`);

        const dir = descending ? -1 : 1;
        return array.value.sort((a, b) => {
            let aObj: JObject | JArray;
            let bObj: JObject | JArray;
            if (typeof a === 'string')
                aObj = json.parseSync(a);
            else if (typeof a === 'object' && a !== null)
                aObj = a;
            else
                aObj = {};
            if (typeof b === 'string')
                bObj = json.parseSync(b);
            else if (typeof b === 'object' && b !== null)
                bObj = b;
            else
                bObj = {};

            const aValue = json.get(aObj, path);
            let aValueString: string;
            if (typeof aValue === 'object' && aValue !== null)
                aValueString = JSON.stringify(aValue);
            else if (aValue !== undefined && aValue !== null)
                aValueString = aValue.toString();
            else
                aValueString = '';
            const bValue = json.get(bObj, path);
            let bValueString: string;
            if (typeof bValue === 'object' && bValue !== null)
                bValueString = JSON.stringify(bValue);
            else if (bValue !== undefined && bValue !== null)
                bValueString = bValue.toString();
            else
                bValueString = '';
            return dir * compare(aValueString, bValueString);
        });
    }
}
