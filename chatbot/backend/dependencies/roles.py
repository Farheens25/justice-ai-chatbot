from fastapi import Header, HTTPException
from supabase import create_client, Client
import os

# -----------------------------
# Supabase Client Initialization
# -----------------------------

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase environment variables not set.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# -----------------------------
# Role-Based Access Dependency
# -----------------------------

def require_role(required_roles: list[str] | str):

    def role_checker(authorization: str = Header(None)):

        # -----------------------------
        # 1️⃣ Validate Authorization Header
        # -----------------------------
        if not authorization:
            raise HTTPException(
                status_code=401,
                detail="Missing Authorization header"
            )

        if not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=401,
                detail="Invalid Authorization format"
            )

        token = authorization.split(" ")[1]

        # -----------------------------
        # 2️⃣ Validate JWT with Supabase
        # -----------------------------
        try:
            user_response = supabase.auth.get_user(token)
            user = user_response.user
        except Exception:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired token"
            )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        # -----------------------------
        # 3️⃣ Fetch User Profile Safely
        # -----------------------------
        try:
            profile_response = (
                supabase.table("profiles")
                .select("role")
                .eq("id", user.id)
                .maybe_single()   # prevents 0-row crash
                .execute()
            )
        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Database error while fetching profile"
            )

        # Handle no profile found
        if not profile_response or not profile_response.data:
            raise HTTPException(
                status_code=403,
                detail="Profile not found"
            )

        user_role = profile_response.data.get("role")

        if not user_role:
            raise HTTPException(
                status_code=403,
                detail="User role not assigned"
            )

        # -----------------------------
        # 4️⃣ Role Authorization Logic
        # -----------------------------
        if isinstance(required_roles, list):
            if user_role not in required_roles:
                raise HTTPException(
                    status_code=403,
                    detail="Not authorized"
                )
        else:
            if user_role != required_roles:
                raise HTTPException(
                    status_code=403,
                    detail="Not authorized"
                )

        return user

    return role_checker