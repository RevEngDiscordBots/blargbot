import { Subtag } from '@cluster/bbtag';
import { BBTagContextMessage } from '@cluster/types';
import { SubtagType } from '@cluster/utils';
import { GuildMessage } from 'discord.js';

export class MessageIdSubtag extends Subtag {
    public constructor() {
        super({
            name: 'messageid',
            category: SubtagType.MESSAGE,
            desc: 'Returns the ID of the invoking message.'
        });
    }

    @Subtag.signature('snowflake', [
        Subtag.context(ctx => ctx.message)
    ], {
        exampleCode: 'The message id was {messageid}',
        exampleOut: 'The message id was 111111111111111111'
    })
    public getMessageId(message: GuildMessage | BBTagContextMessage): string {
        return message.id;
    }
}
