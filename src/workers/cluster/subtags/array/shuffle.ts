import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRef } from '@cluster/types';
import { shuffle, SubtagType } from '@cluster/utils';

export class ShuffleSubtag extends Subtag {
    public constructor() {
        super({
            name: 'shuffle',
            category: SubtagType.ARRAY
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context()
    ], {
        description: 'Shuffles the `{args}` the user provided.',
        exampleCode: '{shuffle} {args;0} {args;1} {args;2}',
        exampleIn: 'one two three',
        exampleOut: 'three one two'
    })
    public shuffleInput(context: BBTagContext): void {
        shuffle(context.input);
    }

    @Subtag.signature('nothing', [
        Subtag.argument('array', 'json[]*')
    ], {
        description: 'Shuffles the `array` given and updates the variable',
        exampleCode: '{shuffle;{get;~myarray}}'
    })
    public shuffleReference(array: BBTagRef<JArray>): void {
        array.set(shuffle(array.get()));
    }

    @Subtag.signature('json[]', [
        Subtag.argument('array', 'json[]')
    ], {
        description: 'Shuffles and returns the given `array`',
        exampleCode: '{shuffle;{get;~myarray}}'
    })
    public shuffleLiteral(array: JArray): JArray {
        return shuffle(array);
    }
}
