from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Body, Path # type: ignore
from admin_routes import router as admin_router
from employee_routes import router1 as employee_router
from endpoints import router2 as main_router
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from pydantic import BaseModel, ValidationError # type: ignore
from models.models import Category, Manufacturer, Product, Role, Supply, SupplyItem, User, ProductInfo, CartItem, Favorite, Order, OrderDetail
from schemas import ProductBase, ProductResponse, RegisterUserData, LoginData, UserResponse, CartItemCreate, FavoriteCreate, OrderResponse, ResetPasswordRequest
from sqlalchemy.ext.asyncio import AsyncSession # type: ignore
from sqlalchemy import select, join, and_, delete, func, case # type: ignore
from sqlalchemy.exc import IntegrityError # type: ignore
from sqlalchemy.orm import Session, selectinload # type: ignore
from typing import List, Dict, Any
from datetime import datetime, timedelta
from auth.auth import ACCESS_TOKEN_EXPIRE_MINUTES, authenticate_user, create_access_token, get_current_user, oauth2_scheme, get_current_active_admin
from auth.database import get_db
from passlib.context import CryptContext # type: ignore
import logging
# from static_config import mount_static



app = FastAPI()

origins = [
    "http://localhost:3000",
    "localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

router = APIRouter()



# Устанавливаем путь к статическим файлам
""" app.mount("/static/products_image", StaticFiles(directory=os.path.join(project_root, ".", "frontend", "src", "img", "products_image")), name="products-image") """
# mount_static(app)




    
app.include_router(main_router, prefix="/main", tags=["main"])
app.include_router(employee_router, prefix="/api", tags=["api"])
app.include_router(admin_router, prefix="/admin", tags=["admin"])
app.include_router(router)