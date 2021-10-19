import { Api } from '@api';
import { BaseRoute } from '@api/BaseRoute';
import { ApiResponse } from '@api/types';
import { tagTypeDetails } from '@cluster/utils/constants/subtagType';

export class SubtagsRoute extends BaseRoute {
    public constructor(private readonly api: Api) {
        super('/subtags');

        this.addRoute('/', {
            get: () => this.listSubtags()
        }).addRoute('/:subtagName', {
            get: (req) => this.getSubtag(req.params.subtagName)
        }).addRoute('/categories', {
            get: () => this.getCategories()
        });
    }

    public async listSubtags(): Promise<ApiResponse> {
        const subtags = await this.api.worker.request('getSubtagList', undefined);
        return this.ok(subtags);
    }

    public async getSubtag(name: string): Promise<ApiResponse> {
        const subtag = await this.api.worker.request('getSubtag', name);
        if (subtag === undefined)
            return this.notFound();
        return this.ok(subtag);
    }

    public getCategories(): Promise<ApiResponse> {
        // we need to return a promise even though this is a sync route
        return new Promise((res) => {
            res(this.ok(tagTypeDetails));
        });
    }
}
