import { EveryoneMentionSubtag } from '@cluster/subtags/message/everyonemention';
import { expect } from 'chai';

import { runSubtagTests } from '../SubtagTestSuite';

runSubtagTests({
    subtag: new EveryoneMentionSubtag(),
    argCountBounds: { min: 0, max: 1 },
    cases: [
        {
            code: '{everyonemention}',
            expected: '@everyone',
            assert(ctx) {
                expect(ctx.state.allowedMentions.everybody).to.be.true;
            }
        },
        {
            code: '{everyonemention;true}',
            expected: '@everyone',
            assert(ctx) {
                expect(ctx.state.allowedMentions.everybody).to.be.true;
            }
        },
        {
            code: '{everyonemention;false}',
            expected: '@everyone',
            assert(ctx) {
                expect(ctx.state.allowedMentions.everybody).to.be.false;
            }
        }
    ]
});