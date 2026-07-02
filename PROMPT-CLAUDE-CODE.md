# PROMPT-MESTRE — Claude Code (FitSaaS) — FOCO: Personal Trainer Autônomo

> Cole este conteúdo como o primeiro prompt ao abrir o projeto no Claude Code (VSCode).
> Ele dá o NORTE completo (início → meio → fim) e regras anti-loop.
> Não é mágica: você (humano) ainda valida cada fase antes de seguir. Trabalhe FASE A FASE.

---

## CONTEXTO DO PROJETO (leia antes de agir)

Você está desenvolvendo o **FitSaaS**, um SaaS B2B2C de gestão de treino para **personal trainers autônomos** (concorrente direto do MFIT Personal). O cliente que paga é o personal — ele paga uma **mensalidade fixa pela ferramenta** e cobra os próprios alunos como quiser (PIX, dinheiro, o que for), ficando com 100% desse valor, em vez de dividir com a plataforma. Esse é o argumento central de venda: "ferramenta mais barata e você não divide receita com ninguém".

A arquitetura é multi-tenant desde o início: cada personal autônomo é um `tenant` de "1 profissional". O MESMO modelo, sem nenhuma mudança de schema, também atende academias com vários personais (tenant maior, vários `users` com role `personal` dentro dele) — isso é plano de expansão futura, NÃO o foco do MVP.

Antes de escrever qualquer código, leia: `README.md`, `app/models/__init__.py`, `app/ai/prescricao.py` e todos os arquivos em `app/api/routes/`. Entenda o que já existe. NÃO recrie o que já está pronto.

---

## PRIORIDADE DE PRODUTO (não perca de vista)

1. O personal autônomo precisa conseguir, sozinho e sem fricção: cadastrar seus alunos, montar treino, acompanhar execução e progresso.
2. O aluno precisa de uma experiência simples tipo app de consumo (pense Strava), não painel administrativo.
3. A IA de sugestão de progressão de carga é o diferencial que justifica a mensalidade — não é acessório, é o que separa esse produto de uma "ficha de treino digital" comum.
4. Multi-unidade / academia grande / pagamento com split / wearables **NÃO entram agora**. Ficam para depois de validar com os primeiros personais pagantes.

---

## REGRAS ANTI-LOOP (obrigatórias)

1. **Trabalhe em FASES.** Só comece uma fase quando eu (humano) confirmar que a anterior está validada. Ao terminar uma fase, PARE e me diga: o que fez, como testar, e o que vem na próxima. Não emende fases sozinho.
2. **Uma alteração coerente por vez.** Não reescreva múltiplos módulos no mesmo passo. Mudou algo? Rode o teste relacionado antes de seguir.
3. **Se um teste falhar 2 vezes seguidas no mesmo ponto, PARE** e me explique a causa raiz com 2-3 hipóteses, em vez de tentar variações cegas repetidamente. Espere minha decisão.
4. **Nunca apague código que funciona pra "tentar outra abordagem" sem antes me avisar** o que vai mudar e por quê.
5. **Antes de criar um arquivo, verifique se ele já existe.** Se existir, edite — não duplique.
6. **Não invente dependências.** Use o que está em `requirements.txt`. Se precisar de algo novo, peça aprovação e justifique.
7. **Toda função nova precisa de pelo menos 1 teste** em `tests/`. Sem teste, a tarefa não está concluída.
8. **Ao final de cada fase, rode `pytest` e mostre o resultado.** Verde antes de avançar.
9. Se algo estiver ambíguo, faça **no máximo uma pergunta objetiva** e siga com a suposição mais razoável declarada explicitamente — não trave esperando.
10. **Não construa nada da lista "NÃO entram agora" (seção Prioridade de Produto) a menos que eu peça explicitamente.**

---

## ROTEIRO (início → meio → fim)

### FASE 0 — Setup e fundação (validar que roda)
- Configurar Alembic, gerar a primeira migration a partir dos models existentes.
- Subir o banco (PostgreSQL), aplicar migration, rodar `uvicorn` e confirmar `/health`.
- Implementar `get_current_user` (dependência JWT) em `app/core/` e proteger as rotas que precisam de auth.
- **Critério de pronto:** `pytest` verde, `/health` responde, login devolve token válido.

### FASE 1 — Onboarding do personal autônomo (fluxo de auto-cadastro)
- Endpoint de auto-registro do personal (`/auth/registrar-personal` já existe no esqueleto — validar e completar): cria o tenant dele automaticamente, sem precisar de admin.
- Convite de aluno por link/e-mail (personal convida, aluno clica e já cai vinculado a esse tenant/personal).
- **Critério de pronto:** um personal se cadastra sozinho, recebe seu tenant, convida um aluno, aluno se cadastra vinculado a ele. Teste cobrindo o fluxo ponta a ponta.

### FASE 2 — Núcleo do personal (CRUD + escopo por tenant)
- Completar rotas de alunos, treinos e itens de treino com validação Pydantic (schemas em `app/schemas/`).
- Garantir ISOLAMENTO multi-tenant: toda query filtra por `tenant_id` do token. Escrever teste que prova que um tenant (um personal) não vê dados de outro.
- Anamnese: endpoint para salvar/recuperar (JSON estruturado).
- **Critério de pronto:** personal cria aluno, monta treino com exercícios, salva anamnese. Testes de isolamento passando.

### FASE 3 — Núcleo do aluno (execução + feedback)
- Endpoint de "treino do dia", registro de execução, feedback de dificuldade.
- Histórico de cargas por exercício (base para os gráficos do front).
- **Critério de pronto:** aluno busca treino, registra execução com feedback, histórico é consultável.

### FASE 4 — Camada de IA (o diferencial que vende a mensalidade)
- Refinar `sugerir_ajuste_carga`: prompt robusto, validação estrita do JSON de saída, retry com fallback seguro (nunca quebrar o fluxo se a IA falhar).
- Implementar `gerar_treino_alternativo` (hoje é `NotImplementedError`).
- Tarefa assíncrona (APScheduler): varrer execuções recentes e pré-calcular sugestões de progressão; gerar alerta de estagnação pro personal.
- **Critério de pronto:** dado um histórico de feedback, a API retorna sugestão coerente e validada; testes cobrem o caso de IA indisponível (fallback).

### FASE 5 — Gamificação (retenção do aluno = retenção do personal como cliente)
- Streak de dias treinados, conquistas (primeira semana, primeiro PR de carga, 30 dias sem faltar).
- Endpoint que devolve o estado de gamificação do aluno.
- **Critério de pronto:** streak e conquistas calculados a partir das execuções reais, com testes.

### FASE 6 — Frontend do personal (React)
- Dashboard: lista de alunos com status (sem treinar há X dias / sugestão de IA pendente). SEM módulo financeiro complexo por enquanto (o personal cobra o aluno por fora).
- Tela de perfil do aluno (abas: anamnese, avaliação, treinos).
- Construtor de treino. Badge "Sugestão da IA" clicável.
- **Critério de pronto:** fluxo do personal navegável ponta a ponta contra o backend.

### FASE 7 — Frontend do aluno (React Native/PWA)
- Tela "treino de hoje" com vídeo, cronômetro de descanso (continua em segundo plano), registro de carga, feedback final.
- Tela de evolução: streak, conquistas, gráfico de carga.
- **Princípio: parecer app de consumo (tipo Strava), não painel administrativo.**
- **Critério de pronto:** aluno executa um treino completo no app rodando num celular real.

### FASE 8 — Dados de demonstração + empacotamento para vender ao 1º personal
- Seed com 1 personal fictício + ~10-20 alunos (o número real que o personal do seu contato tem), treinos e histórico de execução (pra demo não parecer vazia).
- Script de build para instalar no celular (TestFlight/APK) sem precisar publicar nas lojas ainda.
- **Critério de pronto:** app populado, instalável num celular, pronto pra mostrar pro personal com quem você já conversou.

### FASE 9 (depois de validar com os primeiros personais pagantes) — não fazer antes
- Cobrança da MENSALIDADE do personal pra você (assinatura recorrente sua, não split de aluno).
- Multi-tenant para academias com múltiplos personais (o mesmo schema já suporta, é só habilitar o fluxo de admin de academia).
- Chat in-app, wearables, pagamento com split para quem quiser oferecer cobrança de aluno dentro do app.
- Publicação nas lojas (Google Play + App Store).

---

## PADRÕES DE CÓDIGO
- Backend tipado, Pydantic v2, funções pequenas e testáveis.
- Toda rota protegida valida `tenant_id` do token.
- IA: saída SEMPRE validada como JSON; falha de IA nunca derruba o request.
- Commits pequenos e descritivos por fase.
- LGPD: dados de saúde (anamnese/avaliação) são sensíveis — não logar conteúdo, tratar com cuidado.

## COMO COMEÇAR AGORA
1. Confirme que leu os arquivos do esqueleto e resuma em 3-4 linhas o que já existe.
2. Liste o que falta na FASE 0.
3. Execute SÓ a FASE 0. Ao terminar, rode `pytest`, mostre o resultado e PARE para minha validação.
