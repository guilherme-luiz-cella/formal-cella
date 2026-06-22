# Analisador Léxico · Linguagens Formais (TDE 2026)

**URI Campus Erechim · Dep. de Engenharias e Ciência da Computação · Prof. Fabio Zanin**

Implementação interativa de um **Analisador Léxico** baseado em um
**Autômato Finito Determinístico (AFD)**, atendendo ao Trabalho Discente
Efetivo (TDE) de Linguagens Formais — 2026/1.

🌐 **Deploy:** https://formal.cella.website *(domínio em propagação)* · fallback: https://formal-cella.pages.dev

---

## 1. Especificação atendida

| Requisito do enunciado | Implementação |
| --- | --- |
| Alfabeto `Σ = {a, b, c, ..., z}` (somente minúsculas) | `src/domain/automaton.ts` — `classifySymbol` (regex `/^[a-z]$/`) |
| Desconsiderar símbolos especiais | Símbolos fora de `Σ` levam o autômato ao estado de rejeição `qd` (trap) |
| Separador = espaço (branco) | Detectado pelo reducer da camada de aplicação (`useLexer.ts`) — não faz parte de `Σ` |
| Tokens = sentenças digitadas pelo usuário | Capturadas tecla-a-tecla em `TokenInput.tsx` |
| Reconhecer símbolo **concomitantemente** à digitação | Cada tecla aciona uma única transição `δ(estado, símbolo)` e a UI anima a aresta correspondente |
| Após o espaço, indicar token **reconhecido ou rejeitado** | `evaluateToken` é chamado no `reducer` e o token entra no histórico com badge **ACEITO** ou **REJEITADO** |
| Algoritmo refletir uma **máquina de estados** | `domain/automaton.ts` define `Q`, `Σ`, `δ`, `q₀`, `F` como funções puras; sem condicionais ad-hoc espalhados pela UI |

## 2. Definição formal do autômato

```
M = (Q, Σ, δ, q₀, F)

Q  = { q₀, q₁, qd }
Σ  = { a, b, c, ..., z }
q₀ = estado inicial
F  = { q₁ }                              (estado de aceitação)

δ : Q × Σ → Q
  δ(q₀, [a-z])  = q₁
  δ(q₀, outro)  = qd
  δ(q₁, [a-z])  = q₁
  δ(q₁, outro)  = qd
  δ(qd,  *   )  = qd                     (estado-armadilha)
```

**Linguagem reconhecida:** `L(M) = { w ∈ {a-z}⁺ }` — toda palavra não-vazia
formada apenas por letras minúsculas.

O espaço **não pertence a Σ**: ele é tratado pela camada de aplicação
como **separador**, finalizando o token corrente e emitindo o veredito.

## 3. Arquitetura (DDD)

O projeto segue uma separação clara em camadas de Domain-Driven Design:

```
src/
├── domain/                  # regras puras, sem React/DOM
│   ├── automaton.ts         # Q, Σ, δ, step, run, isAccepting
│   ├── token.ts             # evaluateToken, RecognisedToken
│   └── __tests__/           # testes unitários do AFD
├── application/             # orquestração / casos de uso
│   ├── useLexer.ts          # reducer + hook React (lexerReducer)
│   └── __tests__/           # testes integrados do reducer
└── presentation/            # UI / framer-motion
    ├── App.tsx
    └── components/
        ├── AutomatonDiagram.tsx   # SVG animado do AFD
        ├── TokenInput.tsx         # captura tecla-a-tecla
        ├── LiveBuffer.tsx         # buffer + status em tempo real
        ├── TraceTape.tsx          # fita de execução δ(q,a)=q'
        ├── TokenHistory.tsx       # histórico aceito/rejeitado
        └── Header.tsx
```

- **Domain** — `automaton.ts` e `token.ts` não dependem do React,
  de Vite ou do framer-motion. Podem ser portados para Node, Deno
  ou um worker isolado.
- **Application** — `useLexer.ts` orquestra o ciclo de vida do token
  (acumular símbolos, finalizar no espaço, manter histórico). É um
  `useReducer` puro, totalmente testável sem renderização.
- **Presentation** — apenas reage ao estado vindo da application e
  dispara ações. Nenhuma regra de negócio mora aqui.

## 4. Como funciona, passo a passo

1. O usuário digita uma tecla no campo de entrada.
2. `TokenInput` intercepta o `keydown` e despacha `CONSUME(symbol)`.
3. O reducer chama `step(estadoAtual, symbol)` — função pura do domain.
4. O novo estado, o símbolo lido e a transição (`from → to`) entram
   na **fita de execução** (trace).
5. O diagrama destaca o novo estado (anel pulsante) e anima a aresta
   `δ(from, symbol) = to`.
6. Quando a tecla **espaço** é pressionada, o reducer chama
   `evaluateToken(buffer)`. Se o estado final pertencer a `F`, o token
   vai para o histórico como **ACEITO**; caso contrário, **REJEITADO**.
7. O buffer e o trace são resetados; o autômato volta a `q₀`.

## 5. Animações

Todas as animações são feitas com **Framer Motion** + transições
**SVG nativas**:

- **Pulso no estado atual** — `motion.circle` com `repeat: Infinity`.
- **Aresta percorrida** — `pathLength` animado de 0 → 1 com fade out,
  destacando a aresta exata que foi atravessada na última transição.
- **Tape de execução** — entrada e saída de cada símbolo com
  `AnimatePresence` e mola (`type: 'spring'`).
- **Buffer** — cada caractere entra do topo, sai pelo fundo.
- **Histórico** — itens entram da direita, badge ACEITO/REJEITADO
  pulsa ao aparecer.

## 6. Como rodar localmente

Pré-requisitos: Node ≥ 18 e `npm`.

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # roda os 35 testes (vitest)
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
# ou diretamente:
npx wrangler pages deploy dist --project-name=formal-cella
```

Após o primeiro deploy, vincule o domínio `formal.cella.website` no
painel da Cloudflare:

`Cloudflare Dashboard → Workers & Pages → formal-cella → Custom domains → Set up a custom domain`

## 8. Testes

35 testes cobrem o domínio e a application:

| Arquivo | Casos |
| --- | --- |
| `domain/__tests__/automaton.test.ts` | 22 — `classifySymbol`, `step` em cada estado, `run`, traps |
| `domain/__tests__/token.test.ts` | 4 — aceitação / rejeição / vazio / maiúsculas |
| `application/__tests__/useLexer.test.ts` | 9 — reducer completo, backspace, reset, cap de 50 entradas |

Execute com `npm test`.

## 9. Tecnologias

- **Vite** — bundler e dev server
- **React 18 + TypeScript** — UI
- **Tailwind CSS** — estilos utilitários
- **Framer Motion** — animações declarativas
- **Vitest + Testing Library** — testes
- **Cloudflare Pages + Wrangler** — hospedagem estática

## 10. Critérios de avaliação atendidos

1. ✅ Permite digitação do token (campo de entrada controlado).
2. ✅ Acompanhamento símbolo-a-símbolo (fita de execução + diagrama animado).
3. ✅ Aceita ou recusa tokens propostos (badge no histórico após o espaço).
4. ✅ Execução estável (35 testes verdes, build sem warnings críticos).
5. ✅ Interface clara, focada na máquina de estados.
6. ✅ Algoritmo reflete fielmente o AFD — `δ` é literalmente uma função.

---

**Autor:** Guilherme Luiz Cella
**Disciplina:** Linguagens Formais — 2026/1
**Apresentação:** 01/07/2026
