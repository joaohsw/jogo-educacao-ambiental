# Detetive na Propriedade (Web)

Remake completo do jogo educativo para navegador usando:

- TypeScript
- Phaser 3
- Vite
- Tiled (mapas `.tmj`)
- Audio nativo do Phaser

## Objetivo

Conscientizar alunos do ensino fundamental sobre:

- armazenamento seguro de agrotoxicos;
- descarte correto de embalagens;
- riscos de praticas inseguras na lavoura e no deposito;
- uso correto de EPI.

## Minijogos

1. Jogo dos Erros - Lavoura
2. Jogo dos Erros - Deposito
3. Jornada da Embalagem
4. Vista-se Corretamente

## Pontuacao e ranking

- Cada acerto vale `+10`.
- A mesma acao correta nao pontua duas vezes na mesma sessao.
- Pontuacao total e por minijogo ficam no estado global.
- Ranking e nome do jogador ficam em `localStorage`.

## Rodando localmente

Pre-requisito: Node.js 20+.

```bash
npm install
npm run dev
```

Depois abra o endereco mostrado no terminal do Vite (normalmente `http://localhost:5173`).

## Build de producao

```bash
npm run build
npm run preview
```

## Estrutura principal

```text
public/
  audio/               # Efeitos sonoros (.wav)
  images/              # Cenas de fundo
  tiled/               # Mapas Tiled (.tmj)

src/
  game/
    audio/             # Wrapper de audio Phaser
    data/              # Conteudo de cartas e EPIs
    scenes/            # Cenas Phaser (menu, minijogos, ranking)
    state/             # Estado global e leaderboard
    types/             # Tipos compartilhados
    ui/                # Componentes UI (botao/modal)
```

## Editando hotspots e zonas no Tiled

- `public/tiled/spot_lavoura.tmj`: hotspots da cena da lavoura
- `public/tiled/spot_deposito.tmj`: hotspots da cena do deposito
- `public/tiled/packaging_journey.tmj`: slots da sequencia da embalagem
- `public/tiled/dress_up.tmj`: zonas de equipar EPI

Os minijogos carregam essas areas dinamicamente; alterar os objetos no Tiled altera o comportamento em runtime.
