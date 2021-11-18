export class PromiseCompletionSource<T> {
    #resolve?: (value: Awaitable<T>) => void;
    #reject?: (reason?: unknown) => void;
    #state: 'pending' | 'resolved' | 'rejected';
    public readonly promise: Promise<T>;
    public get state(): 'pending' | 'resolved' | 'rejected' { return this.#state; }

    public constructor() {
        this.#state = 'pending';
        this.promise = new Promise<T>((resolve, reject) => {
            this.#resolve = resolve;
            this.#reject = reject;
        });
    }

    public resolve(value: Awaitable<T>): boolean {
        if (this.#state !== 'pending')
            return false;
        this.#state = 'resolved';
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.#resolve!(value);
        return true;
    }

    public reject(error?: unknown): boolean {
        if (this.#state !== 'pending')
            return false;

        this.#state = 'rejected';
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.#reject!(error);
        return true;
    }
}
