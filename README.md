# Detetive na Propriedade

Jogo educativo em Flutter com minijogos sobre uso seguro, armazenamento e descarte correto de agrotoxicos.

## Objetivo

Este projeto busca conscientizar alunos do ensino fundamental sobre:

- armazenamento correto de agrotoxicos;
- descarte correto de embalagens;
- riscos de praticas inseguras no campo e no deposito;
- uso adequado de EPI (equipamentos de protecao individual).

O foco e aprendizagem pratica por meio de interacao, com linguagem simples e feedback imediato.

## Publico-alvo

- Alunos do ensino fundamental (principal);
- Professores e equipes escolares que desejam usar o jogo como apoio didatico em educacao ambiental e saude no campo.

## Minijogos disponiveis

1. Jogo dos Erros - Lavoura
- O aluno identifica praticas incorretas em uma cena de campo.

2. Jogo dos Erros - Deposito
- O aluno identifica problemas em uma cena de armazenamento.

3. Jornada da Embalagem
- O aluno organiza a sequencia correta de pos-uso das embalagens.

4. Vista-se Corretamente
- O aluno equipa o trabalhador com os EPIs adequados.

## Regras de pontuacao (estado atual)

- Cada acerto vale pontos.
- Pontuacao total e consolidada no menu e no ranking.
- A pontuacao foi protegida contra exploracao por repeticao:
  cada acao correta pontua apenas uma vez por sessao, mesmo ao sair e voltar do minijogo.

## Funcionalidades implementadas

- Menu inicial com acesso aos minijogos.
- Modo claro e modo escuro.
- Sistema de pontuacao por minijogo e pontuacao total.
- Ranking de sessoes.
- Navegacao com rotas nomeadas.
- Duas cenas ilustradas para o modo "Jogo dos Erros" com hotspots configuraveis.

## Estrutura principal

```text
lib/
  data/                # Configuracao de cenas e hotspots
  models/              # Modelos de dados
  navigation/          # Rotas do app
  screens/             # Telas e minijogos
  state/               # Estado global (pontuacao, tema, ranking)
```

## Tecnologias

- Flutter
- Dart
- Provider (gerenciamento de estado)
- go_router (navegacao)

## Plataforma alvo

Este projeto e suportado apenas na plataforma web (HTML).

## Como executar (web)

Pre-requisitos:

- Flutter SDK instalado
- Navegador Chrome ou Edge instalado

Comandos:

```bash
flutter pub get
flutter run -d chrome
```

## Build para publicacao web

```bash
flutter build web
```

Os arquivos finais sao gerados em `build/web/`.

## Status

Projeto em desenvolvimento ativo. A base jogavel cobre os principais fluxos pedagogicos definidos ate aqui.
