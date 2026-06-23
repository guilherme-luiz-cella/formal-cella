import { useCallback, useMemo, useReducer } from 'react';
import {
  buildDFA,
  INITIAL_STATE,
  step,
  type DFA,
  type DFAState,
} from '@/domain/automaton';
import { evaluateToken, type RecognisedToken } from '@/domain/token';
import {
  DEFAULT_GRAMMAR,
  type Grammar,
} from '@/domain/grammar';

/**
 * Application layer — orchestrates the lexer interaction. Holds:
 *   - the current Grammar (keyword set)
 *   - the DFA built from that grammar (regenerated on grammar change)
 *   - the live token buffer + DFA state
 *   - the trace of consumed symbols and intermediate states
 *   - the history of finalised tokens
 */

export interface TraceEntry {
  readonly symbol: string;
  readonly from: DFAState;
  readonly to: DFAState;
}

export interface LexerState {
  readonly grammar: Grammar;
  readonly dfa: DFA;
  readonly buffer: string;
  readonly state: DFAState;
  readonly trace: ReadonlyArray<TraceEntry>;
  readonly history: ReadonlyArray<RecognisedToken>;
}

const DEFAULT_DFA = buildDFA(DEFAULT_GRAMMAR);

export const initialLexerState: LexerState = {
  grammar: DEFAULT_GRAMMAR,
  dfa: DEFAULT_DFA,
  buffer: '',
  state: INITIAL_STATE,
  trace: [],
  history: [],
};

type Action =
  | { type: 'CONSUME'; symbol: string }
  | { type: 'BACKSPACE' }
  | { type: 'RESET' }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'SET_GRAMMAR'; grammar: Grammar };

function finaliseToken(dfa: DFA, value: string): RecognisedToken {
  const { status, kind, finalState } = evaluateToken(dfa, value);
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    value,
    status,
    kind,
    finalState,
    at: Date.now(),
  };
}

export function lexerReducer(state: LexerState, action: Action): LexerState {
  switch (action.type) {
    case 'CONSUME': {
      const ch = action.symbol;

      if (ch === ' ') {
        if (state.buffer.length === 0) return state;
        const token = finaliseToken(state.dfa, state.buffer);
        return {
          ...state,
          buffer: '',
          state: INITIAL_STATE,
          trace: [],
          history: [token, ...state.history].slice(0, 50),
        };
      }

      const next = step(state.dfa, state.state, ch);
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
      let s: DFAState = INITIAL_STATE;
      const trace: TraceEntry[] = [];
      for (const ch of nextBuffer) {
        const to = step(state.dfa, s, ch);
        trace.push({ symbol: ch, from: s, to });
        s = to;
      }
      return { ...state, buffer: nextBuffer, state: s, trace };
    }

    case 'RESET':
      return { ...state, buffer: '', state: INITIAL_STATE, trace: [] };

    case 'CLEAR_HISTORY':
      return { ...state, history: [] };

    case 'SET_GRAMMAR': {
      const dfa = buildDFA(action.grammar);
      return {
        ...state,
        grammar: action.grammar,
        dfa,
        buffer: '',
        state: INITIAL_STATE,
        trace: [],
      };
    }
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
  const setGrammar = useCallback(
    (grammar: Grammar) => dispatch({ type: 'SET_GRAMMAR', grammar }),
    [],
  );

  return useMemo(
    () => ({
      ...state,
      consume,
      backspace,
      reset,
      clearHistory,
      setGrammar,
    }),
    [state, consume, backspace, reset, clearHistory, setGrammar],
  );
}
