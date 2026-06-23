import { motion } from 'framer-motion';

export function Header() {
  return (
    <header className="text-center">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex flex-wrap items-center justify-center gap-3"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs uppercase tracking-widest text-brand-400">
          <span className="size-1.5 rounded-full bg-brand-400 animate-pulse" />
          CellaLang · Linguagens Formais · TDE 2026
        </span>
        <a
          href="#/project"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs uppercase tracking-widest text-slate-300 transition hover:border-brand-500/50 hover:text-brand-400"
        >
          /project
        </a>
        <a
          href="https://github.com/guilherme-luiz-cella/formal-cella"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs uppercase tracking-widest text-slate-300 transition hover:border-brand-500/50 hover:text-brand-400"
          aria-label="GitHub repository"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-3.5 fill-current"
          >
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.89-.39.98 0 1.97.13 2.89.39 2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.26 5.68.41.35.77 1.04.77 2.11 0 1.52-.01 2.75-.01 3.13 0 .31.21.68.8.56C20.71 21.38 24 17.08 24 12 24 5.65 18.85.5 12 .5z" />
          </svg>
          GitHub
        </a>
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mt-4 text-4xl font-semibold tracking-tight text-slate-50 md:text-5xl"
      >
        <span className="text-brand-400">CellaLang</span> Lexer
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="mx-auto mt-3 max-w-2xl text-sm text-slate-400 md:text-base"
      >
        Autômato finito determinístico cujo
        <code className="mx-1 rounded bg-slate-800 px-1.5 py-0.5 text-brand-400">Σ</code>
        e estados são derivados do conjunto de
        <code className="mx-1 rounded bg-slate-800 px-1.5 py-0.5 text-brand-400">keywords</code>
        que você define. Cada palavra é um token; tudo o mais é
        rejeitado. Separador
        <code className="mx-1 rounded bg-slate-800 px-1.5 py-0.5 text-brand-400">␣</code>
        finaliza o token.
      </motion.p>
    </header>
  );
}
