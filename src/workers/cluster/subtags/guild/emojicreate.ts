import { BBTagContext, Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { discordUtil, SubtagType } from '@cluster/utils';
import { Role } from 'discord.js';
import fetch from 'node-fetch';

export class EmojiCreateSubtag extends Subtag {
    public constructor() {
        super({
            name: 'emojicreate',
            category: SubtagType.GUILD
        });
    }

    @Subtag.signature('snowflake', [
        Subtag.context(),
        Subtag.argument('name', 'string'),
        Subtag.argument('image', 'string'), //TODO add type for image data
        Subtag.argument('roles', 'role[]', { isVariableName: 'maybe', ifOmitted: '[]' })
    ], {
        description: 'Creates a emoji with the given name and image. ' +
            '`image` is either a link to an image, or a base64 encoded data url (`data:<content-type>;base64,<base64-data>`). You may need to use {semi} for the latter.' +
            '`roles`, if provided, will restrict the emoji\'s usage to the specified roles. Must be an array of roles.' +
            'Returns the new emojis\'s ID.',
        exampleCode: '{emojicreate;fancy_emote;https://some.cool/image.png;["Cool gang"]}',
        exampleOut: '11111111111111111'
    })
    public async createEmoji(context: BBTagContext, name: string, image: string, roles: Role[]): Promise<string> {
        const permission = context.permissions;

        if (!permission.has('MANAGE_EMOJIS_AND_STICKERS'))
            throw new BBTagRuntimeError('Author cannot create emojis');

        if (name === '')
            throw new BBTagRuntimeError('Name was not provided');

        if (/^https?:\/\//i.test(image)) {
            const res = await fetch(image);
            const contentType = res.headers.get('content-type');
            image = `data:${contentType !== null ? contentType : ''};base64,${(await res.buffer()).toString('base64')}`;
        } else if (!image.startsWith('data:')) {
            throw new BBTagRuntimeError('Image was not a buffer or a URL');
        }

        try {
            const fullReason = discordUtil.formatAuditReason(context.user, context.scopes.local.reason);
            const emoji = await context.guild.emojis.create(image, name, { reason: fullReason, roles });
            return emoji.id;
        } catch (err: unknown) {
            if (err instanceof Error) {
                const parts = err.message.split('\n').map(m => m.trim());
                throw new BBTagRuntimeError('Failed to create emoji: ' + (parts.length > 1 ? parts[1] : parts[0]));
            }
            throw err;
        }
    }
}
