import { Cluster } from '@blargbot/cluster';
import { BaseSocialWolkeCommand } from '@blargbot/cluster/command';

export class PatCommand extends BaseSocialWolkeCommand {
    public constructor(cluster: Cluster) {
        super('pat', {
            search: 'pat',
            action: 'pats',
            user: true,
            description: 'Give somebody a lovely pat.',
            wolkeKey: cluster.config.general.wolke
        });
    }
}