import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class InjectSubtag extends Subtag {
    public constructor() {
        super({
            name: 'inject',
            category: SubtagType.BOT
        });
    }

    @Subtag.signature('string', [
        Subtag.context(),
        Subtag.argument('code', 'string')
    ], {
        description: 'Executes any arbitrary BBTag that is within `code` and returns the result. Useful for making dynamic code, or as a testing tool (`{inject;{args}}`)',
        exampleCode: 'Random Number: {inject;{lb}randint{semi}1{semi}4{rb}}',
        exampleOut: 'Random Number: 3'
    })
    public async inject(context: BBTagContext, code: string): Promise<string> {
        const result = await context.engine.execute(code, context);
        return result.content;
    }
}
