import sys

from app.evals.comparer import compare_draft_to_expected
from app.evals.config import MAX_INVENTED_ITEMS, MAX_MISSING_ITEMS, MIN_FIELD_ACCURACY
from app.evals.loader import load_fixtures
from app.features.resumes.service import extract_profile
from app.schemas.profile import FactSource


def run_evals() -> int:
    """Run extraction evaluation harness over all fixtures."""
    fixtures = load_fixtures()

    if not fixtures:
        print("[WARN] No fixtures found to evaluate.")
        return 0

    print("=" * 80)
    print("EXTRACTION EVALUATION REPORT")
    print("=" * 80)
    header = f"{'Fixture Name':<20} | {'Accuracy':<10} | {'Invented':<10} | {'Missing':<10} | {'Status':<8}"
    print(header)
    print("-" * 80)

    any_failed = False

    for fixture in fixtures:
        # Extract profile from resume text using extraction service stub
        draft = extract_profile(text=fixture.resume_text, source=FactSource.resume)

        metrics = compare_draft_to_expected(
            fixture_name=fixture.name,
            draft=draft,
            expected=fixture.expected,
            max_invented=MAX_INVENTED_ITEMS,
            max_missing=MAX_MISSING_ITEMS,
            min_accuracy=MIN_FIELD_ACCURACY,
        )

        status_str = "PASS" if metrics.passed else "FAIL"
        if not metrics.passed:
            any_failed = True

        acc_pct = f"{metrics.field_accuracy * 100:.1f}%"
        row = (
            f"{metrics.fixture_name:<20} | {acc_pct:<10} | "
            f"{metrics.invented_items:<10} | {metrics.missing_items:<10} | "
            f"{status_str:<8}"
        )
        print(row)

    print("=" * 80)
    if any_failed:
        print("[FAIL] Evaluation harness failed one or more targets!")
        return 1

    print("[SUCCESS] All evaluation targets passed.")
    return 0


if __name__ == "__main__":
    sys.exit(run_evals())
