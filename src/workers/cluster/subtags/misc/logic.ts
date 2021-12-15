import { Subtag } from '@cluster/bbtag';
import { InvalidOperatorError, NotABooleanError } from '@cluster/bbtag/errors';
import { bbtagUtil, parse, SubtagType } from '@cluster/utils';

export class LogicSubtag extends Subtag {
    public constructor() {
        super({
            name: 'logic',
            category: SubtagType.MISC,
            definition: [
                {
                    parameters: ['operator', 'values+'],
                    description: 'Accepts 1 or more boolean `values` (`true` or `false`) and returns the result of `operator` on them. ' +
                        'Valid logic operators are `' + [...Object.keys(bbtagUtil.logicOperators), '^'].join('`, `') + '`.' +
                        'See `{operators}` for a shorter way of performing logic operations.',
                    exampleCode: '{logic;&&;true;false}',
                    exampleOut: 'false',
                    returns: 'boolean',
                    execute: (_, values) => this.applyLogicOperation(values.map(arg => arg.value))
                }
            ]
        });
    }

    public applyLogicOperation(args: string[]): boolean {
        let operator;

        for (let i = 0; i < args.length; i++) {
            const operatorName = args[i].toLowerCase();
            operator = toLogicOperator(operatorName);
            if (operator !== undefined) {
                args.splice(i, 1);
                break;
            }
        }

        if (operator === undefined)
            throw new InvalidOperatorError(args[0]);

        const values = args;
        const parsed = values.map((value) => {
            const parsed = parse.boolean(value);
            if (parsed === undefined)
                throw new NotABooleanError(value);
            return parsed;
        });

        return bbtagUtil.operate(operator, parsed);
    }
}

function toLogicOperator(operator: string): bbtagUtil.LogicOperator | undefined {
    if (bbtagUtil.isLogicOperator(operator))
        return operator;
    if (operator === '^')
        return 'xor';
    return undefined;
}
