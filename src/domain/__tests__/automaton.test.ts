import { describe, it, expect } from 'vitest';
import {
  buildDFA,
  DEAD,
  INITIAL_STATE,
  isAccepting,
  run,
  stateLabel,
  step,
} from '../automaton';
import { grammarFromKeywords } from '../grammar';

const dfaLet = buildDFA(grammarFromKeywords(['let']));
const dfaWords = buildDFA(grammarFromKeywords(['let', 'if', 'in']));

describe('automaton — buildDFA from keyword set', () => {
  it('initial state is the empty prefix', () => {
    expect(INITIAL_STATE).toBe('');
  });

  it('includes every prefix of every keyword', () => {
    expect(new Set(dfaWords.prefixes)).toEqual(
      new Set(['', 'l', 'le', 'let', 'i', 'if', 'in']),
    );
  });

  it('accepting set equals the keyword set', () => {
    expect(dfaWords.accepting).toEqual(new Set(['let', 'if', 'in']));
  });

  it('alphabet is the union of keyword characters', () => {
    expect(dfaWords.alphabet).toEqual(new Set(['l', 'e', 't', 'i', 'f', 'n']));
  });

  it('empty grammar yields only the initial state and no transitions', () => {
    const empty = buildDFA(grammarFromKeywords([]));
    expect(empty.prefixes).toEqual(['']);
    expect(empty.accepting.size).toBe(0);
    expect(empty.alphabet.size).toBe(0);
    expect(step(empty, '', 'a')).toBe(DEAD);
  });
});

describe('automaton — step + run', () => {
  it('walks along a valid prefix path', () => {
    expect(step(dfaLet, '', 'l')).toBe('l');
    expect(step(dfaLet, 'l', 'e')).toBe('le');
    expect(step(dfaLet, 'le', 't')).toBe('let');
  });

  it('DEAD on a character that does not extend any prefix', () => {
    expect(step(dfaLet, '', 'x')).toBe(DEAD);
    expect(step(dfaLet, 'l', 'x')).toBe(DEAD);
  });

  it('DEAD is a trap', () => {
    expect(step(dfaLet, DEAD, 'l')).toBe(DEAD);
    expect(step(dfaLet, DEAD, 'x')).toBe(DEAD);
  });

  it('run accepts the exact keyword', () => {
    const final = run(dfaLet, 'let');
    expect(final).toBe('let');
    expect(isAccepting(dfaLet, final)).toBe(true);
  });

  it('run rejects extra characters past the keyword', () => {
    expect(run(dfaLet, 'lets')).toBe(DEAD);
    expect(isAccepting(dfaLet, run(dfaLet, 'lets'))).toBe(false);
  });

  it('run rejects a strict prefix of a keyword (non-accepting)', () => {
    expect(run(dfaLet, 'le')).toBe('le');
    expect(isAccepting(dfaLet, run(dfaLet, 'le'))).toBe(false);
  });

  it('handles multiple keywords sharing/not-sharing prefixes', () => {
    expect(isAccepting(dfaWords, run(dfaWords, 'let'))).toBe(true);
    expect(isAccepting(dfaWords, run(dfaWords, 'if'))).toBe(true);
    expect(isAccepting(dfaWords, run(dfaWords, 'in'))).toBe(true);
    expect(isAccepting(dfaWords, run(dfaWords, 'i'))).toBe(false);
    expect(isAccepting(dfaWords, run(dfaWords, 'lest'))).toBe(false);
  });
});

describe('automaton — stateLabel', () => {
  it('labels the initial state as q₀', () => {
    expect(stateLabel(dfaLet, '')).toBe('q₀');
  });

  it('labels DEAD as qd', () => {
    expect(stateLabel(dfaLet, DEAD)).toBe('qd');
  });

  it('labels prefixes with unique qN ids in insertion order', () => {
    const all = dfaLet.prefixes.map((p) => stateLabel(dfaLet, p));
    expect(new Set(all).size).toBe(all.length);
  });
});
