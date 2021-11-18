import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';
import { MessageEmbedOptions, User } from 'discord.js';

const dmCache: DMCache = {};

export class DMSubtag extends Subtag {
    public constructor() {
        super({
            name: 'dm',
            category: SubtagType.USER
        });
    }

    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('user', 'user'),
        Subtag.argument('message', 'string'),
        Subtag.argument('embed', 'embed[]', { allowMalformed: true }).allowOmitted()
    ], {
        description: 'DMs `user` the given `message` and `embed`. At least one of `message` and `embed` must be provided. ' +
            'You may only send one DM per execution. Requires author to be staff, and the user to be on the current guild.\n' +
            'Please note that `embed` is the JSON for an embed object, don\'t put the `{embed}` subtag there, as nothing will show.',
        exampleCode: '{dm;stupid cat;Hello;{embedbuild;title:You\'re cool}}',
        exampleOut: 'DM: Hello\nEmbed: You\'re cool'
    })
    @Subtag.signature('nothing', [
        Subtag.context(),
        Subtag.argument('user', 'user'),
        Subtag.useValue(undefined),
        Subtag.argument('embed', 'embed[]').allowOmitted()
    ], {
        description: 'DMs `user` the given `embed`. ' +
            'You may only send one DM per execution. Requires author to be staff, and the user to be on the current guild.\n' +
            'Please note that `embed` is the JSON for an embed object, don\'t put the `{embed}` subtag there, as nothing will show.',
        exampleCode: '{dm;stupid cat;{embedbuild;title:You\'re cool}}',
        exampleOut: 'Embed in DM: You\'re cool'
    })
    public async sendDm(context: BBTagContext, user: User, content?: string, embeds?: MessageEmbedOptions[]): Promise<void> {
        try {
            const dmChannel = user.dmChannel ?? await user.createDM();
            let cache = dmCache[user.id];
            if (cache === undefined ||
                cache.count > 5 ||
                cache.user !== context.user.id ||
                cache.guild !== context.guild.id) {
                // Ew we're gonna send a message first? It was voted...
                await context.util.send(dmChannel, 'The following message was sent from ' +
                    `**__${context.guild.name}__** (${context.guild.id}), ` +
                    'and was sent by ' +
                    `**__${context.user.username}#${context.user.discriminator}}__** (${context.user.id}):`
                );
                cache = dmCache[user.id] = { user: context.user.id, guild: context.guild.id, count: 1 };
            }
            await context.util.send(dmChannel.id, {
                content,
                embeds,
                nsfw: context.state.nsfw
            });
            cache.count++;
        } catch (e: unknown) {
            throw new BBTagRuntimeError('Could not send DM');
        }
    }
}

interface DMCache {
    [index: string]: {
        guild: string;
        count: number;
        user: string;
    } | undefined;
}
