from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Numeric, JSON ,Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, Mapped,mapped_column

Base = declarative_base()

class Role(Base):
    __tablename__ = 'roles'
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    permissions = Column(JSON)
    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    phone_number = Column(String(20))
    address = Column(String(255))
    role_id = Column(Integer, ForeignKey('roles.id'))
    registered_at = Column(DateTime, default=datetime.utcnow)
    is_superuser = Column(Boolean, default=False)

    role = relationship("Role", back_populates="users")

    class Config:
        from_attributes = True


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=True)
    quantity = Column(Integer, nullable=True)
    image_name = Column(String, nullable=True)
    date_product = Column(String(length=50), nullable=True)
    manufacturer_id = Column(Integer, ForeignKey("manufacturers.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))

    manufacturer = relationship("Manufacturer", back_populates="products", lazy='selectin')
    category = relationship("Category", back_populates="products")
    info = relationship("ProductInfo", back_populates="product")

    class Config:
        from_attributes = True

class ProductInfo(Base):
    __tablename__ = "product_info"
    
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey('products.id'))
    product = relationship("Product", back_populates="info")

    composition = Column(String, nullable=True)
    pharmacological_action = Column(String, nullable=True)
    indications = Column(String, nullable=True)
    contraindications = Column(String, nullable=True)
    side_effects = Column(String, nullable=True)
    interactions = Column(String, nullable=True)
    dosage = Column(String, nullable=True)
    overdose = Column(String, nullable=True)
    full_description = Column(String, nullable=True)
    storage_conditions = Column(String, nullable=True)
    shelf_life = Column(String, nullable=True)

    class Config:
        from_attributes = True
    

class Category(Base):
    __tablename__ = 'categories'
    id = Column(Integer, primary_key=True)
    category_name = Column(String(255), nullable=False)

    class Config:
        from_attributes = True

class Favorite(Base):
    __tablename__ = 'favorites'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    product_id = Column(Integer, ForeignKey('products.id'))
    added_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="favorites")
    product = relationship("Product", back_populates="favorites")

    class Config:
        from_attributes = True

class Manufacturer(Base):
    __tablename__ = 'manufacturers'
    id = Column(Integer, primary_key=True)
    manufacturer_name = Column(String(255), nullable=False)
    address = Column(String(255), nullable=False)
    phone_number = Column(String(20), nullable=False)
    inn = Column(String(12), nullable=False)
    kpp = Column(String(12), nullable=False)
    account_number = Column(String(10), nullable=False)

    supplies = relationship("Supply", back_populates="manufacturer")
    products = relationship("Product", back_populates="manufacturer")

    class Config:
        from_attributes = True

class Order(Base):
    __tablename__ = 'orders'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    order_date = Column(DateTime, default=datetime.utcnow)
    order_total = Column(Numeric(10, 2), nullable=False)
    user = relationship("User", back_populates="orders")

    class Config:
        from_attributes = True

class OrderDetail(Base):
    __tablename__ = 'order_details'
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey('orders.id'))
    product_id = Column(Integer, ForeignKey('products.id'))
    quantity = Column(Integer, nullable=False)
    order = relationship("Order", back_populates="order_details")
    product = relationship("Product")

    class Config:
        from_attributes = True

class Supply(Base):
    __tablename__ = 'supplies'
    id = Column(Integer, primary_key=True)
    supply_date = Column(DateTime, default=datetime.utcnow)
    total_cost = Column(Numeric(10, 2))
    manufacturer_id = Column(Integer, ForeignKey('manufacturers.id'))
    manufacturer = relationship("Manufacturer", back_populates="supplies")

    class Config:
        from_attributes = True

class SupplyItem(Base):
    __tablename__ = 'supply_items'
    id = Column(Integer, primary_key=True)
    supply_id = Column(Integer, ForeignKey('supplies.id'))
    product_id = Column(Integer, ForeignKey('products.id'))
    quantity = Column(Integer, nullable=False)
    cost = Column(Numeric(10, 2), nullable=False)
    supply = relationship("Supply", back_populates="supply_items")
    product = relationship("Product")

    class Config:
        from_attributes = True



class CartItem(Base):
    __tablename__ = 'cart_items'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    product_id = Column(Integer, ForeignKey('products.id'))
    quantity = Column(Integer, nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")

    class Config:
        from_attributes = True


# Определяем отношения
User.role = relationship("Role", back_populates="users")
Role.users = relationship("User", back_populates="role")

# Добавляем остальные отношения для других моделей
User.favorites = relationship("Favorite", back_populates="user")
User.orders = relationship("Order", back_populates="user")
User.cart_items = relationship("CartItem", back_populates="user")

# Добавлены обратные связи для полноты картины
Role.users = relationship("User", order_by=User.id, back_populates="role")
Product.favorites = relationship("Favorite", order_by=Favorite.id, back_populates="product")
Product.order_details = relationship("OrderDetail", order_by=OrderDetail.id, back_populates="product")
Product.cart_items = relationship("CartItem", order_by=CartItem.id, back_populates="product")
Product.supply_items = relationship("SupplyItem", order_by=SupplyItem.id, back_populates="product")
User.favorites = relationship("Favorite", order_by=Favorite.id, back_populates="user")
User.orders = relationship("Order", order_by=Order.id, back_populates="user")
Manufacturer.supplies = relationship("Supply", order_by=Supply.id, back_populates="manufacturer")
Order.order_details = relationship("OrderDetail", order_by=OrderDetail.id, back_populates="order")
Supply.supply_items = relationship("SupplyItem", order_by=SupplyItem.id, back_populates="supply")
Category.products = relationship("Product", order_by=Product.id, back_populates="category")