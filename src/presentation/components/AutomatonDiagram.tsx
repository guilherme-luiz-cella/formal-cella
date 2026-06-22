import { AnimatePresence, motion } from 'framer-motion';
import type { DFAState } from '@/domain/automaton';
import type { TraceEntry } from '@/application/useLexer';

interface Props {
  currentState: DFAState;
  lastTrace?: TraceEntry;
}

interface NodeDef {
  id: DFAState;
  label: string;
  sub: string;
  x: number;
  y: number;
  accepting: boolean;
}

const NODES: ReadonlyArray<NodeDef> = [
  { id: 'START', label: 'q₀', sub: 'início', x: 110, y: 150, accepting: false },
  { id: 'READING', label: 'q₁', sub: 'aceitação', x: 360, y: 150, accepting: true },
  { id: 'DEAD', label: 'qd', sub: 'rejeição', x: 610, y: 150, accepting: false },
];

interface EdgeDef {
  key: string;
  from: DFAState;
  to: DFAState;
  label: string;
  path: string;
  labelPos: { x: number; y: number };
}

const EDGES: ReadonlyArray<EdgeDef> = [
  {
    key: 'start->reading',
    from: 'START',
    to: 'READING',
    label: '[a-z]',
    path: 'M 152 150 L 318 150',
    labelPos: { x: 235, y: 138 },
  },
  {
    key: 'start->dead',
    from: 'START',
    to: 'DEAD',
    label: 'outro',
    path: 'M 145 180 Q 360 270 575 180',
    labelPos: { x: 360, y: 258 },
  },
  {
    key: 'reading->reading',
    from: 'READING',
    to: 'READING',
    label: '[a-z]',
    path: 'M 340 110 C 320 50, 400 50, 380 110',
    labelPos: { x: 360, y: 48 },
  },
  {
    key: 'reading->dead',
    from: 'READING',
    to: 'DEAD',
    label: 'outro',
    path: 'M 402 150 L 568 150',
    labelPos: { x: 485, y: 138 },
  },
  {
    key: 'dead->dead',
    from: 'DEAD',
    to: 'DEAD',
    label: 'qualquer',
    path: 'M 590 110 C 570 50, 650 50, 630 110',
    labelPos: { x: 610, y: 48 },
  },
];

export function AutomatonDiagram({ currentState, lastTrace }: Props) {
  const activeKey = lastTrace
    ? EDGES.find((e) => e.from === lastTrace.from && e.to === lastTrace.to)?.key
    : undefined;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 shadow-2xl backdrop-blur">
      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-widest text-slate-500">
        <span>Autômato Finito</span>
        <span>δ: Q × Σ → Q</span>
      </div>

      <svg
        viewBox="0 0 720 300"
        className="h-auto w-full"
        role="img"
        aria-label="Diagrama do autômato finito"
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
          </marker>
          <marker
            id="arrow-active"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#818cf8" />
          </marker>
        </defs>

        {EDGES.map((e) => {
          const isActive = e.key === activeKey;
          return (
            <g key={e.key}>
              <path
                d={e.path}
                fill="none"
                stroke={isActive ? '#818cf8' : '#334155'}
                strokeWidth={isActive ? 2.5 : 1.5}
                markerEnd={isActive ? 'url(#arrow-active)' : 'url(#arrow)'}
                className="transition-[stroke,stroke-width] duration-300"
              />
              {isActive && (
                <motion.path
                  key={`${e.key}-${lastTrace?.symbol}-${lastTrace?.from}`}
                  d={e.path}
                  fill="none"
                  stroke="#a5b4fc"
                  strokeWidth={3}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0.95 }}
                  animate={{ pathLength: 1, opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              )}
              <text
                x={e.labelPos.x}
                y={e.labelPos.y}
                textAnchor="middle"
                className="fill-slate-400 text-[12px]"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                {e.label}
              </text>
            </g>
          );
        })}

        <path
          d="M 50 150 L 88 150"
          stroke="#64748b"
          strokeWidth={1.5}
          fill="none"
          markerEnd="url(#arrow)"
        />
        <text
          x={42}
          y={138}
          textAnchor="end"
          className="fill-slate-500 text-[10px] uppercase tracking-widest"
        >
          start
        </text>

        {NODES.map((n) => {
          const isCurrent = n.id === currentState;
          const fill =
            n.id === 'DEAD'
              ? isCurrent ? '#7f1d1d' : '#1e1b1b'
              : n.accepting
                ? isCurrent ? '#14532d' : '#0f1e16'
                : isCurrent ? '#312e81' : '#0f172a';
          const stroke =
            n.id === 'DEAD' ? '#ef4444' : n.accepting ? '#22c55e' : '#818cf8';

          return (
            <g key={n.id}>
              {isCurrent && (
                <motion.circle
                  cx={n.x}
                  cy={n.y}
                  r={30}
                  fill="none"
                  stroke={stroke}
                  strokeOpacity={0.5}
                  initial={{ r: 30, opacity: 0.8 }}
                  animate={{ r: 46, opacity: 0 }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
              <motion.circle
                cx={n.x}
                cy={n.y}
                r={30}
                fill={fill}
                stroke={stroke}
                strokeWidth={isCurrent ? 3 : 1.5}
                animate={{ scale: isCurrent ? 1.06 : 1 }}
                style={{ originX: `${n.x}px`, originY: `${n.y}px` }}
                transition={{ type: 'spring', stiffness: 240, damping: 18 }}
              />
              {n.accepting && (
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={24}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={1.5}
                />
              )}
              <text
                x={n.x}
                y={n.y + 5}
                textAnchor="middle"
                className="select-none fill-slate-100 text-[18px] font-semibold"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                {n.label}
              </text>
              <text
                x={n.x}
                y={n.y + 50}
                textAnchor="middle"
                className="fill-slate-500 text-[11px] uppercase tracking-widest"
              >
                {n.sub}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-2 flex items-center justify-center gap-6 text-xs text-slate-500">
        <Legend color="#818cf8" label="estado atual" />
        <Legend color="#22c55e" label="aceitação" />
        <Legend color="#ef4444" label="rejeição (trap)" />
      </div>

      <AnimatePresence mode="wait">
        {lastTrace && (
          <motion.div
            key={`${lastTrace.symbol}-${lastTrace.from}-${lastTrace.to}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-center text-xs text-slate-400"
          >
            Última transição:{' '}
            <code className="rounded bg-slate-800 px-1.5 py-0.5 text-brand-400">
              δ({lastTrace.from}, {lastTrace.symbol}) = {lastTrace.to}
            </code>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="inline-block size-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
