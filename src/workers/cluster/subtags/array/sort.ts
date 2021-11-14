import { Subtag } from '@cluster/bbtag';
import { BBTagRef } from '@cluster/types';
import { compare, parse, SubtagType } from '@cluster/utils';

export class SortSubtag extends Subtag {
    public constructor() {
        super({
            name: 'sort',
            category: SubtagType.ARRAY
        });
    }

    @Subtag.signature('nothing', [
        Subtag.parameter('array', 'json[]*', { isVariableName: 'maybe' }),
        Subtag.parameter('descending', 'boolean', { mode: 'tryParseOrNotEmpty', default: false })
    ], {
        description: 'Sorts the `array` in ascending order and modifies the variable. If `descending` is provided, sorts in descending order.',
        exampleCode: '{sort;{get;~myArray}}',
        exampleOut: ''
    })
    public sortVariable(array: BBTagRef<JArray>, descending: boolean): void {
        const dir = descending ? -1 : 1;
        array.value.sort((a, b) => dir * compare(parse.string(a), parse.string(b)));
    }

    @Subtag.signature('json[]', [
        Subtag.parameter('array', 'json[]'),
        Subtag.parameter('descending', 'boolean', { mode: 'tryParseOrNotEmpty', default: false })
    ], {
        description: 'Sorts the `array` in ascending order. If `descending` is provided, sorts in descending order.',
        exampleCode: '{sort;[3, 2, 5, 1, 4]}',
        exampleOut: '[1,2,3,4,5]'
    })
    public sortLiteral(array: JArray, descending: boolean): JArray {
        const dir = descending ? -1 : 1;
        return array.sort((a, b) => dir * compare(parse.string(a), parse.string(b)));
    }
}
