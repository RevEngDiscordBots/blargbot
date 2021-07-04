import { BaseSubtag, SubtagType } from '../core';

export class LangSubtag extends BaseSubtag {
    public constructor() {
        super({
            name: 'lang',
            category: SubtagType.BOT,
            deprecated: true,
            definition: [
                {
                    parameters: ['language'],
                    description: 'Specifies which `language` should be used when viewing the raw of this tag',
                    exampleCode: 'This will be displayed with js! {lang;js}.',
                    exampleOut: 'This will be displayed with js!.',
                    execute: () => ''
                }
            ]
        });
    }
}
