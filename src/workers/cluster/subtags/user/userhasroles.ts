import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';
import { GuildMember, Role } from 'discord.js';

export class UserHasRolesSubtag extends Subtag {
    public constructor() {
        super({
            name: 'userhasroles',
            category: SubtagType.USER,
            aliases: ['hasroles'],
            desc: 'This subtag checks if a user has *all* of the provided `roleids`. Use `{userhasrole}` to check if a user has *any* of the provided `roleids`. `roleids` can be an array of role IDs, or a single role ID. For a list of roles and their corresponding IDs, use `b!roles`' +  //TODO context.getRole instead
                '\nReturns a boolean.'
        });
    }

    @Subtag.signature('boolean', [
        Subtag.argument('roles', 'role[]', { allowSingle: true, quietParseError: 'false' }),
        Subtag.argument('user', 'member', { quietParseError: 'false' }).ifOmittedUse('{userid}'),
        Subtag.quietArgument().noEmit()
    ], {
        description: 'Checks if `user` has *any* of the provided `roleids`. If `quiet` is specified, if `user` or any `roleid` can\'t be found it will simply return `false`.',
        exampleCode: '{if;{userhasrole;{userid;moderator};Stupid cat};Stupid cat is a moderator;Stupid cat is not a moderator}',
        exampleOut: 'Stupid cat is a moderator'
    })
    public userHasRoles(roles: Role[], user: GuildMember): boolean {
        return roles.every(r => user.roles.cache.has(r.id));
    }
}
