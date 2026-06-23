/**
 * Domain layer — Grammar configuration.
 *
 * The DFA topology is derived directly from the keyword set. Every
 * configured keyword is a complete accepted token; any other input is
 * rejected. The user edits this set at runtime via the GrammarEditor.
 */
export interface Grammar {
  readonly keywords: ReadonlySet<string>;
}

export const DEFAULT_KEYWORDS: ReadonlyArray<string> = [
  'let',
  'print',
  'if',
  'else',
  'while',
  'true',
  'false',
];

export const DEFAULT_GRAMMAR: Grammar = {
  keywords: new Set(DEFAULT_KEYWORDS),
};

export function keywordsFromString(s: string): ReadonlySet<string> {
  return new Set(
    s
      .split(/[,\s]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0),
  );
}

export function keywordsToString(g: Grammar): string {
  return [...g.keywords].sort().join(' ');
}

export function grammarFromKeywords(keywords: Iterable<string>): Grammar {
  return { keywords: new Set([...keywords].filter((k) => k.length > 0)) };
}
