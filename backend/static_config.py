from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os

UPLOAD_FOLDER = None

def mount_static(app: FastAPI):
    global UPLOAD_FOLDER
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    UPLOAD_FOLDER = os.path.join(project_root, "frontend", "src", "img", "products_image")
    """ UPLOAD_FOLDER = os.path.join(project_root, ".", "frontend", "src", "img", "products_image") """
    
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    
    app.mount("/static/products_image", StaticFiles(directory=UPLOAD_FOLDER), name="products-image")

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