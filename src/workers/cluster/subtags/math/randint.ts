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
        Subtag.useValue(0),
        Subtag.argument('max', 'number', { useFallback: true })
    ], {
        description: 'Chooses a random whole number between 0 and `max` (inclusive).',
        exampleCode: 'You rolled a {randint;6}.',
        exampleOut: 'You rolled a 3.'
    })
    @Subtag.signature('number', [
        Subtag.argument('min', 'number', { useFallback: true }).ifOmittedUse(0),
        Subtag.argument('max', 'number', { useFallback: true })
    ], {
        description: 'Chooses a random whole number between `min` and `max` (inclusive).',
        exampleCode: 'You rolled a {randint;1;6}.',
        exampleOut: 'You rolled a 5.'
    })
    public randInt(min: number, max: number): number {
        return randInt(min, max);
    }
}
