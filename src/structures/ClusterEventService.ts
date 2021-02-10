import { Cluster } from '../cluster';
import { BaseService } from './BaseService';
import { inspect } from 'util';
import { ProcessMessageHandler } from '../workers/core/IPCEvents';

export abstract class ClusterEventService extends BaseService {
    // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
    readonly #execute: ProcessMessageHandler
    public readonly type: string;

    protected constructor(
        public readonly cluster: Cluster,
        public readonly event: string
    ) {
        super();
        this.type = `ClusterEvent:${this.event}`;
        this.#execute = (data, id, reply) => void this._execute(data, id, reply);
    }

    protected abstract execute(...args: Parameters<ProcessMessageHandler>): Promise<void> | void;

    public start(): void {
        this.cluster.worker.on(this.event, this.#execute);
    }

    public stop(): void {
        this.cluster.worker.off(this.event, this.#execute);
    }

    private async _execute(...args: Parameters<ProcessMessageHandler>): Promise<void> {
        try {
            await this.execute(...args);
        } catch (err) {
            this.cluster.logger.error(`Discord event handler ${this.name} threw an error: ${inspect(err)}`);
            this.stop();
        }
    }
}
