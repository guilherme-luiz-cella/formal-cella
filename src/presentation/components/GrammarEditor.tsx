import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DEFAULT_GRAMMAR,
  grammarFromKeywords,
  type Grammar,
} from '@/domain/grammar';

interface Props {
  grammar: Grammar;
  onChange: (g: Grammar) => void;
}

/**
 * Presentation — keyword-set editor. The DFA is a trie over these
 * keywords, so adding / removing a word changes the automaton.
 * Each chip is one accepted token.
 */
export function GrammarEditor({ grammar, onChange }: Props) {
  const [keywords, setKeywords] = useState<string[]>(() => [...grammar.keywords].sort());
  const [draft, setDraft] = useState('');

  // Keep local UI in sync if the parent grammar changes externally.
  useEffect(() => {
    setKeywords([...grammar.keywords].sort());
  }, [grammar]);

  function commit(next: string[]) {
    setKeywords(next);
    onChange(grammarFromKeywords(next));
  }

  function add(word: string) {
    const w = word.trim();
    if (!w) return;
    if (keywords.includes(w)) {
      setDraft('');
      return;
    }
    commit([...keywords, w].sort());
    setDraft('');
  }

  function remove(word: string) {
    commit(keywords.filter((k) => k !== word));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      add(draft);
      return;
    }
    if (e.key === 'Backspace' && draft.length === 0 && keywords.length > 0) {
      e.preventDefault();
      remove(keywords[keywords.length - 1]);
    }
  }

  function resetDefault() {
    commit([...DEFAULT_GRAMMAR.keywords].sort());
  }
  function clearAll() {
    commit([]);
  }

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-brand-500/30 bg-slate-900/60 p-4 shadow-2xl backdrop-blur"
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-400">
            Gramática · tokens aceitos
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Cada palavra é um token. O AFD é o trie destas palavras.
            Pressione <kbd className="rounded bg-slate-800 px-1 py-0.5">Enter</kbd>,
            <kbd className="ml-1 rounded bg-slate-800 px-1 py-0.5">espaço</kbd> ou
            <kbd className="ml-1 rounded bg-slate-800 px-1 py-0.5">,</kbd> para adicionar.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearAll}
            disabled={keywords.length === 0}
            className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-rose-500/60 hover:text-rose-300 disabled:opacity-40"
          >
            limpar
          </button>
          <button
            onClick={resetDefault}
            className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-brand-500/60 hover:text-brand-400"
          >
            padrão
          </button>
        </div>
      </header>

      <div className="mt-4 flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
        <AnimatePresence initial={false}>
          {keywords.map((kw) => (
            <motion.span
              key={kw}
              layout
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="inline-flex items-center gap-1 rounded-full border border-brand-500/40 bg-brand-500/15 px-3 py-1 font-mono text-sm text-brand-200"
            >
              {kw}
              <button
                onClick={() => remove(kw)}
                className="ml-1 rounded-full text-brand-300/70 transition hover:text-rose-300"
                aria-label={`remover ${kw}`}
              >
                ✕
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={keywords.length === 0 ? 'digite uma palavra…' : '+ adicionar'}
          spellCheck={false}
          autoComplete="off"
          className="min-w-[8rem] flex-1 bg-transparent font-mono text-sm text-slate-100 outline-none placeholder:text-slate-600"
        />
      </div>

      <div className="mt-3 text-[11px] text-slate-500">
        {keywords.length} palavra(s) · alfabeto Σ deduzido das palavras
      </div>
    </motion.section>
  );
}
