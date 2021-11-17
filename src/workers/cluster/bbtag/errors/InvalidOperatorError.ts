import { BBTagRuntimeError } from './BBTagRuntimeError';

export class InvalidOperatorError extends BBTagRuntimeError {
    public constructor(public readonly value: string, type?: string) {
        type = type === undefined ? 'an' : /^[aieou]/i.test(type) ? `an ${type}` : `a ${type}`;
        super('Invalid operator', `${value} is not ${type} operator`);
    }
}
