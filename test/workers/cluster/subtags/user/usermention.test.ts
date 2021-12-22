import { TooManyArgumentsError } from '@cluster/bbtag/errors';
import { UserMentionSubtag } from '@cluster/subtags/user/usermention';
import { expect } from 'chai';
import { Member, User } from 'eris';

import { MarkerError, runSubtagTests } from '../SubtagTestSuite';
import { createGetUserPropTestCases } from './_getUserPropTest';

runSubtagTests({
    subtag: new UserMentionSubtag(),
    cases: [
        ...createGetUserPropTestCases({
            ifQuietAndNotFound: '',
            generateCode(...args) {
                return `{${['usermention', ...args].join(';')}}`;
            },
            cases: [
                {
                    expected: '<@12345678900987236>',
                    setup(member) {
                        member.user.id = '12345678900987236';
                    },
                    assert(_, __, ctx) {
                        expect(ctx.state.allowedMentions.users).to.deep.equal(['12345678900987236']);
                    }
                },
                {
                    expected: '<@098765434512212678>',
                    setup(member) {
                        member.user.id = '098765434512212678';
                    },
                    assert(_, __, ctx) {
                        expect(ctx.state.allowedMentions.users).to.deep.equal(['098765434512212678']);
                    }
                },
                {
                    expected: '<@876543456782978367654>',
                    setup(member) {
                        member.user.id = '876543456782978367654';
                    },
                    assert(_, __, ctx) {
                        expect(ctx.state.allowedMentions.users).to.deep.equal(['876543456782978367654']);
                    }
                }
            ]
        }),
        {
            code: '{usermention;12345678900987236}{usermention;12345678900987236}',
            expected: '<@12345678900987236><@12345678900987236>',
            setup(ctx) {
                ctx.users.command.id = '12345678900987236';
            },
            postSetup(bbctx, ctx) {
                const member = ctx.createMock(Member);
                const user = ctx.createMock(User);
                member.setup(m => m.user).thenReturn(user.instance);
                user.setup(m => m.id).thenReturn('12345678900987236');
                user.setup(m => m.mention).thenReturn('<@12345678900987236>');

                ctx.util.setup(m => m.findMembers(bbctx.guild, '12345678900987236')).verifiable(2).thenResolve([member.instance]);
            },
            assert(ctx) {
                expect(ctx.state.allowedMentions.users).to.deep.equal(['12345678900987236']);
            }
        },
        {
            code: '{usermention;12345678900987236}{usermention;098765434512212678}',
            expected: '<@12345678900987236><@098765434512212678>',
            setup(ctx) {
                ctx.users.command.id = '12345678900987236';
                ctx.users.other.id = '098765434512212678';
            },
            postSetup(bbctx, ctx) {
                const member1 = ctx.createMock(Member);
                const member2 = ctx.createMock(Member);
                const user1 = ctx.createMock(User);
                const user2 = ctx.createMock(User);
                member1.setup(m => m.user).thenReturn(user1.instance);
                member2.setup(m => m.user).thenReturn(user2.instance);
                user1.setup(m => m.id).thenReturn('12345678900987236');
                user2.setup(m => m.id).thenReturn('098765434512212678');
                user1.setup(m => m.mention).thenReturn('<@12345678900987236>');
                user2.setup(m => m.mention).thenReturn('<@098765434512212678>');

                ctx.util.setup(m => m.findMembers(bbctx.guild, '12345678900987236')).verifiable(1).thenResolve([member1.instance]);
                ctx.util.setup(m => m.findMembers(bbctx.guild, '098765434512212678')).verifiable(1).thenResolve([member2.instance]);
            },
            assert(ctx) {
                expect(ctx.state.allowedMentions.users).to.deep.equal(['12345678900987236', '098765434512212678']);
            }
        },
        {
            code: '{usermention;{eval};{eval};{eval}}',
            expected: '`Too many arguments`',
            errors: [
                { start: 13, end: 19, error: new MarkerError('eval', 13) },
                { start: 20, end: 26, error: new MarkerError('eval', 20) },
                { start: 27, end: 33, error: new MarkerError('eval', 27) },
                { start: 0, end: 34, error: new TooManyArgumentsError(2, 3) }
            ]
        }
    ]
});
