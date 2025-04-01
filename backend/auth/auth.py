from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from passlib.context import CryptContext
from datetime import datetime, timedelta
from models.models import User
from .database import get_db
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import NoResultFound
from typing import Optional
import logging

SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

pwd_context = CryptContext(schemes=["bcrypt"], default="bcrypt")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

logger = logging.getLogger(__name__)

async def get_current_user(db: AsyncSession = Depends(get_db), token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM],options={
            "verify_exp": True,
            "verify_iat": True,
            "verify_nbf": True 
        })
        email: str = payload.get("sub")
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = await db.execute(select(User).where(User.email == email))
    user = user.scalar_one_or_none()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_active_admin(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    query = select(User).where(User.email == token_data.email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
    if user.role_id != 2: 
        raise HTTPException(status_code=403, detail="Only admins allowed")
    return user

def get_current_active_employee(current_user: User = Depends(get_current_active_user)):
    if current_user.role not in ["admin", "employee"]:
        raise HTTPException(status_code=403, detail="Only employees and admins allowed")
    return current_user

async def authenticate_user(email: str, password: str, db: AsyncSession):
    try:
        user = await db.execute(select(User).where(User.email == email))
        user = user.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=400,
                detail="Неверный email",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=400,
                detail="Неверный пароль",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user
    
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.exception(f"Unexpected error during authentication: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Unexpected error",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e

def verify_password(plain_password, hashed_password):
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.exception(f"Unexpected error during password verification: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Неверный пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "nbf": datetime.utcnow()
        })
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_user(db: AsyncSession, user_id: int):
    user = await db.execute(select(User).where(User.id == user_id))
    return user.scalar_one_or_none()

async def get_user_by_email(db: AsyncSession, email: str):
    user = await db.execute(select(User).where(User.email == email))
    return user.scalar_one_or_none()

class TokenData(BaseModel):
    email: Optional[str] = None

def invalidate_token(token: str):
    try:
        if not token:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Токен не может быть пустым")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Ошибка при недействительности токена")
    
