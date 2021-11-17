import { Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { randChoose, SubtagType } from '@cluster/utils';

export class RandStrSubtag extends Subtag {
    public constructor() {
        super({
            name: 'randstr',
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('characters', 'string'),
        Subtag.argument('length', 'integer', { useFallback: true })
    ], {
        description: 'Creates a random string with characters from `chars` that is `length` characters long.',
        exampleCode: '{randstr;abcdefghijklmnopqrstuvwxyz;9}',
        exampleOut: 'kgzyqcvda'
    })
    public randStr(chars: string, count: number): string {
        if (chars.length === 0)
            throw new BBTagRuntimeError('Not enough characters');

        const numberArray = [...Array(count).keys()]; // TODO: count should be limited here
        return numberArray.map(() => randChoose(chars)).join('');
    }
}
