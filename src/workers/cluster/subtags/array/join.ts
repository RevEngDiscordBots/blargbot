import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class JoinSubtag extends Subtag {
    public constructor() {
        super({
            name: 'join',
            category: SubtagType.ARRAY
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('array', 'json[]', { isVariableName: 'maybe' }),
        Subtag.argument('text', 'string')
    ], {
        description: 'Joins the elements of `array` together with `text` as the separator.',
        exampleCode: '{join;["this", "is", "an", "array"];!}',
        exampleOut: 'this!is!an!array'
    })
    public join(array: JArray, separator: string): string {
        return array.join(separator);
    }
}
