from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Body, Path # type: ignore
from admin_routes import router as admin_router
from employee_routes import router1 as employee_router
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
from static_config import mount_static



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
mount_static(app)



@app.get("/", tags=["root"])
async def read_root() -> dict:
    return {"message": "Welcome to your todo list."}

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@app.post("/token/check", tags=["auth"])
async def check_token(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    logger.debug(f"Received token: {token}")
    current_user = get_current_user(token, db)
    logger.debug(f"Current user: {current_user}")
    if current_user:
        return {"status": "success"}
    else:
        logger.error("Invalid token")
        raise HTTPException(status_code=401, detail="Invalid token")
        

@app.get("/products/")
async def read_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product))
    products = result.scalars().all()
    return [ProductBase.from_orm(p).dict() for p in products]

@app.get("/products/{product_id}")
async def read_product(product_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Product, ProductInfo).options(
        selectinload(Product.manufacturer),
        selectinload(Product.category)
    ).select_from(
        join(Product, ProductInfo, Product.id == ProductInfo.product_id)
    ).where(Product.id == product_id)
    
    result = await db.execute(stmt)
    product = result.fetchone()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product_data = {
        "id": product.Product.id,
        "name": product.Product.name,
        "description": product.Product.description,
        "price": product.Product.price,
        "quantity": product.Product.quantity,
        "image_name": product.Product.image_name,
        "date_product": product.Product.date_product,
        "manufacturer_id": product.Product.manufacturer_id,
        "category_id": product.Product.category_id,
        "composition": product.ProductInfo.composition,
        "pharmacological_action": product.ProductInfo.pharmacological_action,
        "indications": product.ProductInfo.indications,
        "contraindications": product.ProductInfo.contraindications,
        "side_effects": product.ProductInfo.side_effects,
        "interactions": product.ProductInfo.interactions,
        "dosage": product.ProductInfo.dosage,
        "overdose": product.ProductInfo.overdose,
        "full_description": product.ProductInfo.full_description,
        "storage_conditions": product.ProductInfo.storage_conditions,
        "shelf_life": product.ProductInfo.shelf_life,
    }
    
    if product.Product.manufacturer:
        product_data['manufacturer_name'] = product.Product.manufacturer.manufacturer_name
    
    product_response = ProductResponse(**product_data)
    
    return product_response



class ProductIds(BaseModel):
    product_ids: List[int]

@app.post("/products/batch")
async def get_products_batch(product_ids: ProductIds, db: AsyncSession = Depends(get_db)):
    stmt = select(Product).where(Product.id.in_(product_ids.product_ids))
    result = await db.execute(stmt)
    products = result.scalars().all()
    return {"products": [ProductBase.from_orm(p).dict() for p in products]}

@app.get("/products/search/{q}")
async def search_products(q: str = Path(..., description="Search query"), db: AsyncSession = Depends(get_db)):
    sort_condition = case(
        (func.lower(Product.name).startswith(q.lower()), 1),
        else_=2
    )
    
    stmt = select(Product).where(
        func.lower(Product.name).like(f"%{q.lower()}%")
    ).order_by(
        sort_condition,
        Product.name.asc()
    )
    
    result = await db.execute(stmt)
    products = result.scalars().all()
    return {"products": [ProductBase.from_orm(p).dict() for p in products]}

# Регистрация
pwd_context = CryptContext(schemes=["bcrypt"], default="bcrypt")

@app.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(register_data: RegisterUserData = Body(...), db: AsyncSession = Depends(get_db)):
    try:
        validated_data = RegisterUserData(**register_data.dict())
        
        existing_user = await db.execute(select(User).where(User.email == validated_data.email))
        if existing_user.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Пользователь с таким email уже существует")
        
        hashed_password = pwd_context.hash(validated_data.password)
        
        new_user = User(
            first_name=validated_data.first_name,
            last_name=validated_data.last_name,
            email=validated_data.email,
            hashed_password=hashed_password,
            phone_number=validated_data.phone_number.strip(),
            address=validated_data.address,
            role_id=1,
            registered_at=datetime.utcnow()
        )
        
        try:
            db.add(new_user)
            await db.commit()
            await db.refresh(new_user)
        except IntegrityError:
            await db.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ошибка при добавлении пользователя в базу данных")
        
        return {"message": "Пользователь зарегистрирован успешно", "user": new_user}
    
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=e.errors())
    
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Внутренняя ошибка сервера")
    
class TokenInvalidated(Exception):
    """Исключение для инвалидированных токенов"""
    pass


# Авторизация
@app.post("/login", response_model=dict)
async def login_for_access_token(login_data: LoginData, db: AsyncSession = Depends(get_db)):
    try:
        user = await authenticate_user(login_data.email, login_data.password, db)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        user_data = UserResponse(
            id=user.id,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            role_id=user.role_id
        )
        return {"access_token": access_token, "token_type": "bearer", "user": user_data}
    except HTTPException as http_error:
        raise http_error

@app.post("/logout", status_code=status.HTTP_200_OK)
async def logout(current_user: User = Depends(get_current_user), token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        # Очистить данные сессии
        await current_user.session.clear()
        
        # Очистка корзину пользователя на сервере
        await db.execute(delete(CartItem).where(CartItem.user_id == current_user.id))
        await db.commit()
        
        return {"message": "Вы успешно вышли из системы", "clear_cart": True}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Внутренняя ошибка сервера")



@app.get("/profile/me")
async def read_current_user(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "phone_number": current_user.phone_number,
        "address": current_user.address,
        "role_id": current_user.role_id,
        "hashed_password": current_user.hashed_password
    }

@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    if request.isAuthorized:
        current_user = await get_current_user(db, request.email)
        if not current_user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный токен")
        user = current_user
    else:
        user = await db.execute(select(User).where(User.email == request.email))
        user = user.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")

    print(f"User found: {user.email}")

    if request.newPassword != request.confirmNewPassword:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Пароли не совпадают")

    if request.isAuthorized:
        if not pwd_context.verify(request.oldPassword, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Неверный старый пароль")

    hashed_password = pwd_context.hash(request.newPassword)
    print(f"New hashed password: {hashed_password}")

    user.hashed_password = hashed_password
    try:
        await db.commit()
        print("Password updated successfully")
    except Exception as e:
        await db.rollback()
        print(f"Error updating password: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Ошибка при обновлении пароля")

    print(f"Password updated for user {user.email}")
    return {"message": "Пароль успешно обновлен"}



@app.get("/cart-user/{user_id}")
async def get_user_cart(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    print(f"Getting cart for user {user_id}")
    
    stmt = select(CartItem, Product).join(Product, CartItem.product_id == Product.id).where(CartItem.user_id == user_id)
    
    result = await db.execute(stmt)
    cart_items = result.all()
    
    print(f"Cart items: {cart_items}")
    
    if not cart_items:
        return {"cart": [], "total_quantity": 0}
    
    total_quantity = sum(cart_item.quantity for cart_item, _ in cart_items)
    
    result = []
    for cart_item, product in cart_items:
        result.append({
            "product_id": product.id,
            "name": product.name,
            "price": product.price,
            "image": product.image_name,
            "quantity": cart_item.quantity
        })
    
    print(f"Result: {result}")
    return {
        "cart": result,
        "total_quantity": total_quantity
    }


@app.get("/cart/{user_id}")
async def get_user_cart(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет доступа к cart другого пользователя"
        )

    cart_items = await db.execute(select(CartItem).where(CartItem.user_id == user_id))
    return {"cart": [item.product_id for item in cart_items.scalars().all()]}
    
@app.post("/cart/add-item", status_code=status.HTTP_201_CREATED)
async def add_item_to_cart(
    cart_item: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    product = await db.execute(select(Product).where(Product.id == cart_item.product_id))
    product = product.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Продукт не найден")
    
    if cart_item.quantity > product.quantity:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Недостаточно товара на складе")
    
    existing_item = await db.execute(
        select(CartItem).where(and_(CartItem.user_id == current_user.id, CartItem.product_id == cart_item.product_id))
    )
    existing_item = existing_item.scalar_one_or_none()
    
    if existing_item:
        existing_item.quantity = cart_item.quantity
        await db.commit()
        await db.refresh(existing_item)
        return {"message": f"Количество товара {product.name} в корзине обновлено", "item": existing_item}
    else:
        new_cart_item = CartItem(
            user_id=current_user.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            added_at=datetime.utcnow()
        )
    db.add(new_cart_item)
    await db.commit()
    await db.refresh(new_cart_item)
    
    return {"message": f"Товар {product.name} успешно добавлен в корзину", "item": new_cart_item}

@app.delete("/cart/remove-item")
async def remove_item_from_cart(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        await db.execute(delete(CartItem).where(and_(CartItem.user_id == current_user.id, CartItem.product_id == product_id)))
        await db.commit()
        return {"message": f"Товар с ID {product_id} успешно удален из корзины"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Внутренняя ошибка сервера")
    
@app.delete("/cart/remove-items/{user_id}")
async def remove_all_items_from_cart(user_id: int, db: Session = Depends(get_db)):
    await db.execute(delete(CartItem).where(CartItem.user_id == user_id))
    await db.commit()
    return {"message": "Корзина очищена"}
    
@app.get("/favorites/{user_id}")
async def get_user_favorites(user_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет доступа к favorites другого пользователя"
        )

    favorites = await db.execute(select(Favorite).where(Favorite.user_id == user_id))
    return {"favorites": [item.product_id for item in favorites.scalars().all()]}

@app.post("/favorites/add", status_code=status.HTTP_201_CREATED)
async def add_to_favorites(
    favorite: FavoriteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    existing_favorite = await db.execute(
        select(Favorite).where(
            and_(Favorite.user_id == current_user.id, Favorite.product_id == favorite.product_id)
        )
    )
    existing_favorite = existing_favorite.scalar_one_or_none()
    
    if existing_favorite:
        return {"message": "Товар уже в избранном"}
    
    new_favorite = Favorite(
        user_id=current_user.id,
        product_id=favorite.product_id,
        added_at=datetime.utcnow()
    )
    db.add(new_favorite)
    await db.commit()
    await db.refresh(new_favorite)
    
    return {"message": "Товар добавлен в избранное", "favorite": new_favorite}

@app.delete("/favorites/remove")
async def remove_from_favorites(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    favorite = await db.execute(
        select(Favorite).where(
            and_(Favorite.user_id == current_user.id, Favorite.product_id == product_id)
        )
    )
    favorite = favorite.scalar_one_or_none()
    
    if not favorite:
        return {"message": "Товар не в избранном"}
    
    await db.delete(favorite)
    await db.commit()
    
    return {"message": "Товар удален из избранного"}

@router.get("/orders/{user_id}", response_model=dict[str, List[OrderResponse]])
async def get_user_orders(user_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="You don't have permission to access this user's orders")
    
    stmt = select(Order, OrderDetail, Product).join(OrderDetail, Order.id == OrderDetail.order_id).join(Product, OrderDetail.product_id == Product.id).where(Order.user_id == user_id)
    result = await db.execute(stmt)
    orders = result.all()
    
    formatted_orders = []
    current_order = None
    
    for order, order_detail, product in orders:
        if current_order is None or current_order.id != order.id:
            current_order = order
            formatted_orders.append({
                "id": order.id,
                "order_date": order.order_date,
                "total_cost": order.order_total,
                "items": []
            })
        
        formatted_orders[-1]["items"].append({
            "product_id": product.id,
            "name": product.name,
            "price": product.price,
            "quantity": order_detail.quantity,
            "image_name": product.image_name
        })
    
    return {"orders": formatted_orders}



class AddItemRequest(BaseModel):
    endpoint: str
    data: Dict[str, Any]

models = {
            "roles": Role,
            "users": User,
            "products": Product,
            "product_info": ProductInfo,
            "category": Category,
            "favorites": Favorite,
            "manufacturers": Manufacturer,
            "orders": Order,
            "order_details": OrderDetail,
            "supplies": Supply,
            "supply_items": SupplyItem,
            "cart_items": CartItem,    
        }

@app.get("/admin/dashboard", dependencies=[Depends(get_current_active_admin)])
async def read_admin_dashboard(current_admin: User = Depends(get_current_active_admin)):
    return {
        "message": f"Hello, {current_admin.email}! Welcome to the admin dashboard",
        "user_id": current_admin.id,
        "email": current_admin.email,
        "role_id": current_admin.role_id,
        "is_admin": current_admin.role_id == 2
    }

@app.post("/admin/{endpoint}/add")
async def add_item(endpoint: str, item_data: AddItemRequest, db: AsyncSession = Depends(get_db)):
    try:
        model = models.get(endpoint.lower())
        
        if not model:
            raise HTTPException(status_code=400, detail=f"Неподдерживаемый эндпоинт: {endpoint}")
        
        new_item = model(**item_data.data)
        
        db.add(new_item)
        
        await db.commit()
        await db.refresh(new_item)
        
        return {"message": f"Запись успешно добавлена в {endpoint}", "item": new_item}
    
    
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Ошибка при добавлении записи: {str(e)}")
    
@router.delete("/admin/{endpoint}/delete/{item_id}")
async def delete_item(endpoint: str, item_id: int, db: AsyncSession = Depends(get_db)):
    try:
        if endpoint not in models:
            raise HTTPException(status_code=400, detail="Неподдерживаемый эндпоинт")

        model = models[endpoint]

        stmt = select(model).where(model.id == item_id)

        result = await db.execute(stmt)
        db_item = result.scalar_one_or_none()

        if db_item is None:
            raise HTTPException(status_code=404, detail=f"{endpoint.capitalize()} не найден")

        await db.delete(db_item)

        await db.commit()

        return {"message": f"Запись успешно удалена из {endpoint}"}

    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Невозможно удалить запись из-за связанных данных")
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Внутренняя ошибка сервера")
    


@app.put("/admin/{endpoint}/update/{item_id}")
async def update_item(endpoint: str, item_id: int, item_data: AddItemRequest, db: AsyncSession = Depends(get_db)):
    try:
        print("Received endpoint:", endpoint)
        print("Received item_data:", item_data)
        
        model = models.get(endpoint.lower())
        if not model:
            raise HTTPException(status_code=400, detail=f"Unsupported endpoint: {endpoint}")

        item = await db.execute(select(model).where(model.id == item_id))
        item = item.scalar_one_or_none()
        if not item:
            raise HTTPException(status_code=404, detail=f"{endpoint.capitalize()} not found")

        print("Received update data:", item_data.data)

        required_fields = model.__table__.columns.keys()
        missing_fields = []
        for field in required_fields:
            if field not in item_data.data:
                missing_fields.append(field)
        
        if missing_fields:
            raise HTTPException(
                status_code=422,
                detail=[
                    {"loc": ["body", field], "msg": "Field required"}
                    for field in missing_fields
                ]
            )

        for key, value in item_data.data.items():
            if isinstance(value, str) and value.lower() == 'none':
                value = None
            if key not in ['registered_at', 'added_at', 'order_date', 'supply_date']:
                setattr(item, key, value)

        db.add(item)
        await db.commit()
        await db.refresh(item)

        return {"message": f"Запись успешно обновлена в {endpoint}", "item": item}
    

    except Exception as e:
        await db.rollback()
        print(f"Error updating record: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/process-payment")
async def process_payment(payment_data: dict, db: Session = Depends(get_db)):
    try:
        new_order = Order(
            user_id=payment_data['user_id'],
            order_date=datetime.now(),
            order_total=sum(item['price'] * item['quantity'] for item in payment_data['cart_items'])
        )
        db.add(new_order)
        await db.commit()
        await db.refresh(new_order)

        for item in payment_data['cart_items']:
            order_detail = OrderDetail(
                order_id=new_order.id,
                product_id=item['product_id'],
                quantity=item['quantity']
            )
            db.add(order_detail)
        
        await db.commit()

        for item in payment_data['cart_items']:
            product = await db.execute(select(Product).where(Product.id == item['product_id']))
            product = product.scalar_one_or_none()
            if product:
                new_quantity = product.quantity - item['quantity']
                if new_quantity < 0:
                    raise HTTPException(status_code=400, detail=f"Недостаточно товара {product.name} на складе")
                product.quantity = new_quantity
                db.add(product)
                await db.commit()

        await db.execute(delete(CartItem).where(CartItem.user_id == payment_data['user_id']))
        await db.commit()

        return {"message": "Платеж успешно обработан"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

app.include_router(employee_router, prefix="/api", tags=["api"])
app.include_router(admin_router, prefix="/admin", tags=["admin"])
app.include_router(router)