from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Response # type: ignore
from sqlalchemy.ext.asyncio import AsyncSession # type: ignore
from models.models import Category, Manufacturer, ProductInfo, Product, Supply, SupplyItem, Order, OrderDetail
from schemas import CategoryCreate, ManufacturerCreate, ProductInfoCreate, SupplyCreate, SupplyItemCreate
from auth.database import get_db
from sqlalchemy import select, insert, update # type: ignore
from sqlalchemy.orm import selectinload # type: ignore
# from static_config import get_upload_folder, check_upload_folder
import os
import logging
from pydantic import BaseModel # type: ignore
from fastapi.responses import JSONResponse # type: ignore
import uuid
from datetime import datetime
from typing import List
from reportlab.pdfbase import pdfmetrics # type: ignore
from reportlab.pdfbase.ttfonts import TTFont # type: ignore
from reportlab.lib.pagesizes import letter # type: ignore
from reportlab.lib import colors # type: ignore
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle # type: ignore
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle # type: ignore
from reportlab.lib.units import inch # type: ignore
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER # type: ignore
import io


router1 = APIRouter()

logger = logging.getLogger(__name__)

@router1.post("/categories", status_code=status.HTTP_201_CREATED)
async def create_category(category: CategoryCreate, db: AsyncSession = Depends(get_db)):
    try:
        new_category = Category(category_name=category.category_name)
        db.add(new_category)
        await db.commit()
        await db.refresh(new_category)
        return {"message": "Категория успешно добавлена", "category": new_category}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router1.post("/manufacturers", status_code=status.HTTP_201_CREATED)
async def create_manufacturer(manufacturer: ManufacturerCreate, db: AsyncSession = Depends(get_db)):
    try:
        new_manufacturer = Manufacturer(
            manufacturer_name=manufacturer.manufacturer_name,
            address=manufacturer.address,
            phone_number=manufacturer.phone_number,
            inn=manufacturer.inn,
            kpp=manufacturer.kpp,
            account_number=manufacturer.account_number
        )
        db.add(new_manufacturer)
        await db.commit()
        await db.refresh(new_manufacturer)
        return {"message": "Производитель успешно добавлен", "manufacturer": new_manufacturer}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    
@router1.post("/supplies/add")
async def add_supply(supply: SupplyCreate, db: AsyncSession = Depends(get_db)):
    try:
        new_supply = Supply(
            supply_date=datetime.now(),
            total_cost=supply.total_cost,
            manufacturer_id=supply.manufacturer_id
        )
        db.add(new_supply)
        await db.commit()
        await db.refresh(new_supply)
        return {"message": f"Поставка успешно добавлена", "supply": new_supply}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Ошибка при добавлении поставки: {str(e)}")

@router1.post("/supplies/{supply_id}/items")
async def add_supply_items(
    supply_id: int,
    items: List[SupplyItemCreate],
    db: AsyncSession = Depends(get_db)
):
    try:
        supply = await db.get(Supply, supply_id)
        if not supply:
            raise HTTPException(status_code=404, detail="Поставка не найдена")
        
        db_items = []
        for item_data in items:
            product = await db.get(Product, item_data.product_id)
            if not product:
                raise HTTPException(
                    status_code=404,
                    detail=f"Продукт с ID {item_data.product_id} не найден"
                )
            
            if item_data.quantity <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="Количество должно быть больше нуля"
                )
            
            product_price = product.price
            
            total_cost = product_price * item_data.quantity
            
            await db.execute(
                update(Product)
                .where(Product.id == item_data.product_id)
                .values(quantity=Product.quantity + item_data.quantity)
            )
            
            db_item = SupplyItem(
                supply_id=supply_id,
                product_id=item_data.product_id,
                quantity=item_data.quantity,
                cost=total_cost
            )
            db_items.append(db_item)
        
        await db.execute(insert(SupplyItem).values([{
            'supply_id': item.supply_id,
            'product_id': item.product_id,
            'quantity': item.quantity,
            'cost': item.cost
        } for item in db_items]))
        await db.commit()
        
        return {
            "message": "Товары успешно добавлены в поставку",
            "items": db_items
        }
    
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Ошибка при добавлении товаров в поставку: {str(e)}"
        )


@router1.post("/product_info", status_code=status.HTTP_201_CREATED)
async def create_product_info(product_info: ProductInfoCreate, db: AsyncSession = Depends(get_db)):
    try:
        new_product_info = ProductInfo(
            product_id = product_info.product_id,
            composition=product_info.composition,
            pharmacological_action=product_info.pharmacological_action,
            indications=product_info.indications,
            contraindications=product_info.contraindications,
            side_effects=product_info.side_effects,
            interactions=product_info.interactions,
            dosage=product_info.dosage,
            overdose=product_info.overdose,
            full_description=product_info.full_description,
            storage_conditions=product_info.storage_conditions,
            shelf_life=product_info.shelf_life
        )
        db.add(new_product_info)
        await db.commit()
        await db.refresh(new_product_info)
        return {"message": "Информация о продукте успешно добавлена", "product_info": new_product_info}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    
from pathlib import Path  
STATIC_FILES_PATH = os.getenv('STATIC_FILES_PATH', 'uploads')
UPLOAD_FOLDER = Path(STATIC_FILES_PATH) / 'img' / 'products_image'
UPLOAD_FOLDER.mkdir(exist_ok=True)

@router1.post("/products")
async def create_product(
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    quantity: int = Form(...),
    date_product: str = Form(...),
    manufacturer_id: int = Form(...),
    category_id: int = Form(...),
    image: UploadFile = File(None),
    db: AsyncSession = Depends(get_db)
):
    try:
        new_product = Product(
            name=name,
            description=description,
            price=price,
            quantity=quantity,
            date_product=date_product,
            manufacturer_id=manufacturer_id,
            category_id=category_id
        )

        if image:
            # upload_folder = get_upload_folder()
            # check_upload_folder()
            filename = f"{uuid.uuid4()}.{image.filename.split('.')[-1]}"
            # file_path = os.path.join(upload_folder, filename)
            file_path = UPLOAD_FOLDER / filename
            with open(file_path, "wb") as buffer:
                buffer.write(await image.read())
            new_product.image_name = filename

        db.add(new_product)
        await db.commit()
        await db.refresh(new_product)
        return {"message": "Продукт успешно добавлен", "product": new_product}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Error creating product")
    
@router1.post("/upload-image")
async def upload_image(image: UploadFile = File(...)):
    try:
        upload_folder = get_upload_folder()
        check_upload_folder()
        filename = f"{uuid.uuid4()}.{image.filename.split('.')[-1]}"
        file_path = os.path.join(upload_folder, filename)
        
        with open(file_path, "wb") as buffer:
            buffer.write(await image.read())
        
        return JSONResponse(content={"filename": filename}, status_code=200)
    except Exception as e:
        logger.error(f"Error during file upload: {str(e)}")
        raise HTTPException(status_code=500, detail="Error during file upload")
    

@router1.get("/categories")
async def get_categories(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(Category))
        categories = result.scalars().all()
        return {"categories": categories}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router1.get("/supplies")
async def get_categories(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(Supply))
        supplies = result.scalars().all()
        return {"supplies": supplies}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    
@router1.get("/manufacturers")
async def get_manufacturers(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(Manufacturer))
        manufacturers = result.scalars().all()
        return {"manufacturers": manufacturers}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router1.get("/products")
async def get_products(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(Product))
        products = result.scalars().all()
        return {"products": products}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router1.get("/product_info")
async def get_product_info(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(ProductInfo))
        product_info = result.scalars().all()
        return {"product_info": product_info}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    
pdfmetrics.registerFont(TTFont('DejaVu', 'DejaVuSerif.ttf'))

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name='Russian',
    fontName='DejaVu',
    fontSize=12,
    leading=14
))
    
class PDFGenerator:
    def __init__(self):
        self.styles = styles
        self.width, self.height = letter
        
    def create_order_table(self, orders: List[dict]) -> Table:
        # Заголовки таблицы
        data = [
            ['Номер заказа', 'Дата', 'Товар', 'Количество', 'Итого'],
        ]
        
        # Добавляем данные заказов
        for order in orders:
            for detail in order.order_details:
                data.append([
                    f"#{order.id}",
                    order.order_date.strftime('%d.%m.%Y'),
                    detail.product.name,
                    detail.quantity,
                    f"{order.order_total} ₽"
                ])
        
        # Создаем таблицу
        table = Table(data)
        table_style = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'DejaVu'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ])
        table.setStyle(table_style)
        return table

    def generate_pdf(self, orders: List[dict]) -> str:
        filename = f"orders_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        doc = SimpleDocTemplate(filename)
        
        elements = []
        styles = self.styles
        
        # Добавляем заголовок
        title = Paragraph("Отчет о заказах", styles['Russian'])
        elements.append(title)
        
        # Добавляем таблицу
        table = self.create_order_table(orders)
        elements.append(table)
        
        try:
            doc.build(elements)
            return filename
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Ошибка при генерации PDF: {str(e)}")
        finally:
            if os.path.exists(filename):
                os.remove(filename)

def create_pdf_report_sales(orders_data: List[dict], start_date: datetime, end_date: datetime) -> bytes:
    """Генерация PDF отчёта о продажах"""
    buffer = io.BytesIO()
    
    # Создание документа
    doc = SimpleDocTemplate(buffer, pagesize=letter,
                          leftMargin=inch/2, rightMargin=inch/2,
                          topMargin=inch, bottomMargin=inch)
    
    styleN = ParagraphStyle(name='Normal', fontName='DejaVu', alignment=TA_LEFT)
    styleC = ParagraphStyle(name='Normal', fontName='DejaVu', alignment=TA_CENTER)
    styleR = ParagraphStyle(name='Right', fontName='DejaVu', alignment=TA_RIGHT)
    styleH = ParagraphStyle(name='Heading', fontName='DejaVu', fontSize=18, leading=22)
    
    elements = []

    start_date_str = start_date.strftime("%d.%m.%Y")
    end_date_str = end_date.strftime("%d.%m.%Y")
    
    # Заголовок отчёта
    header_text = f"Отчёт по продажам с {start_date_str} по {end_date_str}"
    elements.append(Paragraph(header_text, styleH))
    elements.append(Spacer(1, 12))
    
    # Таблица товаров
    data = [['Товар', 'Количество', 'Цена за единицу', 'Сумма']]
    
    total_quantity = 0
    total_amount = 0
    
    # Формирование данных таблицы
    for order in orders_data:
        for detail in order['order_details']:
            price = detail['product'].price
            total = price * detail['quantity']
            
            data.append([
                Paragraph(detail['product'].name, styleN),
                Paragraph(str(detail['quantity']), styleC),
                Paragraph(f"{price:.2f} ₽", styleC),
                Paragraph(f"{total:.2f} ₽", styleC)
            ])
            total_quantity += detail['quantity']
            total_amount += total
            
    # Создание и стилизация таблицы
    table = Table(data)
    table_style = TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, (0, 0, 0)),
        ('FONTNAME', (0, 0), (-1, 0), 'DejaVu'),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
    ])
    table.setStyle(table_style)
    
    elements.append(table)
    elements.append(Spacer(1, 12))
    
    # Итоговые суммы
    elements.append(Paragraph(f"Итого количество: {total_quantity}", styleR))
    elements.append(Paragraph(f"Общая сумма: {total_amount:.2f} ₽", styleR))
    
    doc.build(elements)
    return buffer.getvalue()

def create_pdf_report_supplies(supplie_data: List[dict], start_date: datetime, end_date: datetime) -> bytes:
    """Генерация PDF отчёта о продажах"""
    buffer = io.BytesIO()
    
    # Создание документа
    doc = SimpleDocTemplate(buffer, pagesize=letter,
                          leftMargin=inch/2, rightMargin=inch/2,
                          topMargin=inch, bottomMargin=inch)
    
    styleN = ParagraphStyle(name='Normal', fontName='DejaVu', alignment=TA_LEFT)
    styleC = ParagraphStyle(name='Normal', fontName='DejaVu', alignment=TA_CENTER)
    styleR = ParagraphStyle(name='Right', fontName='DejaVu', alignment=TA_RIGHT)
    styleH = ParagraphStyle(name='Heading', fontName='DejaVu', fontSize=18, leading=22)
    
    elements = []

    start_date_str = start_date.strftime("%d.%m.%Y")
    end_date_str = end_date.strftime("%d.%m.%Y")
    
    # Заголовок отчёта
    header_text = f"Отчёт по поставкам с {start_date_str} по {end_date_str}"
    elements.append(Paragraph(header_text, styleH))
    elements.append(Spacer(1, 12))
    
    # Таблица товаров
    data = [['Товар', 'Количество', 'Цена за единицу', 'Сумма']]
    
    total_quantity = 0
    total_amount = 0
    
    # Формирование данных таблицы
    for supply in supplie_data:
        for detail in supply['supply_items']:
            price = detail['product'].price
            total = price * detail['quantity']
            
            data.append([
                Paragraph(detail['product'].name, styleN),
                Paragraph(str(detail['quantity']), styleC),
                Paragraph(f"{price:.2f} ₽", styleC),
                Paragraph(f"{total:.2f} ₽", styleC)
            ])
            total_quantity += detail['quantity']
            total_amount += total
            
    # Создание и стилизация таблицы
    table = Table(data)
    table_style = TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, (0, 0, 0)),
        ('FONTNAME', (0, 0), (-1, 0), 'DejaVu'),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER')
    ])
    table.setStyle(table_style)
    
    elements.append(table)
    elements.append(Spacer(1, 12))
    
    # Итоговые суммы
    elements.append(Paragraph(f"Итого количество: {total_quantity}", styleR))
    elements.append(Paragraph(f"Общая сумма: {total_amount:.2f} ₽", styleR))
    
    doc.build(elements)
    return buffer.getvalue()
    
class ReportFilter(BaseModel):
    start_date: datetime
    end_date: datetime
    
@router1.post("/report_sales")
async def generate_sales_report(filter: ReportFilter, db: AsyncSession = Depends(get_db)):
    try:
        query = select(Order).options(
            selectinload(Order.order_details),
            selectinload(Order.order_details).selectinload(OrderDetail.product)
        ).filter(
            Order.order_date >= filter.start_date,
            Order.order_date <= filter.end_date
        )
        result = await db.execute(query)
        orders = result.scalars().all()
        
        # Преобразование данных для отчёта
        orders_data = []
        for order in orders:
            order_data = {
                'order_details': [{
                    'product': detail.product,
                    'quantity': detail.quantity,
                    'price': detail.product.price
                } for detail in order.order_details]
            }
            orders_data.append(order_data)
        
        pdf_content = create_pdf_report_sales(orders_data, filter.start_date, filter.end_date)
        headers = {
            'Content-Disposition': 'attachment; filename="sales_report.pdf"'
        }
        return Response(pdf_content, media_type='application/pdf', headers=headers)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    
@router1.post("/report_supplies")
async def generate_supplies_report(filter: ReportFilter, db: AsyncSession = Depends(get_db)):
    try:
        query = select(Supply).options(
            selectinload(Supply.supply_items),
            selectinload(Supply.supply_items).selectinload(SupplyItem.product)
        ).filter(
            Supply.supply_date >= filter.start_date,
            Supply.supply_date <= filter.end_date
        )
        result = await db.execute(query)
        supplies = result.scalars().all()
        
        # Преобразование данных для отчёта
        supplies_data = []
        for supply in supplies:
            supplie_data = {
                'supply_items': [{
                    'product': detail.product,
                    'quantity': detail.quantity,
                    'price': detail.product.price
                } for detail in supply.supply_items]
            }
            supplies_data.append(supplie_data)
        
        pdf_content = create_pdf_report_supplies(supplies_data, filter.start_date, filter.end_date)
        headers = {
            'Content-Disposition': 'attachment; filename="sales_report.pdf"'
        }
        return Response(pdf_content, media_type='application/pdf', headers=headers)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    
