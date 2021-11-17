import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { Statement } from '@cluster/types';
import { parse, SubtagType } from '@cluster/utils';
import { guard } from '@core/utils';
import { EmojiIdentifierResolvable, User } from 'discord.js';

export class WaitReactionSubtag extends Subtag {
    public constructor() {
        super({
            name: 'waitreaction',
            category: SubtagType.MESSAGE,
            aliases: ['waitreact'],
            desc: 'Pauses the command until one of the given `users` adds any given `reaction` on any of the given `messages`. ' +
                'When a `reaction` is added, `condition` will be run to determine if the reaction can be accepted. ' +
                'If no reaction has been accepted within `timeout` then the subtag returns `Wait timed out`, otherwise it returns an array containing ' +
                'the channel Id, the message Id, the user id and the reaction, in that order. ' +
                '\n\n`userIDs` defaults to the current user if left blank or omitted.' +
                '\n`reactions` defaults to any reaction if left blank or omitted.' +
                '\n`condition` must return `true` or `false`, defaults to `true` if left blank or omitted' +
                '\n`timeout` is a number of seconds. This defaults to 60 if left blank or omitted, and is limited to 300' +
                '\n\n While inside the `condition` parameter, the current message becomes the message the reaction was added to, and the user becomes the person who sent the message. ' +
                'This means that `{channelid}`, `{messageid}`, `{userid}` and all related subtags will change their values.' +
                '\nFinally, while inside the `condition` parameter, you can use the temporary subtag `{reaction}` to get the current reaction ' +
                'and the `{reactuser}` temporary subtag to get the user who reacted.\n' +
                '`messages`, `users` and `reactions` can either be single values eg: `{waitreact;1234567891234;stupid cat;🤔}`, or they can be arrays eg: `{waitreact;["1234567891234","98765432219876"];stupid cat;["🤔"]}'
        });
    }

    @Subtag.signature('string[]', [
        Subtag.context(),
        Subtag.argument('messageIds', 'snowflake[]', { flattenArray: true }),
        Subtag.argument('users', 'user[]', { flattenArray: true, noLookup: true }).ifOmittedUse('{userid}'),
        Subtag.argument('reactions', 'emoji[]').allowOmitted(),
        Subtag.argument('condition', 'ast').ifOmittedUse('true'),
        Subtag.argument('timeout', 'number').ifOmittedUse(60)
    ], {
        description: 'Pauses the command until one of the `reactions` is added to any of the `messageIds` by any of the `users` which satisfies the `condition`.\n' +
            'If no `reactions` are given, then any reaction will suffice.\n' +
            '`timeout` is the number of seconds before to wait and is limited to 300.',
        exampleCode: '{waitreaction;12345678912345;["{userid;stupid cat}","{userid;titansmasher}"];["🤔", "👀"];\n    {bool;{reaction};==;👀}\n;120}',
        exampleOut: '["111111111111111","12345678912345","135556895086870528","👀"]'
    })
    public async awaitReaction(
        context: BBTagContext,
        messageIds: string[],
        users: User[],
        reactions: EmojiIdentifierResolvable[] | undefined,
        condition: Statement,
        timeout: number
    ): Promise<[channelId: string, messageId: string, userId: string, emoji: string]> {
        if (timeout < 0) timeout = 0;
        else if (timeout > 300) timeout = 300;

        const userSet = new Set(users.map(u => u.id));
        const reactionSet = new Set(reactions?.map(r => r.toString()));
        const checkReaction = reactionSet.size === 0 ? () => true : (emoji: string) => reactionSet.has(emoji);
        const reaction = await context.util.cluster.awaiter.reactions.wait(messageIds, async ({ user, reaction, message }) => {
            if (!userSet.has(user.id) || !checkReaction(reaction.emoji.toString()) || !guard.isGuildMessage(message))
                return false;

            context.scopes.pushScope();
            context.scopes.local.reaction = reaction.emoji.toString();
            context.scopes.local.reactUser = user.id;
            const childContext = context.makeChild({ message });
            const result = parse.boolean(await childContext.eval(condition));
            return typeof result === 'boolean' ? result : false; //Feel like it should error if a non-boolean is returned
        }, timeout * 1000);

        if (reaction === undefined)
            throw new BBTagRuntimeError(`Wait timed out after ${timeout * 1000}`);
        return [reaction.message.channel.id, reaction.message.id, reaction.user.id, reaction.reaction.emoji.toString()];
    }
}
