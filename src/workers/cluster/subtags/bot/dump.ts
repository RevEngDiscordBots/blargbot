import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class DumpSubtag extends Subtag {
    public constructor() {
        super({
            name: 'dump',
            category: SubtagType.BOT
        });
    }

    @Subtag.signature('string', [
        Subtag.context(),
        Subtag.argument('text', 'string')
    ], {
        description: 'Dumps the provided text to a blargbot output page. These expire after 7 days.',
        exampleCode: '{dump;Hello, world!}',
        exampleOut: 'https://blargbot.xyz/output/1111111111111111'
    })
    public async createDump(context: BBTagContext, text: string): Promise<string> {
        const id = await context.util.generateOutputPage(text, context.channel);
        return context.util.websiteLink(`output/${id.toString()}`);
    }
}
