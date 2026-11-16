from pathlib import Path

from pydantic import BaseModel

from app.schemas.profile import ApprovedProfile


class Fixture(BaseModel):
    name: str
    resume_text: str
    expected: ApprovedProfile
    notes: str


def load_fixtures(fixtures_dir: Path | None = None) -> list[Fixture]:
    """Load all fixtures located in apps/api/fixtures/resumes/<name>/."""
    if fixtures_dir is None:
        # Resolve relative to project root or current file
        base_dir = Path(__file__).resolve().parent.parent.parent
        fixtures_dir = base_dir / "fixtures" / "resumes"

    fixtures: list[Fixture] = []
    if not fixtures_dir.exists():
        return fixtures

    for candidate_dir in sorted(fixtures_dir.iterdir()):
        if not candidate_dir.is_dir():
            continue

        resume_path = candidate_dir / "resume.txt"
        expected_path = candidate_dir / "expected.json"
        notes_path = candidate_dir / "notes.md"

        if not (resume_path.exists() and expected_path.exists()):
            continue

        resume_text = resume_path.read_text(encoding="utf-8")
        expected_raw = expected_path.read_text(encoding="utf-8")
        expected = ApprovedProfile.model_validate_json(expected_raw)
        notes = notes_path.read_text(encoding="utf-8") if notes_path.exists() else ""

        fixtures.append(
            Fixture(
                name=candidate_dir.name,
                resume_text=resume_text,
                expected=expected,
                notes=notes,
            )
        )

    return fixtures
