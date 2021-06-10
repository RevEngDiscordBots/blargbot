import { BaseService } from './BaseService';
import { ProcessMessageHandler } from '../workers/core/IPCEvents';
import { WorkerConnection } from '../workers/core/WorkerConnection';
import { WorkerPool } from '../workers/core/WorkerPool';

export abstract class WorkerPoolEventService<TWorker extends WorkerConnection> extends BaseService {
    public readonly type: string;
    // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
    readonly #attach: (worker: TWorker) => void;
    // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
    readonly #detach: (worker: TWorker) => void;
    // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
    readonly #handlers: WeakMap<TWorker, ProcessMessageHandler>;

    public constructor(
        public readonly workers: WorkerPool<TWorker>,
        public readonly event: string
    ) {
        super();
        this.type = `WorkerPool:Worker:${event}`;
        this.#attach = this.attach.bind(this);
        this.#detach = this.detach.bind(this);
        this.#handlers = new WeakMap();
    }

    public start(): void {
        this.workers.on('spawningworker', this.#attach);
        this.workers.on('killingworker', this.#detach);
    }

    public stop(): void {
        this.workers.off('spawningworker', this.#attach);
        this.workers.off('killingworker', this.#detach);
    }

    private attach(worker: TWorker): void {
        const handler: ProcessMessageHandler = (...args) => void (async () => {
            try {
                await this.execute(worker, ...args);
            } catch (ex) {
                this.workers.logger.error(ex);
            }
        })();
        this.#handlers.set(worker, handler);
        worker.on(this.event, handler);
    }

    private detach(worker: TWorker): void {
        const handler = this.#handlers.get(worker);
        if (!handler)
            return;
        worker.off(this.event, handler);
        this.#handlers.delete(worker);
    }

    protected abstract execute(worker: TWorker, ...args: Parameters<ProcessMessageHandler>): Promise<void> | void;
}