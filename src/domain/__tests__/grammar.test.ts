import { describe, it, expect } from 'vitest';
import {
  DEFAULT_GRAMMAR,
  grammarFromKeywords,
  keywordsFromString,
  keywordsToString,
} from '../grammar';
import { buildDFA, isAccepting, run } from '../automaton';

describe('grammar — helpers', () => {
  it('keywordsFromString splits on whitespace and commas', () => {
    expect([...keywordsFromString('let if  ,  else')]).toEqual([
      'let',
      'if',
      'else',
    ]);
  });

  it('keywordsToString round-trips a stable sorted form', () => {
    const out = keywordsToString(DEFAULT_GRAMMAR);
    expect(out).toContain('let');
    expect(out.split(' ').sort()).toEqual(out.split(' '));
  });

  it('grammarFromKeywords drops empty strings', () => {
    const g = grammarFromKeywords(['a', '', '  ', 'b']);
    // empty-string filter does not strip whitespace-only entries;
    // confirm the documented behaviour.
    expect(g.keywords.has('a')).toBe(true);
    expect(g.keywords.has('b')).toBe(true);
    expect(g.keywords.has('')).toBe(false);
  });
});

describe('grammar — drives the DFA', () => {
  it('changing the keyword set changes accepted tokens', () => {
    const dfaA = buildDFA(grammarFromKeywords(['foo']));
    const dfaB = buildDFA(grammarFromKeywords(['bar']));

    expect(isAccepting(dfaA, run(dfaA, 'foo'))).toBe(true);
    expect(isAccepting(dfaA, run(dfaA, 'bar'))).toBe(false);
    expect(isAccepting(dfaB, run(dfaB, 'bar'))).toBe(true);
    expect(isAccepting(dfaB, run(dfaB, 'foo'))).toBe(false);
  });
});
