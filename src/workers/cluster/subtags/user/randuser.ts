import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { Guild } from 'discord.js';

export class RandUserSubtag extends Subtag {
    public constructor() {
        super({
            name: 'randuser',
            category: SubtagType.USER
        });
    }

    @Subtag.signature('snowflake', [
        Subtag.guild()
    ], {
        description: 'Returns the id of a random user on the current guild.',
        exampleCode: '{username;{randuser}} is a lovely person! {username;{randuser}} isn\'t as good.',
        exampleOut: 'abalabahaha is a lovely person! stupid cat isn\'t as good.'
    })
    public randomUser(guild: Guild): string {
        const members = guild.members.cache.map(m => m.id);
        return members[Math.floor(Math.random() * members.length)];
    }
}
