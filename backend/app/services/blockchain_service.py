import json
import os
from web3 import Web3
from flask import current_app

_web3 = None
_nft_contract = None
_marketplace_contract = None

def get_web3():
    global _web3
    if _web3 is None:
        rpc_url = current_app.config.get("BLOCKCHAIN_RPC_URL", "https://rpc.sepolia.org")
        _web3 = Web3(Web3.HTTPProvider(rpc_url))
    return _web3

def _find_abi(contract_name):
    paths = [
        os.path.join(os.path.dirname(__file__), "..", "..", "..", "contracts", "artifacts", "contracts", f"{contract_name}.sol", f"{contract_name}.json"),
        os.path.join("contracts", "artifacts", "contracts", f"{contract_name}.sol", f"{contract_name}.json"),
    ]
    for p in paths:
        if os.path.exists(p):
            with open(p) as f:
                return json.load(f)["abi"]
    return None

def get_nft_contract():
    global _nft_contract
    if _nft_contract is None:
        address = current_app.config.get("CONTRACT_NFT_ADDRESS", "")
        if not address:
            return None
        abi = _find_abi("NFT")
        if not abi:
            return None
        w3 = get_web3()
        _nft_contract = w3.eth.contract(address=Web3.to_checksum_address(address), abi=abi)
    return _nft_contract

def get_marketplace_contract():
    global _marketplace_contract
    if _marketplace_contract is None:
        address = current_app.config.get("CONTRACT_MARKETPLACE_ADDRESS", "")
        if not address:
            return None
        abi = _find_abi("Marketplace")
        if not abi:
            return None
        w3 = get_web3()
        _marketplace_contract = w3.eth.contract(address=Web3.to_checksum_address(address), abi=abi)
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
        "nonce": w3.eth.get_transaction_count(account.address),
        "gas": 300000,
        "gasPrice": w3.eth.gas_price,
    })

    signed = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
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
        "nonce": w3.eth.get_transaction_count(account.address),
        "gas": 200000,
        "gasPrice": w3.eth.gas_price,
    })

    signed = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
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
        "nonce": w3.eth.get_transaction_count(account.address),
        "gas": 200000,
        "gasPrice": w3.eth.gas_price,
        "value": price_wei,
    })

    signed = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
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
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    return {
        "tx_hash": tx_hash.hex(),
    }
