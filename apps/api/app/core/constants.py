from app.core.config import get_settings

DEFAULT_EMBEDDING_DIM = 1536


def get_embedding_dim() -> int:
    try:
        return get_settings().EMBEDDING_DIM
    except Exception:
        return DEFAULT_EMBEDDING_DIM
