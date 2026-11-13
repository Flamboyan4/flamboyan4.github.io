#!/usr/bin/env python3
"""Validate guarded donor deployment code and SQL statement splitter without touching D1."""
import ast
from pathlib import Path
import sqlite3
import re
import textwrap

ROOT=Path(__file__).resolve().parents[1]
workflow=(ROOT/".github/workflows/f4-finance-guarded-deploy.yml").read_text()
migration=(ROOT/"cloudflare/migrations/20261113_donatur_pendanaan.sql").read_text()
assert "D1_DONOR_ADD_ONLY_SCHEMA_OK=1" in workflow
assert "python3 qa/verify-donor-module.py" in workflow

# Extract the Python heredoc inside the existing GitHub guarded release step.
start=workflow.index('          python3 - <<\'PY\'\n')
end=workflow.index('\n          PY',start)
source=textwrap.dedent(workflow[start:end].split("\n",1)[1])
ast.parse(source,filename="guarded-worker-deploy.py")
assert "donor_expected" in source
assert "d1query(statement)" in source

# The script executes exactly these additive DDL commands, one remote request each.
pending=""
commands=[]
for line in migration.splitlines(keepends=True):
    if line.lstrip().startswith("--"):
        continue
    pending+=line
    if sqlite3.complete_statement(pending):
        statement=pending.strip()
        if statement:
            commands.append(statement)
        pending=""
assert not pending.strip()
assert len(commands)==14, f"Unexpected command count: {len(commands)}"
for sql in commands:
    assert sql.upper().startswith((
        "CREATE TABLE IF NOT EXISTS ",
        "CREATE INDEX IF NOT EXISTS ",
        "CREATE TRIGGER IF NOT EXISTS "
    )),sql[:80]
assert sum(x.upper().startswith("CREATE TABLE") for x in commands)==6
assert sum(x.upper().startswith("CREATE INDEX") for x in commands)==5
assert sum(x.upper().startswith("CREATE TRIGGER") for x in commands)==3

# Compilation and syntax/constraint behavior in isolated SQLite are covered by donor-module QA.
assert "CREATE TABLE IF NOT EXISTS donor_accounts" in migration
assert "CREATE TABLE IF NOT EXISTS donor_sessions" in migration
assert "CREATE TABLE IF NOT EXISTS donor_finance_links" in migration
assert "ALTER TABLE accounts" not in migration
assert re.search(r"\b(?:DROP|DELETE|UPDATE)\s+(?:TABLE\s+)?accounts\b",migration,re.I) is None
print("PASS: guarded deploy Python syntax and 14 additive donor DDL statements.")
