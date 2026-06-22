/**
 * Domain layer — Deterministic Finite Automaton (DFA).
 *
 * Formal definition  M = (Q, Σ, δ, q0, F)
 *   Q  = { q0, q1, qd }
 *   Σ  = { a..z }              (lowercase letters)
 *   δ  : Q × Σ → Q              (transition function below)
 *   q0 = START                 (initial state)
 *   F  = { q1 }                (accepting states)
 *
 * Language recognised: L(M) = { w ∈ {a..z}+ }  — any non-empty word of
 * lowercase letters. The space character is the token separator and is
 * handled at the application layer (finalisation), not by δ.
 */
export type DFAState = 'START' | 'READING' | 'DEAD';

export const ACCEPTING_STATES: ReadonlySet<DFAState> = new Set<DFAState>(['READING']);

export const INITIAL_STATE: DFAState = 'START';

const LOWERCASE_RE = /^[a-z]$/;

export type SymbolClass = 'LETTER' | 'INVALID';

export function classifySymbol(ch: string): SymbolClass {
  return LOWERCASE_RE.test(ch) ? 'LETTER' : 'INVALID';
}

/**
 * δ — Single deterministic transition. Pure function. Given the current
 * state and an input symbol, returns the next state. Any symbol outside
 * Σ traps the automaton in DEAD until the token is finalised.
 */
export function step(state: DFAState, symbol: string): DFAState {
  const cls = classifySymbol(symbol);

  switch (state) {
    case 'START':
      return cls === 'LETTER' ? 'READING' : 'DEAD';
    case 'READING':
      return cls === 'LETTER' ? 'READING' : 'DEAD';
    case 'DEAD':
      return 'DEAD';
  }
}

export function isAccepting(state: DFAState): boolean {
  return ACCEPTING_STATES.has(state);
}

/**
 * Run the automaton against a full token (no separators inside).
 * Returns the final state reached.
 */
export function run(token: string, from: DFAState = INITIAL_STATE): DFAState {
  let s = from;
  for (const ch of token) {
    s = step(s, ch);
  }
  return s;
}

/** Symbolic label shown to the user for each transition. */
export function symbolLabel(symbol: string): string {
  if (symbol === ' ') return '␣';
  return symbol;
}
