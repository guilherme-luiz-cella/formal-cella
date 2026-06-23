import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { marked } from 'marked';
import readmeRaw from '../../../README.md?raw';

marked.setOptions({ gfm: true, breaks: false });

export function ProjectPage() {
  const html = useMemo(() => marked.parse(readmeRaw) as string, []);

  return (
    <div className="mx-auto min-h-full max-w-4xl px-4 py-8 md:py-12">
      <motion.nav
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-8 flex items-center justify-between gap-3 text-xs uppercase tracking-widest"
      >
        <a
          href="#/"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-slate-300 transition hover:border-brand-500/50 hover:text-brand-400"
        >
          Voltar ao lexer
        </a>
        <div className="flex items-center gap-2">
          <a
            href="https://formal-cella.pages.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-slate-300 transition hover:border-brand-500/50 hover:text-brand-400"
          >
            Deploy
          </a>
          <a
            href="https://github.com/guilherme-luiz-cella/formal-cella"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-slate-300 transition hover:border-brand-500/50 hover:text-brand-400"
          >
            GitHub
          </a>
        </div>
      </motion.nav>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="mb-6 rounded-2xl border border-brand-500/30 bg-brand-500/5 px-4 py-3 text-xs uppercase tracking-widest text-brand-400"
      >
        Documentacao do projeto CellaLang - renderizada do README.md
      </motion.div>

      <motion.article
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="readme-prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <footer className="mt-16 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
        URI Campus Erechim - Linguagens Formais - TDE 2026
      </footer>
    </div>
  );
}
