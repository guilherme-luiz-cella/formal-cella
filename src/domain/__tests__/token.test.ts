import { describe, it, expect } from 'vitest';
import { evaluateToken } from '../token';
import { buildDFA } from '../automaton';
import { grammarFromKeywords } from '../grammar';

const dfa = buildDFA(grammarFromKeywords(['let', 'if', 'else']));

describe('token — evaluateToken (keyword-only)', () => {
  it('accepts a configured keyword', () => {
    expect(evaluateToken(dfa, 'let')).toMatchObject({
      status: 'ACCEPTED',
      kind: 'KEYWORD',
      finalState: 'let',
    });
  });

  it('rejects an empty token', () => {
    expect(evaluateToken(dfa, '')).toMatchObject({
      status: 'REJECTED',
      kind: 'INVALID',
    });
  });

  it('rejects a strict prefix of a keyword', () => {
    expect(evaluateToken(dfa, 'le')).toMatchObject({
      status: 'REJECTED',
      kind: 'INVALID',
      finalState: 'le',
    });
  });

  it('rejects an unknown token', () => {
    expect(evaluateToken(dfa, 'foo')).toMatchObject({
      status: 'REJECTED',
      kind: 'INVALID',
    });
  });

  it('rejects extra characters past a keyword', () => {
    expect(evaluateToken(dfa, 'lets')).toMatchObject({
      status: 'REJECTED',
      kind: 'INVALID',
    });
  });
});
