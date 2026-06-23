# CellaLang · Analisador Léxico (TDE 2026)

**URI Campus Erechim · Dep. de Engenharias e Ciência da Computação · Prof. Fabio Zanin**

**CellaLang** é uma pequena linguagem inventada para este TDE de
Linguagens Formais. O analisador léxico é um **Autômato Finito
Determinístico (AFD)** multi-token, com 7 estados, que distingue
**identificadores**, **palavras-reservadas (keywords)**, **números**
(inteiros e ponto flutuante) e **operadores** de caractere único.

**Deploy:** https://formal.cella.website *(domínio em propagação)* · fallback: https://formal-cella.pages.dev

---

## 1. Especificação da linguagem

### 1.1 Alfabeto `Σ`

```
Σ = LETTER ∪ DIGIT ∪ { . } ∪ OP

LETTER = [a-zA-Z_]
DIGIT  = [0-9]
OP     = { + - * / = ( ) ; , < > ! }
```

O **espaço** *não* pertence a `Σ`: ele é tratado pela camada de
aplicação como **separador**, finalizando o token corrente.

### 1.2 Classes de token reconhecidas

| Kind | Regex equivalente | Exemplos |
| --- | --- | --- |
| `KEYWORD`  | `let \| print \| if \| else \| while \| true \| false` | `let`, `if`, `true` |
| `IDENT`    | `[a-zA-Z_][a-zA-Z0-9_]*` (não-keyword) | `x`, `Foo_42`, `_tmp` |
| `NUMBER`   | `[0-9]+(\.[0-9]+)?` | `0`, `42`, `3.14` |
| `OPERATOR` | um único caractere de `OP` | `+`, `=`, `(` |
| `INVALID`  | (qualquer outra coisa) | `3.`, `++`, `a+b` |

`KEYWORD` é uma camada léxica: o AFD aceita o token como identificador
e a função `kindOf` reclassifica para `KEYWORD` se o lexema pertencer
ao conjunto de palavras reservadas.

## 2. Definição formal do AFD

```
M = (Q, Σ, δ, q₀, F)

Q  = { START, IN_IDENT, IN_INT, AFTER_DOT, IN_FLOAT, OP_DONE, DEAD }
Σ  = LETTER ∪ DIGIT ∪ { . } ∪ OP        (ver 1.1)
q₀ = START
F  = { IN_IDENT, IN_INT, IN_FLOAT, OP_DONE }
```

### 2.1 Função de transição δ

| de \ símbolo  | LETTER     | DIGIT      | `.`         | OP          | INVÁLIDO  |
| --- | --- | --- | --- | --- | --- |
| `START`       | IN_IDENT   | IN_INT     | DEAD        | OP_DONE     | DEAD      |
| `IN_IDENT`    | IN_IDENT   | IN_IDENT   | DEAD        | DEAD        | DEAD      |
| `IN_INT`      | DEAD       | IN_INT     | AFTER_DOT   | DEAD        | DEAD      |
| `AFTER_DOT`   | DEAD       | IN_FLOAT   | DEAD        | DEAD        | DEAD      |
| `IN_FLOAT`    | DEAD       | IN_FLOAT   | DEAD        | DEAD        | DEAD      |
| `OP_DONE`     | DEAD       | DEAD       | DEAD        | DEAD        | DEAD      |
| `DEAD`        | DEAD       | DEAD       | DEAD        | DEAD        | DEAD      |

`OP_DONE` é um estado de aceitação **terminal**: como os operadores
têm apenas um caractere, qualquer próximo símbolo dentro do mesmo
token leva ao trap `DEAD`. Use **espaço** para finalizar e iniciar
um novo token.

`AFTER_DOT` é um estado **não-aceitação intermediário** — exige um
dígito depois do ponto para virar `IN_FLOAT`. Por isso `3.` é
rejeitado e `3.14` é aceito.

## 3. Arquitetura (DDD)

```
src/
├── domain/                  # regras puras, sem React/DOM
│   ├── automaton.ts         # Q, Σ, δ, step, run, isAccepting, classifySymbol
│   ├── token.ts             # TokenKind, KEYWORDS, kindOf, evaluateToken
│   └── __tests__/
├── application/             # orquestração / casos de uso
│   ├── useLexer.ts          # reducer + hook React (lexerReducer)
│   └── __tests__/
└── presentation/            # UI / framer-motion
    ├── App.tsx
    └── components/
        ├── AutomatonDiagram.tsx   # SVG animado dos 7 estados
        ├── TokenInput.tsx         # captura tecla-a-tecla
        ├── LiveBuffer.tsx
        ├── TraceTape.tsx          # fita δ(q,a)=q'
        ├── TokenHistory.tsx       # histórico com badge de Kind
        └── Header.tsx
```

- **Domain** — funções puras (`step`, `run`, `kindOf`, `evaluateToken`).
  Não dependem de React, Vite ou framer-motion.
- **Application** — `useLexer.ts` orquestra o ciclo do token
  (acumular, finalizar no espaço, manter histórico). Reducer puro,
  testável sem renderização.
- **Presentation** — apenas reage ao estado vindo da application.
  Nenhuma regra de negócio mora aqui.

## 4. Como funciona, passo a passo

1. O usuário digita uma tecla no campo de entrada.
2. `TokenInput` intercepta o `keydown` e despacha `CONSUME(symbol)`.
3. O reducer chama `step(estadoAtual, symbol)` — função pura do domain.
4. O novo estado, o símbolo lido e a transição (`from → to`) entram
   na **fita de execução** (trace).
5. O diagrama destaca o novo estado e anima a aresta
   `δ(from, symbol) = to`.
6. Quando **espaço** é pressionado, o reducer chama
   `evaluateToken(buffer)`, que retorna `{ status, kind, finalState }`.
   O token vai para o histórico com badge **ACEITO/REJEITADO** e badge
   **KEYWORD / IDENT / NUMBER / OPERATOR / INVALID**.
7. O buffer e o trace são resetados; o autômato volta a `q₀`.

## 5. Exemplos

| Entrada    | Estado final | Aceito? | Kind     |
| ---        | ---          | ---     | ---      |
| `let`      | IN_IDENT     | ✅      | KEYWORD  |
| `Hello_42` | IN_IDENT     | ✅      | IDENT    |
| `42`       | IN_INT       | ✅      | NUMBER   |
| `3.14`     | IN_FLOAT     | ✅      | NUMBER   |
| `+`        | OP_DONE      | ✅      | OPERATOR |
| `3.`       | AFTER_DOT    | ❌      | INVALID  |
| `++`       | DEAD         | ❌      | INVALID  |
| `a+b`      | DEAD         | ❌      | INVALID  |
| `.5`       | DEAD         | ❌      | INVALID  |
| `@nope`    | DEAD         | ❌      | INVALID  |

## 6. Como rodar localmente

Pré-requisitos: Node ≥ 18 e `npm`.

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # roda os 84 testes (vitest)
npm run build        # gera dist/
npm run preview      # serve o dist/ localmente
```

## 7. Como fazer o deploy (Cloudflare Pages)

O projeto está configurado para Cloudflare Pages via `wrangler.toml`.

```bash
# autentique-se (uma vez)
npx wrangler login

# crie o projeto (apenas na primeira vez)
npx wrangler pages project create formal-cella --production-branch main

# deploy
npm run deploy
```

Após o primeiro deploy, vincule o domínio `formal.cella.website` no
painel da Cloudflare:

`Cloudflare Dashboard → Workers & Pages → formal-cella → Custom domains → Set up a custom domain`

## 8. Testes

**84 testes** cobrem o domínio e a application:

| Arquivo | Casos |
| --- | --- |
| `domain/__tests__/automaton.test.ts` | 61 — `classifySymbol`, `step` em cada estado, traps, `run` de tokens variados |
| `domain/__tests__/token.test.ts`     | 10 — IDENT vs KEYWORD, NUMBER (int/float), OPERATOR, INVALID, `kindOf` direto |
| `application/__tests__/useLexer.test.ts` | 13 — reducer completo, kinds no histórico, backspace, reset, cap de 50 |

Execute com `npm test`.

## 9. Tecnologias

- **Vite** — bundler e dev server
- **React 18 + TypeScript** — UI
- **Tailwind CSS** — estilos utilitários (paleta Steam: navy + ciano)
- **Framer Motion** — animações declarativas
- **Vitest + Testing Library** — testes
- **Cloudflare Pages + Wrangler** — hospedagem estática

## 10. Critérios de avaliação atendidos

1. Permite digitação do token (campo de entrada controlado).
2. Acompanhamento símbolo-a-símbolo (fita de execução + diagrama animado).
3. Aceita ou recusa tokens propostos com **classificação por kind**.
4. Execução estável (84 testes verdes, build sem warnings críticos).
5. Interface clara, focada na máquina de estados.
6. Algoritmo reflete fielmente o AFD — `δ` é literalmente uma função pura.

---

**Autor:** Guilherme Luiz Cella
**Disciplina:** Linguagens Formais — 2026/1
**Apresentação:** 01/07/2026
