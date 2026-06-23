import { isAccepting, run, type DFA, type DFAState } from './automaton';

export type TokenStatus = 'ACCEPTED' | 'REJECTED';

export type TokenKind = 'KEYWORD' | 'INVALID';

export interface RecognisedToken {
  readonly id: string;
  readonly value: string;
  readonly status: TokenStatus;
  readonly kind: TokenKind;
  readonly finalState: DFAState;
  readonly at: number;
}

/**
 * A token is accepted iff it is non-empty AND the automaton finishes in
 * an accepting state — i.e. the token is exactly equal to one of the
 * configured keywords.
 */
export function evaluateToken(
  dfa: DFA,
  value: string,
): {
  status: TokenStatus;
  kind: TokenKind;
  finalState: DFAState;
} {
  if (value.length === 0) {
    return { status: 'REJECTED', kind: 'INVALID', finalState: '' };
  }
  const finalState = run(dfa, value);
  const ok = isAccepting(dfa, finalState);
  return {
    status: ok ? 'ACCEPTED' : 'REJECTED',
    kind: ok ? 'KEYWORD' : 'INVALID',
    finalState,
  };
}
