import { BaseSubtag } from '@cluster/bbtag';
import { BBTagRuntimeError, NotANumberError } from '@cluster/bbtag/errors';
import { SubtagArgumentValue } from '@cluster/types';
import { parse, SubtagType } from '@cluster/utils';

export class ChooseSubtag extends BaseSubtag {
    public constructor() {
        super({
            name: 'choose',
            category: SubtagType.MISC,
            definition: [
                {
                    parameters: ['choice', '~options+'],
                    description: 'Chooses from the given `options`, where `choice` is the index of the option to select.',
                    exampleCode: 'I feel like eating {choose;1;cake;pie;pudding} today.',
                    exampleOut: 'I feel like eating pie today.',
                    execute: (_, args) => this.choose(args[0].value, args.slice(1))
                }
            ]
        });
    }
    public choose(
        choice: string,
        options: SubtagArgumentValue[]
    ): Promise<string> | string {
        const index = parse.int(choice, false);

        if (index === undefined)
            throw new NotANumberError(choice);

        if (index < 0)
            throw new BBTagRuntimeError('Choice cannot be negative');

        if (index >= options.length)
            throw new BBTagRuntimeError('Index out of range');

        return options[index].wait();
    }
}
