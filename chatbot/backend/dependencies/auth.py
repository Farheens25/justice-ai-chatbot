
from fastapi import Depends, HTTPException, Header
from services.supabase_client import supabase

def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")

    try:
        token = authorization.split(" ")[1]  # Bearer <token>
    except:
        raise HTTPException(status_code=401, detail="Invalid token format")

    user = supabase.auth.get_user(token)

    if not user or not user.user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return user.user