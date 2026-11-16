from app.main import app


def test_openapi_spec_generates_without_errors() -> None:
    schema = app.openapi()
    assert schema is not None
    assert "paths" in schema
    assert "info" in schema
    assert schema["info"]["title"] == "AI Recruiter Assistant API"

    expected_endpoints = [
        "/health",
        "/ready",
        "/v1/resumes",
        "/v1/jobs/{job_id}",
        "/v1/profile/draft",
        "/v1/profile/followups",
        "/v1/profile/approve",
        "/v1/profile/versions",
        "/v1/site/publish",
        "/v1/site",
        "/v1/unanswered",
        "/v1/account",
        "/public/sites/{slug}",
        "/public/chat/stream",
    ]

    for endpoint in expected_endpoints:
        msg = f"Endpoint {endpoint} missing in OpenAPI schema"
        assert endpoint in schema["paths"], msg
