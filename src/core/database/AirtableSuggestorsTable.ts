import { Logger } from '@core/Logger';
import { Suggestor, SuggestorsTable } from '@core/types';
import { AirtableBase } from 'airtable/lib/airtable_base';

import { AirtableDbTable } from './base';

export class AirtableSuggestorsTable extends AirtableDbTable<Suggestor> implements SuggestorsTable {
    public constructor(client: AirtableBase, logger: Logger) {
        super(client, 'Suggestors', logger);
    }

    public async get(id: string): Promise<Suggestor | undefined> {
        const record = await this.aget(id);
        return record?.fields;
    }

    public async upsert(userid: string, username: string): Promise<string | undefined> {
        const current = await this.afind('ID', userid);
        if (current === undefined) {
            const created = await this.acreate({
                ['ID']: userid,
                ['Username']: username
            });
            return created?.id;
        }

        await this.aupdate(current.id, { ['Username']: username });

        return current.id;
    }
}
