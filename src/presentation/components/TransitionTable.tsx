import { AnimatePresence, motion } from 'framer-motion';
import {
  DEAD,
  stateLabel,
  type DFA,
  type DFAState,
} from '@/domain/automaton';
import type { TraceEntry } from '@/application/useLexer';

interface Props {
  dfa: DFA;
  currentState: DFAState;
  lastTrace?: TraceEntry;
}

/**
 * Presentation — δ rendered as a transition table.
 *
 *   rows = states (q₀, q₁, … plus qd)
 *   cols = alphabet symbols + a final-state marker column
 *   cell = next state (or — when no transition exists)
 *
 * The current row pulses cyan; the destination cell of the last
 * transition flashes when a new symbol is consumed.
 */
export function TransitionTable({ dfa, currentState, lastTrace }: Props) {
  const alphabet = [...dfa.alphabet].sort();
  const rows: ReadonlyArray<DFAState> = [...dfa.prefixes, DEAD];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 shadow-2xl backdrop-blur">
      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-widest text-slate-500">
        <span>CellaLang · tabela de transição δ</span>
        <span>|Q|={dfa.prefixes.length + 1} · |Σ|={alphabet.length}</span>
      </div>

      <div className="mb-3 text-center text-sm font-semibold text-brand-400">
        Estado atual: <code className="rounded bg-slate-800 px-2 py-0.5">{stateLabel(dfa, currentState)}</code>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-max border-separate border-spacing-0 text-center text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 border border-slate-700 bg-slate-900 px-3 py-2 text-left font-semibold text-slate-200">
                Estado
              </th>
              {alphabet.map((ch) => (
                <th
                  key={ch}
                  className="border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-brand-400"
                >
                  {ch}
                </th>
              ))}
              <th className="border border-slate-700 bg-slate-900 px-3 py-2 font-semibold text-slate-200">
                Final
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {rows.map((s) => {
                const isCurrent = s === currentState;
                const rowLabel = stateLabel(dfa, s);
                const isAccepting = s !== DEAD && dfa.accepting.has(s);
                return (
                  <motion.tr
                    key={rowLabel}
                    layout
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className={
                      isCurrent
                        ? 'bg-brand-500/15'
                        : s === DEAD
                          ? 'bg-rose-500/5'
                          : ''
                    }
                  >
                    <td
                      className={`sticky left-0 z-[5] border border-slate-800 px-3 py-2 text-left font-mono ${
                        isCurrent
                          ? 'bg-brand-500/25 text-brand-200'
                          : s === DEAD
                            ? 'bg-rose-500/10 text-rose-300'
                            : 'bg-slate-950/60 text-slate-200'
                      }`}
                      title={s === DEAD ? 'trap' : `prefixo: "${s}"`}
                    >
                      {rowLabel}
                    </td>
                    {alphabet.map((ch) => {
                      const next = s === DEAD
                        ? DEAD
                        : (dfa.transitions.get(s)?.get(ch) ?? DEAD);
                      const isJustFired =
                        lastTrace !== undefined &&
                        lastTrace.from === s &&
                        lastTrace.symbol === ch;
                      const cellLabel = next === DEAD ? '—' : stateLabel(dfa, next);
                      return (
                        <td
                          key={ch}
                          className={`relative border border-slate-800 px-3 py-2 font-mono ${
                            next === DEAD
                              ? 'text-slate-600'
                              : 'text-slate-100'
                          }`}
                        >
                          {isJustFired && next !== DEAD && (
                            <motion.span
                              key={`${rowLabel}-${ch}-${lastTrace?.symbol}-${Date.now()}`}
                              initial={{
                                opacity: 0.9,
                                backgroundColor: 'rgba(102,192,244,0.55)',
                              }}
                              animate={{
                                opacity: 0,
                                backgroundColor: 'rgba(102,192,244,0)',
                              }}
                              transition={{ duration: 0.7, ease: 'easeOut' }}
                              className="pointer-events-none absolute inset-0"
                            />
                          )}
                          <span className="relative">{cellLabel}</span>
                        </td>
                      );
                    })}
                    <td className="border border-slate-800 px-3 py-2">
                      {isAccepting ? (
                        <span className="text-emerald-400">✓</span>
                      ) : (
                        <span className="text-slate-700">·</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <FinalStates dfa={dfa} />

      <AnimatePresence mode="wait">
        {lastTrace && (
          <motion.div
            key={`${lastTrace.symbol}-${lastTrace.from}-${lastTrace.to}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-center text-xs text-slate-400"
          >
            Última transição:{' '}
            <code className="rounded bg-slate-800 px-1.5 py-0.5 text-brand-400">
              δ({stateLabel(dfa, lastTrace.from)}, {lastTrace.symbol}) ={' '}
              {stateLabel(dfa, lastTrace.to)}
            </code>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FinalStates({ dfa }: { dfa: DFA }) {
  const finals = [...dfa.accepting].sort();
  if (finals.length === 0) {
    return (
      <p className="mt-3 text-center text-xs text-slate-500">
        Nenhum estado final: adicione palavras na gramática.
      </p>
    );
  }
  return (
    <p className="mt-3 text-center text-xs text-slate-500">
      <span className="text-slate-400">Estados finais:</span>{' '}
      {finals.map((kw, i) => (
        <span key={kw}>
          <code className="rounded bg-slate-800 px-1.5 py-0.5 text-brand-400">
            {stateLabel(dfa, kw)}
          </code>{' '}
          → <span className="text-slate-300">"{kw}"</span>
          {i < finals.length - 1 ? ' · ' : ''}
        </span>
      ))}
    </p>
  );
}
