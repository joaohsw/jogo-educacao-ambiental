# Detetive na Propriedade (Web)

Remake completo do jogo educativo para navegador usando:

- TypeScript
- Phaser 3
- Vite
- Tiled (mapas `.tmj`)
- Audio nativo do Phaser

## Objetivo

Conscientizar alunos do ensino fundamental sobre:

- armazenamento seguro de agrotóxicos;
- descarte correto de embalagens;
- riscos de práticas inseguras na lavoura e no depósito;
- uso correto de EPI.

## Minijogos

1. Jogo dos Erros - Lavoura
2. Jogo dos Erros - Depósito
3. Jornada da Embalagem
4. Vista-se Corretamente

## Pontuação e estatísticas

- Cada acerto vale `+10`.
- A mesma ação correta não pontua duas vezes na mesma sessão.
- Pontuação total e por minijogo ficam no estado global.
- Estatísticas arquivadas e nome do jogador ficam em `localStorage`.

## Rodando localmente

Pré-requisito: Node.js 20+.

```bash
npm install
npm run dev
```

Depois abra o endereço mostrado no terminal do Vite (normalmente `http://localhost:5173`).

## Build de produção

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
    data/              # Conteúdo de cartas e EPIs
    scenes/            # Cenas Phaser (menu, minijogos, estatísticas)
    state/             # Estado global e histórico
    types/             # Tipos compartilhados
    ui/                # Componentes UI (botão/modal)
```

## Editando hotspots e zonas no Tiled

- `public/tiled/spot_lavoura.tmj`: hotspots da cena da lavoura
- `public/tiled/spot_deposito.tmj`: hotspots da cena do depósito
- `public/tiled/packaging_journey.tmj`: slots da sequência da embalagem
- `public/tiled/dress_up.tmj`: zonas de equipar EPI

Os minijogos carregam essas áreas dinamicamente; alterar os objetos no Tiled altera o comportamento em runtime.
