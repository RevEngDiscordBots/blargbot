import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { Guild } from 'discord.js';

//TODO IMO this should return an array of emoji IDs instead of an array of emojis
export class EmojisSubtag extends Subtag {
    public constructor() {
        super({
            name: 'emojis',
            category: SubtagType.GUILD,
            desc: 'Please not that Discord will remove all the emojis from a message which contains an emoji that blarg can\'t use. For example, blargbot can\'t use a role-restricted emoji if it doesn\'t have the role. Learn more [here](https://discordapp.com/developers/docs/resources/emoji).'
        });
    }

    @Subtag.signature('string[]', [
        Subtag.guild()
    ], {
        description: 'Returns an array of emojis in the current guild.',
        exampleCode: 'This guild has {length;{emojis}} emojis.',
        exampleOut: 'This guild has 23 emojis.'
    })
    public getAllEmojis(guild: Guild): string[] {
        return guild.emojis.cache.map(e => `<${e.animated ?? false ? 'a' : ''}:${e.name ?? ''}:${e.id}>`);
    }

    //! Doesn't work, but compatibility™
    //* The code commented below is the working code, however to keep compatibility the old code is still used
    @Subtag.signature('string[]', [
        Subtag.guild(),
        Subtag.argument('role', 'string'/*'role'*/)
    ], {
        description: 'Returns an array of emojis whitelisted for the provided `role`',
        exampleCode: 'Cool gang has {length;{emojis;Cool gang}} emojis.',
        exampleOut: 'Cool gang has 6 emojis.'
    })
    public /*async*/ getEmojisForRole(guild: Guild/*, role: Role*/): /*Promise<*/string[]/*>*/ {
        return guild.emojis.cache.filter(e => e.roles.cache.size > 0)
            .map(e => `<${e.animated ?? false ? 'a' : ''}:${e.name ?? ''}:${e.id}>`);

        // return context.guild.emojis.filter(e => e.roles.cache.has(role.id))
        //     .map(e => `<${e.animated ? 'a' : ''}:${e.name}:${e.id}>`);
    }
}
