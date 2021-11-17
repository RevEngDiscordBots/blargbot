import { Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';
import { default as Brainfuck } from 'brainfuck-node';

const bfClient = new Brainfuck();
export class BrainFuckSubtag extends Subtag {
    public constructor() {
        super({
            name: 'brainfuck',
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('string', [
        Subtag.argument('code', 'string'),
        Subtag.argument('input', 'string').allowOmitted()
    ], {
        description: 'Interprets `code` as brainfuck, using `input` as the text for `,`.',
        exampleCode: '{brainfuck;++++++++++[>+++++++>++++++++++>+++>+<<<<-]>++.>+.+++++++..+++.>++.<<+++++++++++++++.>.+++.------.--------.>+.>.}',
        exampleOut: 'Hello World!'
    })
    public runBrainfuck(code: string, input = ''): string {
        try {
            return bfClient.execute(code, input).output;
        } catch (e: unknown) {
            if (e instanceof Error)
                throw new BBTagRuntimeError(e.message);
            throw new BBTagRuntimeError('Unexpected error from brainfuck');
        }
    }
}
