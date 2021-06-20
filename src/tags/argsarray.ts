import { Cluster } from '../cluster';
import { BaseSubtag } from '../core/bbtag';
import { SubtagType } from '../utils';

export class ArgsarraySubtag extends BaseSubtag {
    public constructor(cluster: Cluster) {
        super(cluster, {
            name: 'argsarray',
            category: SubtagType.SIMPLE,
            definition: [
                {
                    parameters: [],
                    description: 'Gets user input as an array.',
                    exampleCode: 'Your input was {argsarray}',
                    exampleIn: 'Hello world!',
                    exampleOut: 'Your input was ["Hello","world!"]',
                    execute: (ctx) => JSON.stringify(ctx.input)
                }
            ]
        });
    }
}
