import { Cluster } from '@cluster';
import { CronService } from '@core/serviceTypes';

export class CustomCommandIntervalCron extends CronService {
    public readonly type = 'bbtag';
    public constructor(
        public readonly cluster: Cluster
    ) {
        super({ cronTime: '*/15 * * * *' }, cluster.logger);
    }

    protected async execute(): Promise<void> {
        await this.cluster.intervals.invokeAll();
    }
}
