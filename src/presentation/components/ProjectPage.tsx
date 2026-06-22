import { useMemo } from 'react';
import { marked } from 'marked';
import readmeRaw from '../../../README.md?raw';

marked.setOptions({ gfm: true, breaks: false });

export function ProjectPage() {
  const html = useMemo(() => marked.parse(readmeRaw) as string, []);

  return (
    <div className="mx-auto min-h-full max-w-4xl px-4 py-8 md:py-12">
      <nav className="mb-8 flex items-center justify-between text-xs uppercase tracking-widest">
        <a
          href="#/"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-slate-300 transition hover:border-brand-500/50 hover:text-brand-400"
        >
          ← Voltar
        </a>
        <a
          href="https://github.com/guilherme-luiz-cella/formal-cella"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-slate-300 transition hover:border-brand-500/50 hover:text-brand-400"
        >
          GitHub
        </a>
      </nav>

      <article
        className="readme-prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
