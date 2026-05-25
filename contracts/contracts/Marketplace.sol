// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Marketplace is Ownable, ReentrancyGuard {
    IERC721 public nftContract;
    uint256 public platformFee = 250;

    struct Listing {
        uint256 listingId;
        uint256 tokenId;
        address payable seller;
        uint256 price;
        bool isActive;
    }

    uint256 private _listingIds;
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => address) public tokenSeller;

    event TokenListed(uint256 indexed listingId, uint256 indexed tokenId, address indexed seller, uint256 price);
    event TokenSold(uint256 indexed listingId, uint256 indexed tokenId, address indexed seller, address buyer, uint256 price);
    event ListingCancelled(uint256 indexed listingId, uint256 indexed tokenId, address indexed seller);
    event ListingUpdated(uint256 indexed listingId, uint256 newPrice);

    constructor(address _nftContract, address _owner) Ownable(_owner) {
        nftContract = IERC721(_nftContract);
    }

    function listItem(uint256 tokenId, uint256 price) external returns (uint256) {
        require(price > 0, "Price must be > 0");
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(
            nftContract.getApproved(tokenId) == address(this) ||
            nftContract.isApprovedForAll(msg.sender, address(this)),
            "Not approved"
        );

        _listingIds++;
        uint256 newListingId = _listingIds;

        listings[newListingId] = Listing({
            listingId: newListingId,
            tokenId: tokenId,
            seller: payable(msg.sender),
            price: price,
            isActive: true
        });

        tokenSeller[tokenId] = msg.sender;

        nftContract.transferFrom(msg.sender, address(this), tokenId);

        emit TokenListed(newListingId, tokenId, msg.sender, price);
        return newListingId;
    }

    function buyItem(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(msg.value == listing.price, "Incorrect payment amount");

        listing.isActive = false;
        delete tokenSeller[listing.tokenId];

        uint256 fee = (msg.value * platformFee) / 10000;
        uint256 sellerProceeds = msg.value - fee;

        payable(owner()).transfer(fee);
        listing.seller.transfer(sellerProceeds);

        nftContract.transferFrom(address(this), msg.sender, listing.tokenId);

        emit TokenSold(listingId, listing.tokenId, listing.seller, msg.sender, msg.value);
    }

    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");

        listing.isActive = false;
        delete tokenSeller[listing.tokenId];

        nftContract.transferFrom(address(this), msg.sender, listing.tokenId);

        emit ListingCancelled(listingId, listing.tokenId, msg.sender);
    }

    function updateListing(uint256 listingId, uint256 newPrice) external {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");
        require(newPrice > 0, "Price must be > 0");

        listing.price = newPrice;

        emit ListingUpdated(listingId, newPrice);
    }

    function getActiveListings() external view returns (Listing[] memory) {
        uint256 total = _listingIds;
        uint256 count = 0;

        for (uint256 i = 1; i <= total; i++) {
            if (listings[i].isActive) {
                count++;
            }
        }

        Listing[] memory active = new Listing[](count);
        uint256 idx = 0;

        for (uint256 i = 1; i <= total; i++) {
            if (listings[i].isActive) {
                active[idx] = listings[i];
                idx++;
            }
        }

        return active;
    }

    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee cannot exceed 10%");
        platformFee = _fee;
    }
}
