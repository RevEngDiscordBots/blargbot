import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagCall } from '@cluster/types';
import { SubtagType } from '@cluster/utils';

export class DebugSubtag extends Subtag {
    public constructor() {
        super({
            name: 'debug',
            category: SubtagType.BOT
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.subtagAST(),
        Subtag.argument('text', 'string').repeat(1, Infinity)
    ], {
        description: 'Adds the specified text to the debug output. This output is only shown via ' +
            '`tag debug`, `ccommand debug`, `tag test debug` and `ccommand test debug`.' +
            'The line number is also included in the debug entry',
        exampleCode: '{debug;current value;{get;~i}}',
        exampleOut: '(in debug output)[10]current value 1'
    })
    public addDebug(context: BBTagContext, subtag: SubtagCall, text: string[]): void {
        context.debug.push({ subtag, text: text.join(' ') });
    }
}
