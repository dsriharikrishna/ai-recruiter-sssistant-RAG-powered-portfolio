from typing import Any

from pydantic import BaseModel

from app.schemas.profile import ApprovedProfile, ProfileDraft


class EvalMetrics(BaseModel):
    fixture_name: str
    total_fields: int
    matching_fields: int
    field_accuracy: float
    invented_items: int
    missing_items: int
    passed: bool


def _extract_fact_identifiers(items: list[Any], key_attr: str) -> set[str]:
    keys = set()
    for item in items:
        val = getattr(item, key_attr, None)
        if val:
            keys.add(str(val).strip().lower())
    return keys


def compare_draft_to_expected(
    fixture_name: str,
    draft: ProfileDraft,
    expected: ApprovedProfile,
    max_invented: int = 0,
    max_missing: int = 0,
    min_accuracy: float = 1.0,
) -> EvalMetrics:
    """Compare an extracted ProfileDraft against an expected ground truth.

    Matches fields across profile, contact, experiences, projects, skills, etc.
    """
    total_fields = 0
    matching_fields = 0

    # 1. Profile metadata checks
    profile_fields = ["name", "headline", "summary"]
    for field in profile_fields:
        total_fields += 1
        draft_val = getattr(draft.profile, field, None)
        exp_val = getattr(expected.profile, field, None)
        if draft_val == exp_val:
            matching_fields += 1

    # 2. Contact details checks
    total_fields += 2
    if draft.contact.email == expected.contact.email:
        matching_fields += 1
    if draft.contact.phone == expected.contact.phone:
        matching_fields += 1

    # 3. List comparisons: Experiences, Projects, Skills, Educations, Certifications
    comparisons: list[tuple[str, list[Any], list[Any], str]] = [
        ("experiences", list(draft.experiences), list(expected.experiences), "company"),
        ("projects", list(draft.projects), list(expected.projects), "name"),
        ("skills", list(draft.skills), list(expected.skills), "name"),
        (
            "educations",
            list(draft.educations),
            list(expected.educations),
            "institution",
        ),
        (
            "certifications",
            list(draft.certifications),
            list(expected.certifications),
            "name",
        ),
    ]

    total_invented = 0
    total_missing = 0

    for _cat_name, draft_list, exp_list, match_key in comparisons:
        draft_set = _extract_fact_identifiers(draft_list, match_key)
        exp_set = _extract_fact_identifiers(exp_list, match_key)

        invented = len(draft_set - exp_set)
        missing = len(exp_set - draft_set)
        matched = len(draft_set & exp_set)

        total_invented += invented
        total_missing += missing
        total_fields += len(exp_set)
        matching_fields += matched

    field_accuracy = (matching_fields / total_fields) if total_fields > 0 else 1.0

    passed = (
        total_invented <= max_invented
        and total_missing <= max_missing
        and field_accuracy >= min_accuracy
    )

    return EvalMetrics(
        fixture_name=fixture_name,
        total_fields=total_fields,
        matching_fields=matching_fields,
        field_accuracy=round(field_accuracy, 4),
        invented_items=total_invented,
        missing_items=total_missing,
        passed=passed,
    )
