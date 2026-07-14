declare module 'turndown' {
  export interface TurndownOptions {
    headingStyle?: 'setext' | 'atx';
    hr?: string;
    bulletListMarker?: string;
    codeBlockStyle?: 'indented' | 'fenced';
    fence?: string;
    emDelimiter?: string;
    strongDelimiter?: string;
    linkStyle?: 'inlined' | 'referenced';
    linkReferenceStyle?: 'full' | 'collapsed' | 'shortcut';
  }

  export class TurndownService {
    constructor(options?: TurndownOptions);
    addRule(key: string, rule: any): TurndownService;
    turndown(html: string): string;
  }

  export default TurndownService;
}

