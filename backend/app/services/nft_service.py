import hashlib
import logging
import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app
from PIL import Image

from app.services.ipfs_service import upload_file_to_ipfs, upload_json_to_ipfs

logger = logging.getLogger(__name__)

def allowed_file(filename):
    ext = filename.rsplit(".", 1)[1].lower() if "." in filename else ""
    return ext in current_app.config["ALLOWED_EXTENSIONS"]

def validate_image(file):
    logger.debug(f"validate_image: filename={file.filename}")
    ext = file.filename.rsplit(".", 1)[1].lower() if "." in file.filename else ""
    logger.debug(f"validate_image: ext={ext}, allowed={current_app.config['ALLOWED_EXTENSIONS']}")
    if ext not in current_app.config["ALLOWED_EXTENSIONS"]:
        raise ValueError(f"Invalid format: {ext}")

    file.seek(0)
    try:
        image = Image.open(file)
        image.load()  # force PIL to actually read the image
        logger.debug(f"validate_image: format={image.format}, size={image.size}, mode={image.mode}")
    except Exception as e:
        logger.error(f"PIL failed to open image: {e}", exc_info=True)
        raise ValueError(f"Cannot read image: {e}")

    if image.width > 4096 or image.height > 4096:
        raise ValueError("Image dimensions too large (max 4096x4096)")

    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    logger.debug(f"validate_image: file_size={size}, max={current_app.config['MAX_CONTENT_LENGTH']}")
    if size > current_app.config["MAX_CONTENT_LENGTH"]:
        raise ValueError("File too large (max 50MB)")

def generate_metadata(name, description, image_cid, file_hash):
    return {
        "name": name,
        "description": description,
        "image": f"ipfs://{image_cid}",
        "external_url": "",
        "attributes": [],
        "properties": {
            "files": [{"uri": f"ipfs://{image_cid}", "type": "image"}],
            "creators": [],
        },
        "file_hash": file_hash,
    }

def upload_to_ipfs(file, name, description):
    file.seek(0)
    file_bytes = file.read()
    file_hash = hashlib.sha256(file_bytes).hexdigest()

    file.seek(0)
    image_cid = upload_file_to_ipfs(file_bytes, secure_filename(file.filename))

    metadata = generate_metadata(name, description, image_cid, file_hash)
    metadata_cid = upload_json_to_ipfs(metadata)

    return {
        "image_cid": image_cid,
        "metadata_cid": metadata_cid,
        "metadata": metadata,
        "file_hash": file_hash,
    }

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
