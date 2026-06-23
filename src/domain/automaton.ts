import type { Grammar } from './grammar';
import { DEFAULT_GRAMMAR } from './grammar';

/**
 * Domain layer — Deterministic Finite Automaton built from a keyword
 * set. The DFA is a trie of the configured keywords:
 *
 *   - States = every prefix of every configured keyword, plus DEAD.
 *   - q0     = the empty prefix ''.
 *   - F      = the set of complete keywords.
 *   - δ      : Q × Σ → Q
 *               δ(s, c) = s + c     if s + c is a prefix of some keyword
 *               δ(s, c) = DEAD      otherwise
 *               δ(DEAD, *)          = DEAD
 *
 * Σ is the union of every character that appears in some keyword. This
 * means changing the keyword set automatically changes both the
 * topology and the alphabet — the DFA is regenerated from scratch.
 */

export const DEAD: DEAD = 'DEAD';
export type DEAD = 'DEAD';

/** A DFA state is either a prefix string or the dead/trap marker. */
export type DFAState = string | DEAD;

export const INITIAL_STATE: DFAState = '';

export interface DFA {
  readonly grammar: Grammar;
  readonly prefixes: ReadonlyArray<string>;   // every reachable prefix, '' first
  readonly accepting: ReadonlySet<string>;    // the keywords themselves
  /** transitions[fromPrefix][char] = next prefix. Missing → DEAD. */
  readonly transitions: ReadonlyMap<string, ReadonlyMap<string, string>>;
  /** the union of all symbols that appear in any keyword. */
  readonly alphabet: ReadonlySet<string>;
}

export function buildDFA(grammar: Grammar = DEFAULT_GRAMMAR): DFA {
  const prefixSet = new Set<string>(['']);
  const alphabet = new Set<string>();
  const accepting = new Set<string>();

  for (const kw of grammar.keywords) {
    if (kw.length === 0) continue;
    accepting.add(kw);
    for (let i = 0; i <= kw.length; i++) {
      prefixSet.add(kw.slice(0, i));
    }
    for (const ch of kw) alphabet.add(ch);
  }

  // Order prefixes so the empty one is first, then by length, then lex —
  // this gives a stable order for layout/iteration.
  const prefixes = [...prefixSet].sort((a, b) => {
    if (a.length !== b.length) return a.length - b.length;
    return a < b ? -1 : a > b ? 1 : 0;
  });

  const transitions = new Map<string, Map<string, string>>();
  for (const p of prefixes) {
    const row = new Map<string, string>();
    for (const ch of alphabet) {
      const next = p + ch;
      if (prefixSet.has(next)) row.set(ch, next);
    }
    transitions.set(p, row);
  }

  return { grammar, prefixes, accepting, transitions, alphabet };
}

export function step(dfa: DFA, state: DFAState, symbol: string): DFAState {
  if (state === DEAD) return DEAD;
  const row = dfa.transitions.get(state);
  const next = row?.get(symbol);
  return next === undefined ? DEAD : next;
}

export function isAccepting(dfa: DFA, state: DFAState): boolean {
  return state !== DEAD && dfa.accepting.has(state);
}

export function run(dfa: DFA, token: string, from: DFAState = INITIAL_STATE): DFAState {
  let s = from;
  for (const ch of token) {
    s = step(dfa, s, ch);
  }
  return s;
}

/** Human-readable label for a symbol when shown in the trace. */
export function symbolLabel(symbol: string): string {
  if (symbol === ' ') return '␣';
  return symbol;
}

/** Friendly state label for UI (q₀, q₁, … in insertion order, qd for DEAD). */
export function stateLabel(dfa: DFA, state: DFAState): string {
  if (state === DEAD) return 'qd';
  const idx = dfa.prefixes.indexOf(state);
  if (idx < 0) return '?';
  return `q${subscript(idx)}`;
}

function subscript(n: number): string {
  const map = '₀₁₂₃₄₅₆₇₈₉';
  return String(n)
    .split('')
    .map((d) => map[+d])
    .join('');
}
