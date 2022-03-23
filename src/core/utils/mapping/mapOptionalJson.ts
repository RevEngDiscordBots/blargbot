import { TypeMapping } from '@core/types';

import { result } from './result';

export function mapOptionalJson<T>(mapping: TypeMapping<T>): TypeMapping<T | null> {
    return value => {
        if (value === undefined || value === null) {
            return result.null;
        }
        if (typeof value !== 'string')
            return result.never;
        try {
            return mapping(JSON.parse(value));
        } catch {
            return result.never;
        }
    };
}
