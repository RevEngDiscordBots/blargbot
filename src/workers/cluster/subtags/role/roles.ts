import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { Guild, GuildMember } from 'discord.js';

export class RolesSubtag extends Subtag {
    public constructor() {
        super({
            name: 'roles',
            category: SubtagType.ROLE
        });
    }

    @Subtag.signature('snowflake[]', [
        Subtag.guild()
    ], {
        description: 'Returns an array of roles on the current guild.',
        exampleCode: 'The roles on this guild are: {roles}.',
        exampleOut: 'The roles on this guild are: ["11111111111111111","22222222222222222"].'
    })
    public getGuildRoles(guild: Guild): string[] {
        return guild.roles.cache.sort((a, b) => b.position - a.position).map(r => r.id);
    }

    @Subtag.signature('snowflake[]', [
        Subtag.argument('user', 'member', { quietParseError: '' }),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Returns `user`\'s roles in the current guild. If `quiet` is specified, if `user` can\'t be found it will simply return nothing.',
        exampleCode: 'Stupid cat has the roles: {roles;Stupid cat}',
        exampleOut: 'Stupid cat has the roles: ["11111111111111111","22222222222222222"]'
    })
    public getUserRoles(member: GuildMember): string[] {
        return member.roles.cache.sort((a, b) => b.position - a.position).map(r => r.id);
    }
}
