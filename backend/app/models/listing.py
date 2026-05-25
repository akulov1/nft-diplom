from app import db
from datetime import datetime, timezone

class Listing(db.Model):
    __tablename__ = "listings"

    id = db.Column(db.Integer, primary_key=True)
    listing_id = db.Column(db.Integer, unique=True, nullable=True)
    nft_id = db.Column(db.Integer, db.ForeignKey("nfts.id"), nullable=False)
    seller_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    price_wei = db.Column(db.String(78), nullable=False)
    price_eth = db.Column(db.Float, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    tx_hash = db.Column(db.String(66))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    nft = db.relationship("NFT", backref="listings")
    seller = db.relationship("User", backref="listings")

    def to_dict(self):
        return {
            "id": self.id,
            "listing_id": self.listing_id,
            "nft": self.nft.to_dict() if self.nft else None,
            "seller_id": self.seller_id,
            "seller_address": self.seller.wallet_address if self.seller else None,
            "price_wei": self.price_wei,
            "price_eth": self.price_eth,
            "is_active": self.is_active,
            "tx_hash": self.tx_hash,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
