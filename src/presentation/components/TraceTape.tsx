import { AnimatePresence, motion } from 'framer-motion';
import { DEAD, stateLabel, type DFA } from '@/domain/automaton';
import type { TraceEntry } from '@/application/useLexer';

interface Props {
  dfa: DFA;
  entries: ReadonlyArray<TraceEntry>;
}

export function TraceTape({ dfa, entries }: Props) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-widest text-slate-500">
        <span>Fita de execução</span>
        <span>{entries.length} símbolo(s)</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence initial={false}>
          {entries.length === 0 && (
            <motion.span
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-slate-600"
            >
              Aguardando o primeiro símbolo…
            </motion.span>
          )}
          {entries.map((entry, i) => {
            const dead = entry.to === DEAD;
            const accepting = entry.to !== DEAD && dfa.accepting.has(entry.to);
            const cls = dead
              ? 'border-rose-500/40 bg-rose-500/5 text-rose-200'
              : accepting
                ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-200'
                : 'border-brand-500/40 bg-brand-500/5 text-brand-300';
            return (
              <motion.div
                key={`${i}-${entry.symbol}-${entry.to}`}
                initial={{ opacity: 0, y: -8, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className={`flex flex-col items-center rounded-xl border px-3 py-2 ${cls}`}
              >
                <span className="font-mono text-lg leading-none">
                  {entry.symbol}
                </span>
                <span className="mt-1 text-[10px] uppercase tracking-widest opacity-70">
                  {stateLabel(dfa, entry.from)}→{stateLabel(dfa, entry.to)}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
