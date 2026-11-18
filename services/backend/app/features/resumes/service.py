from app.features.resumes.parser import extract_text_from_file, parse_resume_to_draft
from app.schemas.profile import FactSource, Flag, FlagKind, ProfileDraft


def extract_profile(text: str, source: FactSource = FactSource.resume) -> ProfileDraft:
    """Extract candidate profile data from unstructured text into a ProfileDraft."""
    return parse_resume_to_draft(text, source=source)


def verify_evidence(draft: ProfileDraft, source_text: str) -> ProfileDraft:
    """Validate that every evidence quote in the draft exists in the source text."""
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
    """Merge facts from resume extraction and portfolio extraction into one draft."""
    combined_flags = list(resume_draft.flags) + list(portfolio_draft.flags)
    return resume_draft.model_copy(update={"flags": combined_flags})
