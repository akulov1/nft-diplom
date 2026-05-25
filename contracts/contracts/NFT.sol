// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    event TokenCreated(uint256 indexed tokenId, address indexed creator, string uri);

    constructor() ERC721("NFT Diploma", "NFTD") Ownable(msg.sender) {}

    function mint(address to, string memory uri) public onlyOwner returns (uint256) {
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, uri);
        emit TokenCreated(newTokenId, to, uri);
        return newTokenId;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds;
    }

    function burn(uint256 tokenId) public {
        require(_ownerOf(tokenId) == msg.sender, "Not token owner");
        _burn(tokenId);
    }
}
