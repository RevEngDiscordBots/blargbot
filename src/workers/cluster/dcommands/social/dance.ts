import { Cluster } from '@cluster';
import { BaseSocialWolkeCommand } from '@cluster/command';

export class DanceCommand extends BaseSocialWolkeCommand {
    public constructor(cluster: Cluster) {
        super('dance', {
            search: 'dance',
            action: 'dances',
            description: 'Break out some sweet, sweet dance moves.',
            wolkeKey: cluster.config.general.wolke
        });
    }
}