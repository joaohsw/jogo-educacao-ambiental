# Detetive na Propriedade

Jogo educativo em Flutter com minijogos sobre uso seguro, armazenamento e descarte correto de agrotóxicos.

## Objetivo

Este projeto tem como objetivo conscientizar alunos do ensino fundamental do Rio Grande do Sul sobre:

- armazenamento correto de agrotóxicos;
- descarte correto de embalagens;
- riscos de práticas inseguras no campo e no depósito;
- uso adequado de EPI (equipamentos de proteção individual).

O foco é aprendizagem prática por meio de interação, com linguagem simples e feedback imediato.

## Público-alvo

- Alunos do ensino fundamental (principal);
- Professores e equipes escolares que desejam usar o jogo como apoio didático em educação ambiental e saúde no campo.

## Minijogos disponíveis

1. Jogo dos Erros - Lavoura
- O aluno identifica práticas incorretas em uma cena de campo.

2. Jogo dos Erros - Depósito
- O aluno identifica problemas em uma cena de armazenamento.

3. Jornada da Embalagem
- O aluno organiza a sequência correta de pós-uso das embalagens.

4. Vista-se Corretamente
- O aluno equipa o trabalhador com os EPIs adequados.

## Regras de pontuação (estado atual)

- Cada acerto vale pontos.
- Pontuação total é consolidada no menu e no ranking.
- A pontuação foi protegida contra exploração por repetição:
  cada ação correta pontua apenas uma vez por sessão, mesmo ao sair e voltar do minijogo.

## Funcionalidades já implementadas

- Menu inicial com acesso aos minijogos.
- Modo claro e modo escuro.
- Sistema de pontuação por minijogo e pontuação total.
- Ranking de sessões.
- Navegação com rotas nomeadas.
- Duas cenas ilustradas para o modo "Jogo dos Erros" com hotspots configuráveis.

## Estrutura principal do projeto

```text
lib/
  data/                # Configuração de cenas e hotspots
  models/              # Modelos de dados
  navigation/          # Rotas do app
  screens/             # Telas e minijogos
  state/               # Estado global (pontuação, tema, ranking)
```

## Tecnologias

- Flutter
- Dart
- Provider (gerenciamento de estado)
- go_router (navegação)

## Como executar

Pré-requisitos:

- Flutter SDK instalado
- Dispositivo/emulador configurado

Comandos:

```bash
flutter pub get
flutter run
```

## Status

Projeto em desenvolvimento ativo. A base jogável está funcional e já cobre os principais fluxos pedagógicos definidos até aqui.
