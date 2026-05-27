import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__, static_folder=None)
    app.config.from_object("app.config.Config")

    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

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
