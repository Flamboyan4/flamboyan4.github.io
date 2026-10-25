# Bank Sampah — final data and authentication verification (25 Oct 2026)

Scope: **Bank Sampah only**. User-uploaded `Database Bank Sampah.xlsx` compared with the Cloudflare D1 `flamboyan4-staging` read-only export. No production financial transactions were inserted, changed, or removed.

## Private per-person roster reconciliation

Method: export **read-only** D1 to a disposable SQLite clone, encrypt all 33 member records with one-time RSA-OAEP/AES-GCM public-key envelope, decrypt locally using a private key **never shared with GitHub**, compare (full display name, exact house code) with the 33 workbook entries. Raw source names and private decrypted D1 records are not published to this repository, CI logs, or GitHub Actions artifacts.

Result:
- Workbook rows parsed: **33**.
- Cloudflare D1 member rows parsed: **33**.
- Full name matches: **33/33**.
- Exact house code matches: **33/33**.
- Missing people: **0**.
- Additional people: **0**.
- Inactive or ambiguous member-account links: **0**; each member has one active account.

The uploaded workbook had **0** manually entered deposit rows; the D1 clone already has **3** deposit rows. These are preserved and **not** declared to originate from the Excel. No accounting deletion or alteration was performed during this verification.

## Login and financial roundtrip

- Tests use the actual Cloudflare Worker implementation and a **local D1 clone** only; generate strong QA credentials for a cloned superadmin and an existing member account and verify PBKDF2-SHA256 password login, HTTP-only session cookie, member savings scope, denial of admin access to members, and logout revocation. No actual user's password is collected or changed.
- Existing local D1 finance suite covers deposit, batch, sales/reconciliation, allocations, savings ledger, payout, cancellation/reversal, expenses, public/admin/member reporting, year-end and other finance safeguards.
- **88/88 checks pass**, including **six read-only live production gates**: health, public bank overview, public bank report, unauthorized private savings denied, unauthorized admin bank data denied, and an unknown username correctly rejected by the active login endpoint.
- Earlier isolated PC/HP browser acceptance with admin/member UI, statement printing and member CSV download also passed **75/75 checks** before adding production read-only gates.

GitHub Actions evidence: https://github.com/Flamboyan4/flamboyan4.github.io/actions/runs/40159151541

Caveat: no genuine live credential from an actual person was supplied or used, and deliberately no fictitious financial transaction was written into production merely to test it. The **first genuine Bank Sampah deposit still requires a human admin to enter/confirm real amounts**, then to review the associated member and public report. This is an operational step, not a missing frontend/backend implementation.

All original D1 balances, historical records, 21 Cloudflare Worker bindings, and 13 write flags are preserved.
