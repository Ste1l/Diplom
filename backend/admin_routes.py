from auth.database import get_db
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.models import (
    Product, User, ProductInfo, CartItem, Favorite, Order, OrderDetail,
    Supply, SupplyItem, Manufacturer, Category, Role
)
from schemas_admin import (
    ProductAdminPanel, UserAdminPanel, ProductInfoAdminPanel,
    CartItemAdminPanel, FavoriteAdminPanel, OrderAdminPanel,
    OrderDetailAdminPanel, SupplyAdminPanel, SupplyItemAdminPanel,
    ManufacturerAdminPanel, CategoryAdminPanel, RoleAdminPanel
)

router = APIRouter()

@router.get("/products/")
async def get_admin_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product))
    products = result.scalars().all()
    return [ProductAdminPanel.from_orm(p).dict() for p in products]

@router.get("/users/")
async def get_admin_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    users = result.scalars().all()
    return [UserAdminPanel.from_orm(u).dict() for u in users]

@router.get("/product_info/")
async def get_admin_product_info(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProductInfo))
    product_info = result.scalars().all()
    return [ProductInfoAdminPanel.from_orm(pi).dict() for pi in product_info]

@router.get("/cart_items/")
async def get_admin_cart_items(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CartItem))
    cart_items = result.scalars().all()
    return [CartItemAdminPanel.from_orm(item).dict() for item in cart_items]

@router.get("/favorites/")
async def get_admin_favorites(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Favorite))
    favorites = result.scalars().all()
    return [FavoriteAdminPanel.from_orm(item).dict() for item in favorites]

@router.get("/orders/")
async def get_admin_orders(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order))
    orders = result.scalars().all()
    return [OrderAdminPanel.from_orm(item).dict() for item in orders]

@router.get("/order_details/")
async def get_admin_order_details(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(OrderDetail))
    order_details = result.scalars().all()
    return [OrderDetailAdminPanel.from_orm(item).dict() for item in order_details]

@router.get("/supplies/")
async def get_admin_supplies(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Supply))
    supplies = result.scalars().all()
    return [SupplyAdminPanel.from_orm(item).dict() for item in supplies]

@router.get("/supply_items/")
async def get_admin_supply_items(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SupplyItem))
    supply_items = result.scalars().all()
    return [SupplyItemAdminPanel.from_orm(item).dict() for item in supply_items]

@router.get("/manufacturers/")
async def get_admin_manufacturers(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Manufacturer))
    manufacturers = result.scalars().all()
    return [ManufacturerAdminPanel.from_orm(m).dict() for m in manufacturers]

@router.get("/category/")
async def get_admin_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category))
    categories = result.scalars().all()
    return [CategoryAdminPanel.from_orm(c).dict() for c in categories]

@router.get("/roles/")
async def get_admin_roles(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Role))
    roles = result.scalars().all()
    return [RoleAdminPanel.from_orm(r).dict() for r in roles]