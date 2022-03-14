import { BBTagContext, DefinedSubtag } from '@blargbot/cluster/bbtag';
import { NotANumberError } from '@blargbot/cluster/bbtag/errors';
import { parse, SubtagType } from '@blargbot/cluster/utils';

export class NewlineSubtag extends DefinedSubtag {
    public constructor() {
        super({
            name: 'newline',
            category: SubtagType.MISC,
            aliases: ['n'],
            definition: [
                {
                    parameters: ['count?:1'],
                    description: 'Will be replaced by `count` newline characters (\\n).',
                    exampleCode: 'Hello,{newline}world!',
                    exampleOut: 'Hello,\nworld!',
                    returns: 'string',
                    execute: (ctx, [count]) => this.getNewlines(ctx, count.value)
                }
            ]
        });
    }

    public getNewlines(ctx: BBTagContext, countStr: string): string {
        const count = parse.int(countStr, false) ?? parse.int(ctx.scopes.local.fallback ?? '', false);
        if (count === undefined)
            throw new NotANumberError(countStr);

        // TODO: limit count
        return ''.padStart(count < 0 ? 0 : count, '\n');
    }
}
