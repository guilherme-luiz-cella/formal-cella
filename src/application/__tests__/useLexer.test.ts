import { describe, it, expect } from 'vitest';
import {
  initialLexerState,
  lexerReducer,
  type LexerState,
} from '../useLexer';
import { grammarFromKeywords } from '@/domain/grammar';

function consumeAll(state: LexerState, input: string): LexerState {
  let s = state;
  for (const ch of input) {
    s = lexerReducer(s, { type: 'CONSUME', symbol: ch });
  }
  return s;
}

describe('lexerReducer (keyword-trie DFA)', () => {
  it('starts at the empty prefix and the default grammar', () => {
    expect(initialLexerState.buffer).toBe('');
    expect(initialLexerState.state).toBe('');
    expect(initialLexerState.grammar.keywords.has('let')).toBe(true);
  });

  it('walks the trie character by character', () => {
    const s = consumeAll(initialLexerState, 'let');
    expect(s.buffer).toBe('let');
    expect(s.state).toBe('let');
    expect(s.trace.map((t) => t.to)).toEqual(['l', 'le', 'let']);
  });

  it('finalises a KEYWORD token on space', () => {
    let s = consumeAll(initialLexerState, 'let');
    s = lexerReducer(s, { type: 'CONSUME', symbol: ' ' });
    expect(s.buffer).toBe('');
    expect(s.state).toBe('');
    expect(s.history).toHaveLength(1);
    expect(s.history[0]).toMatchObject({
      value: 'let',
      status: 'ACCEPTED',
      kind: 'KEYWORD',
    });
  });

  it('rejects strict prefixes of a keyword', () => {
    let s = consumeAll(initialLexerState, 'le');
    s = lexerReducer(s, { type: 'CONSUME', symbol: ' ' });
    expect(s.history[0]).toMatchObject({
      value: 'le',
      status: 'REJECTED',
      kind: 'INVALID',
    });
  });

  it('rejects unknown words and traps in DEAD on the offending char', () => {
    let s = consumeAll(initialLexerState, 'lex');
    expect(s.state).toBe('DEAD');
    s = lexerReducer(s, { type: 'CONSUME', symbol: ' ' });
    expect(s.history[0]).toMatchObject({
      value: 'lex',
      status: 'REJECTED',
      finalState: 'DEAD',
    });
  });

  it('ignores spaces with an empty buffer', () => {
    const s = lexerReducer(initialLexerState, { type: 'CONSUME', symbol: ' ' });
    expect(s.history).toEqual([]);
    expect(s.buffer).toBe('');
  });

  it('backspace replays the trie deterministically', () => {
    let s = consumeAll(initialLexerState, 'lex');
    expect(s.state).toBe('DEAD');
    s = lexerReducer(s, { type: 'BACKSPACE' });
    expect(s.buffer).toBe('le');
    expect(s.state).toBe('le');
    expect(s.trace).toHaveLength(2);
  });

  it('reset clears live state but keeps history', () => {
    let s = consumeAll(initialLexerState, 'let');
    s = lexerReducer(s, { type: 'CONSUME', symbol: ' ' });
    s = consumeAll(s, 'if');
    s = lexerReducer(s, { type: 'RESET' });
    expect(s.buffer).toBe('');
    expect(s.state).toBe('');
    expect(s.history).toHaveLength(1);
  });

  it('SET_GRAMMAR rebuilds the DFA and resets the live token', () => {
    let s = consumeAll(initialLexerState, 'le');
    s = lexerReducer(s, {
      type: 'SET_GRAMMAR',
      grammar: grammarFromKeywords(['foo', 'bar']),
    });
    expect(s.buffer).toBe('');
    expect(s.state).toBe('');
    expect(s.dfa.accepting).toEqual(new Set(['foo', 'bar']));

    // 'l' is no longer a prefix of any keyword.
    s = lexerReducer(s, { type: 'CONSUME', symbol: 'l' });
    expect(s.state).toBe('DEAD');
  });

  it('caps history at 50 entries', () => {
    let s: LexerState = initialLexerState;
    for (let i = 0; i < 60; i++) {
      s = consumeAll(s, 'let');
      s = lexerReducer(s, { type: 'CONSUME', symbol: ' ' });
    }
    expect(s.history).toHaveLength(50);
  });
});
