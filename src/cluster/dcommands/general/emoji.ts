import { BaseGlobalCommand } from '@blargbot/cluster/command';
import { CommandType } from '@blargbot/cluster/utils';
import { Emote } from '@blargbot/core/Emote';
import { SendPayload } from '@blargbot/core/types';
import { FileContent } from 'eris';
import fs from 'fs';
import svg2png from 'svg2png';
import twemoji from 'twemoji';

export class EmojiCommand extends BaseGlobalCommand {
    public constructor() {
        super({
            name: 'emoji',
            aliases: ['e'],
            category: CommandType.GENERAL,
            description: 'Gives you a large version of an emoji. If size is specified and the emoji is not a custom emoji, the image will be that size.',
            flags: [{
                flag: 's',
                word: 'svg',
                description: 'Get the emote as an svg instead of a png.'
            }],
            definitions: [
                {
                    parameters: '{emoji} {size:number=668}',
                    execute: (_, [emoji, size], flags) => this.emoji(emoji.asString, size.asNumber, flags.s !== undefined),
                    description: 'Gives you a large version of an emoji. If size is specified and the emoji is not a custom emoji, the image will be that size.'
                }
            ]
        });
    }

    public async emoji(emoji: string, size: number, svg: boolean): Promise<FileContent | SendPayload> {
        const parsedEmojis = Emote.findAll(emoji);
        if (parsedEmojis.length === 0)
            return 'No emoji found!';

        const parsedEmoji = parsedEmojis[0];
        if (parsedEmoji.id !== undefined) {
            const url = `https://cdn.discordapp.com/emojis/${parsedEmoji.id}.${parsedEmoji.animated ? 'gif' : 'png'}`;
            return { embeds: [{ image: { url } }] };
        }

        try {
            const codePoint = twemoji.convert.toCodePoint(parsedEmoji.name);
            const file = require.resolve(`twemoji/2/svg/${codePoint}.svg`);
            const body = fs.readFileSync(file);
            if (svg)
                return { name: 'emoji.svg', file: body };

            const buffer = await svg2png(body, {
                width: size,
                height: size
            });
            return { name: 'emoji.png', file: buffer };
        } catch {
            return 'Invalid emoji!';
        }

    }
}