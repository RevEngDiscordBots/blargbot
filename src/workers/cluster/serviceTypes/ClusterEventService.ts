import { Cluster } from '@cluster';
import { ClusterIPCContract } from '@cluster/types';
import { BaseService } from '@core/serviceTypes';
import { GetWorkerProcessMessageHandler, IPCContractNames } from '@core/types';

export abstract class ClusterEventService<Contract extends IPCContractNames<ClusterIPCContract>> extends BaseService {
    // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
    readonly #execute: GetWorkerProcessMessageHandler<ClusterIPCContract, Contract>
    public readonly type: string;

    protected constructor(
        public readonly cluster: Cluster,
        public readonly event: Contract,
        protected readonly execute: GetWorkerProcessMessageHandler<ClusterIPCContract, Contract>
    ) {
        super();
        this.type = `ClusterEvent:${this.event}`;
        this.#execute = ({ data, id, reply }): void => {
            try {
                this.execute({ data, id, reply });
            } catch (err: unknown) {
                this.cluster.logger.error(`Cluster event handler ${this.name} threw an error`, err);
            }
        };
    }

    public start(): void {
        this.cluster.worker.on(this.event, this.#execute);
    }

    public stop(): void {
        this.cluster.worker.off(this.event, this.#execute);
    }
}
