import { DumpSubtag } from '@blargbot/cluster/subtags/bot/dump';

import { runSubtagTests } from '../SubtagTestSuite';

runSubtagTests({
    subtag: new DumpSubtag(),
    argCountBounds: { min: 1, max: 1 },
    cases: [
        {
            code: '{dump;abc123}',
            expected: 'https://blargbot.xyz/output/1271927912712712',
            postSetup(bbctx, ctx) {
                ctx.util.setup(m => m.generateOutputPage('abc123', bbctx.channel)).thenResolve('1271927912712712');
                ctx.util.setup(m => m.websiteLink('output/1271927912712712')).thenReturn('https://blargbot.xyz/output/1271927912712712');
            }
        }
    ]
});