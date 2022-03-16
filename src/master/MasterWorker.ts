import { Configuration } from '@blargbot/config/Configuration';
import { Logger } from '@blargbot/core/Logger';
import { BaseWorker } from '@blargbot/core/worker';
import { MasterIPCContract, MasterOptions } from '@blargbot/master/types';

import { Master } from './Master';

export class MasterWorker extends BaseWorker<MasterIPCContract> {
    public readonly master: Master;

    public constructor(
        process: NodeJS.Process,
        logger: Logger,
        config: Configuration,
        options: Omit<MasterOptions, 'worker'>
    ) {
        super(process, logger);

        logger.info(`
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

MAIN PROCESS INITIALIZED

@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@`);

        this.master = new Master(logger, config, { ...options, worker: this });
    }

    public async start(): Promise<void> {
        await this.master.start();
        super.start();
    }
}
