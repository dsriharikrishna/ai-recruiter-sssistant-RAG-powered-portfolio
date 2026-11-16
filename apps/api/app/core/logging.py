import logging
import sys
from collections.abc import MutableMapping
from typing import Any, cast

import structlog
from structlog.stdlib import BoundLogger

# Keys that must never be printed to logs
SENSITIVE_KEYS = {
    "password",
    "secret",
    "jwt_secret_key",
    "token",
    "api_key",
    "openai_api_key",
    "authorization",
    "resume_text",
    "raw_resume",
    "resume_raw_text",
    "cv_text",
}


def mask_sensitive_data(
    logger: logging.Logger | None,
    method_name: str,
    event_dict: MutableMapping[str, Any],
) -> MutableMapping[str, Any]:
    """Censors passwords, tokens, API keys, and resume raw text from log entries."""
    for key in list(event_dict.keys()):
        lower_key = key.lower()
        if any(sensitive in lower_key for sensitive in SENSITIVE_KEYS):
            event_dict[key] = "[REDACTED]"
    return event_dict


def setup_logging(log_level: str = "INFO") -> None:
    level = getattr(logging, log_level.upper(), logging.INFO)

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            mask_sensitive_data,
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(level),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(file=sys.stdout),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str = __name__) -> BoundLogger:
    return cast(BoundLogger, structlog.get_logger(name))
