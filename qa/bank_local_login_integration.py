"""Real Worker /api/auth/login and cookie checks using synthetic LOCAL D1 credentials only."""
import hashlib,json,secrets,sqlite3,urllib.request,urllib.error

def crypt(password):
    salt=secrets.token_bytes(16)
    dk=hashlib.pbkdf2_hmac("sha256",password.encode(),salt,100000,dklen=32)
    return "pbkdf2-sha256:100000:"+salt.hex()+":"+dk.hex()

def fetch(origin,path,method="GET",body=None,cookie=None):
    raw=json.dumps(body).encode() if body is not None else None
    heads={"Accept":"application/json"}
    if raw is not None:heads["Content-Type"]="application/json"
    if cookie:heads["Cookie"]=cookie
    req=urllib.request.Request(origin+path,data=raw,method=method,headers=heads)
    try:
        with urllib.request.urlopen(req,timeout=10) as res:
            return res.status,json.load(res),res.headers.get("Set-Cookie","")
    except urllib.error.HTTPError as ex:
        try:reply=json.load(ex)
        except:reply={}
        return ex.code,reply,ex.headers.get("Set-Cookie","")

def verify(db_path,origin,assert_step):
    username_admin="f4auditadmin"+secrets.token_hex(7)
    username_member="f4auditmember"+secrets.token_hex(7)
    pw_admin="QA!"+secrets.token_urlsafe(18)
    pw_member="QA!"+secrets.token_urlsafe(18)
    with sqlite3.connect(str(db_path)) as db:
        admin=db.execute("SELECT id FROM accounts WHERE role='superadmin' LIMIT 1").fetchone()
        member=db.execute("SELECT id FROM members WHERE status='aktif' LIMIT 1").fetchone()
        member_acc=db.execute("SELECT id FROM accounts WHERE role='anggota' LIMIT 1").fetchone()
        if not(admin and member and member_acc):raise AssertionError("Missing superadmin/member account in cloned D1")
        db.execute("""UPDATE accounts SET username=?,password_hash=?,password_scheme='pbkdf2-sha256',
            failed_attempts=0,locked_until=NULL,status='aktif' WHERE id=?""",
            (username_admin,crypt(pw_admin),admin[0]))
        db.execute("""UPDATE accounts SET username=?,password_hash=?,password_scheme='pbkdf2-sha256',
            failed_attempts=0,locked_until=NULL,status='aktif',member_id=? WHERE id=?""",
            (username_member,crypt(pw_member),member[0],member_acc[0]))
        db.commit()
    # One deliberately unknown username, not an existing account, must be denied.
    bad=fetch(origin,"/api/auth/login","POST",{"username":"f4qa-unknown-never-exists","password":"1234"})
    assert_step("bank_live_auth_rejects_unknown_account_local",bad[0]==401)
    a=fetch(origin,"/api/auth/login","POST",{"username":username_admin,"password":pw_admin})
    acookie=a[2].split(";",1)[0]
    assert_step("bank_real_password_login_admin_local",a[0]==200 and
        a[1].get("role")=="superadmin" and acookie.startswith("f4_session="))
    am=fetch(origin,"/api/v2/admin/bank/members?limit=5",cookie=acookie)
    assert_step("bank_admin_cookie_can_access_members_local",am[0]==200)
    m=fetch(origin,"/api/auth/login","POST",{"username":username_member,"password":pw_member})
    mcookie=m[2].split(";",1)[0]
    assert_step("bank_real_password_login_member_local",m[0]==200 and
        m[1].get("role")=="anggota" and mcookie.startswith("f4_session="))
    private=fetch(origin,"/api/member/savings",cookie=mcookie)
    assert_step("bank_member_cookie_can_access_own_savings_local",
        private[0]==200 and private[1].get("anggota",{}).get("id")==member[0])
    forbidden=fetch(origin,"/api/v2/admin/bank/members?limit=5",cookie=mcookie)
    assert_step("bank_member_cookie_cannot_access_admin_local",forbidden[0] in (401,403))
    ended=fetch(origin,"/api/auth/logout","POST",cookie=mcookie)
    denied=fetch(origin,"/api/member/savings",cookie=mcookie)
    assert_step("bank_logout_revokes_member_cookie_local",
        ended[0]==200 and denied[0] in (401,403))
    return {"admin":"password_verified","member":"password_verified",
            "permissions":"enforced","logout":"revoked","storage":"isolated D1"}
