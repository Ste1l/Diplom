
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os

UPLOAD_FOLDER = None

def mount_static(app: FastAPI):
    global UPLOAD_FOLDER

    

    project_root = Path(__file__).parent.parent
    # UPLOAD_FOLDER = project_root  / "frontend" / "src" / "img" / "products_image"
    UPLOAD_FOLDER = project_root  / "build" / "img" / "products_image"

    print(f"Файл существует: {os.path.exists(str(UPLOAD_FOLDER / 'calcium_glucinate.jpg'))}")
    
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    # app.mount("/static/products_image", StaticFiles(directory=str(UPLOAD_FOLDER)), html=True, check_dir=False name="products-image")
    # app.mount("/static", StaticFiles(directory="/app/build/img/products_image/"), name="static")
    app.mount(
        "/static/products_image",
        StaticFiles(directory=str(UPLOAD_FOLDER)),
        name="products-image"
    )

def get_upload_folder():
    if UPLOAD_FOLDER is None:
        raise ValueError("UPLOAD_FOLDER is not configured")
    return UPLOAD_FOLDER

def check_upload_folder():
    upload_folder = get_upload_folder()
    if not os.path.exists(upload_folder):
        raise ValueError(f"UPLOAD_FOLDER does not exist: {upload_folder}")
    if not os.path.isdir(upload_folder):
        raise ValueError(f"UPLOAD_FOLDER is not a directory: {upload_folder}")
    if not os.access(upload_folder, os.W_OK):
        raise ValueError(f"No write permissions for UPLOAD_FOLDER: {upload_folder}")
