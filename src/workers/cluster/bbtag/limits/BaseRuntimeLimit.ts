import { RuntimeLimit, RuntimeLimitRule, SerializedRuntimeLimit } from '@cluster/types';

import { BBTagContext } from '../BBTagContext';
import { limits } from './index';
import { disabledRule } from './rules';

export abstract class BaseRuntimeLimit implements RuntimeLimit {
    /* eslint-disable @typescript-eslint/explicit-member-accessibility */
    readonly #rules: Record<string, RuntimeLimitRuleCollection | undefined>;
    readonly #name: keyof typeof limits;
    /* eslint-enable @typescript-eslint/explicit-member-accessibility */

    public abstract get scopeName(): string;

    protected constructor(name: keyof typeof limits) {
        this.#rules = {};
        this.#name = name;
    }

    private resolveKey(key: string, create: true): RuleKeyRef<true>;
    private resolveKey(key: string, create?: boolean): RuleKeyRef<boolean>;
    private resolveKey(key: string, create = false): RuleKeyRef<boolean> {
        const subtag = key.split(':', 1)[0];
        const argument = subtag.length === key.length ? undefined : key.slice(subtag.length + 1);
        if (!create && this.#rules[subtag] === undefined)
            return { rules: undefined, subtag, argument };

        const set = this.#rules[subtag] ??= { subtag: [], arguments: {} };
        if (argument === undefined)
            return { rules: set.subtag, subtag, argument };

        if (!create)
            return { rules: set.arguments[argument], subtag, argument };
        return { rules: set.arguments[argument] ??= [], subtag, argument };
    }

    public addRules(rulekeys: string | string[], ...rules: RuntimeLimitRule[]): this {
        if (typeof rulekeys === 'string')
            rulekeys = [rulekeys];
        for (const ruleKey of rulekeys)
            this.resolveKey(ruleKey, true).rules.push(...rules);
        return this;
    }

    public async check(context: BBTagContext, rulekey: string): Promise<void> {
        const details = this.resolveKey(rulekey);
        if (details.rules === undefined)
            return;

        for (const rule of details.rules)
            await rule.check(context, details.subtag);
    }

    public rulesFor(rulekey: string): string[] {
        const details = this.resolveKey(rulekey);
        if (details.rules === undefined)
            return [];

        if (details.rules.includes(disabledRule))
            return [disabledRule.displayText(details.subtag, this.scopeName)];

        return details.rules.map(r => r.displayText(details.subtag, this.scopeName));
    }

    public serialize(): SerializedRuntimeLimit {
        const result: SerializedRuntimeLimit = { rules: {}, type: this.#name };

        for (const [subtag, ruleSet] of Object.entries(this.#rules)) {
            if (ruleSet === undefined)
                continue;

            result.rules[subtag] = ruleSet.subtag.map(r => r.state());

            for (const [argument, subRules] of Object.entries(ruleSet.arguments)) {
                if (subRules !== undefined) {
                    result.rules[`${subtag}:${argument}`] = subRules.map(r => r.state());
                }
            }
        }

        return result;
    }

    public load(state: SerializedRuntimeLimit): void {
        for (const [ruleKey, states] of Object.entries(state.rules)) {
            const details = this.resolveKey(ruleKey);
            if (details.rules === undefined)
                continue;

            const iter = Math.min(states.length, details.rules.length);
            for (let i = 0; i < iter; i++)
                details.rules[i].load(states[i]);
        }
    }
}

interface RuntimeLimitRuleCollection {
    readonly subtag: RuntimeLimitRule[];
    readonly arguments: Record<string, RuntimeLimitRule[] | undefined>;
}

interface RuleKeyRef<IsForced extends boolean> {
    readonly rules: RuntimeLimitRule[] | (IsForced extends true ? never : undefined);
    readonly subtag: string;
    readonly argument?: string;
}
