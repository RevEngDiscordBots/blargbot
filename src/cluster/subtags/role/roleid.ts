import { BBTagContext, DefinedSubtag } from '@blargbot/cluster/bbtag';
import { RoleNotFoundError } from '@blargbot/cluster/bbtag/errors';
import { SubtagType } from '@blargbot/cluster/utils';

export class RoleIdSubtag extends DefinedSubtag {
    public constructor() {
        super({
            name: 'roleid',
            category: SubtagType.ROLE,
            definition: [
                {
                    parameters: ['role', 'quiet?'],
                    description: 'Returns `role`\'s ID. If `quiet` is specified, if `role` can\'t be found it will simply return nothing.',
                    exampleCode: 'The admin role ID is: {roleid;admin}.',
                    exampleOut: 'The admin role ID is: 123456789123456.',
                    returns: 'id',
                    execute: (ctx, [roleId, quiet]) => this.getRoleId(ctx, roleId.value, quiet.value !== '')
                }
            ]
        });
    }

    public async getRoleId(
        context: BBTagContext,
        roleId: string,
        quiet: boolean
    ): Promise<string> {
        quiet ||= context.scopes.local.quiet ?? false;
        const role = await context.queryRole(roleId, { noLookup: quiet });

        if (role === undefined) {
            throw new RoleNotFoundError(roleId)
                .withDisplay(quiet ? '' : undefined);
        }

        return role.id;
    }
}