from flask import Blueprint, request, jsonify
from app import db
from app.models.user import User
from web3 import Web3

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/nonce", methods=["GET"])
def get_nonce():
    address = request.args.get("address")
    if not address or not Web3.is_address(address):
        return jsonify({"error": "Invalid wallet address"}), 400

    address = Web3.to_checksum_address(address)
    user = User.query.filter_by(wallet_address=address).first()

    if not user:
        user = User(wallet_address=address)
        db.session.add(user)
        db.session.commit()

    return jsonify({"nonce": f"Sign this message to login: {user.id}-{user.created_at.timestamp()}"})

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    address = data.get("address")
    signature = data.get("signature")

    if not address or not signature:
        return jsonify({"error": "Address and signature required"}), 400

    address = Web3.to_checksum_address(address)
    user = User.query.filter_by(wallet_address=address).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "message": "Login successful",
        "user": user.to_dict(),
        "address": address,
    })

@auth_bp.route("/profile/<address>", methods=["GET"])
def get_profile(address):
    if not Web3.is_address(address):
        return jsonify({"error": "Invalid address"}), 400

    address = Web3.to_checksum_address(address)
    user = User.query.filter_by(wallet_address=address).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify(user.to_dict())

@auth_bp.route("/profile/<address>", methods=["PUT"])
def update_profile(address):
    if not Web3.is_address(address):
        return jsonify({"error": "Invalid address"}), 400

    address = Web3.to_checksum_address(address)
    user = User.query.filter_by(wallet_address=address).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    user.username = data.get("username", user.username)
    user.bio = data.get("bio", user.bio)
    user.avatar_url = data.get("avatar_url", user.avatar_url)
    db.session.commit()

    return jsonify(user.to_dict())
