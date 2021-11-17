import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { parse, SubtagType } from '@cluster/utils';
import { guard } from '@core/utils';
import { GuildChannels, User } from 'discord.js';

import { Statement } from '../../types';

export class WaitMessageSubtags extends Subtag {
    public constructor() {
        super({
            name: 'waitmessage',
            category: SubtagType.MESSAGE,
            desc: 'Pauses the command until one of the given users sends a message in any of the given channels. ' +
                'When a message is sent, `condition` will be run to determine if the message can be accepted. ' +
                'If no message has been accepted within `timeout` then the subtag returns `Wait timed out`, otherwise it returns an array containing ' +
                'the channel Id, then the message Id. ' +
                '\n\n`channels` defaults to the current channel.' +
                '\n`users` defaults to the current user.' +
                '\n`condition` must return `true` or `false` and defaults to `true`' +
                '\n`timeout` is a number of seconds. This defaults to 60 and is limited to 300' +
                '\n\n While inside the `condition` parameter, the current message becomes the users message that is to be checked. This means that ' +
                '`{channelid}`, `{messageid}`, `{userid}` and all related subtags will change their values.'
        });
    }

    @Subtag.signature('snowflake[]', [
        Subtag.context(),
        Subtag.argument('channels', 'channel[]', { allowSingle: true, noLookup: true }).ifOmittedUse('{channelid}'),
        Subtag.argument('users', 'user[]', { allowSingle: true, noLookup: true }).ifOmittedUse('{userid}'),
        Subtag.argument('condition', 'ast').ifOmittedUse('true'),
        Subtag.argument('timeout', 'number').ifOmittedUse(60)
    ], {
        description: 'Pauses the command until a message is sent by any of the `users` in any of the `channels` which satisfies the `condition`.\n' +
            '`timeout` is the number of seconds before to wait and is limited to 300',
        exampleCode: '{waitmessage;111111111111111;{userid;stupid cat};\n    {bool;{username};startswith;stupid}\n;50}',
        exampleOut: '["111111111111111", "103347843934212096"]'
    })
    public async awaitMessage(
        context: BBTagContext,
        channels: GuildChannels[],
        users: User[],
        condition: Statement,
        timeout: number
    ): Promise<[channelId: string, messageId: string]> {
        if (timeout < 0) timeout = 0;
        else if (timeout > 300) timeout = 300;

        const userSet = new Set(users.map(u => u.id));
        const result = await context.util.cluster.awaiter.messages.wait(channels.map(c => c.id), async message => {
            if (!userSet.has(message.author.id) || !guard.isGuildMessage(message))
                return false;

            const childContext = context.makeChild({ message });
            const result = parse.boolean(await childContext.eval(condition));
            return typeof result === 'boolean' ? result : false; //Feel like it should error if a non-boolean is returned
        }, timeout * 1000);

        if (result === undefined)
            throw new BBTagRuntimeError(`Wait timed out after ${timeout * 1000}`);
        return [result.channel.id, result.id];

    }
}
