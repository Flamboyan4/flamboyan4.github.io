"""Emit an encrypted membership snapshot for a private offline roster check.

Only the caller holding the RSA private key can read the D1 member rows.
GitHub public logs contain ONLY RSA-wrapped AES-GCM ciphertext.
Called on the local clone of a read-only Cloudflare D1 export, pre-fixture.
"""
import base64,json,os,pathlib,secrets,zlib
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes,serialization
from cryptography.hazmat.primitives.asymmetric import padding

PUBKEY=b"""-----BEGIN PUBLIC KEY-----
MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEApD1FO9/8f5/JGwE8yE3V
rw2Bbf+WU2jBdBeKkfpl82NGhl4HmyNTv3G4YOmMJAI5fg7Z84OO3Ki4F7st0KJ5
9/Sl3nF5BJzhrObbjmghEhSQnrNMzR6uSaldBaHMxku4Y/T4PCqWE+XMWsrYHrly
otv2fn7D7bszrHmg9xcUmsDpQRJyyxO6/K3bIha/hlP9RIyQWK7Yy4vj/6V3jkVo
5AnR9RJKk1EFTgU/oryK/0u6GkJcBVfgN1wjBbIM99kHrZwY6NiMbDbRNhxqEjH8
43iK8E2mwB2sfm9CSN1jPYReAsrztGA1AmxepBCQHmBxZdvo5/F5uAokB59YJtwt
kM8gHSWyO0ONQDg+QPsOBCv64IOIv0pee1K4Z4Q4xPfxBPFMsuezaJKrul+VLOs1
4CNqnGcM3ta/pECe5D41CRNhNromIdYnHc8X3b7KpJI1eYIKJbEu+Yrf+Wlsvf/X
/xivQ6abBIM+/U+iqiaPQBvxzrzavfgi62wPHy2PTi6VAgMBAAE=
-----END PUBLIC KEY-----
"""
def snapshot(connection):
  rows=connection.execute("""
  SELECT m.id,m.display_name AS name,h.house_code AS house,m.status,
    (SELECT COUNT(*) FROM accounts a WHERE a.member_id=m.id AND a.status='aktif') AS active_accounts
    FROM members m LEFT JOIN households h ON h.id=m.household_id ORDER BY m.id
  """).fetchall()
  return [{"id":r[0],"name":r[1],"house":r[2],"status":r[3],
           "active_accounts":r[4]} for r in rows]

def emit(connection):
  blob=zlib.compress(json.dumps({"member_rows":snapshot(connection)},ensure_ascii=False,sort_keys=True).encode(),9)
  key=secrets.token_bytes(32)
  nonce=secrets.token_bytes(12)
  ciphertext=AESGCM(key).encrypt(nonce,blob,b"f4-bank-private-audit-20261025")
  rsa=serialization.load_pem_public_key(PUBKEY)
  wrapped=rsa.encrypt(key,padding.OAEP(mgf=padding.MGF1(hashes.SHA256()),
                                        algorithm=hashes.SHA256(),label=None))
  entry={"version":2,"compressed":"zlib","key":base64.b64encode(wrapped).decode(),
         "nonce":base64.b64encode(nonce).decode(),
         "ciphertext":base64.b64encode(ciphertext).decode()}
  # DO NOT print unencrypted names, house codes, login data, or token.
  print("F4_BANK_PRIVATE_AUDIT_ENCRYPTED="+base64.b64encode(json.dumps(entry).encode()).decode(),flush=True)
