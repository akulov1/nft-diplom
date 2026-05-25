import json
import requests
from flask import current_app

def upload_file_to_ipfs(file_bytes, filename):
    api_url = current_app.config["IPFS_API_URL"]
    api_key = current_app.config["PINATA_API_KEY"]
    secret_key = current_app.config["PINATA_SECRET_KEY"]

    headers = {
        "pinata_api_key": api_key,
        "pinata_secret_api_key": secret_key,
    }

    files = {
        "file": (filename, file_bytes),
    }

    response = requests.post(
        f"{api_url}/pinning/pinFileToIPFS",
        files=files,
        headers=headers,
        timeout=60,
    )

    if response.status_code != 200:
        raise RuntimeError(f"IPFS upload failed: {response.text}")

    return response.json()["IpfsHash"]

def upload_json_to_ipfs(data):
    api_url = current_app.config["IPFS_API_URL"]
    api_key = current_app.config["PINATA_API_KEY"]
    secret_key = current_app.config["PINATA_SECRET_KEY"]

    headers = {
        "pinata_api_key": api_key,
        "pinata_secret_api_key": secret_key,
        "Content-Type": "application/json",
    }

    response = requests.post(
        f"{api_url}/pinning/pinJSONToIPFS",
        json=data,
        headers=headers,
        timeout=60,
    )

    if response.status_code != 200:
        raise RuntimeError(f"IPFS JSON upload failed: {response.text}")

    return response.json()["IpfsHash"]

def get_ipfs_url(cid):
    gateway = current_app.config["IPFS_GATEWAY"]
    return f"{gateway}/ipfs/{cid}"
