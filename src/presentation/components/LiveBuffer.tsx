import { AnimatePresence, motion } from 'framer-motion';
import type { DFAState } from '@/domain/automaton';
import { isAccepting } from '@/domain/automaton';

interface Props {
  buffer: string;
  state: DFAState;
}

export function LiveBuffer({ buffer, state }: Props) {
  const status =
    buffer.length === 0
      ? 'idle'
      : state === 'DEAD'
        ? 'reject'
        : isAccepting(state)
          ? 'accept'
          : 'pending';

  const colour =
    status === 'accept'
      ? 'border-emerald-500/50 text-emerald-300'
      : status === 'reject'
        ? 'border-rose-500/50 text-rose-300'
        : status === 'pending'
          ? 'border-brand-500/50 text-brand-400'
          : 'border-slate-800 text-slate-500';

  const label =
    status === 'accept'
      ? 'seria aceito agora'
      : status === 'reject'
        ? 'seria rejeitado agora'
        : status === 'pending'
          ? 'em análise'
          : 'aguardando entrada';

  return (
    <motion.div
      layout
      className={`flex items-center justify-between gap-4 rounded-2xl border bg-slate-900/40 px-5 py-4 transition-colors ${colour}`}
    >
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-widest text-slate-500">
          buffer
        </div>
        <div className="mt-1 truncate font-mono text-xl">
          <AnimatePresence initial={false} mode="popLayout">
            {buffer.split('').map((ch, i) => (
              <motion.span
                key={`${i}-${ch}`}
                initial={{ opacity: 0, y: -8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.9 }}
                transition={{ duration: 0.18 }}
                className="inline-block"
              >
                {ch}
              </motion.span>
            ))}
          </AnimatePresence>
          {buffer.length === 0 && (
            <span className="text-slate-700">␣</span>
          )}
          <motion.span
            aria-hidden
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="ml-0.5 inline-block w-[2px] align-baseline"
            style={{ height: '1em', backgroundColor: 'currentColor' }}
          />
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-xs uppercase tracking-widest text-slate-500">
          estado · {state}
        </div>
        <div className="mt-1 text-sm">{label}</div>
      </div>
    </motion.div>
  );
}
