from app.api.v1.mock_data import get_mock_profile_draft
from app.schemas.profile import FactSource, Flag, FlagKind, ProfileDraft


def extract_profile(text: str, source: FactSource) -> ProfileDraft:
    """Extract candidate profile data from unstructured text into a ProfileDraft.

    Real implementation requirement:
    1. Parse source text (from resume or portfolio website).
    2. Invoke LLM structured output adhering to the ProfileDraft Pydantic schema.
    3. Ensure every extracted fact carries source, type, and an exact evidence quote.
    4. Flag ambiguities or unverified claims for candidate confirmation.

    Stub behavior:
    Returns standard mock ProfileDraft populated with valid structure and flags.
    """
    return get_mock_profile_draft()


def verify_evidence(draft: ProfileDraft, source_text: str) -> ProfileDraft:
    """Validate that every evidence quote in the draft exists in the source text.

    Real implementation requirement:
    1. Iterate over every Experience, Project, Skill, Education, Certification.
    2. Check if item.evidence is substring / semantic match of source_text.
    3. If evidence is not in source_text:
       - Drop the ungrounded fact, OR
       - Add a Flag(kind=FlagKind.conflict, target_id=item.id, message=...)
    4. Return sanitized ProfileDraft.

    Stub behavior:
    Checks if evidence exists in source_text; if not, appends a confirmation flag.
    """
    normalized_source = source_text.lower()
    updated_flags = list(draft.flags)

    for exp in draft.experiences:
        if exp.evidence and exp.evidence.lower() not in normalized_source:
            msg = f"Evidence quote for '{exp.company}' not found in source text"
            updated_flags.append(
                Flag(
                    kind=FlagKind.conflict,
                    target_id=exp.id,
                    message=msg,
                )
            )

    return draft.model_copy(update={"flags": updated_flags})


def merge_drafts(
    resume_draft: ProfileDraft, portfolio_draft: ProfileDraft
) -> ProfileDraft:
    """Merge facts from resume extraction and portfolio extraction into one draft.

    Real implementation requirement:
    1. Resume is primary source of truth; portfolio is supplementary.
    2. Match items by company+role, project name, or skill name.
    3. Detect discrepancies (dates, titles) and produce Flag(kind=conflict).
    4. Combine unique projects, links, and portfolio highlights.

    Stub behavior:
    Returns resume_draft with combined contact links and flags from portfolio.
    """
    combined_flags = list(resume_draft.flags) + list(portfolio_draft.flags)
    return resume_draft.model_copy(update={"flags": combined_flags})
