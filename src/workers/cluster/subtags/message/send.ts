import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError, ChannelNotFoundError } from '@cluster/bbtag/errors';
import { guard, SubtagType } from '@cluster/utils';
import { GuildChannels, MessageEmbedOptions } from 'discord.js';

export class SendSubtag extends Subtag {
    public constructor() {
        super({
            name: 'send',
            category: SubtagType.MESSAGE,
            desc: 'If `embed` is an array, multiple embeds will be added to the message payload.'
        });
    }

    @Subtag.signature('snowflake', [
        Subtag.context(),
        Subtag.argument('channel', 'channel', { guard: guard.isTextableChannel }),
        Subtag.useValue(undefined),
        Subtag.argument('embed', 'embed[]'),
        Subtag.useValue(undefined),
        Subtag.useValue(undefined)
    ], {
        description: 'Sends a message containing `embed` to `channel`, and returns the message id.\n' +
            '**Note:** `embed` is the JSON for an embed, don\'t put the `{embed}` subtag there, as nothing will show',
        exampleCode: '{send;#support;{j;{"title": "This is my embed!" }}}',
        exampleOut: '12345678901212'
    })
    @Subtag.signature('snowflake', [
        Subtag.context(),
        Subtag.argument('channel', 'channel', { guard: guard.isTextableChannel }),
        Subtag.argument('message', 'string'),
        Subtag.argument('embed', 'embed[]', { ifOmitted: undefined, allowMalformed: true }),
        Subtag.useValue(undefined),
        Subtag.useValue(undefined)
    ], {
        description: 'Sends a message containing `message` and `embed` to `channel`, and returns the message id.\n' +
            '**Note:** `embed` is the JSON for an embed, don\'t put the `{embed}` subtag there, as nothing will show',
        exampleCode: '{send;#support;Hello world!;{j;{"title": "This is my embed!" }}}',
        exampleOut: '12345678901212'
    })
    @Subtag.signature('snowflake', [
        Subtag.context(),
        Subtag.argument('channel', 'channel', { guard: guard.isTextableChannel }),
        Subtag.argument('message', 'string'),
        Subtag.argument('embed', 'embed[]', { ifOmitted: undefined, allowMalformed: true }),
        Subtag.argument('fileContent', 'string'),
        Subtag.argument('fileName', 'string', { ifOmitted: undefined })
    ], {
        description: 'Sends a message containing `message` and `embed` to `channel` with an attachment, and returns the message id.\n' +
            'If `fileContent` starts with `buffer:` then the following text will be parsed as base64 to a raw buffer.\n' +
            '**Note:** `embed` is the JSON for an embed, don\'t put the `{embed}` subtag there, as nothing will show',
        exampleCode: '{send;#support;Hello world!;{j;{"title": "This is my embed!" }};This is a text file!;myFile.txt}',
        exampleOut: '12345678901212'
    })
    public async send(context: BBTagContext, channel: GuildChannels, message?: string, embed?: MessageEmbedOptions[], fileContent?: string, fileName?: string): Promise<string> {
        if (!guard.isTextableChannel(channel))
            throw new ChannelNotFoundError(channel.id);

        const fileData = typeof fileContent === 'string' && fileContent.startsWith('buffer:')
            ? Buffer.from(fileContent.slice(7), 'base64')
            : fileContent;

        const disableEveryone = !context.isCC
            || (await context.database.guilds.getSetting(channel.guild.id, 'disableeveryone')
                ?? !context.state.allowedMentions.everybody);

        try {
            const sent = await context.util.send(channel, {
                content: message,
                embeds: embed !== undefined ? embed : undefined,
                nsfw: context.state.nsfw,
                allowedMentions: {
                    parse: disableEveryone ? [] : ['everyone'],
                    roles: context.isCC ? context.state.allowedMentions.roles : undefined,
                    users: context.isCC ? context.state.allowedMentions.users : undefined
                },
                files: fileData === undefined ? undefined : [
                    { attachment: fileData, name: fileName }
                ]
            });

            if (sent === undefined)
                throw new Error('Send unsuccessful');

            context.state.ownedMsgs.push(sent.id);
            return sent.id;
        } catch (err: unknown) {
            if (err instanceof Error)
                throw new BBTagRuntimeError(`Failed to send: ${err.message}`);
            context.logger.error('Failed to send!', err);
            throw new BBTagRuntimeError('Failed to send: UNKNOWN');
        }

    }
}
