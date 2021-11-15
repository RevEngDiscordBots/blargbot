import { Subtag } from '@cluster/bbtag';
import { randInt, SubtagType } from '@cluster/utils';

export class RandIntSubtag extends Subtag {
    public constructor() {
        super({
            name: 'randint',
            category: SubtagType.MATH
        });
    }

    @Subtag.signature('number', [
        Subtag.argument('min', 'number', { ifOmitted: 0, useFallback: true }),
        Subtag.argument('max', 'number', { useFallback: true })
    ], {
        description: 'Chooses a random whole number between `min` and `max` (inclusive). `min` defaults to 0.',
        exampleCode: 'You rolled a {randint;1;6}.',
        exampleOut: 'You rolled a 5.'
    })
    public randInt(min: number, max: number): number {
        return randInt(min, max);
    }
}
