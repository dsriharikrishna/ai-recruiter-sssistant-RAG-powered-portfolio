from app.evals.comparer import compare_draft_to_expected
from app.evals.loader import load_fixtures
from app.modules.extraction.service import extract_profile
from app.schemas.profile import FactSource


def test_fixture_loader_loads_placeholder() -> None:
    fixtures = load_fixtures()
    assert len(fixtures) >= 1
    placeholder = next((f for f in fixtures if f.name == "placeholder"), None)
    assert placeholder is not None
    assert "Alex Johnson" in placeholder.resume_text
    assert placeholder.expected.profile.name == "Alex Johnson"
    assert len(placeholder.expected.experiences) > 0


def test_comparer_accuracy_metrics() -> None:
    fixtures = load_fixtures()
    placeholder = next((f for f in fixtures if f.name == "placeholder"), None)
    assert placeholder is not None

    draft = extract_profile(text=placeholder.resume_text, source=FactSource.resume)
    metrics = compare_draft_to_expected(
        fixture_name="placeholder",
        draft=draft,
        expected=placeholder.expected,
        max_invented=0,
        max_missing=0,
        min_accuracy=1.0,
    )

    assert metrics.fixture_name == "placeholder"
    assert metrics.field_accuracy == 1.0
    assert metrics.invented_items == 0
    assert metrics.missing_items == 0
    assert metrics.passed is True


def test_comparer_detects_invented_and_missing_items() -> None:
    fixtures = load_fixtures()
    placeholder = next((f for f in fixtures if f.name == "placeholder"), None)
    assert placeholder is not None

    draft = extract_profile(text=placeholder.resume_text, source=FactSource.resume)
    # Modify expected to create simulated discrepancies
    modified_expected = placeholder.expected.model_copy(deep=True)
    # Remove all skills to simulate invented items in draft
    modified_expected.skills = []

    metrics = compare_draft_to_expected(
        fixture_name="placeholder-diff",
        draft=draft,
        expected=modified_expected,
        max_invented=0,
        max_missing=0,
        min_accuracy=1.0,
    )

    assert metrics.invented_items > 0
    assert metrics.passed is False
