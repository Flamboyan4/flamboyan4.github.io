"""Low-impact Bank Sampah LIVE auth/public read-only smoke.

All GET checks are read-only. The sole POST tests a mathematically unrelated,
nonexistent username; never sends/changes an actual resident credential.
"""
import json,urllib.request,urllib.error

HOST="https://api.flamboyan4.web.id"
ORIGIN="https://flamboyan4.web.id"

def fetch(path,method="GET",body=None):
    raw=None if body is None else json.dumps(body).encode()
    req=urllib.request.Request(HOST+path,method=method,data=raw,
      headers={"Accept":"application/json","Origin":ORIGIN,
               "Cache-Control":"no-cache","User-Agent":"F4-Bank-Completion-ReadOnly/1.0",
               **({"Content-Type":"application/json"} if raw is not None else {})})
    try:
        with urllib.request.urlopen(req,timeout=18) as r:
            return r.status,json.loads(r.read(2000000))
    except urllib.error.HTTPError as ex:
        try:response=json.loads(ex.read(2000000))
        except:response={}
        return ex.code,response

def verify(assert_step):
    health=fetch("/api/health")
    assert_step("production_bank_health_readonly",health[0]==200)
    overview=fetch("/api/v2/public/bank")
    assert_step("production_bank_public_overview_readonly",
        overview[0]==200 and "overview" in overview[1] and "progress" in overview[1])
    report=fetch("/api/v2/public/bank/report")
    assert_step("production_bank_public_report_readonly",
        report[0]==200 and "ringkasan" in report[1] and report[1].get("readOnly") is True)
    private=fetch("/api/member/savings")
    assert_step("production_bank_savings_requires_login",private[0] in (401,403))
    admin=fetch("/api/v2/admin/bank/members?limit=1")
    assert_step("production_bank_admin_requires_login",admin[0] in (401,403))
    unknown=fetch("/api/auth/login","POST",
        {"username":"f4unregisteredqareadonly20261025neverexists",
         "password":"NotAResidentTestOnly"})
    assert_step("production_bank_auth_endpoint_active_rejects_unknown",
        unknown[0]==401)
    return {"public":"ok","anonymous_blocked":True,"auth_enabled":True,
            "actual_user_login":"not_attempted"}
