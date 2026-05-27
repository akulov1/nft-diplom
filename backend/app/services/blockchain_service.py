import json
from web3 import Web3
from flask import current_app

_web3 = None
_nft_contract = None
_marketplace_contract = None

_NFT_ABI = json.loads("""[{"inputs": [], "stateMutability": "nonpayable", "type": "constructor"}, {"inputs": [{"internalType": "address", "name": "sender", "type": "address"}, {"internalType": "uint256", "name": "tokenId", "type": "uint256"}, {"internalType": "address", "name": "owner", "type": "address"}], "name": "ERC721IncorrectOwner", "type": "error"}, {"inputs": [{"internalType": "address", "name": "operator", "type": "address"}, {"internalType": "uint256", "name": "tokenId", "type": "uint256"}], "name": "ERC721InsufficientApproval", "type": "error"}, {"inputs": [{"internalType": "address", "name": "approver", "type": "address"}], "name": "ERC721InvalidApprover", "type": "error"}, {"inputs": [{"internalType": "address", "name": "operator", "type": "address"}], "name": "ERC721InvalidOperator", "type": "error"}, {"inputs": [{"internalType": "address", "name": "owner", "type": "address"}], "name": "ERC721InvalidOwner", "type": "error"}, {"inputs": [{"internalType": "address", "name": "receiver", "type": "address"}], "name": "ERC721InvalidReceiver", "type": "error"}, {"inputs": [{"internalType": "address", "name": "sender", "type": "address"}], "name": "ERC721InvalidSender", "type": "error"}, {"inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}], "name": "ERC721NonexistentToken", "type": "error"}, {"inputs": [{"internalType": "address", "name": "owner", "type": "address"}], "name": "OwnableInvalidOwner", "type": "error"}, {"inputs": [{"internalType": "address", "name": "account", "type": "address"}], "name": "OwnableUnauthorizedAccount", "type": "error"}, {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "owner", "type": "address"}, {"indexed": true, "internalType": "address", "name": "approved", "type": "address"}, {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"}], "name": "Approval", "type": "event"}, {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "owner", "type": "address"}, {"indexed": true, "internalType": "address", "name": "operator", "type": "address"}, {"indexed": false, "internalType": "bool", "name": "approved", "type": "bool"}], "name": "ApprovalForAll", "type": "event"}, {"anonymous": false, "inputs": [{"indexed": false, "internalType": "uint256", "name": "_fromTokenId", "type": "uint256"}, {"indexed": false, "internalType": "uint256", "name": "_toTokenId", "type": "uint256"}], "name": "BatchMetadataUpdate", "type": "event"}, {"anonymous": false, "inputs": [{"indexed": false, "internalType": "uint256", "name": "_tokenId", "type": "uint256"}], "name": "MetadataUpdate", "type": "event"}, {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "previousOwner", "type": "address"}, {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"}], "name": "OwnershipTransferred", "type": "event"}, {"anonymous": false, "inputs": [{"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"}, {"indexed": true, "internalType": "address", "name": "creator", "type": "address"}, {"indexed": false, "internalType": "string", "name": "uri", "type": "string"}], "name": "TokenCreated", "type": "event"}, {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "from", "type": "address"}, {"indexed": true, "internalType": "address", "name": "to", "type": "address"}, {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"}], "name": "Transfer", "type": "event"}, {"inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "tokenId", "type": "uint256"}], "name": "approve", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [{"internalType": "address", "name": "owner", "type": "address"}], "name": "balanceOf", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}, {"inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}], "name": "burn", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}], "name": "getApproved", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"}, {"inputs": [{"internalType": "address", "name": "owner", "type": "address"}, {"internalType": "address", "name": "operator", "type": "address"}], "name": "isApprovedForAll", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "view", "type": "function"}, {"inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "string", "name": "uri", "type": "string"}], "name": "mint", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [], "name": "name", "outputs": [{"internalType": "string", "name": "", "type": "string"}], "stateMutability": "view", "type": "function"}, {"inputs": [], "name": "owner", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"}, {"inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}], "name": "ownerOf", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"}, {"inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [{"internalType": "address", "name": "from", "type": "address"}, {"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "tokenId", "type": "uint256"}], "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [{"internalType": "address", "name": "from", "type": "address"}, {"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "tokenId", "type": "uint256"}, {"internalType": "bytes", "name": "data", "type": "bytes"}], "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [{"internalType": "address", "name": "operator", "type": "address"}, {"internalType": "bool", "name": "approved", "type": "bool"}], "name": "setApprovalForAll", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [{"internalType": "bytes4", "name": "interfaceId", "type": "bytes4"}], "name": "supportsInterface", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "view", "type": "function"}, {"inputs": [], "name": "symbol", "outputs": [{"internalType": "string", "name": "", "type": "string"}], "stateMutability": "view", "type": "function"}, {"inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}], "name": "tokenURI", "outputs": [{"internalType": "string", "name": "", "type": "string"}], "stateMutability": "view", "type": "function"}, {"inputs": [], "name": "totalSupply", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}, {"inputs": [{"internalType": "address", "name": "from", "type": "address"}, {"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "tokenId", "type": "uint256"}], "name": "transferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function"}]""")

_MARKETPLACE_ABI = json.loads("""[{"inputs": [{"internalType": "address", "name": "_nftContract", "type": "address"}, {"internalType": "address", "name": "_owner", "type": "address"}], "stateMutability": "nonpayable", "type": "constructor"}, {"inputs": [{"internalType": "address", "name": "owner", "type": "address"}], "name": "OwnableInvalidOwner", "type": "error"}, {"inputs": [{"internalType": "address", "name": "account", "type": "address"}], "name": "OwnableUnauthorizedAccount", "type": "error"}, {"inputs": [], "name": "ReentrancyGuardReentrantCall", "type": "error"}, {"anonymous": false, "inputs": [{"indexed": true, "internalType": "uint256", "name": "listingId", "type": "uint256"}, {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"}, {"indexed": true, "internalType": "address", "name": "seller", "type": "address"}], "name": "ListingCancelled", "type": "event"}, {"anonymous": false, "inputs": [{"indexed": true, "internalType": "uint256", "name": "listingId", "type": "uint256"}, {"indexed": false, "internalType": "uint256", "name": "newPrice", "type": "uint256"}], "name": "ListingUpdated", "type": "event"}, {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "previousOwner", "type": "address"}, {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"}], "name": "OwnershipTransferred", "type": "event"}, {"anonymous": false, "inputs": [{"indexed": true, "internalType": "uint256", "name": "listingId", "type": "uint256"}, {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"}, {"indexed": true, "internalType": "address", "name": "seller", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "price", "type": "uint256"}], "name": "TokenListed", "type": "event"}, {"anonymous": false, "inputs": [{"indexed": true, "internalType": "uint256", "name": "listingId", "type": "uint256"}, {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"}, {"indexed": true, "internalType": "address", "name": "seller", "type": "address"}, {"indexed": false, "internalType": "address", "name": "buyer", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "price", "type": "uint256"}], "name": "TokenSold", "type": "event"}, {"inputs": [{"internalType": "uint256", "name": "listingId", "type": "uint256"}], "name": "buyItem", "outputs": [], "stateMutability": "payable", "type": "function"}, {"inputs": [{"internalType": "uint256", "name": "listingId", "type": "uint256"}], "name": "cancelListing", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [], "name": "getActiveListings", "outputs": [{"components": [{"internalType": "uint256", "name": "listingId", "type": "uint256"}, {"internalType": "uint256", "name": "tokenId", "type": "uint256"}, {"internalType": "address payable", "name": "seller", "type": "address"}, {"internalType": "uint256", "name": "price", "type": "uint256"}, {"internalType": "bool", "name": "isActive", "type": "bool"}], "internalType": "struct Marketplace.Listing[]", "name": "", "type": "tuple[]"}], "stateMutability": "view", "type": "function"}, {"inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}, {"internalType": "uint256", "name": "price", "type": "uint256"}], "name": "listItem", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "name": "listings", "outputs": [{"internalType": "uint256", "name": "listingId", "type": "uint256"}, {"internalType": "uint256", "name": "tokenId", "type": "uint256"}, {"internalType": "address payable", "name": "seller", "type": "address"}, {"internalType": "uint256", "name": "price", "type": "uint256"}, {"internalType": "bool", "name": "isActive", "type": "bool"}], "stateMutability": "view", "type": "function"}, {"inputs": [], "name": "nftContract", "outputs": [{"internalType": "contract IERC721", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"}, {"inputs": [], "name": "owner", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"}, {"inputs": [], "name": "platformFee", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}, {"inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [{"internalType": "uint256", "name": "_fee", "type": "uint256"}], "name": "setPlatformFee", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "name": "tokenSeller", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"}, {"inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [{"internalType": "uint256", "name": "listingId", "type": "uint256"}, {"internalType": "uint256", "name": "newPrice", "type": "uint256"}], "name": "updateListing", "outputs": [], "stateMutability": "nonpayable", "type": "function"}]""")

def get_web3():
    global _web3
    if _web3 is None:
        rpc_url = current_app.config.get("BLOCKCHAIN_RPC_URL", "https://rpc.sepolia.org")
        _web3 = Web3(Web3.HTTPProvider(rpc_url))
    return _web3

def get_nft_contract():
    global _nft_contract
    if _nft_contract is None:
        address = current_app.config.get("CONTRACT_NFT_ADDRESS", "")
        if not address:
            return None
        w3 = get_web3()
        _nft_contract = w3.eth.contract(address=Web3.to_checksum_address(address), abi=_NFT_ABI)
    return _nft_contract

def get_marketplace_contract():
    global _marketplace_contract
    if _marketplace_contract is None:
        address = current_app.config.get("CONTRACT_MARKETPLACE_ADDRESS", "")
        if not address:
            return None
        w3 = get_web3()
        _marketplace_contract = w3.eth.contract(address=Web3.to_checksum_address(address), abi=_MARKETPLACE_ABI)
    return _marketplace_contract

def mint_nft(to_address, token_uri):
    w3 = get_web3()
    contract = get_nft_contract()
    if not contract:
        raise RuntimeError("NFT contract not configured")
    private_key = current_app.config.get("PLATFORM_PRIVATE_KEY", "")
    account = w3.eth.account.from_key(private_key)

    tx = contract.functions.mint(
        Web3.to_checksum_address(to_address),
        token_uri,
    ).build_transaction({
        "from": account.address,
        "nonce": w3.eth.get_transaction_count(account.address, "pending"),
        "gas": 300000,
        "gasPrice": max(w3.eth.gas_price, w3.eth.gas_price * 11 // 10),
    })

    signed = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    logs = contract.events.TokenCreated().process_receipt(receipt)
    token_id = logs[0].args.tokenId if logs else None

    return {
        "token_id": token_id,
        "tx_hash": tx_hash.hex(),
        "receipt": receipt,
    }

def list_nft(token_id, price_wei):
    w3 = get_web3()
    contract = get_marketplace_contract()
    if not contract:
        raise RuntimeError("Marketplace contract not configured")
    private_key = current_app.config.get("PLATFORM_PRIVATE_KEY", "")
    account = w3.eth.account.from_key(private_key)

    tx = contract.functions.listItem(
        token_id,
        price_wei,
    ).build_transaction({
        "from": account.address,
        "nonce": w3.eth.get_transaction_count(account.address, "pending"),
        "gas": 200000,
        "gasPrice": max(w3.eth.gas_price, w3.eth.gas_price * 11 // 10),
    })

    signed = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    logs = contract.events.TokenListed().process_receipt(receipt)
    listing_id = logs[0].args.listingId if logs else None

    return {
        "listing_id": listing_id,
        "tx_hash": tx_hash.hex(),
    }

def buy_nft(listing_id, price_wei):
    w3 = get_web3()
    contract = get_marketplace_contract()
    if not contract:
        raise RuntimeError("Marketplace contract not configured")
    private_key = current_app.config.get("PLATFORM_PRIVATE_KEY", "")
    account = w3.eth.account.from_key(private_key)

    tx = contract.functions.buyItem(
        listing_id,
    ).build_transaction({
        "from": account.address,
        "nonce": w3.eth.get_transaction_count(account.address, "pending"),
        "gas": 200000,
        "gasPrice": max(w3.eth.gas_price, w3.eth.gas_price * 11 // 10),
        "value": price_wei,
    })

    signed = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    return {
        "tx_hash": tx_hash.hex(),
        "receipt": receipt,
    }

def cancel_listing(listing_id):
    w3 = get_web3()
    contract = get_marketplace_contract()
    if not contract:
        raise RuntimeError("Marketplace contract not configured")
    private_key = current_app.config.get("PLATFORM_PRIVATE_KEY", "")
    account = w3.eth.account.from_key(private_key)

    tx = contract.functions.cancelListing(
        listing_id,
    ).build_transaction({
        "from": account.address,
        "nonce": w3.eth.get_transaction_count(account.address),
        "gas": 150000,
        "gasPrice": w3.eth.gas_price,
    })

    signed = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    return {
        "tx_hash": tx_hash.hex(),
    }
