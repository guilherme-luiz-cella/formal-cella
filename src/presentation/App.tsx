import { useEffect, useState } from 'react';
import { useLexer } from '@/application/useLexer';
import { AutomatonDiagram } from './components/AutomatonDiagram';
import { TokenInput } from './components/TokenInput';
import { TraceTape } from './components/TraceTape';
import { TokenHistory } from './components/TokenHistory';
import { Header } from './components/Header';
import { LiveBuffer } from './components/LiveBuffer';
import { ProjectPage } from './components/ProjectPage';

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

export function App() {
  const route = useHashRoute();
  if (route.startsWith('#/project')) return <ProjectPage />;
  return <LexerPage />;
}

function LexerPage() {
  const lexer = useLexer();

  return (
    <div className="mx-auto min-h-full max-w-6xl px-4 py-8 md:py-12">
      <Header />

      <main className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section className="space-y-6">
          <AutomatonDiagram
            currentState={lexer.state}
            lastTrace={lexer.trace[lexer.trace.length - 1]}
          />
          <LiveBuffer buffer={lexer.buffer} state={lexer.state} />
          <TokenInput
            buffer={lexer.buffer}
            onConsume={lexer.consume}
            onBackspace={lexer.backspace}
            onReset={lexer.reset}
          />
          <TraceTape entries={lexer.trace} />
        </section>

        <aside>
          <TokenHistory
            tokens={lexer.history}
            onClear={lexer.clearHistory}
          />
        </aside>
      </main>

      <footer className="mt-16 text-center text-xs text-slate-500">
        <p>
          URI Campus Erechim · Dep. de Engenharias e Ciência da Computação ·
          Prof. Fabio Zanin · Linguagens Formais · TDE 2026
        </p>
      </footer>
    </div>
  );
}
