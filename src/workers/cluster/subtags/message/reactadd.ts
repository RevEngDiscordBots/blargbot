import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';
import { EmojiIdentifierResolvable, GuildChannels } from 'discord.js';

export class ReactAddSubtag extends Subtag {
    public constructor() {
        super({
            name: 'reactadd',
            category: SubtagType.MESSAGE,
            aliases: ['addreact'],
            desc: 'Please note that to be able to add a reaction, I must be on the server that you got that reaction from. ' +
                'If I am not, then I will return an error if you are trying to apply the reaction to another message.'
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.useValue(undefined),
        Subtag.argument('reactions', 'emoji', { repeat: [1, Infinity] })
    ], {
        description: 'Adds `reactions` to the output message of this tag.',
        exampleCode: 'This will have reactions! {reactadd;🤔;👀}'
    })
    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.context(ctx => ctx.channel),
        Subtag.argument('messageId', 'snowflake'),
        Subtag.argument('reactions', 'emoji', { repeat: [1, Infinity] })
    ], {
        description: 'Adds `reactions` to `messageid` in the current channel.',
        exampleCode: '{reactadd;11111111111111111;🤔;👀}'
    })
    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('channel', 'channel', { noLookup: true, quiet: true }),
        Subtag.argument('messageId', 'snowflake'),
        Subtag.argument('reactions', 'emoji', { repeat: [1, Infinity] })
    ], {
        description: 'Adds `reactions` to `messageid` in `channelid`. `channelid` must be an ID, use of `{channelid} is advised`.',
        exampleCode: '{reactadd;11111111111111111;22222222222222222;🤔;👀}'
    })
    public async addReactions(context: BBTagContext, channel: GuildChannels, messageId: string | undefined, emojis: EmojiIdentifierResolvable[]): Promise<void> {
        const permissions = channel.permissionsFor(context.discord.user);
        if (permissions === null || !permissions.has('ADD_REACTIONS'))
            throw new BBTagRuntimeError('I dont have permission to Add Reactions');

        if (emojis.length === 0)
            throw new BBTagRuntimeError('Invalid Emojis');

        messageId ??= await context.state.outputMessage;
        const message = messageId === undefined ? undefined : await context.util.getMessage(channel, messageId);
        if (message === undefined) {
            context.state.reactions.push(...emojis.map(e => e.toString()));
            return;
        }

        const errors = await context.util.addReactions(message, emojis);
        if (errors.failed.length > 0)
            throw new BBTagRuntimeError(`I cannot add '${errors.failed.toString()}' as reactions`);
    }
}
