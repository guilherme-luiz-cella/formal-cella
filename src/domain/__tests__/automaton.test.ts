import { describe, it, expect } from 'vitest';
import {
  INITIAL_STATE,
  classifySymbol,
  isAccepting,
  run,
  step,
} from '../automaton';

describe('automaton — δ transition function', () => {
  describe('classifySymbol', () => {
    it.each(['a', 'm', 'z'])('classifies "%s" as LETTER', (ch) => {
      expect(classifySymbol(ch)).toBe('LETTER');
    });

    it.each(['A', 'Z', '0', '9', '!', '@', ' ', '-'])(
      'classifies "%s" as INVALID',
      (ch) => {
        expect(classifySymbol(ch)).toBe('INVALID');
      },
    );
  });

  describe('step', () => {
    it('moves START → READING on a lowercase letter', () => {
      expect(step('START', 'a')).toBe('READING');
    });

    it('moves START → DEAD on an invalid symbol', () => {
      expect(step('START', '1')).toBe('DEAD');
      expect(step('START', 'A')).toBe('DEAD');
    });

    it('stays in READING on subsequent lowercase letters', () => {
      expect(step('READING', 'b')).toBe('READING');
    });

    it('moves READING → DEAD on any invalid symbol', () => {
      expect(step('READING', '1')).toBe('DEAD');
      expect(step('READING', 'X')).toBe('DEAD');
    });

    it('DEAD is a trap', () => {
      expect(step('DEAD', 'a')).toBe('DEAD');
      expect(step('DEAD', '1')).toBe('DEAD');
    });
  });

  describe('run + isAccepting', () => {
    it('accepts a single lowercase letter', () => {
      const s = run('a');
      expect(s).toBe('READING');
      expect(isAccepting(s)).toBe(true);
    });

    it('accepts a long lowercase word', () => {
      expect(isAccepting(run('linguagensformais'))).toBe(true);
    });

    it('rejects the empty string (still at START, non-accepting)', () => {
      expect(run('')).toBe(INITIAL_STATE);
      expect(isAccepting(run(''))).toBe(false);
    });

    it('rejects a token containing an uppercase letter', () => {
      expect(isAccepting(run('helloWorld'))).toBe(false);
      expect(run('helloWorld')).toBe('DEAD');
    });

    it('rejects a token containing digits or symbols', () => {
      expect(isAccepting(run('abc1'))).toBe(false);
      expect(isAccepting(run('a!b'))).toBe(false);
    });

    it('a single invalid char puts us in DEAD permanently', () => {
      expect(run('1abc')).toBe('DEAD');
    });
  });
});
