from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

# Mock OAuth2 implementation for MVP
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme)):
    # In a real implementation, decode JWT and verify RBAC
    if not token or token == "invalid":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"user_id": "admin_uuid", "role": "Investigator"}

def require_admin(user: dict = Depends(get_current_user)):
    if user.get("role") not in ["Admin", "Supervisor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Admin or Supervisor required."
        )
    return user
