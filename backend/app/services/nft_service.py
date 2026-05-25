import hashlib
import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app
from PIL import Image

def allowed_file(filename):
    ext = filename.rsplit(".", 1)[1].lower() if "." in filename else ""
    return ext in current_app.config["ALLOWED_EXTENSIONS"]

def validate_image(file):
    ext = file.filename.rsplit(".", 1)[1].lower() if "." in file.filename else ""
    if ext not in current_app.config["ALLOWED_EXTENSIONS"]:
        raise ValueError(f"Invalid format: {ext}")

    file.seek(0)
    image = Image.open(file)
    if image.width > 4096 or image.height > 4096:
        raise ValueError("Image dimensions too large (max 4096x4096)")

    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    if size > current_app.config["MAX_CONTENT_LENGTH"]:
        raise ValueError("File too large (max 50MB)")

def save_local(file):
    uploads_dir = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(uploads_dir, exist_ok=True)

    ext = file.filename.rsplit(".", 1)[1].lower() if "." in file.filename else "jpg"
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    save_path = os.path.join(uploads_dir, unique_name)
    file.seek(0)
    file.save(save_path)

    file.seek(0)
    file_hash = hashlib.sha256(file.read()).hexdigest()
    file.seek(0)

    return {
        "filename": unique_name,
        "path": save_path,
        "url": f"/uploads/{unique_name}",
        "file_hash": file_hash,
    }
