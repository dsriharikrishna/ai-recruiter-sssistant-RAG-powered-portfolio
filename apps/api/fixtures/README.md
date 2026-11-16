# Resume Fixtures Guide

This directory contains evaluation fixtures for the extraction and profile synthesis pipeline.

## Directory Structure

Each fixture lives under `apps/api/fixtures/resumes/<fixture_name>/`:
```
fixtures/resumes/<fixture_name>/
├── resume.txt      # Raw resume text (or input document)
├── expected.json   # Valid ApprovedProfile JSON representing ground truth
└── notes.md        # Edge cases, ambiguities, and evaluation criteria notes
```

## How to Author a Fixture

1. **Create the folder**:
   `apps/api/fixtures/resumes/<candidate_name>/`

2. **Add `resume.txt`**:
   Paste the raw resume text exactly as extracted or provided by candidate.

3. **Add `expected.json`**:
   - Must strictly conform to the `ApprovedProfile` schema defined in `apps/api/app/schemas/profile.py`.
   - Every fact with source other than `user` must include an exact verbatim `evidence` quote found within `resume.txt`.
   - Ensure all dates follow the `YYYY-MM` or `YYYY` schema constraint.

4. **Add `notes.md`**:
   Document specific edge cases being tested:
   - Date formats (e.g., overlapping tenures, open-ended roles)
   - Disambiguation between work experiences and personal projects
   - Implicit vs. explicitly cited skills
   - Unsupported or novel certification formats

