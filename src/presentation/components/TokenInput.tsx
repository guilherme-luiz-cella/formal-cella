import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Props {
  buffer: string;
  onConsume: (symbol: string) => void;
  onBackspace: () => void;
  onReset: () => void;
}

/**
 * Captures keystrokes one at a time and feeds them to the lexer. The
 * `value` attribute is bound to the live buffer so React stays the source
 * of truth; we intercept keys via `onKeyDown` so each symbol triggers
 * exactly one DFA transition.
 */
export function TokenInput({ buffer, onConsume, onBackspace, onReset }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      onBackspace();
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onReset();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      onConsume(' '); // finalise on Enter as well
      return;
    }
    // Single printable character (length 1 filters out arrows, F-keys, etc.)
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      onConsume(e.key);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4"
    >
      <label
        htmlFor="lexer-input"
        className="block text-xs uppercase tracking-widest text-slate-500"
      >
        Digite um token (pressione <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-brand-400">espaço</kbd> para finalizar)
      </label>
      <input
        id="lexer-input"
        ref={ref}
        value={buffer}
        onChange={() => { /* controlled via onKeyDown */ }}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder="ex.: alfa beta 123abc"
        className="mt-2 w-full bg-transparent text-2xl tracking-wide text-slate-100 outline-none placeholder:text-slate-700"
      />
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>
          <kbd className="rounded bg-slate-800 px-1.5 py-0.5">Esc</kbd> reinicia
          ·{' '}
          <kbd className="rounded bg-slate-800 px-1.5 py-0.5">⌫</kbd> apaga
        </span>
        <button
          onClick={onReset}
          className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-brand-500/60 hover:text-brand-400"
        >
          reiniciar token
        </button>
      </div>
    </motion.div>
  );
}
