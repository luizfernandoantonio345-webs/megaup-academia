"""
Camada de IA — integração com a API da Anthropic (Claude).
Responsável por: sugestão de progressão de carga e treino alternativo.

Design de robustez:
- _call_claude: até 2 retries com backoff crescente; levanta na exaustão
- Cada função pública captura toda exceção e retorna fallback seguro
- Saída sempre validada por Pydantic antes de retornar ao caller
- Falha de IA nunca derruba o request nem o scheduler
"""
import json
import time
from typing import Literal

from anthropic import Anthropic
from pydantic import BaseModel, ValidationError

from app.core.config import settings

MODEL = "claude-sonnet-4-6"
_IA_DISPONIVEL = bool(settings.ANTHROPIC_API_KEY)
client = Anthropic(api_key=settings.ANTHROPIC_API_KEY) if _IA_DISPONIVEL else None


# ---------------------------------------------------------------------------
# Modelos internos de validação de saída
# ---------------------------------------------------------------------------

class _AjusteCargaOutput(BaseModel):
    acao: Literal["aumentar", "manter", "reduzir"]
    carga_sugerida: float | None = None
    motivo: str


class _ItemAlternativo(BaseModel):
    exercicio_original: str
    exercicio_alternativo: str
    motivo: str


class _TreinoAlternativoOutput(BaseModel):
    itens: list[_ItemAlternativo]
    observacoes: str = ""


# ---------------------------------------------------------------------------
# Helpers internos
# ---------------------------------------------------------------------------

def _call_claude(system: str, user: str, max_tokens: int = 600, max_retries: int = 2) -> str:
    """Chama Claude com retry e backoff crescente. Levanta a última exceção ao esgotar."""
    if not _IA_DISPONIVEL or client is None:
        raise RuntimeError("ANTHROPIC_API_KEY não configurada")
    last_exc: Exception | None = None
    for attempt in range(max_retries + 1):
        try:
            resp = client.messages.create(
                model=MODEL,
                max_tokens=max_tokens,
                system=system,
                messages=[{"role": "user", "content": user}],
            )
            return resp.content[0].text.strip()
        except Exception as exc:
            last_exc = exc
            if attempt < max_retries:
                time.sleep(0.5 * (attempt + 1))
    raise last_exc  # type: ignore[misc]


def _parse_json(texto: str) -> dict:
    """Remove fences de markdown e parseia JSON."""
    texto = texto.replace("```json", "").replace("```", "").strip()
    return json.loads(texto)


# ---------------------------------------------------------------------------
# Funções públicas
# ---------------------------------------------------------------------------

def sugerir_ajuste_carga(historico_feedback: list[dict]) -> dict:
    """
    Recebe o histórico de feedback das últimas execuções de um exercício
    e retorna sugestão de ajuste de carga validada por Pydantic.

    historico_feedback: [{"data": "...", "carga": 20, "dificuldade": "facil"}, ...]
    Retorna: {"acao": "aumentar"|"manter"|"reduzir", "carga_sugerida": float|null, "motivo": str}
    Nunca levanta exceção — usa fallback "manter" em caso de erro.
    """
    system = (
        "Você é um especialista em prescrição de treino de musculação. "
        "Analise o histórico de execuções de um aluno e sugira o ajuste de carga. "
        "Critérios: 2+ execuções seguidas com dificuldade 'facil' → aumentar carga ~5-10%; "
        "execuções com dificuldade 'dificil' → manter ou reduzir; "
        "variação normal ('ok') → manter com eventual ajuste leve. "
        "Responda SOMENTE com JSON válido, sem markdown, no formato exato:\n"
        '{"acao": "aumentar"|"manter"|"reduzir", "carga_sugerida": <número ou null>, "motivo": "<frase curta>"}'
    )
    user = (
        "Histórico de execuções (do mais antigo ao mais recente):\n"
        + json.dumps(historico_feedback, ensure_ascii=False, default=str)
    )

    try:
        texto = _call_claude(system, user)
        raw = _parse_json(texto)
        validated = _AjusteCargaOutput(**raw)
        return validated.model_dump()
    except (ValidationError, json.JSONDecodeError, KeyError) as e:
        return {"acao": "manter", "carga_sugerida": None, "motivo": f"saída inválida da IA: {e}"}
    except Exception as e:
        return {"acao": "manter", "carga_sugerida": None, "motivo": f"IA indisponível: {e}"}


def gerar_treino_alternativo(treino_original: dict, equipamento_indisponivel: str) -> dict:
    """
    Gera substituições de exercícios quando um equipamento não está disponível.

    treino_original: {"nome": "...", "itens": [{"exercicio": "...", "equipamento": "..."}, ...]}
    equipamento_indisponivel: ex. "barra", "halteres", "pull-down"
    Retorna: {"itens": [{"exercicio_original", "exercicio_alternativo", "motivo"}], "observacoes"}
    Nunca levanta exceção — retorna lista vazia em caso de erro.
    """
    system = (
        "Você é especialista em prescrição de treino de musculação. "
        "O aluno não tem acesso a um equipamento específico. "
        "Sugira exercícios alternativos SOMENTE para os itens que dependem desse equipamento. "
        "Mantenha o grupo muscular trabalhado. "
        "Responda SOMENTE com JSON válido, sem markdown, no formato exato:\n"
        '{"itens": [{"exercicio_original": "...", "exercicio_alternativo": "...", "motivo": "..."}], '
        '"observacoes": "..."}'
    )
    user = (
        f"Equipamento indisponível: {equipamento_indisponivel}\n\n"
        f"Treino original:\n{json.dumps(treino_original, ensure_ascii=False)}"
    )

    try:
        texto = _call_claude(system, user, max_tokens=800)
        raw = _parse_json(texto)
        validated = _TreinoAlternativoOutput(**raw)
        return validated.model_dump()
    except (ValidationError, json.JSONDecodeError, KeyError) as e:
        return {"itens": [], "observacoes": f"saída inválida da IA: {e}"}
    except Exception as e:
        return {"itens": [], "observacoes": f"IA indisponível: {e}"}
