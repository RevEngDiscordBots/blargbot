import { ApiConnection } from '@api';
import { WorkerPoolEventService } from '@core/serviceTypes';
import { ParsedDump } from '@core/types';
import { Master } from '@master';

export class ApiGetDumpHandler extends WorkerPoolEventService<ApiConnection, 'getDump'> {
    public constructor(private readonly master: Master) {
        super(
            master.api,
            'getDump',
            async ({ data, reply }) => reply(await this.getDump(data)));
    }

    protected async getDump(id: string): Promise<ParsedDump | undefined> {
        const dump = await this.master.database.dumps.getById(id);
        return dump;
    }
}
