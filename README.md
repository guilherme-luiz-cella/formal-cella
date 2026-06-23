# CellaLang - Analisador Lexico (TDE 2026)

**URI Campus Erechim - Dep. de Engenharias e Ciencia da Computacao - Prof. Fabio Zanin**

**CellaLang** e uma linguagem inventada para este TDE de Linguagens
Formais. O analisador lexico e um **Automato Finito Deterministico
(AFD)** cujo conjunto de estados e o alfabeto sao **derivados em tempo
de execucao a partir da gramatica** que o usuario edita.

A gramatica e simplesmente um **conjunto de palavras-chave (tokens)**.
Cada palavra configurada e um token aceito; qualquer outra entrada e
rejeitada. O AFD e o **trie das palavras**.

**Deploy:** https://formal.cella.website *(dominio em propagacao)* - fallback: https://formal-cella.pages.dev

---

## 1. Especificacao da linguagem

### 1.1 Gramatica configuravel

A gramatica e um conjunto finito de tokens:

```
G = { w_1, w_2, ..., w_n }
```

Cada `w_i` e uma palavra qualquer sobre os caracteres digitados pelo
usuario. Adicionar e remover palavras no painel **Gramatica - tokens
aceitos** reconstroi o AFD imediatamente.

### 1.2 Classes de token

Apenas dois resultados possiveis:

| Kind     | Regra                                                |
| ---      | ---                                                  |
| `KEYWORD`| token e exatamente igual a alguma palavra da gramatica |
| `INVALID`| qualquer outra coisa (prefixo, sufixo extra, palavra desconhecida) |

### 1.3 Separador

O **espaco** nao pertence a Sigma. E o separador que finaliza o token
corrente. Pressionar **espaco** ou **Enter** dispara a avaliacao do
buffer.

## 2. Definicao formal do AFD

O AFD e o **trie** das palavras configuradas:

```
M = (Q, Sigma, delta, q_0, F)

Q       = todo prefixo (inclusive vazio) de toda palavra de G, mais qd
Sigma   = uniao dos caracteres que aparecem em alguma palavra de G
q_0     = ""                                  (prefixo vazio)
F       = G                                  (so as palavras inteiras)

delta : Q x Sigma -> Q
  delta(s, c) = s + c          se s + c e prefixo de alguma palavra
  delta(s, c) = qd             caso contrario
  delta(qd, *) = qd            (estado-armadilha)
```

### 2.1 Exemplo

Para `G = { let, if, in }`:

```
Q       = { "", l, le, let, i, if, in, qd }
Sigma   = { l, e, t, i, f, n }
F       = { let, if, in }
```

Tabela de transicao parcial:

| Estado | l   | e   | t   | i   | f   | n   | Final |
| ---    | --- | --- | --- | --- | --- | --- | ---   |
| `q_0`  | q_1 | -   | -   | q_4 | -   | -   |       |
| `q_1`  | -   | q_2 | -   | -   | -   | -   |       |
| `q_2`  | -   | -   | q_3 | -   | -   | -   |       |
| `q_3`  | -   | -   | -   | -   | -   | -   | sim   |
| `q_4`  | -   | -   | -   | -   | q_5 | q_6 |       |
| `q_5`  | -   | -   | -   | -   | -   | -   | sim   |
| `q_6`  | -   | -   | -   | -   | -   | -   | sim   |
| `qd`   | -   | -   | -   | -   | -   | -   |       |

A enumeracao `q_i` segue a ordem **largura por profundidade** dos
prefixos (prefixos mais curtos primeiro).

## 3. Arquitetura (DDD)

```
src/
|-- domain/                       # regras puras, sem React/DOM
|   |-- grammar.ts                # Grammar = { keywords: Set<string> }
|   |-- automaton.ts              # buildDFA, step, run, stateLabel
|   |-- token.ts                  # evaluateToken (KEYWORD ou INVALID)
|   `-- __tests__/
|-- application/                  # orquestracao
|   |-- useLexer.ts               # reducer + hook React
|   `-- __tests__/
`-- presentation/                 # UI / framer-motion
    |-- App.tsx
    `-- components/
        |-- TransitionTable.tsx   # tabela delta animada
        |-- GrammarEditor.tsx     # chips de tokens aceitos
        |-- TokenInput.tsx        # captura tecla-a-tecla
        |-- LiveBuffer.tsx        # buffer + estado em tempo real
        |-- TraceTape.tsx         # fita de simbolos consumidos
        |-- TokenHistory.tsx      # historico aceito/rejeitado
        `-- Header.tsx
```

- **Domain** - `automaton.ts` constroi o AFD a partir da `Grammar`.
  Funcoes `step`, `run`, `evaluateToken` sao puras e nao dependem
  de React.
- **Application** - `useLexer.ts` mantem buffer, estado, trace,
  historico e a `Grammar` corrente. `SET_GRAMMAR` reconstroi o AFD
  e zera o buffer (delta mudou).
- **Presentation** - reage ao estado vindo da application. A tabela
  e os chips animam por meio do framer-motion.

## 4. Como funciona, passo a passo

1. O usuario adiciona palavras no painel **Gramatica**. Cada palavra
   vira um chip; o AFD e reconstruido a cada alteracao.
2. O usuario digita uma tecla no campo de entrada.
3. `TokenInput` intercepta o `keydown` e despacha `CONSUME(symbol)`.
4. O reducer chama `step(dfa, estadoAtual, symbol)` - funcao pura do
   domain.
5. O simbolo lido, o estado de origem e o de destino entram na **fita
   de execucao**. A celula correspondente na tabela `delta` pulsa em
   ciano.
6. Quando **espaco** (ou Enter) e pressionado, o reducer chama
   `evaluateToken(dfa, buffer)`. Se o estado final estiver em F, o
   token vai para o historico como **ACEITO / KEYWORD**; caso
   contrario **REJEITADO / INVALID**.
7. O buffer e o trace sao resetados; o automato volta a `q_0`.

## 5. Exemplos (gramatica padrao: let print if else while true false)

| Entrada | Estado final | Aceito? | Kind    |
| ---     | ---          | ---     | ---     |
| `let`   | `let`        | sim     | KEYWORD |
| `if`    | `if`         | sim     | KEYWORD |
| `el`    | `el`         | nao     | INVALID |
| `lets`  | `qd`         | nao     | INVALID |
| `foo`   | `qd`         | nao     | INVALID |

## 6. Como rodar localmente

Pre-requisitos: Node >= 18 e `npm`.

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # roda todos os testes (vitest)
npm run build        # gera dist/
npm run preview      # serve o dist/ localmente
```

## 7. Como fazer o deploy (Cloudflare Pages)

O projeto esta configurado para Cloudflare Pages via `wrangler.toml`.

```bash
# autentique-se (uma vez)
npx wrangler login

# crie o projeto (apenas na primeira vez)
npx wrangler pages project create formal-cella --production-branch main

# deploy
npm run deploy
```

Apos o primeiro deploy, vincule o dominio `formal.cella.website` no
painel da Cloudflare:

`Cloudflare Dashboard -> Workers & Pages -> formal-cella -> Custom domains -> Set up a custom domain`

## 8. Testes

Cobertura do dominio e da application:

| Arquivo | Foco |
| --- | --- |
| `domain/__tests__/automaton.test.ts` | `buildDFA` (prefixos, alfabeto, accepting), `step`, `run`, `stateLabel` |
| `domain/__tests__/token.test.ts`     | `evaluateToken` para keyword, prefixo, sufixo extra, desconhecido |
| `domain/__tests__/grammar.test.ts`   | helpers de string, gramaticas distintas geram automatos distintos |
| `application/__tests__/useLexer.test.ts` | reducer completo: walk, finalize, backspace, reset, `SET_GRAMMAR`, cap |

Execute com `npm test`.

## 9. Tecnologias

- **Vite** - bundler e dev server
- **React 18 + TypeScript** - UI
- **Tailwind CSS** - paleta inspirada na Steam (navy + ciano)
- **Framer Motion** - animacoes declarativas
- **Vitest + Testing Library** - testes
- **Cloudflare Pages + Wrangler** - hospedagem estatica

## 10. Criterios de avaliacao atendidos

1. Permite digitacao do token (campo de entrada controlado).
2. Acompanhamento simbolo-a-simbolo (tabela delta com pulso na celula
   destino + fita de execucao).
3. Aceita ou recusa tokens propostos com base no AFD.
4. Execucao estavel (todos os testes passam, build sem warnings).
5. Interface clara, focada no funcionamento da maquina de estados.
6. Algoritmo reflete o AFD - `delta` e literalmente uma funcao pura
   construida a partir da gramatica.

---

**Autor:** Guilherme Luiz Cella
**Disciplina:** Linguagens Formais - 2026/1
**Apresentacao:** 01/07/2026
