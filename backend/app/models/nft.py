from app import db
from datetime import datetime, timezone

class NFT(db.Model):
    __tablename__ = "nfts"

    id = db.Column(db.Integer, primary_key=True)
    token_id = db.Column(db.Integer, unique=True, nullable=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(500), nullable=False)
    metadata_url = db.Column(db.String(500))
    ipfs_cid = db.Column(db.String(100))
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    contract_address = db.Column(db.String(42))
    tx_hash = db.Column(db.String(66))
    is_minted = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "token_id": self.token_id,
            "name": self.name,
            "description": self.description,
            "image_url": self.image_url,
            "metadata_url": self.metadata_url,
            "ipfs_cid": self.ipfs_cid,
            "owner_id": self.owner_id,
            "owner_address": self.owner.wallet_address if self.owner else None,
            "contract_address": self.contract_address,
            "tx_hash": self.tx_hash,
            "is_minted": self.is_minted,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
