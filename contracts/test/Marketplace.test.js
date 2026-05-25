const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Marketplace", function () {
  let NFT, Marketplace, nft, marketplace, owner, seller, buyer;

  beforeEach(async function () {
    [owner, seller, buyer] = await ethers.getSigners();

    NFT = await ethers.getContractFactory("NFT");
    nft = await NFT.deploy();
    await nft.deployed();

    Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy(nft.address, owner.address);
    await marketplace.deployed();

    await nft.mint(seller.address, "ipfs://test-uri");
  });

  it("should list an NFT for sale", async function () {
    const nftAsSeller = nft.connect(seller);

    await nftAsSeller.approve(marketplace.address, 1);
    await marketplace.connect(seller).listItem(1, ethers.utils.parseEther("1"));

    expect(await nft.ownerOf(1)).to.equal(marketplace.address);
  });

  it("should allow buying a listed NFT", async function () {
    const nftAsSeller = nft.connect(seller);

    await nftAsSeller.approve(marketplace.address, 1);
    await marketplace.connect(seller).listItem(1, ethers.utils.parseEther("1"));

    const sellerBalBefore = await ethers.provider.getBalance(seller.address);
    const ownerBalBefore = await ethers.provider.getBalance(owner.address);

    await marketplace.connect(buyer).buyItem(1, { value: ethers.utils.parseEther("1") });

    expect(await nft.ownerOf(1)).to.equal(buyer.address);

    const sellerBalAfter = await ethers.provider.getBalance(seller.address);
    const ownerBalAfter = await ethers.provider.getBalance(owner.address);

    const fee = ethers.utils.parseEther("0.025");
    const sellerProceeds = ethers.utils.parseEther("0.975");

    expect(sellerBalAfter.sub(sellerBalBefore)).to.equal(sellerProceeds);
    expect(ownerBalAfter.sub(ownerBalBefore)).to.equal(fee);
  });

  it("should allow seller to cancel a listing", async function () {
    const nftAsSeller = nft.connect(seller);

    await nftAsSeller.approve(marketplace.address, 1);
    await marketplace.connect(seller).listItem(1, ethers.utils.parseEther("1"));
    await marketplace.connect(seller).cancelListing(1);

    expect(await nft.ownerOf(1)).to.equal(seller.address);
  });

  it("should revert when buying an inactive listing", async function () {
    const nftAsSeller = nft.connect(seller);

    await nftAsSeller.approve(marketplace.address, 1);
    await marketplace.connect(seller).listItem(1, ethers.utils.parseEther("1"));
    await marketplace.connect(seller).cancelListing(1);

    await expect(
      marketplace.connect(buyer).buyItem(1, { value: ethers.utils.parseEther("1") })
    ).to.be.revertedWith("Listing not active");
  });

  it("should revert when listing with zero price", async function () {
    const nftAsSeller = nft.connect(seller);

    await nftAsSeller.approve(marketplace.address, 1);
    await expect(
      marketplace.connect(seller).listItem(1, 0)
    ).to.be.revertedWith("Price must be > 0");
  });
});
