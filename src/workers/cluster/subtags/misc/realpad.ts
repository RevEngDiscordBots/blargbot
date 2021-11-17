import { Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';

export class RealPadSubtag extends Subtag {
    public constructor() {
        super({
            name: 'realpad',
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('text', 'string'),
        Subtag.argument('length', 'number'),
        Subtag.useValue(' '),
        Subtag.useValue('right')
    ], {
        description: 'Pads `text` using space until it has `length` characters. Spaces are added on the right side.',
        exampleCode: '{realpad;Hello;10} world!',
        exampleOut: 'Hello      world!'
    })
    @Subtag.signature('string', [
        Subtag.argument('text', 'string'),
        Subtag.argument('length', 'number'),
        Subtag.argument('filler', 'string').guard(str => str.length === 1, 'Filler must be 1 character').ifOmittedUse(' '),
        Subtag.argument('direction', 'string').guard(['left', 'right'] as const, val => new BBTagRuntimeError('Invalid direction', `${val} is invalid`))
    ], {
        description: 'Pads `text` using `filler` until it has `length` characters. `filler` is applied to the  `direction` of `text`. `filler` defaults to space.',
        exampleCode: '{realpad;ABC;6;0;left}',
        exampleOut: '000ABC'
    })
    public realPad(text: string, length: number, filler: string, direction: 'left' | 'right'): string {
        if (filler.length !== 1)
            throw new BBTagRuntimeError('Filler must be 1 character');

        const padAmount = Math.max(0, length - text.length);

        switch (direction) {
            case 'right': return text + filler[0].repeat(padAmount);
            case 'left': return filler[0].repeat(padAmount) + text;
        }
    }
}
