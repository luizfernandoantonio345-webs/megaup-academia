"""
seed_sueli_gabriela.py
======================
Cria os alunos Sueli e Gabriela com programas de treino especializados.

Sueli  — Fibromialgia + Perda de Peso + Definição
         Treino full body 3x/semana, baixa intensidade, respeitando os
         limites da fibromialgia. Baseado nas diretrizes ACSM e estudos
         clinicos de exercicio terapeutico para fibromialgia.

Gabriela — Pos-Anabolizante, Gluteos/Pernas/Costas/Ombros desenvolvidos
           Programa 6x/semana de alta intensidade com enfase em gluteos
           (2x/semana), definicao e proporcionalidade.

Uso:
    python seed_sueli_gabriela.py --api https://fitsaas.onrender.com --email luiz@email.com --senha suasenha
"""
import argparse
import sys
import time
import unicodedata
import requests

# ---------------------------------------------------------------------------
# EXERCICIOS NOVOS — serao criados apenas se nao existirem
# ---------------------------------------------------------------------------

EXERCICIOS_NOVOS = [
    # ── AEROBICO / WARM-UP ───────────────────────────────────────────────────
    {
        "nome": "Bicicleta Ergometrica (Aquecimento)",
        "grupo_muscular": "cardio",
        "equipamento": "bicicleta",
        "video_url": "https://www.youtube.com/watch?v=5jSAdpwLl6g",
    },
    {
        "nome": "Esteira Caminhada (Aquecimento)",
        "grupo_muscular": "cardio",
        "equipamento": "esteira",
        "video_url": "https://www.youtube.com/watch?v=5iHkQAGXz5I",
    },
    # ── PEITO (NOVOS) ─────────────────────────────────────────────────────────
    {
        "nome": "Crucifixo com Haltere (Fly)",
        "grupo_muscular": "peito",
        "equipamento": "haltere",
        "video_url": "https://www.youtube.com/watch?v=eozdVDA78K0",
    },
    {
        "nome": "Voador (Pec Deck)",
        "grupo_muscular": "peito",
        "equipamento": "maquina",
        "video_url": "https://www.youtube.com/watch?v=Z57CtFmRMxA",
    },
    # ── TRICEPS (NOVO) ────────────────────────────────────────────────────────
    {
        "nome": "Triceps no Banco (Bench Dip)",
        "grupo_muscular": "triceps",
        "equipamento": "banco",
        "video_url": "https://www.youtube.com/watch?v=0326dy_-CzM",
    },
    # ── CORE / HIPOPRESSIVO ───────────────────────────────────────────────────
    {
        "nome": "Extensao Lombar na Maquina",
        "grupo_muscular": "lombar",
        "equipamento": "maquina",
        "video_url": "https://www.youtube.com/watch?v=b_RJcYBkBCo",
    },
    {
        "nome": "Abdominal Hipopressivo (Vacuum de Pe)",
        "grupo_muscular": "abdomen",
        "equipamento": "peso_corporal",
        "video_url": "https://www.youtube.com/watch?v=VwwFmBK2Z2c",
    },
    # ── GLUTEOS ───────────────────────────────────────────────────────────────
    {
        "nome": "Hip Thrust com Barra",
        "grupo_muscular": "gluteos",
        "equipamento": "barra",
        "video_url": "https://www.youtube.com/watch?v=xDmFkJxPzeM",
    },
    {
        "nome": "Abducao de Quadril na Maquina",
        "grupo_muscular": "gluteos",
        "equipamento": "maquina",
        "video_url": "https://www.youtube.com/watch?v=_Zl-QxMWHkE",
    },
    {
        "nome": "Extensao de Quadril no Cabo (Coice)",
        "grupo_muscular": "gluteos",
        "equipamento": "polia",
        "video_url": "https://www.youtube.com/watch?v=jO3OTL02oF0",
    },
    {
        "nome": "Afundo (Lunge) com Haltere",
        "grupo_muscular": "pernas",
        "equipamento": "haltere",
        "video_url": "https://www.youtube.com/watch?v=QOVaHwm-Q6U",
    },
    {
        "nome": "Elevacao de Quadril no Chao (Glute Bridge)",
        "grupo_muscular": "gluteos",
        "equipamento": "peso_corporal",
        "video_url": "https://www.youtube.com/watch?v=wPM8icPu6H8",
    },
    # ── COSTAS (NOVOS) ────────────────────────────────────────────────────────
    {
        "nome": "Remada T (T-Bar Row)",
        "grupo_muscular": "costas",
        "equipamento": "barra",
        "video_url": "https://www.youtube.com/watch?v=j3Igk5nyZE4",
    },
    {
        "nome": "Rosca Concentrada com Haltere",
        "grupo_muscular": "biceps",
        "equipamento": "haltere",
        "video_url": "https://www.youtube.com/watch?v=Jvj2wV0vOYU",
    },
    # ── PERNAS (NOVOS) ────────────────────────────────────────────────────────
    {
        "nome": "Hack Squat na Maquina",
        "grupo_muscular": "pernas",
        "equipamento": "maquina",
        "video_url": "https://www.youtube.com/watch?v=0tn5K9NlCfo",
    },
    # ── OMBROS (NOVOS) ────────────────────────────────────────────────────────
    {
        "nome": "Desenvolvimento Militar com Barra",
        "grupo_muscular": "ombros",
        "equipamento": "barra",
        "video_url": "https://www.youtube.com/watch?v=2yjwXTZQDDI",
    },
    {
        "nome": "Desenvolvimento Arnold com Haltere",
        "grupo_muscular": "ombros",
        "equipamento": "haltere",
        "video_url": "https://www.youtube.com/watch?v=3ml7BH7mNwQ",
    },
    {
        "nome": "Remada Alta com Barra (Upright Row)",
        "grupo_muscular": "ombros",
        "equipamento": "barra",
        "video_url": "https://www.youtube.com/watch?v=um3VBhRfBkQ",
    },
    # ── AGACHAMENTO SUMO ──────────────────────────────────────────────────────
    {
        "nome": "Agachamento Sumo com Haltere",
        "grupo_muscular": "pernas",
        "equipamento": "haltere",
        "video_url": "https://www.youtube.com/watch?v=3zqRWe2MNTA",
    },
]

# ---------------------------------------------------------------------------
# PROGRAMAS — [(nome_treino, dia_semana, [(ex_nome, series, reps, carga, descanso, ordem)])]
# ---------------------------------------------------------------------------

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SUELI — FIBROMIALGIA
# Protocolo baseado nas diretrizes do American College of Rheumatology e
# evidencias clinicas para exercicio em fibromialgia:
#   - Aerobico de baixa intensidade (60-70% FC max) 30-40 min por sessao
#   - Forcas com cargas MUITO LEVES (50-60% 1RM), alto volume (15-20 reps)
#   - 3x/semana full body, dias nao consecutivos
#   - Descanso longo entre series (90-120s) — fundamental na fibromialgia
#   - Warm-up obrigatorio 10-15 min, cool-down 10 min
#   - Progressao MUITO gradual: so aumentar carga apos 3 semanas no mesmo peso
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TREINOS_SUELI = [
    (
        "Sueli A — Full Body Leve (Segunda)",
        "segunda",
        # (exercicio, series, reps, carga_kg, descanso_seg, ordem)
        [
            ("Bicicleta Ergometrica (Aquecimento)",       1, "12-15min", None, 0,   1),  # warm-up
            ("Leg Press 45 Graus",                        3, "15-20",    30.0, 120, 2),  # leve
            ("Remada Baixa no Cabo",                      3, "15-20",    None, 120, 3),
            ("Supino Reto com Barra",                     3, "15",       20.0, 90,  4),  # barra vazia + leve
            ("Elevacao Lateral com Haltere",              3, "15",        5.0, 90,  5),  # muito leve
            ("Rosca Alternada com Haltere",               3, "15",        6.0, 60,  6),
            ("Triceps Corda na Polia",                    3, "15",       None, 60,  7),  # cabo no leve
            ("Panturrilha Sentado",                       3, "20",       None, 45,  8),
            ("Prancha Frontal (Plank)",                   3, "20s",      None, 30,  9),  # tempo curto
        ],
    ),
    (
        "Sueli B — Full Body Leve (Quarta)",
        "quarta",
        [
            ("Esteira Caminhada (Aquecimento)",           1, "12-15min", None, 0,   1),  # warm-up
            ("Cadeira Extensora",                         3, "15-20",    None, 120, 2),
            ("Puxada Frontal na Polia",                   3, "15",       None, 120, 3),
            ("Voador (Pec Deck)",                         3, "15",       None,  90, 4),
            ("Elevacao Frontal com Haltere",              3, "15",        4.0,  90, 5),
            ("Rosca Martelo com Haltere",                 3, "15",        6.0,  60, 6),
            ("Triceps no Banco (Bench Dip)",              3, "15",       None,  60, 7),  # peso corporal apenas
            ("Abdominal Supra (Crunch)",                  3, "15",       None,  45, 8),
            ("Extensao Lombar na Maquina",                3, "15",       None,  60, 9),
        ],
    ),
    (
        "Sueli C — Full Body Suave + Flexibilidade (Sexta)",
        "sexta",
        [
            ("Bicicleta Ergometrica (Aquecimento)",       1, "15min",    None, 0,   1),  # warm-up
            ("Agachamento Sumo com Haltere",              3, "15-20",    10.0, 120, 2),  # haltere leve
            ("Remada Unilateral com Haltere",             3, "15",       10.0, 90,  3),
            ("Crucifixo com Haltere (Fly)",               3, "15",        8.0, 90,  4),
            ("Desenvolvimento com Haltere Sentado",       3, "15",        8.0, 90,  5),
            ("Panturrilha em Pe na Maquina",              3, "20",       None, 45,  6),
            ("Abdominal Hipopressivo (Vacuum de Pe)",     3, "30s",      None, 30,  7),
            ("Extensao Lombar na Maquina",                3, "15",       None, 60,  8),
        ],
    ),
]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# GABRIELA — POS-ANABOLIZANTE, GLUTEOS/PERNAS/COSTAS/OMBROS DESENVOLVIDOS
# Objetivos:
#   1. Manter e continuar crescendo as areas ja desenvolvidas (gluteos, pernas,
#      costas, ombros)
#   2. Desenvolver peito e braccos para equilibrar proporcao
#   3. Definicao — corte de gordura com volume alto
# Protocolo:
#   - 6 dias/semana (gluteos 2x, costas 1x, pernas 2x, ombros 1x, peito 1x)
#   - Cargas altas (70-85% 1RM) nos compostos
#   - Series altas nas isoladas (15-25 reps) para pump e definicao
#   - Treino F no sabado foca em gluteo glute e finalizacao
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TREINOS_GABRIELA = [
    (
        "Gabriela A — Gluteos + Posterior de Coxa (Segunda)",
        "segunda",
        [
            ("Hip Thrust com Barra",                     5, "8-10",  60.0, 90,  1),
            ("Stiff com Haltere (RDL)",                  4, "10-12", 35.0, 90,  2),
            ("Mesa Flexora Deitada",                     4, "12-15", None, 60,  3),
            ("Afundo (Lunge) com Haltere",               3, "12",    20.0, 60,  4),
            ("Abducao de Quadril na Maquina",            4, "20",    None, 45,  5),
            ("Extensao de Quadril no Cabo (Coice)",      3, "15",    None, 45,  6),
            ("Elevacao de Quadril no Chao (Glute Bridge)", 3, "20",  None, 30,  7),
        ],
    ),
    (
        "Gabriela B — Costas Largas + Biceps (Terca)",
        "terca",
        [
            ("Barra Fixa Pegada Aberta",                 4, "8-10",  None, 120, 1),
            ("Remada T (T-Bar Row)",                     4, "10",    50.0,  90, 2),
            ("Puxada Frontal na Polia",                  3, "12",    None,  90, 3),
            ("Remada Curvada com Barra",                 3, "10",    50.0,  90, 4),
            ("Pullover com Haltere",                     3, "15",    20.0,  60, 5),
            ("Rosca Direta com Barra EZ",                3, "12",    30.0,  60, 6),
            ("Rosca Concentrada com Haltere",            3, "15",    12.0,  45, 7),
        ],
    ),
    (
        "Gabriela C — Quadriceps + Panturrilha (Quarta)",
        "quarta",
        [
            ("Agachamento Livre com Barra",              4, "8",     70.0, 120, 1),
            ("Leg Press 45 Graus",                       4, "12",    None,  90, 2),
            ("Hack Squat na Maquina",                    3, "12",    None,  90, 3),
            ("Cadeira Extensora",                        3, "15",    None,  60, 4),
            ("Agachamento Bulgaro (Split Squat)",        3, "10",    20.0,  90, 5),
            ("Panturrilha em Pe na Maquina",             5, "25",    None,  30, 6),
            ("Panturrilha Sentado",                      4, "20",    None,  30, 7),
        ],
    ),
    (
        "Gabriela D — Ombros + Trapezio (Quinta)",
        "quinta",
        [
            ("Desenvolvimento Militar com Barra",        4, "8",     40.0,  90, 1),
            ("Elevacao Lateral com Haltere",             5, "12-15", 12.0,  60, 2),
            ("Desenvolvimento Arnold com Haltere",       3, "10",    16.0,  90, 3),
            ("Peck Deck Invertido (Deltoide Posterior)", 4, "15",    None,  60, 4),
            ("Face Pull na Polia",                       3, "15",    None,  60, 5),
            ("Remada Alta com Barra (Upright Row)",      3, "12",    30.0,  60, 6),
            ("Encolhimento de Ombros com Haltere",       4, "20",    32.0,  45, 7),
        ],
    ),
    (
        "Gabriela E — Peito + Triceps + Core (Sexta)",
        "sexta",
        [
            ("Supino Reto com Barra",                    4, "8-10",  50.0,  90, 1),
            ("Supino Inclinado com Haltere",             3, "12",    24.0,  90, 2),
            ("Crossover na Polia (Cruzamento)",          3, "15",    None,  60, 3),
            ("Voador (Pec Deck)",                        3, "15",    None,  60, 4),
            ("Triceps Corda na Polia",                   4, "12",    None,  60, 5),
            ("Triceps Frances com Barra EZ",             3, "12",    20.0,  60, 6),
            ("Abdominal Roda (Ab Wheel)",                4, "15",    None,  45, 7),
            ("Prancha Frontal (Plank)",                  4, "60s",   None,  30, 8),
        ],
    ),
    (
        "Gabriela F — Gluteos Vol.2 + Definicao (Sabado)",
        "sabado",
        [
            ("Hip Thrust com Barra",                     4, "15",    50.0,  60, 1),  # pausa no topo
            ("Agachamento Sumo com Haltere",             4, "15",    30.0,  60, 2),
            ("Abducao de Quadril na Maquina",            5, "20-25", None,  30, 3),
            ("Extensao de Quadril no Cabo (Coice)",      3, "20",    None,  30, 4),
            ("Elevacao de Quadril no Chao (Glute Bridge)", 3, "25",  None,  30, 5),
            ("Bicicleta Ergometrica (Aquecimento)",      1, "20min", None,   0, 6),  # HIIT finalizacao
        ],
    ),
]

# Mapeamento: nome_aluno → (email_placeholder, objetivo, lista_de_treinos)
ALUNOS_CONFIG = {
    "Sueli": (
        "sueli@academia.com",
        "Perda de peso e definicao com fibromialgia — treino terapeutico de baixa intensidade",
        TREINOS_SUELI,
    ),
    "Gabriela": (
        "gabriela@academia.com",
        "Gluteos, pernas, costas e ombros grandes e definidos — proporcionalidade e volume",
        TREINOS_GABRIELA,
    ),
}

# ---------------------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------------------

def norm(s):
    return ''.join(
        c for c in unicodedata.normalize('NFD', s.lower())
        if unicodedata.category(c) != 'Mn'
    )

def post(url, token, body, retries=3):
    for attempt in range(retries):
        try:
            r = requests.post(url, json=body, headers={"Authorization": f"Bearer {token}"}, timeout=30)
            r.raise_for_status()
            time.sleep(0.5)
            return r.json()
        except requests.exceptions.ConnectionError:
            if attempt < retries - 1:
                print(f"    [retry {attempt+1}] aguardando 6s...")
                time.sleep(6)
            else:
                raise

def get(url, token, retries=3):
    for attempt in range(retries):
        try:
            r = requests.get(url, headers={"Authorization": f"Bearer {token}"}, timeout=30)
            r.raise_for_status()
            return r.json()
        except requests.exceptions.ConnectionError:
            if attempt < retries - 1:
                time.sleep(6)
            else:
                raise

# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--api",   default="https://fitsaas.onrender.com")
    parser.add_argument("--email", default="")
    parser.add_argument("--senha", default="")
    args = parser.parse_args()

    api   = args.api.rstrip("/")
    email = args.email or input("E-mail do personal: ").strip()
    senha = args.senha or input("Senha: ").strip()

    print(f"\nConectando em {api}\n")

    # 1. Login
    print("[ 1 ] Autenticando...")
    r = requests.post(f"{api}/auth/login", json={"email": email, "senha": senha}, timeout=15)
    r.raise_for_status()
    token = r.json()["access_token"]
    print(f"  [OK] Autenticado como {email}")

    # 2. Exercicios — cria os novos, indexa todos por nome normalizado
    print(f"\n[ 2 ] Sincronizando {len(EXERCICIOS_NOVOS)} novos exercicios...")
    existentes = get(f"{api}/exercicios/", token)
    id_por_nome = {norm(e["nome"]): e["id"] for e in existentes}

    for ex in EXERCICIOS_NOVOS:
        n = norm(ex["nome"])
        if n in id_por_nome:
            print(f"  [=]  {ex['nome']}")
        else:
            novo = post(f"{api}/exercicios/", token, ex)
            id_por_nome[norm(novo["nome"])] = novo["id"]
            print(f"  [+]  {ex['nome']} (id={novo['id']})")

    # 3. Alunos — cria Sueli e Gabriela se nao existirem
    print("\n[ 3 ] Criando/verificando alunas...")
    alunos_api = get(f"{api}/alunos/", token)
    aluno_id_map = {norm(a["nome"]): a["id"] for a in alunos_api}

    for nome_aluno, (email_aluno, objetivo, treinos) in ALUNOS_CONFIG.items():
        n = norm(nome_aluno)
        if n not in aluno_id_map:
            novo_aluno = post(f"{api}/alunos/", token, {
                "nome": nome_aluno,
                "email": email_aluno,
                "objetivo": objetivo,
            })
            aluno_id_map[n] = novo_aluno["id"]
            print(f"  [+]  Aluno criado: {nome_aluno} (id={novo_aluno['id']})")
        else:
            print(f"  [=]  {nome_aluno} ja existe (id={aluno_id_map[n]})")

    # 4. Treinos
    for nome_aluno, (_, _, treinos) in ALUNOS_CONFIG.items():
        aluno_id = aluno_id_map[norm(nome_aluno)]
        print(f"\n[ 4 ] Treinos de {nome_aluno} (aluno_id={aluno_id})...")

        treinos_api = get(f"{api}/treinos/?aluno_id={aluno_id}", token)
        treino_map = {norm(t["nome"]): t for t in treinos_api}

        for (nome_treino, dia, itens) in treinos:
            nn = norm(nome_treino)

            if nn in treino_map:
                treino_id = treino_map[nn]["id"]
                existentes_ids = {it["exercicio_id"] for it in (treino_map[nn].get("itens") or [])}
                print(f"  [=]  {nome_treino} (id={treino_id}, {len(existentes_ids)} itens)")
            else:
                treino = post(f"{api}/treinos/", token, {
                    "aluno_id": aluno_id, "nome": nome_treino, "dia_semana": dia,
                })
                treino_id = treino["id"]
                existentes_ids = set()
                print(f"  [+]  {nome_treino} (id={treino_id})")

            for (ex_nome, series, reps, carga, descanso, ordem) in itens:
                ex_id = id_por_nome.get(norm(ex_nome))
                if not ex_id:
                    print(f"       [ERR] exercicio nao encontrado: {ex_nome}")
                    continue
                if ex_id in existentes_ids:
                    continue

                post(f"{api}/treinos/{treino_id}/itens/", token, {
                    "exercicio_id": ex_id,
                    "series": series,
                    "repeticoes": reps,
                    "carga": carga,
                    "descanso_seg": descanso,
                    "ordem": ordem,
                })
                existentes_ids.add(ex_id)
                print(f"       + {ex_nome}  {series}x{reps}  {descanso}s")

    print("\n" + "=" * 60)
    print("  SUELI + GABRIELA CRIADAS!")
    print("=" * 60)
    print("""
  SUELI — Fibromialgia:
    A - Segunda | Full Body Leve (bicicleta + forca suave)
    B - Quarta  | Full Body Leve (esteira + variacao)
    C - Sexta   | Full Body Suave + Flexibilidade
    * Cargas MUITO leves, descanso 90-120s, aquecimento obrigatorio
    * Progredir APENAS apos 3 semanas no mesmo peso sem dor

  GABRIELA — Glut + Pernas + Costas + Ombros:
    A - Segunda  | Gluteos + Posterior de Coxa (Hip Thrust pesado)
    B - Terca    | Costas Largas + Biceps (barra fixa + remada T)
    C - Quarta   | Quadriceps + Panturrilha (agachamento pesado)
    D - Quinta   | Ombros + Trapezio (shoulder heavy)
    E - Sexta    | Peito + Triceps + Core
    F - Sabado   | Gluteos Vol.2 + Definicao (volume alto)
""")


if __name__ == "__main__":
    main()
