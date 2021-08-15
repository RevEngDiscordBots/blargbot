import { BaseSubtag } from '@cluster/bbtag';
import { bbtagUtil, SubtagType } from '@cluster/utils';

const json = bbtagUtil.json;

export class JsonGetSubtag extends BaseSubtag {
    public constructor() {
        super({
            name: 'jsonget',
            category: SubtagType.ARRAY,
            aliases: ['jget'],
            definition: [
                {
                    parameters: ['input', 'path?'],
                    description: 'Navigates the path of a JSON object. Works with arrays too!\n' +
                    '`input` can be a JSON object, array, or string. If a string is provided, a variable with the same name will be used.\n' +
                    '`path` is a dot-noted series of properties.',
                    exampleCode: '{jsonget;{j;{\n  "array": [\n    "zero",\n    { "value": "one" },\n    "two"\n  ]\n}};array.1.value}',
                    exampleOut: 'one',
                    execute: async (context, [{value: input}, {value: path}], subtag): Promise<string | void> => {
                        if (input === '')
                            input = '{}';

                        let obj: JObject | JArray;
                        const arr = await bbtagUtil.tagArray.getArray(context, input);
                        if (arr !== undefined && Array.isArray(arr.v)) {
                            obj = arr.v;
                        } else {
                            obj = (await json.parse(context, input)).object;
                        }

                        try {
                            const value = json.get(obj, path);
                            if (typeof value === 'object')
                                return JSON.stringify(value);
                            else if (value !== undefined)
                                return value.toString();
                        } catch (err: unknown) {
                            if (err instanceof Error)
                                return this.customError(err.message, context, subtag);
                        }
                    }
                }
            ]
        });
    }
}

// module.exports =
//     Builder.ArrayTag('jsonget')
//         .withAlias('jget')
//         .withArgs(a => [a.required('input'), a.required('path')])
//         .withDesc('Navigates the path of a JSON object. Works with arrays too!\n' +
//             '`input` can be a JSON object, array, or string. If a string is provided, a variable with the same name will be used.\n' +
//             '`path` is a dot-noted series of properties.'
//         )
//         .withExample(
//             '{jsonget;{j;{\n  "array": [\n    "zero",\n    { "value": "one" },\n    "two"\n  ]\n}};array.1.value}',
//             'one'
//         )
//         .whenArgs('0-1', Builder.errors.notEnoughArguments)
//         .whenArgs(2, async function (subtag, context, args) {
//             let obj = args[0];
//             let path = args[1];

//             if (!obj)
//                 obj = '{}';

//             let varname = undefined;

//             let arr = await bu.getArray(obj);
//             if (arr && Array.isArray(arr.v)) {
//                 obj = arr.v;
//             } else {
//                 try {
//                     obj = JSON.parse(obj);
//                 } catch (err) {
//                     varname = obj;
//                     let v = await context.variables.get(varname);
//                     if (v) {
//                         if (typeof v === 'object') obj = v;
//                         else {
//                             try {
//                                 obj = JSON.parse(v);
//                             } catch (err2) {
//                                 obj = {};
//                             }
//                         }
//                     } else obj = {};
//                 }
//             }
//             if (typeof obj !== 'object' || obj === null)
//                 obj = {};

//             path = path.split('.');
//             try {
//                 for (const part of path) {
//                     if (typeof obj === 'string') {
//                         try {
//                             obj = JSON.parse(obj);
//                         } catch (err) {
//                             // NOOP
//                         }
//                     }

//                     if (typeof obj === 'object') {
//                         const keys = Object.keys(obj);
//                         if (keys.length === 2 && keys.includes('v') && keys.includes('n') && /^\d+$/.test(part)) {
//                             obj = obj.v;
//                         }
//                     }

//                     // intentionally let it error if undefined
//                     if (obj === undefined || Object.prototype.hasOwnProperty.call(obj, part))
//                         obj = obj[part];
//                     else obj = undefined;
//                 }
//                 if (typeof obj === 'object')
//                     obj = JSON.stringify(obj);
//                 return obj;
//             } catch (err) {
//                 return Builder.errors.customError(subtag, context, err.message);
//             }
//         })
//         .whenDefault(Builder.errors.tooManyArguments)
//         .build();