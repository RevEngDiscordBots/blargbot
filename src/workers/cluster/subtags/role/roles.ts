import { BaseSubtag, BBTagContext } from '@cluster/bbtag';
import { UserNotFoundError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';

export class RolesSubtag extends BaseSubtag {
    public constructor() {
        super({
            name: 'roles',
            category: SubtagType.ROLE,
            definition: [
                {
                    parameters: [],
                    description: 'Returns an array of roles on the current guild.',
                    exampleCode: 'The roles on this guild are: {roles}.',
                    exampleOut: 'The roles on this guild are: ["11111111111111111","22222222222222222"].',
                    returns: 'array',
                    execute: (ctx) => this.getGuildRoles(ctx)
                },
                {
                    parameters: ['user', 'quiet?'],
                    description: 'Returns `user`\'s roles in the current guild. If `quiet` is specified, if `user` can\'t be found it will simply return nothing.',
                    exampleCode: 'Stupid cat has the roles: {roles;Stupid cat}',
                    exampleOut: 'Stupid cat has the roles: ["11111111111111111","22222222222222222"]',
                    returns: 'array',
                    execute: (ctx, [userId, quiet]) => this.getUserRoles(ctx, userId.value, quiet.value !== '')
                }
            ]
        });
    }

    public getGuildRoles(context: BBTagContext): string[] {
        return context.member.roles.cache.sort((a, b) => b.position - a.position).map(r => r.id);
    }

    public async getUserRoles(
        context: BBTagContext,
        userId: string,
        quiet: boolean
    ): Promise<string[]> {
        quiet ||= context.scopes.local.quiet ?? false;
        const member = await context.queryMember(userId, { noLookup: quiet });

        if (member === undefined) {
            // We dont want this error to appear in the output
            context.scopes.local.fallback = '';
            throw new UserNotFoundError(userId);
        }

        return member.roles.cache.sort((a, b) => b.position - a.position).map(r => r.id);
    }
}
