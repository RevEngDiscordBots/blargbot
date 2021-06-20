import { BBTagContext } from '../BBTagContext';
import { Statement, SubtagArgumentValue as ISubtagArgumentValue } from '../types';

export class SubtagArgumentValue implements ISubtagArgumentValue {
    // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
    #promise?: Promise<string>;
    // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
    #value?: string;

    public readonly code: Statement;
    public get isCached(): boolean { return this.#value !== undefined; }
    public get raw(): string { return this.code.map(c => typeof c === 'string' ? c : c.source).join(''); }
    public get value(): string {
        if (this.#value === undefined)
            throw new Error('The value is not available yet. Please await the wait() method before attempting to access the value');
        return this.#value;
    }

    public constructor(private readonly context: BBTagContext, code: Statement) {
        this.code = code;
    }
    public execute(): Promise<string> {
        return this.#promise = this.context.eval(this.code)
            .then(v => this.#value = v);
    }

    public wait(): Promise<string> {
        return this.#promise ??= this.execute();
    }
}

export class DefaultingSubtagArgumentValue implements ISubtagArgumentValue {
    public get isCached(): boolean { return this.innerArg.isCached; }
    public get raw(): string { return this.innerArg.raw; }
    public get value(): string { return this.handleResult(this.innerArg.value); }
    public get code(): Statement { return this.innerArg.code; }

    public constructor(
        private readonly innerArg: ISubtagArgumentValue,
        private readonly defaultValue: string) {
    }

    public async wait(): Promise<string> {
        return this.handleResult(await this.innerArg.wait());
    }

    public async execute(): Promise<string> {
        return this.handleResult(await this.innerArg.execute());
    }

    private handleResult(result: string): string {
        return result.length === 0
            ? this.defaultValue
            : result;
    }
}