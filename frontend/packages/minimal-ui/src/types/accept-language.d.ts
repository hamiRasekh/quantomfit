declare module 'accept-language' {
  export function parse(acceptLanguageHeader: string): Array<{ language: string; region?: string; quality: number }>;
}

