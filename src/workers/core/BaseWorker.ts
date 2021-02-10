import { IPCEvents } from './IPCEvents';

export abstract class BaseWorker extends IPCEvents {
    // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
    readonly #process: NodeJS.Process;
    public get id(): number { return this.#process.pid; }
    public get env(): NodeJS.ProcessEnv { return this.#process.env; }
    public get memoryUsage(): NodeJS.MemoryUsage { return this.#process.memoryUsage(); }

    public constructor(
        public readonly logger: CatLogger
    ) {
        super();

        this.#process = process;
        super.attach(this.#process);
        this.#process.on('unhandledRejection', (err) =>
            this.logger.error('Unhandled Promise Rejection: Promise' + JSON.stringify(err)));

        this.logger.addPostHook(({ text, level, timestamp }) => {
            this.send('log', { text, level, timestamp });
            return null;
        });

        this.send('alive');
    }

    public start(): void {
        this.send('ready', 'Hello!');
    }
}
