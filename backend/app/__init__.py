import os
import logging
from flask import Flask, send_from_directory, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__, static_folder=None)
    app.config.from_object("app.config.Config")

    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    @app.before_request
    def log_request():
        logger.debug("=" * 60)
        logger.debug(f"REQUEST: {request.method} {request.path}")
        logger.debug(f"HEADERS: {dict(request.headers)}")
        if request.form:
            logger.debug(f"FORM DATA keys: {list(request.form.keys())}")
            logger.debug(f"FORM DATA values: {dict(request.form)}")
        if request.files:
            logger.debug(f"FILES keys: {list(request.files.keys())}")
            for key in request.files:
                f = request.files[key]
                logger.debug(f"  FILE '{key}': name={f.filename}, content_type={f.content_type}")
        if request.is_json:
            logger.debug(f"JSON: {request.get_json(silent=True)}")
        logger.debug("=" * 60)

    from app.routes.auth import auth_bp
    from app.routes.nft import nft_bp
    from app.routes.marketplace import marketplace_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(nft_bp, url_prefix="/api/nft")
    app.register_blueprint(marketplace_bp, url_prefix="/api/marketplace")

    frontend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend")

    @app.route("/uploads/<path:filename>")
    def serve_upload(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    @app.route("/assets/<path:filename>")
    def serve_frontend_assets(filename):
        return send_from_directory(os.path.join(frontend_dir, "assets"), filename)

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path):
        if path and os.path.exists(os.path.join(frontend_dir, path)):
            return send_from_directory(frontend_dir, path)
        return send_from_directory(frontend_dir, "index.html")

    with app.app_context():
        db.create_all()

    return app
