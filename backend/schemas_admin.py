from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ProductAdminPanel(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    quantity: Optional[int] = None
    image_name: Optional[str] = None
    date_product: Optional[str] = None
    manufacturer_id: Optional[int] = None
    category_id: Optional[int] = None

    class Config:
        from_attributes = True

class UserAdminPanel(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    hashed_password: str
    phone_number: str
    address: str
    role_id: int
    registered_at: Optional[datetime] = None
    is_superuser: Optional[bool] = False

    class Config:
        from_attributes = True

    @property
    def registered_at_str(self) -> str:
        return self.registered_at.isoformat() if self.registered_at else None

    @property
    def is_superuser_str(self) -> str:
        return str(self.is_superuser)

    def dict(self, **kwargs):
        data = super().dict(**kwargs)
        data['registered_at'] = self.registered_at_str
        data['is_superuser'] = self.is_superuser_str
        return data
    
class ProductInfoAdminPanel(BaseModel):
    id: int
    product_id: int
    composition: Optional[str] = None
    pharmacological_action: Optional[str] = None
    indications: Optional[str] = None
    contraindications: Optional[str] = None
    side_effects: Optional[str] = None
    interactions: Optional[str] = None
    dosage: Optional[str] = None
    overdose: Optional[str] = None
    full_description: Optional[str] = None
    storage_conditions: Optional[str] = None
    shelf_life: Optional[str] = None

    class Config:
        from_attributes = True
    
class CartItemAdminPanel(BaseModel):
    id: int
    user_id: int
    product_id: int
    quantity: int
    added_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True

    @property
    def added_at_str(self) -> str:
        return self.added_at.isoformat()

    def dict(self, **kwargs):
        data = super().dict(**kwargs)
        data['added_at'] = self.added_at_str
        return data

class FavoriteAdminPanel(BaseModel):
    id: int
    user_id: int
    product_id: int
    added_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True

    @property
    def added_at_str(self) -> str:
        return self.added_at.isoformat()

    def dict(self, **kwargs):
        data = super().dict(**kwargs)
        data['added_at'] = self.added_at_str
        return data

class OrderAdminPanel(BaseModel):
    id: int
    user_id: int
    order_date: datetime = Field(default_factory=datetime.utcnow)
    order_total: float

    class Config:
        from_attributes = True

    @property
    def order_date_str(self) -> str:
        return self.order_date.isoformat()

    def dict(self, **kwargs):
        data = super().dict(**kwargs)
        data['order_date'] = self.order_date_str
        return data

class OrderDetailAdminPanel(BaseModel):
    id: int
    order_id: int
    product_id: int
    quantity: int

    class Config:
        from_attributes = True

class SupplyAdminPanel(BaseModel):
    id: int
    supply_date: datetime = Field(default_factory=datetime.utcnow)
    total_cost: Optional[float] = None
    manufacturer_id: int

    class Config:
        from_attributes = True

    @property
    def supply_date_str(self) -> str:
        return self.supply_date.isoformat()

    def dict(self, **kwargs):
        data = super().dict(**kwargs)
        data['supply_date'] = self.supply_date_str
        return data

class SupplyItemAdminPanel(BaseModel):
    id: int
    supply_id: int
    product_id: int
    quantity: int
    cost: float

    class Config:
        from_attributes = True

class ManufacturerAdminPanel(BaseModel):
    id: int
    manufacturer_name: str
    address: str
    phone_number: str
    inn: str
    kpp: str
    account_number: str

    class Config:
        from_attributes = True

class CategoryAdminPanel(BaseModel):
    id: int
    category_name: str

    class Config:
        from_attributes = True

class RoleAdminPanel(BaseModel):
    id: int
    name: str
    permissions: Optional[str] = None

    class Config:
        from_attributes = True