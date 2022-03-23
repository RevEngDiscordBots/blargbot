import { Api } from '@api';
import { BaseRoute } from '@api/BaseRoute';
import { ApiResponse } from '@api/types';

export class ChatlogsRoute extends BaseRoute {
    public constructor(private readonly api: Api) {
        super('/chatlogs');

        this.addRoute('/:id', {
            get: (req) => this.getLogs(req.params.id)
        });
    }

    public async getLogs(id: string): Promise<ApiResponse> {
        const dump = await this.api.worker.request('getChatLogs', id);
        if (dump === undefined)
            return this.notFound();
        return this.ok(dump);
    }
}
