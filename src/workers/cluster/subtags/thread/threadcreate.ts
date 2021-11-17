import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError, InvalidChannelError, MessageNotFoundError } from '@cluster/bbtag/errors';
import { bbtagUtil, guard, mapping, parse, SubtagType } from '@cluster/utils';
import { GuildChannels, GuildMessage } from 'discord.js';

export class ThreadCreateSubtag extends Subtag {
    public constructor() {
        super({
            name: 'threadcreate',
            aliases: ['createthread'],
            category: SubtagType.THREAD
        });
    }

    @Subtag.signature('snowflake', [
        Subtag.context(),
        Subtag.argument('channel', 'channel').ifOmittedUse('{channelid}'),
        Subtag.argument('messageId', 'snowflake').allowOmitted(),
        Subtag.argument('options', 'string')
    ], {
        description: '`channel` defaults to the current channel\n\nCreates a new thread in `channel`. If `message` is provided, thread will start from `message`.\n`options` must be a JSON object containing `name`, other properties are:\n- `autoArchiveDuration` (one of `60, 1440, 4320, 10080`)\n- `private` (boolean)\nThe guild must have the required boosts for durations `4320` and `10080`. If `private` is true thread will be private (unless in a news channel).\nReturns the ID of the new thread channel',
        exampleCode: '{threadcreate;;123456789123456;{json;{"name" : "Hello world!"}}}',
        exampleOut: '98765432198765'
    })
    public async createThread(context: BBTagContext, channel: GuildChannels, messageId: string | undefined, optionsStr: string): Promise<string> {
        if (!guard.isThreadableChannel(channel))
            throw new InvalidChannelError(channel);

        let message: GuildMessage | undefined;
        if (messageId !== undefined) {
            message = await context.util.getMessage(channel, messageId);
            if (message === undefined)
                throw new MessageNotFoundError(channel, messageId);
        }

        const mappingOptions = mapThreadOptions((await bbtagUtil.json.parse(context, optionsStr)).object);

        if (!mappingOptions.valid)
            throw new BBTagRuntimeError('Invalid options object');
        const guildFeatures = context.guild.features;

        const input = mappingOptions.value;
        if (input.autoArchiveDuration !== undefined)
            input.autoArchiveDuration = parse.int(input.autoArchiveDuration);
        else
            input.autoArchiveDuration = 1440;

        switch (input.autoArchiveDuration) {
            case 60: break;
            case 1440: break;
            case 4320:
                if (!guildFeatures.includes('THREE_DAY_THREAD_ARCHIVE'))
                    throw new BBTagRuntimeError('Guild does not have 3 day threads', 'Missing boosts');
                break;
            case 10080:
                if (!guildFeatures.includes('SEVEN_DAY_THREAD_ARCHIVE'))
                    throw new BBTagRuntimeError('Guild does not have 7 day threads', 'Missing boosts');
                break;
            default:
                throw new BBTagRuntimeError('Invalid autoArchiveDuration');
        }

        if (parse.boolean(input.private) === true && !guildFeatures.includes('PRIVATE_THREADS'))
            throw new BBTagRuntimeError('Guild cannot have private threads');

        try {
            const threadChannel = await channel.threads.create({
                name: input.name,
                autoArchiveDuration: input.autoArchiveDuration,
                startMessage: message?.id
            });
            return threadChannel.id;
        } catch (e: unknown) {
            if (!(e instanceof Error))
                throw e;

            context.logger.error(e);
            throw new BBTagRuntimeError(e.message);
        }
    }
}

const mapThreadOptions = mapping.object({
    name: mapping.string,
    autoArchiveDuration: mapping.choice(
        mapping.in(undefined),
        mapping.string,
        mapping.number
    ),
    private: mapping.choice(
        mapping.in(undefined),
        mapping.string,
        mapping.boolean
    )
});
