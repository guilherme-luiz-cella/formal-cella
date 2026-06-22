import { describe, it, expect } from 'vitest';
import {
  initialLexerState,
  lexerReducer,
  type LexerState,
} from '../useLexer';

function consumeAll(state: LexerState, input: string): LexerState {
  let s = state;
  for (const ch of input) {
    s = lexerReducer(s, { type: 'CONSUME', symbol: ch });
  }
  return s;
}

describe('lexerReducer', () => {
  it('starts with empty buffer and START state', () => {
    expect(initialLexerState.buffer).toBe('');
    expect(initialLexerState.state).toBe('START');
    expect(initialLexerState.history).toEqual([]);
  });

  it('accumulates lowercase letters and walks the trace', () => {
    const s = consumeAll(initialLexerState, 'abc');
    expect(s.buffer).toBe('abc');
    expect(s.state).toBe('READING');
    expect(s.trace.map((t) => t.to)).toEqual(['READING', 'READING', 'READING']);
  });

  it('finalises an accepted token on space', () => {
    let s = consumeAll(initialLexerState, 'hello');
    s = lexerReducer(s, { type: 'CONSUME', symbol: ' ' });
    expect(s.buffer).toBe('');
    expect(s.state).toBe('START');
    expect(s.trace).toEqual([]);
    expect(s.history).toHaveLength(1);
    expect(s.history[0].value).toBe('hello');
    expect(s.history[0].status).toBe('ACCEPTED');
  });

  it('finalises a rejected token on space when the buffer contains invalid symbols', () => {
    let s = consumeAll(initialLexerState, 'ab1c');
    expect(s.state).toBe('DEAD');
    s = lexerReducer(s, { type: 'CONSUME', symbol: ' ' });
    expect(s.history[0].value).toBe('ab1c');
    expect(s.history[0].status).toBe('REJECTED');
    expect(s.history[0].finalState).toBe('DEAD');
  });

  it('ignores spaces when the buffer is empty (no empty tokens emitted)', () => {
    const s = lexerReducer(initialLexerState, { type: 'CONSUME', symbol: ' ' });
    expect(s.history).toEqual([]);
    expect(s.buffer).toBe('');
  });

  it('handles backspace by recomputing state and trace deterministically', () => {
    let s = consumeAll(initialLexerState, 'ab1');
    expect(s.state).toBe('DEAD');
    s = lexerReducer(s, { type: 'BACKSPACE' });
    expect(s.buffer).toBe('ab');
    expect(s.state).toBe('READING'); // back into accepting state
    expect(s.trace).toHaveLength(2);
  });

  it('reset clears buffer + state but keeps history', () => {
    let s = consumeAll(initialLexerState, 'hi');
    s = lexerReducer(s, { type: 'CONSUME', symbol: ' ' });
    s = consumeAll(s, 'abc');
    s = lexerReducer(s, { type: 'RESET' });
    expect(s.buffer).toBe('');
    expect(s.state).toBe('START');
    expect(s.history).toHaveLength(1);
  });

  it('clears history without touching the live buffer', () => {
    let s = consumeAll(initialLexerState, 'hi');
    s = lexerReducer(s, { type: 'CONSUME', symbol: ' ' });
    s = consumeAll(s, 'wo');
    s = lexerReducer(s, { type: 'CLEAR_HISTORY' });
    expect(s.history).toEqual([]);
    expect(s.buffer).toBe('wo');
    expect(s.state).toBe('READING');
  });

  it('caps history at 50 entries', () => {
    let s: LexerState = initialLexerState;
    for (let i = 0; i < 60; i++) {
      s = consumeAll(s, 'tok');
      s = lexerReducer(s, { type: 'CONSUME', symbol: ' ' });
    }
    expect(s.history).toHaveLength(50);
  });
});
