import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from app import db
from app.models.nft import NFT
from app.models.user import User
from app.models.listing import Listing
from app.services.nft_service import allowed_file, validate_image, save_local, upload_to_ipfs
from app.services.ipfs_service import upload_file_to_ipfs, upload_json_to_ipfs
from app.services.blockchain_service import mint_nft
from web3 import Web3

nft_bp = Blueprint("nft", __name__)

@nft_bp.route("/create", methods=["POST"])
def create_nft():
    try:
        current_app.logger.debug("=== CREATE NFT START ===")

        if "file" not in request.files:
            current_app.logger.warning("No file in request.files")
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        owner_address = request.form.get("owner_address")
        name = request.form.get("name")
        description = request.form.get("description", "")

        current_app.logger.debug(f"owner_address={owner_address}, name={name}, description={description}")
        current_app.logger.debug(f"file={file}, filename={file.filename}")

        if not file or not allowed_file(file.filename):
            current_app.logger.warning(f"Invalid file format: {file.filename}")
            return jsonify({"error": "Invalid file format"}), 400
        if not owner_address or not Web3.is_address(owner_address):
            current_app.logger.warning(f"Invalid wallet address: {owner_address}")
            return jsonify({"error": "Invalid wallet address"}), 400
        if not name:
            current_app.logger.warning("Name is empty")
            return jsonify({"error": "Name is required"}), 400

        try:
            validate_image(file)
            current_app.logger.debug("Image validation passed")
        except ValueError as e:
            current_app.logger.warning(f"Image validation failed: {e}")
            return jsonify({"error": str(e)}), 400

        owner_address = Web3.to_checksum_address(owner_address)
        user = User.query.filter_by(wallet_address=owner_address).first()
        if not user:
            user = User(wallet_address=owner_address)
            db.session.add(user)
            db.session.commit()
            current_app.logger.debug(f"Created new user {owner_address}")

        use_ipfs = bool(current_app.config.get("PINATA_API_KEY"))
        current_app.logger.debug(f"use_ipfs={use_ipfs}")

        if use_ipfs:
            try:
                current_app.logger.debug("Uploading to IPFS via Pinata...")
                ipfs_result = upload_to_ipfs(file, name, description)
                image_url = f"ipfs://{ipfs_result['image_cid']}"
                metadata_url = f"ipfs://{ipfs_result['metadata_cid']}"
                ipfs_cid = ipfs_result["metadata_cid"]
                current_app.logger.debug(f"IPFS success: image_cid={ipfs_result['image_cid']}, metadata_cid={ipfs_result['metadata_cid']}")
            except Exception as e:
                current_app.logger.error(f"IPFS upload failed, falling back to local: {e}", exc_info=True)
                local_result = save_local(file)
                image_url = local_result["url"]
                metadata_url = None
                ipfs_cid = None
                current_app.logger.debug(f"Saved locally: {image_url}")
        else:
            local_result = save_local(file)
            image_url = local_result["url"]
            metadata_url = None
            ipfs_cid = None
            current_app.logger.debug(f"No IPFS configured, saved locally: {image_url}")

        nft_record = NFT(
            name=name,
            description=description,
            image_url=image_url,
            metadata_url=metadata_url,
            ipfs_cid=ipfs_cid,
            owner_id=user.id,
        )
        db.session.add(nft_record)
        db.session.commit()
        current_app.logger.debug(f"NFT record saved: id={nft_record.id}")

        if current_app.config.get("CONTRACT_NFT_ADDRESS") and current_app.config.get("PLATFORM_PRIVATE_KEY"):
            try:
                current_app.logger.debug("Minting on blockchain...")
                tx_result = mint_nft(owner_address, metadata_url or image_url)
                nft_record.token_id = tx_result["token_id"]
                nft_record.contract_address = current_app.config["CONTRACT_NFT_ADDRESS"]
                nft_record.tx_hash = tx_result["tx_hash"]
                nft_record.is_minted = True
                db.session.commit()
                current_app.logger.debug(f"Mint success: token_id={tx_result['token_id']}")
            except Exception as e:
                current_app.logger.error(f"Mint failed: {e}", exc_info=True)

        current_app.logger.debug("=== CREATE NFT SUCCESS ===")
        return jsonify({
            "message": "NFT created",
            "nft": nft_record.to_dict(),
        }), 201

    except Exception as e:
        current_app.logger.error(f"NFT creation error: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@nft_bp.route("/collection/<address>", methods=["GET"])
def get_collection(address):
    if not Web3.is_address(address):
        return jsonify({"error": "Invalid address"}), 400

    address = Web3.to_checksum_address(address)
    user = User.query.filter_by(wallet_address=address).first()
    if not user:
        return jsonify([])

    nfts = NFT.query.filter_by(owner_id=user.id).order_by(NFT.created_at.desc()).all()
    return jsonify([nft.to_dict() for nft in nfts])

@nft_bp.route("/<int:nft_id>", methods=["GET"])
def get_nft(nft_id):
    nft = NFT.query.get_or_404(nft_id)
    data = nft.to_dict()
    active_listing = Listing.query.filter_by(nft_id=nft_id, is_active=True).first()
    data["listings"] = [active_listing.to_dict()] if active_listing else []
    return jsonify(data)

@nft_bp.route("/<int:nft_id>", methods=["PUT"])
def update_nft(nft_id):
    nft = NFT.query.get_or_404(nft_id)
    data = request.get_json()

    nft.name = data.get("name", nft.name)
    nft.description = data.get("description", nft.description)
    db.session.commit()

    return jsonify(nft.to_dict())
