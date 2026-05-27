from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models.nft import NFT
from app.models.listing import Listing
from app.models.user import User
from app.services.blockchain_service import list_nft, buy_nft, cancel_listing, mint_nft
from web3 import Web3

marketplace_bp = Blueprint("marketplace", __name__)

@marketplace_bp.route("/listings", methods=["GET"])
def get_listings():
    listings = Listing.query.filter_by(is_active=True).order_by(Listing.created_at.desc()).all()
    return jsonify([l.to_dict() for l in listings])

@marketplace_bp.route("/list", methods=["POST"])
def list_nft_for_sale():
    data = request.get_json()
    nft_id = data.get("nft_id")
    seller_address = data.get("seller_address")
    price_eth = data.get("price_eth")

    if not all([nft_id, seller_address, price_eth]):
        return jsonify({"error": "nft_id, seller_address, price_eth required"}), 400
    if not Web3.is_address(seller_address):
        return jsonify({"error": "Invalid address"}), 400
    if price_eth <= 0:
        return jsonify({"error": "Price must be > 0"}), 400

    seller_address = Web3.to_checksum_address(seller_address)
    nft = NFT.query.get_or_404(nft_id)

    if not nft.is_minted or nft.token_id is None:
        if current_app.config.get("CONTRACT_NFT_ADDRESS") and current_app.config.get("PLATFORM_PRIVATE_KEY"):
            try:
                current_app.logger.info(f"Retroactively minting NFT {nft.id}...")
                tx_result = mint_nft(seller_address, nft.metadata_url or nft.image_url)
                nft.token_id = tx_result["token_id"]
                nft.contract_address = current_app.config["CONTRACT_NFT_ADDRESS"]
                nft.tx_hash = tx_result["tx_hash"]
                nft.is_minted = True
                db.session.commit()
                current_app.logger.info(f"Mint success: token_id={tx_result['token_id']}")
            except Exception as e:
                current_app.logger.error(f"Retroactive mint failed: {e}", exc_info=True)
                return jsonify({"error": f"Blockchain mint failed: {str(e)}"}), 500
        else:
            return jsonify({"error": "Blockchain not configured — minting unavailable"}), 500

    user = User.query.filter_by(wallet_address=seller_address).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    if nft.owner_id != user.id:
        return jsonify({"error": "Not the owner"}), 403

    price_wei = Web3.to_wei(price_eth, "ether")

    existing_listing = Listing.query.filter_by(nft_id=nft_id, is_active=True).first()
    if existing_listing:
        return jsonify({"error": "Already listed"}), 400

    listing = Listing(
        nft_id=nft_id,
        seller_id=user.id,
        price_wei=str(price_wei),
        price_eth=price_eth,
    )
    db.session.add(listing)
    db.session.commit()

    if current_app.config.get("CONTRACT_MARKETPLACE_ADDRESS") and current_app.config.get("PLATFORM_PRIVATE_KEY"):
        try:
            tx_result = list_nft(nft.token_id, price_wei)
            listing.listing_id = tx_result["listing_id"]
            listing.tx_hash = tx_result["tx_hash"]
            db.session.commit()
        except Exception as e:
            current_app.logger.error(f"Blockchain listing failed: {e}")
            db.session.delete(listing)
            db.session.commit()
            return jsonify({"error": f"Blockchain listing failed: {str(e)}"}), 500

    return jsonify({
        "message": "NFT listed for sale",
        "listing": listing.to_dict(),
    }), 201

@marketplace_bp.route("/buy", methods=["POST"])
def buy_listed_nft():
    data = request.get_json()
    listing_id = data.get("listing_id")
    buyer_address = data.get("buyer_address")

    if not listing_id or not buyer_address:
        return jsonify({"error": "listing_id and buyer_address required"}), 400
    if not Web3.is_address(buyer_address):
        return jsonify({"error": "Invalid address"}), 400

    listing = Listing.query.get_or_404(listing_id)
    if not listing.is_active:
        return jsonify({"error": "Listing not active"}), 400

    buyer_address = Web3.to_checksum_address(buyer_address)
    buyer = User.query.filter_by(wallet_address=buyer_address).first()
    if not buyer:
        buyer = User(wallet_address=buyer_address)
        db.session.add(buyer)
        db.session.commit()

    nft = listing.nft
    if not nft:
        return jsonify({"error": "NFT not found"}), 404

    if listing.listing_id is not None and current_app.config.get("CONTRACT_MARKETPLACE_ADDRESS") and current_app.config.get("PLATFORM_PRIVATE_KEY"):
        try:
            tx_result = buy_nft(listing.listing_id, int(listing.price_wei))
            listing.tx_hash = tx_result["tx_hash"]
        except Exception as e:
            current_app.logger.error(f"Blockchain buy failed: {e}")
            return jsonify({"error": f"Blockchain transaction failed: {str(e)}"}), 500

    listing.is_active = False
    nft.owner_id = buyer.id
    db.session.commit()

    return jsonify({
        "message": "NFT purchased successfully",
        "nft": nft.to_dict(),
    }), 200

@marketplace_bp.route("/cancel", methods=["POST"])
def cancel_listing_route():
    data = request.get_json()
    listing_id = data.get("listing_id")
    seller_address = data.get("seller_address")

    if not listing_id or not seller_address:
        return jsonify({"error": "listing_id and seller_address required"}), 400

    listing = Listing.query.get_or_404(listing_id)
    if not listing.is_active:
        return jsonify({"error": "Listing not active"}), 400

    if listing.listing_id is not None and current_app.config.get("CONTRACT_MARKETPLACE_ADDRESS") and current_app.config.get("PLATFORM_PRIVATE_KEY"):
        try:
            tx_result = cancel_listing(listing.listing_id)
            listing.tx_hash = tx_result["tx_hash"]
        except Exception as e:
            current_app.logger.error(f"Blockchain cancel failed: {e}")
            return jsonify({"error": f"Blockchain transaction failed: {str(e)}"}), 500

    listing.is_active = False
    db.session.commit()

    return jsonify({
        "message": "Listing cancelled",
    }), 200

@marketplace_bp.route("/listings/<address>", methods=["GET"])
def get_user_listings(address):
    if not Web3.is_address(address):
        return jsonify({"error": "Invalid address"}), 400

    address = Web3.to_checksum_address(address)
    user = User.query.filter_by(wallet_address=address).first()
    if not user:
        return jsonify([])

    listings = Listing.query.filter_by(seller_id=user.id, is_active=True).all()
    return jsonify([l.to_dict() for l in listings])
