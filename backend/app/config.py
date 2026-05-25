import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///nft_marketplace.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    IPFS_API_URL = os.getenv("IPFS_API_URL", "https://api.pinata.cloud")
    IPFS_GATEWAY = os.getenv("IPFS_GATEWAY", "https://gateway.pinata.cloud")
    PINATA_API_KEY = os.getenv("PINATA_API_KEY", "")
    PINATA_SECRET_KEY = os.getenv("PINATA_SECRET_KEY", "")

    BLOCKCHAIN_RPC_URL = os.getenv("BLOCKCHAIN_RPC_URL", "https://rpc.sepolia.org")
    CONTRACT_NFT_ADDRESS = os.getenv("CONTRACT_NFT_ADDRESS", "")
    CONTRACT_MARKETPLACE_ADDRESS = os.getenv("CONTRACT_MARKETPLACE_ADDRESS", "")
    PLATFORM_PRIVATE_KEY = os.getenv("PLATFORM_PRIVATE_KEY", "")
    PLATFORM_ADDRESS = os.getenv("PLATFORM_ADDRESS", "")

    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads")
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
