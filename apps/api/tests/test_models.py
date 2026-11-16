from app.models.base import Base


def test_models_metadata_registered() -> None:
    tables = Base.metadata.tables.keys()
    expected_tables = {
        "users",
        "documents",
        "extraction_jobs",
        "profile_drafts",
        "profile_versions",
        "chunks",
        "sites",
        "conversations",
        "messages",
        "unanswered_questions",
        "usage_events",
    }
    for table in expected_tables:
        assert table in tables, f"Table {table} not found in metadata"


def test_models_have_owner_id_or_parent_fk() -> None:
    tables = Base.metadata.tables
    # Tenant tables directly isolated by owner_id
    tenant_tables = [
        "documents",
        "profile_drafts",
        "profile_versions",
        "chunks",
        "sites",
        "usage_events",
    ]
    for table_name in tenant_tables:
        table = tables[table_name]
        assert "owner_id" in table.columns, f"{table_name} missing owner_id"
        owner_indices = [
            idx
            for idx in table.indexes
            if any(c.name == "owner_id" for c in idx.columns)
        ]
        assert len(owner_indices) > 0, f"{table_name} missing index on owner_id"
