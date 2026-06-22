import { motion } from 'framer-motion';

export function Header() {
  return (
    <header className="text-center">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs uppercase tracking-widest text-brand-400"
      >
        <span className="size-1.5 rounded-full bg-brand-400 animate-pulse" />
        Linguagens Formais · TDE 2026
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mt-4 text-4xl font-semibold tracking-tight text-slate-50 md:text-5xl"
      >
        Analisador <span className="text-brand-400">Léxico</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="mx-auto mt-3 max-w-2xl text-sm text-slate-400 md:text-base"
      >
        Autômato finito determinístico que reconhece tokens sobre o alfabeto
        <code className="mx-1 rounded bg-slate-800 px-1.5 py-0.5 text-brand-400">[a-z]</code>
        e finaliza cada token ao detectar o separador
        <code className="mx-1 rounded bg-slate-800 px-1.5 py-0.5 text-brand-400">␣</code>.
      </motion.p>
    </header>
  );
}
