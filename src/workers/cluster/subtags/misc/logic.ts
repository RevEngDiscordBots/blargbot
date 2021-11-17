import { Subtag } from '@cluster/bbtag';
import { BBTagRuntimeError, InvalidOperatorError, NotABooleanError } from '@cluster/bbtag/errors';
import { bbtagUtil, parse, SubtagType } from '@cluster/utils';
import { LogicOperator } from '@cluster/utils/bbtag/operators';

const operators = bbtagUtil.operators.logic;

export class LogicSubtag extends Subtag {
    public constructor() {
        super({
            name: 'logic',
            category: SubtagType.MISC
        });
    }

    @Subtag.signature('boolean', [
        Subtag.argument('operator', 'string').guard(bbtagUtil.operators.isLogicOperator, val => new InvalidOperatorError(val, 'logic')),
        Subtag.argument('values', 'boolean').repeat(1, Infinity)
    ], {
        description: 'Accepts 1 or more boolean `values` (`true` or `false`) and returns the result of `operator` on them. ' +
            'Valid logic operators are `' + Object.keys(operators).join('`, `') + '`.' +
            'See `{operators}` for a shorter way of performing logic operations.',
        exampleCode: '{logic;&&;true;false}',
        exampleOut: 'false'
    })
    public applyLogicOperation(operator: LogicOperator, values: boolean[]): boolean {
        return operators[operator](values);
    }

    // Signature for backwards compatibility.
    @Subtag.signature('boolean', [
        Subtag.argument('values', 'string').repeat(2, Infinity)
    ], { hidden: true })
    public applyLogicOperationDirty(args: string[]): boolean {
        let operator: LogicOperator | undefined;

        for (let i = 0; i < args.length; i++) {
            const operatorName = args[i].toLowerCase();
            if (bbtagUtil.operators.isLogicOperator(operatorName)) {
                operator = operatorName;
                args.splice(i, 1);
            }
        }

        if (operator === undefined)
            throw new BBTagRuntimeError('Invalid operator');

        const values = args;
        if (operator === '!') {
            const value = parse.boolean(values[0]);
            if (value === undefined)
                throw new NotABooleanError(values[0]);
            return this.applyLogicOperation(operator, [value]);
        }

        return this.applyLogicOperation(operator, values.map((value) => {
            const parsed = parse.boolean(value);
            if (parsed === undefined)
                throw new NotABooleanError(value);
            return parsed;
        }));
    }
}
