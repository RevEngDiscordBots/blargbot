import { BBTagContext, Subtag } from '@cluster/bbtag';
import { NotEnoughArgumentsError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';

export class ArgsSubtag extends Subtag {
    public constructor() {
        super({
            name: 'args',
            category: SubtagType.BOT
        });
    }

    @Subtag.signature('string', [
        Subtag.context()
    ], {
        description: 'Gets the whole user input',
        exampleCode: 'You said {args}',
        exampleIn: 'Hello world! BBtag is so cool',
        exampleOut: 'You said Hello world! BBtag is so cool'
    })
    public getAllArgs(context: BBTagContext): string {
        return context.input.join(' ');
    }

    @Subtag.signature('string', [
        Subtag.context(),
        Subtag.argument('index', 'integer')
    ], {
        description: 'Gets a word from the user input at the `index` position',
        exampleCode: '{args;1}',
        exampleIn: 'Hello world! BBtag is so cool',
        exampleOut: 'world!'
    })
    public getArg(context: BBTagContext, index: number): string {
        return context.input[index];
    }

    @Subtag.signature('string', [
        Subtag.context(),
        Subtag.argument('start', 'integer'),
        Subtag.argument('end', 'integer').catch((err, val) => val.toLowerCase() === 'n' ? Infinity : err)
    ], {
        description: 'Gets all the words in the user input from `start` up to `end`. If `end` is `n` then all words after `start` will be returned. ' +
            '`start` and `end` will be sorted first if they arent in order.',
        exampleCode: '{args;2;4}',
        exampleIn: 'Hello world! BBtag is so cool',
        exampleOut: 'BBtag is'
    })
    public getArgs(context: BBTagContext, start: number, end: number): string {
        [start, end] = [start, end].sort();

        if (context.input.length <= start || start < 0)
            throw new NotEnoughArgumentsError(start, context.input.length);

        return context.input.slice(start, end).join(' ');
    }
}
