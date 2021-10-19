import { BaseRoute } from '@api/BaseRoute';
import { ApiResponse } from '@api/types';
import { tagTypeDetails } from '@cluster/utils/constants/subtagType';

export class SubtagsRoute extends BaseRoute {
    public constructor() {
        super('/categories');

        this.addRoute('/subtags', {
            get: () => this.getCategories()
        });
    }

    public getCategories(): Promise<ApiResponse> {
        // we need to return a promise even though this is a sync route
        return new Promise((res) => {
            res(this.ok(tagTypeDetails));
        });
    }
}
