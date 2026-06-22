import { useCallback, useMemo, useReducer } from 'react';
import {
  INITIAL_STATE,
  step,
  type DFAState,
} from '@/domain/automaton';
import { evaluateToken, type RecognisedToken } from '@/domain/token';

/**
 * Application layer — orchestrates the lexer interaction. Holds:
 *   - the live (token-being-typed) buffer
 *   - the live DFA state
 *   - the trace of consumed symbols and intermediate states
 *   - the history of finalised tokens
 *
 * Pure reducer, no DOM. Easy to test in isolation.
 */

export interface TraceEntry {
  readonly symbol: string;
  readonly from: DFAState;
  readonly to: DFAState;
}

export interface LexerState {
  readonly buffer: string;
  readonly state: DFAState;
  readonly trace: ReadonlyArray<TraceEntry>;
  readonly history: ReadonlyArray<RecognisedToken>;
}

export const initialLexerState: LexerState = {
  buffer: '',
  state: INITIAL_STATE,
  trace: [],
  history: [],
};

type Action =
  | { type: 'CONSUME'; symbol: string }
  | { type: 'BACKSPACE' }
  | { type: 'RESET' }
  | { type: 'CLEAR_HISTORY' };

function finaliseToken(value: string): RecognisedToken {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    value,
    status: evaluateToken(value),
    finalState: value.length === 0 ? INITIAL_STATE : runFinal(value),
    at: Date.now(),
  };
}

function runFinal(value: string): DFAState {
  let s: DFAState = INITIAL_STATE;
  for (const ch of value) s = step(s, ch);
  return s;
}

export function lexerReducer(state: LexerState, action: Action): LexerState {
  switch (action.type) {
    case 'CONSUME': {
      const ch = action.symbol;

      // Separator: finalise current buffer (if any) and emit token.
      if (ch === ' ') {
        if (state.buffer.length === 0) return state;
        const token = finaliseToken(state.buffer);
        return {
          buffer: '',
          state: INITIAL_STATE,
          trace: [],
          history: [token, ...state.history].slice(0, 50),
        };
      }

      const next = step(state.state, ch);
      return {
        ...state,
        buffer: state.buffer + ch,
        state: next,
        trace: [...state.trace, { symbol: ch, from: state.state, to: next }],
      };
    }

    case 'BACKSPACE': {
      if (state.buffer.length === 0) return state;
      const nextBuffer = state.buffer.slice(0, -1);
      // Recompute the trace deterministically — the automaton has no
      // history-dependence, so replaying is the simplest correct option.
      let s: DFAState = INITIAL_STATE;
      const trace: TraceEntry[] = [];
      for (const ch of nextBuffer) {
        const to = step(s, ch);
        trace.push({ symbol: ch, from: s, to });
        s = to;
      }
      return { ...state, buffer: nextBuffer, state: s, trace };
    }

    case 'RESET':
      return { ...state, buffer: '', state: INITIAL_STATE, trace: [] };

    case 'CLEAR_HISTORY':
      return { ...state, history: [] };
  }
}

export function useLexer() {
  const [state, dispatch] = useReducer(lexerReducer, initialLexerState);

  const consume = useCallback((symbol: string) => {
    dispatch({ type: 'CONSUME', symbol });
  }, []);
  const backspace = useCallback(() => dispatch({ type: 'BACKSPACE' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);
  const clearHistory = useCallback(() => dispatch({ type: 'CLEAR_HISTORY' }), []);

  return useMemo(
    () => ({ ...state, consume, backspace, reset, clearHistory }),
    [state, consume, backspace, reset, clearHistory],
  );
}
