from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from app.security import decode_token

oauth2 = OAuth2PasswordBearer(tokenUrl="/auth/login")

def require_role(role: str):
    def checker(token: str = Depends(oauth2)):
        try:
            payload = decode_token(token)
            if payload.get("role") != role:
                raise HTTPException(status_code=403, detail="Insufficient permissions")
            return payload
        except Exception as e:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
    return checker
