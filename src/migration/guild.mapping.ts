/* Autogenerated mapping by /home/danny/projects/blargbot/blargbot/migration/createMappingsFromRethink.js */

import { mapping } from '@blargbot/mapping';

export type OldRethinkGuild = Extract<ReturnType<typeof mapGuild>, { valid: true; }>['value'];
export const mapGuild = mapping.object({
    ['active']: mapping.boolean,
    ['announce']: mapping.object({
        ['channel']: mapping.string,
        ['role']: mapping.string
    }).optional,
    ['autoresponse']: mapping.object({
        ['everything']: mapping.object({
            ['executes']: mapping.string,
            ['regex']: mapping.boolean,
            ['term']: mapping.string,
            ['weight']: mapping.number
        }).nullable,
        ['index']: mapping.number,
        ['list']: mapping.array(mapping.object({
            ['executes']: mapping.string,
            ['regex']: mapping.boolean,
            ['term']: mapping.string,
            ['weight']: mapping.number
        }))
    }).optional,
    ['ccommands']: mapping.record(mapping.object({
        ['alias']: mapping.string.optional,
        ['author']: mapping.string.optional,
        ['authorizer']: mapping.string.optional,
        ['content']: mapping.string.optional,
        ['cooldown']: mapping.number.optional,
        ['flags']: mapping.array(mapping.object({
            ['desc']: mapping.string,
            ['flag']: mapping.string,
            ['word']: mapping.string
        })).optional,
        ['help']: mapping.string.optional,
        ['hidden']: mapping.boolean.optional,
        ['lang']: mapping.string.optional,
        ['managed']: mapping.boolean.optional,
        ['roles']: mapping.array(mapping.string).optional
    }).optional),
    ['censor']: mapping.object({
        ['cases']: mapping.object({}),
        ['exception']: mapping.object({
            ['channel']: mapping.array(mapping.string),
            ['role']: mapping.array(mapping.string),
            ['user']: mapping.array(mapping.string)
        }),
        ['list']: mapping.array(mapping.object({
            ['banMessage']: mapping.string.optional,
            ['decancer']: mapping.boolean.optional,
            ['deleteMessage']: mapping.string.optional,
            ['kickMessage']: mapping.string.optional,
            ['reason']: mapping.string.optional,
            ['regex']: mapping.boolean,
            ['term']: mapping.string,
            ['weight']: mapping.number
        })),
        ['rule']: mapping.object({
            ['banMessage']: mapping.string.optional,
            ['deleteMessage']: mapping.string.optional,
            ['kickMessage']: mapping.string.optional
        })
    }).optional,
    ['channels']: mapping.record(mapping.object({
        ['blacklisted']: mapping.boolean,
        ['nsfw']: mapping.boolean
    }).optional),
    ['commandperms']: mapping.record(mapping.object({
        ['disabled']: mapping.boolean.optional,
        ['permission']: mapping.number.nullish,
        ['rolename']: mapping.array(mapping.string).nullish
    }).optional),
    ['guildid']: mapping.string,
    ['log']: mapping.object({
        ['avatarupdate']: mapping.string.optional,
        ['memberban']: mapping.string.optional,
        ['memberjoin']: mapping.string.optional,
        ['memberleave']: mapping.string.optional,
        ['memberunban']: mapping.string.optional,
        ['messagedelete']: mapping.string.optional,
        ['messageupdate']: mapping.string.optional,
        ['nameupdate']: mapping.string.optional,
        ['nickupdate']: mapping.string.optional,
        ['role:']: mapping.string.optional,
        ['role:258242367050612736']: mapping.string.optional,
        ['role:272975289204867073']: mapping.string.optional,
        ['role:331911911325171714']: mapping.string.optional,
        ['role:331912421876957185']: mapping.string.optional,
        ['role:331912735069569034']: mapping.string.optional,
        ['role:331913187274522636']: mapping.string.optional,
        ['role:331913691379400724']: mapping.string.optional,
        ['role:331914066731991042']: mapping.string.optional,
        ['role:331914264073994242']: mapping.string.optional,
        ['role:331919869912285195']: mapping.string.optional,
        ['role:331923438845558788']: mapping.string.optional,
        ['role:331923582768644096']: mapping.string.optional,
        ['role:331923726599847938']: mapping.string.optional,
        ['role:331923793889067021']: mapping.string.optional,
        ['role:331923795608731649']: mapping.string.optional,
        ['role:346552505561251841']: mapping.string.optional,
        ['role:346552662025568256']: mapping.string.optional,
        ['role:346552715670847490']: mapping.string.optional,
        ['role:346552789834661899']: mapping.string.optional,
        ['role:351695323716124674']: mapping.string.optional,
        ['role:351695577987416065']: mapping.string.optional,
        ['role:368103203340025866']: mapping.string.optional,
        ['role:428637054922915850']: mapping.string.optional,
        ['role:486321901342425089']: mapping.string.optional,
        ['role:493736829275865089']: mapping.string.optional,
        ['role:494530972784525342']: mapping.string.optional,
        ['role:494531031303454740']: mapping.string.optional,
        ['role:522705900864012309']: mapping.string.optional,
        ['role:531507085846904853']: mapping.string.optional,
        ['role:545916863478104086']: mapping.string.optional,
        ['role:560454729390358528']: mapping.string.optional,
        ['role:574700303685910530']: mapping.string.optional,
        ['role:588481730395111434']: mapping.string.optional,
        ['role:605777718034038794']: mapping.string.optional,
        ['role:631809141576564736']: mapping.string.optional,
        ['role:655432532170506252']: mapping.string.optional,
        ['role:663155293752131584']: mapping.string.optional,
        ['role:663155525529370637']: mapping.string.optional,
        ['role:663155739384217600']: mapping.string.optional,
        ['role:663155871899058235']: mapping.string.optional,
        ['role:663169850599800862']: mapping.string.optional,
        ['role:670238604290687016']: mapping.string.optional,
        ['role:671109140814495767']: mapping.string.optional,
        ['role:701420666578010183']: mapping.string.optional,
        ['role:701430705330323516']: mapping.string.optional,
        ['role:704643026265571338']: mapping.string.optional,
        ['role:708345472204406807']: mapping.string.optional,
        ['role:719187945541599315']: mapping.string.optional,
        ['role:765830472700788747']: mapping.string.optional,
        ['role:781145160184627230']: mapping.string.optional,
        ['role:793222057335717908']: mapping.string.optional,
        ['role:801400158629658634']: mapping.string.optional,
        ['role:811891747646734336']: mapping.string.optional,
        ['role:832452855121969162']: mapping.string.optional,
        ['role:832569076073103360']: mapping.string.optional,
        ['role:863807478381805578']: mapping.string.optional,
        ['role:873981772617097257']: mapping.string.optional,
        ['role:<@&708154808057725179>']: mapping.string.optional,
        ['role:<id>']: mapping.string.optional
    }).optional,
    ['logIgnore']: mapping.array(mapping.string).optional,
    ['modlog']: mapping.array(mapping.object({
        ['caseid']: mapping.number,
        ['modid']: mapping.string.nullable,
        ['msgid']: mapping.string.optional,
        ['reason']: mapping.string,
        ['type']: mapping.string,
        ['userid']: mapping.string.optional
    })),
    ['name']: mapping.string,
    ['roleme']: mapping.array(mapping.object({
        ['add']: mapping.array(mapping.string),
        ['casesensitive']: mapping.boolean,
        ['channels']: mapping.array(mapping.string),
        ['message']: mapping.string,
        ['output']: mapping.string.optional,
        ['remove']: mapping.array(mapping.string)
    })).optional,
    ['settings']: mapping.object({
        ['actonlimitsonly']: mapping.boolean.optional,
        ['adminrole']: mapping.string.optional,
        ['antimention']: mapping.number.optional,
        ['banat']: mapping.number.optional,
        ['banoverride']: mapping.number.optional,
        ['cahnsfw']: mapping.boolean.optional,
        ['deletenotif']: mapping.boolean.optional,
        ['disableeveryone']: mapping.boolean.optional,
        ['disablenoperms']: mapping.boolean.optional,
        ['dmhelp']: mapping.boolean.optional,
        ['farewell']: mapping.choice(
            mapping.object({
                ['author']: mapping.string,
                ['authorizer']: mapping.string,
                ['content']: mapping.string
            }),
            mapping.string
        ).optional,
        ['farewellchan']: mapping.string.optional,
        ['greetchan']: mapping.string.optional,
        ['greeting']: mapping.choice(
            mapping.object({
                ['author']: mapping.string,
                ['authorizer']: mapping.string,
                ['content']: mapping.string
            }),
            mapping.string
        ).optional,
        ['kickat']: mapping.number.optional,
        ['kickoverride']: mapping.number.optional,
        ['makelogs']: mapping.boolean.optional,
        ['modlog']: mapping.string.optional,
        ['mutedrole']: mapping.string.optional,
        ['nocleverbot']: mapping.boolean.optional,
        ['permoverride']: mapping.boolean.optional,
        ['prefix']: mapping.array(mapping.string).optional,
        ['social']: mapping.boolean.optional,
        ['staffperms']: mapping.number.optional,
        ['tableflip']: mapping.boolean.optional
    }),
    ['votebans']: mapping.record(mapping.array(mapping.object({
        ['id']: mapping.string,
        ['reason']: mapping.string.optional
    })).optional).optional,
    ['warnings']: mapping.object({
        ['users']: mapping.record(mapping.number.optional)
    }).optional
});
