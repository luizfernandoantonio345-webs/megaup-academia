"""
seed_treino_luiz.py
===================
Cria o programa de hipertrofia completo para o aluno Luiz no FitSaaS.
Programa: 5 dias/semana | Triângulo Invertido + Pernas Grandes + Abdômen Trincado

Uso:
    python seed_treino_luiz.py --api http://localhost:8000 --email luiz@email.com --senha suasenha
    python seed_treino_luiz.py   (faz perguntas interativamente)
"""
import argparse
import sys
import time
import unicodedata
import requests

# ---------------------------------------------------------------------------
# PROGRAMA DE TREINO — DESIGN
# ---------------------------------------------------------------------------
# A: PEITO + TRÍCEPS        (Segunda)
# B: COSTAS + BÍCEPS        (Terça)
# C: OMBROS + TRAPÉZIO      (Quarta)
# D: PERNAS + PANTURRILHA   (Quinta)
# E: ABDÔMEN + CORE         (Sexta)
#
# Prioridade máxima: largura de costas (barra fixa + puxada frontal),
# ombros (elevação lateral pesada), e pernas completas.
# ---------------------------------------------------------------------------

EXERCICIOS = [
    # ── PEITO ────────────────────────────────────────────────────────────────
    {
        "nome": "Supino Reto com Barra",
        "grupo_muscular": "peito",
        "equipamento": "barra",
        "video_url": "https://www.youtube.com/watch?v=vcBig73ojpE",
    },
    {
        "nome": "Supino Inclinado com Haltere",
        "grupo_muscular": "peito",
        "equipamento": "haltere",
        "video_url": "https://www.youtube.com/watch?v=8iPEnn-ltC8",
    },
    {
        "nome": "Supino Declinado com Haltere",
        "grupo_muscular": "peito",
        "equipamento": "haltere",
        "video_url": "https://www.youtube.com/watch?v=LfyQTqU4F8M",
    },
    {
        "nome": "Crossover na Polia (Cruzamento)",
        "grupo_muscular": "peito",
        "equipamento": "polia",
        "video_url": "https://www.youtube.com/watch?v=ta7XRJE0E_Y",
    },
    # ── TRÍCEPS ──────────────────────────────────────────────────────────────
    {
        "nome": "Tríceps Corda na Polia",
        "grupo_muscular": "triceps",
        "equipamento": "polia",
        "video_url": "https://www.youtube.com/watch?v=kiuVA0gs3EI",
    },
    {
        "nome": "Tríceps Francês com Barra EZ",
        "grupo_muscular": "triceps",
        "equipamento": "barra",
        "video_url": "https://www.youtube.com/watch?v=d_KZxkY_0cM",
    },
    # ── COSTAS ───────────────────────────────────────────────────────────────
    {
        "nome": "Barra Fixa Pegada Aberta",
        "grupo_muscular": "costas",
        "equipamento": "barra_fixa",
        "video_url": "https://www.youtube.com/watch?v=eGo4IYlbE5g",
    },
    {
        "nome": "Remada Curvada com Barra",
        "grupo_muscular": "costas",
        "equipamento": "barra",
        "video_url": "https://www.youtube.com/watch?v=T3N-TO4reLQ",
    },
    {
        "nome": "Puxada Frontal na Polia",
        "grupo_muscular": "costas",
        "equipamento": "polia",
        "video_url": "https://www.youtube.com/watch?v=CAwf7n6Luuc",
    },
    {
        "nome": "Remada Unilateral com Haltere",
        "grupo_muscular": "costas",
        "equipamento": "haltere",
        "video_url": "https://www.youtube.com/watch?v=pYcpY20QaE8",
    },
    {
        "nome": "Pullover com Haltere",
        "grupo_muscular": "costas",
        "equipamento": "haltere",
        "video_url": "https://www.youtube.com/watch?v=FK4rHfVKFTg",
    },
    # ── BÍCEPS ───────────────────────────────────────────────────────────────
    {
        "nome": "Rosca Direta com Barra EZ",
        "grupo_muscular": "biceps",
        "equipamento": "barra",
        "video_url": "https://www.youtube.com/watch?v=kwG2ipFRgfo",
    },
    {
        "nome": "Rosca Martelo com Haltere",
        "grupo_muscular": "biceps",
        "equipamento": "haltere",
        "video_url": "https://www.youtube.com/watch?v=TwD-YGVP4Bk",
    },
    # ── OMBROS ───────────────────────────────────────────────────────────────
    {
        "nome": "Desenvolvimento com Haltere Sentado",
        "grupo_muscular": "ombros",
        "equipamento": "haltere",
        "video_url": "https://www.youtube.com/watch?v=CnBmiBqp-AI",
    },
    {
        "nome": "Elevação Lateral com Haltere",
        "grupo_muscular": "ombros",
        "equipamento": "haltere",
        "video_url": "https://www.youtube.com/watch?v=3VcKaXpzqRo",
    },
    {
        "nome": "Elevação Frontal com Haltere",
        "grupo_muscular": "ombros",
        "equipamento": "haltere",
        "video_url": "https://www.youtube.com/watch?v=sOoBZ9KYGR4",
    },
    {
        "nome": "Peck Deck Invertido (Deltoide Posterior)",
        "grupo_muscular": "ombros",
        "equipamento": "maquina",
        "video_url": "https://www.youtube.com/watch?v=ttvAYETx-EA",
    },
    {
        "nome": "Face Pull na Polia",
        "grupo_muscular": "ombros",
        "equipamento": "polia",
        "video_url": "https://www.youtube.com/watch?v=rep-qVOkqgk",
    },
    # ── TRAPÉZIO ─────────────────────────────────────────────────────────────
    {
        "nome": "Encolhimento de Ombros com Haltere",
        "grupo_muscular": "trapezio",
        "equipamento": "haltere",
        "video_url": "https://www.youtube.com/watch?v=cJRVVxmytaM",
    },
    # ── PERNAS ───────────────────────────────────────────────────────────────
    {
        "nome": "Agachamento Livre com Barra",
        "grupo_muscular": "pernas",
        "equipamento": "barra",
        "video_url": "https://www.youtube.com/watch?v=1oed-UmAxFs",
    },
    {
        "nome": "Leg Press 45 Graus",
        "grupo_muscular": "pernas",
        "equipamento": "maquina",
        "video_url": "https://www.youtube.com/watch?v=IZxyjW7MPJQ",
    },
    {
        "nome": "Agachamento Bulgaro (Split Squat)",
        "grupo_muscular": "pernas",
        "equipamento": "haltere",
        "video_url": "https://www.youtube.com/watch?v=2C-uNgKwPLE",
    },
    {
        "nome": "Cadeira Extensora",
        "grupo_muscular": "pernas",
        "equipamento": "maquina",
        "video_url": "https://www.youtube.com/watch?v=YyvSfVjQeL0",
    },
    {
        "nome": "Mesa Flexora Deitada",
        "grupo_muscular": "pernas",
        "equipamento": "maquina",
        "video_url": "https://www.youtube.com/watch?v=1Tq3QdYUuHs",
    },
    {
        "nome": "Stiff com Haltere (RDL)",
        "grupo_muscular": "pernas",
        "equipamento": "haltere",
        "video_url": "https://www.youtube.com/watch?v=FWJR5Ve8bnQ",
    },
    # ── PANTURRILHA ──────────────────────────────────────────────────────────
    {
        "nome": "Panturrilha em Pe na Maquina",
        "grupo_muscular": "panturrilha",
        "equipamento": "maquina",
        "video_url": "https://www.youtube.com/watch?v=JbyjNymZOt0",
    },
    {
        "nome": "Panturrilha Sentado",
        "grupo_muscular": "panturrilha",
        "equipamento": "maquina",
        "video_url": "https://www.youtube.com/watch?v=JbyjNymZOt0",
    },
    # ── ABDÔMEN ──────────────────────────────────────────────────────────────
    {
        "nome": "Abdominal Supra (Crunch)",
        "grupo_muscular": "abdomen",
        "equipamento": "peso_corporal",
        "video_url": "https://www.youtube.com/watch?v=Xyd_fa5zoEU",
    },
    {
        "nome": "Elevacao de Pernas (Abdominal Infra)",
        "grupo_muscular": "abdomen",
        "equipamento": "peso_corporal",
        "video_url": "https://www.youtube.com/watch?v=JB2oyawG9KI",
    },
    {
        "nome": "Bicicleta (Bicycle Crunch)",
        "grupo_muscular": "abdomen",
        "equipamento": "peso_corporal",
        "video_url": "https://www.youtube.com/watch?v=9FGilxCbdz8",
    },
    {
        "nome": "Prancha Frontal (Plank)",
        "grupo_muscular": "abdomen",
        "equipamento": "peso_corporal",
        "video_url": "https://www.youtube.com/watch?v=pSHjTRCQxIw",
    },
    {
        "nome": "Russian Twist com Disco",
        "grupo_muscular": "abdomen",
        "equipamento": "disco",
        "video_url": "https://www.youtube.com/watch?v=wkD8rjkodUI",
    },
    {
        "nome": "Abdominal Roda (Ab Wheel)",
        "grupo_muscular": "abdomen",
        "equipamento": "roda_abdominal",
        "video_url": "https://www.youtube.com/watch?v=BlVPnAFtcts",
    },
    {
        "nome": "Vacuo Abdominal (Stomach Vacuum)",
        "grupo_muscular": "abdomen",
        "equipamento": "peso_corporal",
        "video_url": "https://www.youtube.com/watch?v=VwwFmBK2Z2c",
    },
]

# Programa completo: [nome, dia_semana, [(nome_exercicio, series, reps, carga, descanso_seg, ordem)]]
TREINOS = [
    (
        "Treino A — Peito + Triceps",
        "segunda",
        [
            ("Supino Reto com Barra",               4, "6-8",   60.0, 120, 1),
            ("Supino Inclinado com Haltere",         3, "10-12", 22.0,  90, 2),
            ("Supino Declinado com Haltere",         3, "10-12", 22.0,  90, 3),
            ("Crossover na Polia (Cruzamento)",      3, "12-15", None,  60, 4),
            ("Triceps Corda na Polia",               4, "12-15", None,  60, 5),
            ("Triceps Frances com Barra EZ",         3, "10-12", 20.0,  60, 6),
        ],
    ),
    (
        "Treino B — Costas + Biceps",
        "terca",
        [
            ("Barra Fixa Pegada Aberta",             4, "8-10",  None, 120, 1),
            ("Remada Curvada com Barra",             4, "8-10",  60.0,  90, 2),
            ("Puxada Frontal na Polia",              3, "10-12", None,  90, 3),
            ("Remada Unilateral com Haltere",        3, "10-12", 24.0,  60, 4),
            ("Pullover com Haltere",                 3, "12-15", 18.0,  60, 5),
            ("Rosca Direta com Barra EZ",            3, "10-12", 30.0,  60, 6),
            ("Rosca Martelo com Haltere",            3, "12",    16.0,  60, 7),
        ],
    ),
    (
        "Treino C — Ombros + Trapezio",
        "quarta",
        [
            ("Desenvolvimento com Haltere Sentado",  4, "8-10",  20.0,  90, 1),
            ("Elevacao Lateral com Haltere",         4, "12-15", 10.0,  60, 2),
            ("Elevacao Frontal com Haltere",         3, "12",    10.0,  60, 3),
            ("Peck Deck Invertido (Deltoide Posterior)", 3, "15", None, 60, 4),
            ("Face Pull na Polia",                   3, "15",    None,  60, 5),
            ("Encolhimento de Ombros com Haltere",   4, "15-20", 28.0,  45, 6),
        ],
    ),
    (
        "Treino D — Pernas + Panturrilha",
        "quinta",
        [
            ("Agachamento Livre com Barra",          4, "6-8",   80.0, 120, 1),
            ("Leg Press 45 Graus",                   4, "10-12", None,  90, 2),
            ("Agachamento Bulgaro (Split Squat)",    3, "10",    16.0,  90, 3),
            ("Cadeira Extensora",                    3, "12-15", None,  60, 4),
            ("Mesa Flexora Deitada",                 3, "12-15", None,  60, 5),
            ("Stiff com Haltere (RDL)",              3, "12",    30.0,  60, 6),
            ("Panturrilha em Pe na Maquina",         5, "20-25", None,  45, 7),
            ("Panturrilha Sentado",                  4, "15-20", None,  45, 8),
        ],
    ),
    (
        "Treino E — Abdomen + Core",
        "sexta",
        [
            ("Abdominal Supra (Crunch)",             4, "20",    None,  30, 1),
            ("Elevacao de Pernas (Abdominal Infra)", 4, "15",    None,  30, 2),
            ("Bicicleta (Bicycle Crunch)",           3, "20",    None,  30, 3),
            ("Prancha Frontal (Plank)",              4, "45s",   None,  30, 4),
            ("Russian Twist com Disco",              3, "20",    5.0,   30, 5),
            ("Abdominal Roda (Ab Wheel)",            3, "10-15", None,  45, 6),
            ("Vacuo Abdominal (Stomach Vacuum)",     3, "30s",   None,  30, 7),
        ],
    ),
]


# ---------------------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------------------

def ok(label, value=""):
    print(f"  [OK]  {label} {value}")

def err(label, detail=""):
    print(f"  [ERR] {label} {detail}", file=sys.stderr)

def norm(s):
    """Remove accents and lowercase for fuzzy name matching."""
    return ''.join(
        c for c in unicodedata.normalize('NFD', s.lower())
        if unicodedata.category(c) != 'Mn'
    )

def post(url, token, body, retries=3):
    for attempt in range(retries):
        try:
            r = requests.post(url, json=body, headers={"Authorization": f"Bearer {token}"}, timeout=30)
            r.raise_for_status()
            time.sleep(0.4)
            return r.json()
        except requests.exceptions.ConnectionError as e:
            if attempt < retries - 1:
                print(f"    [retry {attempt+1}] connection dropped, waiting 5s...")
                time.sleep(5)
            else:
                raise

def get(url, token, retries=3):
    for attempt in range(retries):
        try:
            r = requests.get(url, headers={"Authorization": f"Bearer {token}"}, timeout=30)
            r.raise_for_status()
            return r.json()
        except requests.exceptions.ConnectionError as e:
            if attempt < retries - 1:
                time.sleep(5)
            else:
                raise


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Seed treino Luiz — FitSaaS")
    parser.add_argument("--api",   default="", help="URL base da API (ex: https://fitsaas-api.onrender.com)")
    parser.add_argument("--email", default="", help="E-mail do personal trainer")
    parser.add_argument("--senha", default="", help="Senha do personal trainer")
    parser.add_argument("--aluno", default="Luiz", help="Nome do aluno (default: Luiz)")
    args = parser.parse_args()

    api   = args.api   or input("URL da API (Enter para http://localhost:8000): ").strip() or "http://localhost:8000"
    email = args.email or input("E-mail do personal: ").strip()
    senha = args.senha or input("Senha do personal: ").strip()
    aluno_nome = args.aluno

    api = api.rstrip("/")
    print(f"\nConectando em {api}\n")

    # 1. Login
    print("[ 1/5 ] Autenticando...")
    try:
        r = requests.post(f"{api}/auth/login", json={"email": email, "senha": senha}, timeout=15)
        r.raise_for_status()
    except Exception as e:
        err("Falha no login", str(e))
        sys.exit(1)

    token = r.json()["access_token"]
    ok("Autenticado como", email)

    # 2. Encontrar o aluno
    print(f"\n[ 2/5 ] Buscando aluno '{aluno_nome}'...")
    alunos = get(f"{api}/alunos/", token)
    aluno = next((a for a in alunos if aluno_nome.lower() in a["nome"].lower()), None)
    if not aluno:
        err(f"Aluno '{aluno_nome}' não encontrado. Alunos disponíveis:")
        for a in alunos:
            print(f"       - {a['nome']} (id={a['id']})")
        sys.exit(1)

    aluno_id = aluno["id"]
    ok(f"Aluno encontrado: {aluno['nome']}", f"(id={aluno_id})")

    # 3. Criar exercícios (pula os que já existem com mesmo nome)
    print(f"\n[ 3/5 ] Criando {len(EXERCICIOS)} exercícios...")
    existentes = get(f"{api}/exercicios/", token)
    # index by normalized name (no accents) for fuzzy matching
    id_por_nome = {norm(e["nome"]): e["id"] for e in existentes}

    for ex in EXERCICIOS:
        n = norm(ex["nome"])
        if n in id_por_nome:
            ok(f"[ja existe] {ex['nome']}")
        else:
            novo = post(f"{api}/exercicios/", token, ex)
            id_por_nome[n] = novo["id"]
            id_por_nome[norm(novo["nome"])] = novo["id"]  # also index by stored name
            ok(f"[criado]    {ex['nome']}", f"(id={novo['id']})")

    # 4. Criar treinos (5 splits)
    print(f"\n[ 4/5 ] Criando {len(TREINOS)} splits de treino para {aluno['nome']}...")

    treinos_existentes = get(f"{api}/treinos/?aluno_id={aluno_id}", token)
    # index treinos by normalized name → {nome_norm: treino_obj}
    treino_por_nome = {norm(t["nome"]): t for t in treinos_existentes}

    for (nome_treino, dia, itens) in TREINOS:
        n = norm(nome_treino)
        if n in treino_por_nome:
            treino_id = treino_por_nome[n]["id"]
            existentes_ids = {it["exercicio_id"] for it in (treino_por_nome[n].get("itens") or [])}
            ok(f"[ja existe] {nome_treino}", f"(id={treino_id}, {len(existentes_ids)} itens ja adicionados)")
        else:
            treino = post(f"{api}/treinos/", token, {
                "aluno_id": aluno_id,
                "nome": nome_treino,
                "dia_semana": dia,
            })
            treino_id = treino["id"]
            existentes_ids = set()
            ok(f"[criado]    {nome_treino}", f"(id={treino_id}, dia={dia})")

        # Add any missing items (handles partial inserts on previous failed runs)
        for (ex_nome, series, reps, carga, descanso, ordem) in itens:
            ex_id = id_por_nome.get(norm(ex_nome))
            if not ex_id:
                err(f"  Exercicio nao encontrado: {ex_nome}")
                continue

            if ex_id in existentes_ids:
                print(f"         = {ex_nome}  (ja existe)")
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
            print(f"         + {ex_nome}  {series}x{reps}  {descanso}s descanso")

    print("\n" + "=" * 60)
    print("  PROGRAMA COMPLETO CRIADO!")
    print("=" * 60)
    print("""
  Splits criados:
    A - Segunda  |  Peito + Triceps
    B - Terca    |  Costas Largas + Biceps
    C - Quarta   |  Ombros + Trapezio
    D - Quinta   |  Pernas + Panturrilha
    E - Sexta    |  Abdomen + Core

  Proximos passos:
    1. Acesse o app como Luiz (aluno) para ver os treinos
    2. Ajuste as cargas iniciais conforme seu nivel atual
    3. Apos 4 semanas, aumente cargas 2.5-5kg nos compostos
    4. Videos: verifique no app e edite se algum nao carregar
""")


if __name__ == "__main__":
    main()
