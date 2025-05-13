from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime
from fastapi import UploadFile

class ProductBase(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    quantity: Optional[int] = None
    image_name: Optional[str] = None
    date_product: Optional[str] = None
    manufacturer_id: Optional[int] = None
    category_id: Optional[int] = None
    manufacturer_name: Optional[str] = None

    class Config:
        from_attributes = True

class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    quantity: Optional[int] = None
    image_name: Optional[str] = None
    date_product: Optional[str] = None
    manufacturer_id: Optional[int] = None
    category_id: Optional[int] = None
    manufacturer_name: Optional[str] = None
    composition: str
    pharmacological_action: str
    indications: str
    contraindications: str
    side_effects: str
    interactions: str
    dosage: str
    overdose: str
    full_description: str
    storage_conditions: str
    shelf_life: str

    class Config:
        from_attributes = True



class RegisterUserData(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    phone_number: str
    address: str
    is_superuser: bool = False

    class Config:
        from_attributes = True
    

class LoginData(BaseModel):
    email: str
    password: str

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    role_id: int

    class Config:
        from_attributes = True



class Profile(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone_number: str
    address: str

    class Config:
        from_attributes = True

class CartItemCreate(BaseModel):
    product_id: int
    quantity: int

    class Config:
        from_attributes = True

class CartItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    price: float
    quantity: int
    total_price: float

    class Config:
        from_attributes = True

class FavoriteCreate(BaseModel):
    product_id: int

    class Config:
        from_attributes = True

class FavoriteResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    added_at: datetime

    class Config:
        from_attributes = True

class CategoryCreate(BaseModel):
    category_name: str

class ManufacturerCreate(BaseModel):
    manufacturer_name: str
    address: str
    phone_number: str
    inn: str
    kpp: str
    account_number: str

class ProductInfoCreate(BaseModel):
    product_id: int
    composition: str
    pharmacological_action: str
    indications: str
    contraindications: str
    side_effects: str
    interactions: str
    dosage: str
    overdose: str
    full_description: str
    storage_conditions: str
    shelf_life: str

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    quantity: int
    image_name: Optional[str] = None
    date_product: str
    manufacturer_id: int
    category_id: int

class OrderResponse(BaseModel):
    id: int
    order_date: datetime
    total_cost: float
    items: List[dict]

class ResetPasswordRequest(BaseModel):
    email: str
    oldPassword: Optional[str] = None
    newPassword: str
    confirmNewPassword: str
    isAuthorized: bool

class SupplyCreate(BaseModel):
    supply_date: Optional[datetime] = None
    total_cost: Optional[float] = None
    manufacturer_id: Optional[int] = None

class SupplyItemCreate(BaseModel):
    product_id: int
    quantity: int