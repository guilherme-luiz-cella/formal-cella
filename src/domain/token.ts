import { isAccepting, run, type DFAState } from './automaton';

export type TokenStatus = 'ACCEPTED' | 'REJECTED';

export interface RecognisedToken {
  readonly id: string;
  readonly value: string;
  readonly status: TokenStatus;
  readonly finalState: DFAState;
  readonly at: number;
}

/**
 * A token is accepted iff it is non-empty AND the automaton ends in an
 * accepting state after consuming all its symbols.
 */
export function evaluateToken(value: string): TokenStatus {
  if (value.length === 0) return 'REJECTED';
  const finalState = run(value);
  return isAccepting(finalState) ? 'ACCEPTED' : 'REJECTED';
}
