#!/usr/bin/env python3
"""Read-only Cloudflare D1/Worker readiness check. Never prints secrets or private rows.

Environment: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID.
Only the named staging database may be inspected. No schema or data mutations.
"""
from __future__ import annotations
import json
import os
import re
import sys
import urllib.request
from urllib.error import HTTPError, URLError

WORKER_NAME = "flamboyan4-terpadu-staging"
DATABASE_NAME = "flamboyan4-staging"

def main() -> int:
    token = os.getenv("CLOUDFLARE_API_TOKEN", "")
    account = os.getenv("CLOUDFLARE_ACCOUNT_ID", "")
    if not token or not account:
        print("PREFLIGHT=BLOCKED: Cloudflare GitHub Actions secrets unavailable")
        return 2

    root = f"https://api.cloudflare.com/client/v4/accounts/{account}"

    def call(path: str, *, sql: str | None = None):
        if sql is not None:
            cleaned = sql.strip().upper()
            if not (cleaned.startswith("SELECT ") or cleaned.startswith("PRAGMA TABLE_INFO(")):
                raise ValueError("Only read-only metadata queries are permitted")
        payload = json.dumps({"sql": sql}).encode("utf-8") if sql else None
        headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}
        if payload is not None:
            headers["Content-Type"] = "application/json"
        request = urllib.request.Request(root + path, headers=headers, data=payload,
                                         method="POST" if payload is not None else "GET")
        with urllib.request.urlopen(request, timeout=35) as response:
            data = json.load(response)
        if data.get("success") is not True:
            raise RuntimeError("Cloudflare API refused metadata request")
        return data.get("result")

    try:
        settings = call("/workers/scripts/" + WORKER_NAME + "/settings")
        bindings = {x.get("name"): x for x in (settings.get("bindings") or [])}
        if bindings.get("DB", {}).get("type") != "d1":
            print("PREFLIGHT=BLOCKED: Worker has no D1 binding")
            return 2
        if bindings.get("PHOTOS", {}).get("type") != "r2_bucket":
            print("PREFLIGHT=BLOCKED: Worker has no PHOTOS R2 binding")
            return 2
        databases = call("/d1/database")
        db = next((x for x in databases if x.get("name") == DATABASE_NAME), None)
        if db is None or bindings["DB"].get("id") != db.get("uuid"):
            print("PREFLIGHT=BLOCKED: Worker does not point to expected staging D1")
            return 2
        query_path = "/d1/database/" + db["uuid"] + "/query"

        def query(sql: str):
            result = call(query_path, sql=sql)
            if not isinstance(result, list) or len(result) != 1 or result[0].get("success") is not True:
                raise RuntimeError("D1 metadata read failed")
            return result[0].get("results") or []

        tables = {r["name"] for r in query(
            "SELECT name FROM sqlite_master WHERE type='table' AND name IN "
            "('accounts','sessions','treasury_events','treasury_entries','portal_project_cards','donor_organizations')"
        )}
        required = {"accounts", "sessions", "treasury_events", "treasury_entries", "portal_project_cards"}
        if not required.issubset(tables):
            print("PREFLIGHT=BLOCKED: Missing required staging tables: " + ", ".join(sorted(required - tables)))
            return 2
        cols = {row["name"]: row for row in query("PRAGMA table_info(accounts)")}
        if not {"id", "username", "role", "member_id", "status", "password_hash"}.issubset(cols):
            print("PREFLIGHT=BLOCKED: Unrecognized accounts schema")
            return 2
        member_nullable = not bool(cols["member_id"].get("notnull"))
        account_schema = query("SELECT sql FROM sqlite_master WHERE type='table' AND name='accounts'")
        # Schema-only metadata for migration design; never inspect credentials or user rows.
        import json as _json
        fk = query("PRAGMA foreign_key_list(accounts)")
        idx = query("PRAGMA index_list(accounts)")
        triggers = query("SELECT name FROM sqlite_master WHERE type='trigger' AND tbl_name='accounts'")
        print("ACCOUNT_STRUCTURE=" + _json.dumps({
            "columns":[{"name":n,"type":str(v.get("type") or ""),"notnull":bool(v.get("notnull")),"pk":int(v.get("pk") or 0)}
                       for n,v in cols.items()],
            "foreign_keys":[{"from":x.get("from"),"to":x.get("to"),"table":x.get("table"),"on_delete":x.get("on_delete")}
                            for x in fk],
            "indexes":[{"name":x.get("name"),"unique":bool(x.get("unique"))} for x in idx],
            "triggers":[x.get("name") for x in triggers]
        },separators=(",",":")))
        ddl = str(account_schema[0].get("sql") or "") if account_schema else ""
        role_check = re.search(r"""CHECK\s*\(\s*["']?role["']?\s+IN\s*\(([^)]*)\)""", ddl, re.I)
        print("ACCOUNT_ROLE_CHECK_OPTIONS=" + json.dumps(
            re.findall(r"""['"]([a-z_-]{2,32})['"]""", role_check.group(1), re.I) if role_check else []))
        donor_allowed = role_check is None or re.search(r"""['"]donatur['"]""", role_check.group(1)) is not None
        flags = {
            "staging_worker_and_D1_binding_valid": True,
            "member_id_nullable": member_nullable,
            "role_donatur_accepted_by_existing_role_check": bool(donor_allowed),
            "donor_tables_exist": "donor_organizations" in tables,
        }
        print("DONOR_STAGING_PREFLIGHT=" + json.dumps(flags, sort_keys=True, separators=(",", ":")))
        if not member_nullable or not donor_allowed:
            print("PREFLIGHT=BLOCKED: accounts needs an audited role migration before account creation")
            return 2
        print("PREFLIGHT=READ_ONLY_OK: No D1 rows or schema were modified")
        return 0
    except (HTTPError, URLError, ValueError, RuntimeError, KeyError, TypeError) as exc:
        print("PREFLIGHT=BLOCKED: Cloudflare metadata validation failed (" + type(exc).__name__ + ")")
        return 2


if __name__ == "__main__":
    sys.exit(main())
