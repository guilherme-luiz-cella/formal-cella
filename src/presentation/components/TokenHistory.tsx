import { AnimatePresence, motion } from 'framer-motion';
import type { RecognisedToken, TokenKind } from '@/domain/token';
import { stateLabel, type DFA } from '@/domain/automaton';

interface Props {
  dfa: DFA;
  tokens: ReadonlyArray<RecognisedToken>;
  onClear: () => void;
}

export function TokenHistory({ dfa, tokens, onClear }: Props) {
  const accepted = tokens.filter((t) => t.status === 'ACCEPTED').length;
  const rejected = tokens.length - accepted;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
            Histórico
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {accepted} aceito(s) · {rejected} rejeitado(s)
          </p>
        </div>
        <button
          onClick={onClear}
          disabled={tokens.length === 0}
          className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-brand-500/60 hover:text-brand-400 disabled:opacity-40 disabled:hover:border-slate-700 disabled:hover:text-slate-300"
        >
          limpar
        </button>
      </div>

      <ul className="mt-4 space-y-2">
        <AnimatePresence initial={false}>
          {tokens.length === 0 && (
            <motion.li
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-dashed border-slate-800 px-4 py-6 text-center text-sm text-slate-600"
            >
              Nenhum token reconhecido ainda. Digite algo e pressione
              <span className="mx-1 rounded bg-slate-800 px-1.5 py-0.5 text-brand-400">
                espaço
              </span>
              .
            </motion.li>
          )}
          {tokens.map((t) => (
            <motion.li
              key={t.id}
              layout
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 ${
                t.status === 'ACCEPTED'
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-rose-500/30 bg-rose-500/5'
              }`}
            >
              <div className="min-w-0">
                <div className="truncate font-mono text-base text-slate-100">
                  {t.value}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500">
                  <KindBadge kind={t.kind} />
                  <span>estado · {stateLabel(dfa, t.finalState)}</span>
                </div>
              </div>
              <StatusBadge status={t.status} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function StatusBadge({ status }: { status: RecognisedToken['status'] }) {
  const ok = status === 'ACCEPTED';
  return (
    <motion.span
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${
        ok
          ? 'bg-emerald-500/15 text-emerald-300'
          : 'bg-rose-500/15 text-rose-300'
      }`}
    >
      {ok ? 'aceito' : 'rejeitado'}
    </motion.span>
  );
}

function KindBadge({ kind }: { kind: TokenKind }) {
  const styles: Record<TokenKind, string> = {
    KEYWORD: 'bg-fuchsia-500/15 text-fuchsia-300',
    INVALID: 'bg-rose-500/15 text-rose-300',
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-widest ${styles[kind]}`}
    >
      {kind}
    </span>
  );
}
