from collections.abc import MutableMapping
from typing import Any

from app.core.logging import mask_sensitive_data


def test_sensitive_data_masked_in_logs() -> None:
    event_dict: MutableMapping[str, Any] = {
        "event": "user_action",
        "password": "my_secret_password",
        "jwt_secret_key": "jwt_key_123",
        "openai_api_key": "sk-12345",
        "resume_text": "Experienced software engineer at Google...",
        "user_email": "candidate@example.com",
    }

    masked = mask_sensitive_data(logger=None, method_name="info", event_dict=event_dict)

    assert masked["password"] == "[REDACTED]"
    assert masked["jwt_secret_key"] == "[REDACTED]"
    assert masked["openai_api_key"] == "[REDACTED]"
    assert masked["resume_text"] == "[REDACTED]"
    assert masked["user_email"] == "candidate@example.com"
