import { Cluster } from '@cluster';
import { ClusterEventService } from '@cluster/serviceTypes';
import { CommandListResult } from '@cluster/types';

export class ClusterGetCommandListHandler extends ClusterEventService<'getCommandList'> {
    public constructor(
        cluster: Cluster
    ) {
        super(cluster, 'getCommandList', async ({ reply }) => reply(await this.getCommandList()));
    }

    public async getCommandList(): Promise<CommandListResult> {
        const commands: CommandListResult = {};
        for await (const c of this.cluster.commands.default.list()) {
            commands[c.name] = {
                aliases: c.aliases,
                category: c.category,
                description: c.description,
                disabled: c.disabled,
                flags: c.flags,
                hidden: c.hidden,
                name: c.name,
                permission: c.permission,
                roles: c.roles,
                signatures: c.signatures
            };
        }
        return commands;
    }
}