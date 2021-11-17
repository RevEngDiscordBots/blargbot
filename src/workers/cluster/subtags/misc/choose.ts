import { Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';

export class ChooseSubtag extends Subtag {
    public constructor() {
        super({
            name: 'choose',
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('choice', 'integer'),
        Subtag.argument('options', 'deferred').repeat(1, Infinity)
    ], {
        description: 'Chooses from the given `options`, where `choice` is the index of the option to select.',
        exampleCode: 'I feel like eating {choose;1;cake;pie;pudding} today.',
        exampleOut: 'I feel like eating pie today.'
    })
    public choose(index: number, options: Array<() => Awaitable<string>>): Awaitable<string> {
        if (index < 0)
            throw new BBTagRuntimeError('Choice cannot be negative');

        if (index >= options.length)
            throw new BBTagRuntimeError('Index out of range');

        return options[index]();
    }
}
