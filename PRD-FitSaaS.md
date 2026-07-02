# [Nome Provisório: "FitFlow" / "JarvisFit" / a definir] — Especificação do Produto

> SaaS B2B2C para personal trainers e academias gerenciarem alunos, treinos, avaliações e pagamentos. Inspirado no MFIT Personal, mas com diferenciais em IA, multi-tenant para academias, gamificação e UX de pagamento.

---

## 1. Visão Geral do Produto

**Quem paga:** o personal trainer (ou a academia/estúdio) — assinatura mensal.
**Quem usa de graça:** o aluno — vinculado ao personal/academia que pagou.
**Como ganha dinheiro além da assinatura:** taxa sobre pagamentos processados (split de pagamento), planos premium com IA avançada, marketplace de templates de treino (futuro).

Existem **três tipos de usuário** no sistema, cada um com uma experiência diferente:

| Perfil | O que faz no app |
|---|---|
| **Admin de Academia** | Gerencia vários personais, vê dashboard consolidado, define planos/preços, fatura tudo centralizado |
| **Personal Trainer** | Cadastra alunos, monta treinos, faz anamnese/avaliação, acompanha progresso, recebe pagamento |
| **Aluno** | Vê seus treinos, registra execução, dá feedback, acompanha evolução, paga a mensalidade |

---

## 2. Módulos do Sistema (o que cada parte faz)

### 2.1 Módulo de Autenticação e Onboarding
**Função:** controlar quem entra no sistema e direcionar pra experiência certa.
- Login único, mas a tela muda conforme o papel (personal vs aluno vs admin de academia) — igual o MFIT faz, é um padrão bom.
- Onboarding separado: personal preenche dados profissionais (CREF, especialidade); aluno preenche um mini-questionário de saúde já na entrada (reduz fricção da anamnese depois).
- Convite por link/e-mail: personal convida aluno, aluno clica e já cai logado vinculado a esse personal.

### 2.2 Módulo Multi-Tenant (Academias) — *diferencial #1*
**Função:** permitir que uma academia tenha vários personais trabalhando dentro da mesma "casa", com faturamento e visão consolidada.
- Cada academia é um *tenant*. Dentro dela, existem múltiplos personais, cada um com sua carteira de alunos.
- O dono da academia vê: quantos alunos ativos no total, quanto cada personal está faturando (se quiser comissionar), taxa de adesão/abandono geral.
- Personal dentro de uma academia tem a mesma experiência de um personal autônomo — a diferença é invisível pra ele, só muda quem fatura.
- **Por que isso importa:** é a maior lacuna que o MFIT deixa aberta. Academias pequenas/médias hoje usam planilha ou nada pra coordenar os personais que trabalham lá dentro.

### 2.3 Módulo de Anamnese e Avaliação Física
**Função:** coletar histórico de saúde e medidas do aluno antes de montar o treino.
- Templates prontos (igual MFIT) + builder de formulário customizado (arrasta pergunta, define tipo de resposta).
- Avaliação física com protocolos (dobras cutâneas, perimetria, etc.) — pode usar o mesmo conjunto de protocolos conhecidos do mercado.
- Histórico versionado: cada nova avaliação fica salva, gera gráfico de evolução automaticamente (peso, %gordura, medidas).

### 2.4 Módulo de Prescrição de Treino (com IA) — *diferencial #2*
**Função:** o personal monta o treino; a IA ajuda a ajustar e evoluir.
- Banco de exercícios com vídeo/gif, categorizado por grupo muscular, equipamento necessário, nível.
- Personal monta a rotina (dias da semana, séries, repetições, carga, descanso) — manual, como hoje.
- **Camada de IA por cima:**
  - Sugestão de progressão de carga baseada no feedback das últimas sessões (se o aluno marcou "muito fácil" 3x seguidas, sugere aumentar carga; se marcou "muito difícil", sugere ajustar).
  - Geração de treino alternativo automático quando o aluno reporta que não tem um equipamento disponível naquele dia.
  - Alerta de estagnação: se a carga não evolui há N semanas, avisa o personal.
- Clonagem de rotina entre alunos (igual MFIT, é essencial pra produtividade do personal).

### 2.5 Módulo do Aluno (execução do treino)
**Função:** experiência de quem está na academia treinando.
- Tela do treino do dia, com vídeo de cada exercício, campo pra registrar carga usada e cronômetro de descanso (que continua tocando mesmo com o app em segundo plano e respeitando música — ponto que o MFIT já resolveu bem, deve ser copiado).
- Feedback obrigatório ao final do treino (curto: emoji de dificuldade + campo de texto opcional) — isso é o que alimenta a IA de progressão.
- Histórico visual de evolução (gráfico de carga por exercício ao longo do tempo).

### 2.6 Módulo de Gamificação — *diferencial #3*
**Função:** manter o aluno engajado e reduzir abandono (o maior problema de personal trainer é aluno desistir).
- Streak de dias treinados seguidos.
- Conquistas (primeira semana completa, primeiro PR de carga, 30 dias sem faltar).
- Ranking opcional entre alunos do mesmo personal (o personal decide se ativa, pra não constranger ninguém).
- Isso é zero no MFIT — é onde dá pra ganhar percepção de produto "mais moderno".

### 2.7 Módulo de Pagamentos — *diferencial #4*
**Função:** o aluno paga a mensalidade da consultoria direto pelo app, o personal recebe.
- PIX como método padrão (instantâneo, sem o problema do boleto levar 3 dias úteis que o MFIT tem).
- Split automático: a plataforma desconta a taxa na hora, o personal recebe o líquido sem precisar "solicitar liberação" manualmente.
- Cobrança recorrente automática (assinatura mensal do aluno com o personal).
- Dashboard financeiro simples pro personal: quanto entrou, quem está inadimplente, próximos vencimentos.

### 2.8 Módulo de Comunicação — *diferencial #5*
**Função:** fechar o buraco que o MFIT deixa (só feedback pós-treino, sem chat real).
- Chat in-app simples entre personal e aluno (texto + áudio).
- Notificações push: lembrete de treino, aviso de novo treino prescrito, mensagem não lida.

### 2.9 Módulo de Wearables — *diferencial #6 (fase 2, não MVP)*
**Função:** puxar dados automáticos em vez do aluno digitar tudo manualmente.
- Integração com Apple Health e Google Fit: frequência cardíaca, calorias, passos.
- Enriquece o relatório de progresso sem esforço do aluno.

---

## 3. Fluxos de UX (telas e jornada)

### 3.1 Jornada do Personal Trainer

```
Login → Dashboard
  ├─ Ver lista de alunos (cards com foto, status: ativo/inadimplente/sem treino há X dias)
  ├─ [+ Novo Aluno] → preenche nome/email → convite enviado
  ├─ Clica num aluno → Perfil do aluno
  │     ├─ Aba Anamnese (ver respostas)
  │     ├─ Aba Avaliação Física (histórico + gráfico)
  │     ├─ Aba Treinos (rotina atual + criar nova)
  │     │     └─ [+ Nova Rotina] → escolhe exercícios → define séries/carga/descanso → salva
  │     │           └─ IA sugere ajuste de carga (badge "Sugestão da IA" clicável)
  │     ├─ Aba Financeiro (status de pagamento, histórico)
  │     └─ Aba Chat (conversa direta)
  └─ Dashboard financeiro geral (todos os alunos, recebido no mês)
```

**Princípio de UX:** o personal passa o dia entre "ver quem precisa de atenção" e "montar/ajustar treino". O dashboard inicial deve já mostrar isso sem precisar clicar: alunos inadimplentes, alunos sem treinar há mais de 5 dias, sugestões de IA pendentes de aprovação.

### 3.2 Jornada do Aluno

```
Login → Tela "Treino de Hoje"
  ├─ Lista de exercícios do dia (com vídeo)
  ├─ Inicia treino → cronômetro de descanso entre séries
  ├─ Registra carga usada em cada série
  ├─ Finaliza treino → feedback obrigatório (1 toque: fácil/ok/difícil) + campo opcional de texto
  └─ Tela de Evolução
        ├─ Streak atual + conquistas desbloqueadas
        ├─ Gráfico de carga por exercício
        └─ Comparação com avaliação física anterior
  Aba separada: Financeiro (pagar mensalidade via PIX)
  Aba separada: Chat com o personal
```

**Princípio de UX:** o aluno não deve precisar pensar. Ao abrir o app, o treino do dia já está na tela principal — sem menu, sem navegação extra. É o oposto de um app "empresarial"; tem que parecer um app de consumo, simples e rápido (pensa Strava, não pensa planilha).

### 3.3 Jornada do Admin de Academia (multi-tenant)

```
Login → Dashboard da Academia
  ├─ Lista de personais cadastrados (status, nº de alunos cada um)
  ├─ [+ Adicionar Personal]
  ├─ Visão consolidada: total de alunos ativos, faturamento total, inadimplência geral
  └─ Configurações de faturamento (planos, comissão por personal, se aplicável)
```

---

## 4. Arquitetura Técnica (resumo, dado seu stack)

- **Backend:** FastAPI, multi-tenant via `tenant_id` em todas as tabelas relevantes (mesmo padrão que você já validou no GWI Platform).
- **Banco:** PostgreSQL.
- **Fila assíncrona:** APScheduler ou Celery — para recalcular sugestões de IA, disparar lembretes, processar pagamentos recorrentes.
- **Frontend Personal/Admin:** React (web), responsivo.
- **Frontend Aluno:** PWA ou React Native — precisa parecer um app nativo de consumo, não um painel administrativo.
- **Pagamentos:** Asaas ou Pagar.me (PIX nativo, split de pagamento, boleto como fallback).
- **IA:** camada própria sobre API da Anthropic (Claude) para geração e ajuste de treino, com prompt estruturado retornando JSON validado.

---

## 5. MVP sugerido (ordem de construção)

1. Auth + cadastro de personal e aluno (sem multi-tenant ainda, só 1:N personal→alunos)
2. Anamnese simples + banco de exercícios curado (não precisa de 1800 vídeos, comece com 100-200 bem escolhidos)
3. Prescrição de treino manual + execução pelo aluno + feedback
4. IA de sugestão de progressão de carga (o diferencial mais forte, entra cedo)
5. Pagamento via PIX (mesmo que manual no início, split depois)
6. Gamificação básica (streak + 3-4 conquistas)
7. Multi-tenant para academias (fase 2, quando já tiver tração com personais autônomos)
8. Chat, wearables (fase 3)

---

## 6. Próximos passos possíveis
- Desenhar o schema de banco de dados completo (tabelas, relacionamentos)
- Escrever os prompts de IA para a prescrição/ajuste de treino
- Prototipar as telas principais (wireframe ou já em React)
