const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT", function () {
  let NFT, nft, owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    NFT = await ethers.getContractFactory("NFT");
    nft = await NFT.deploy();
    await nft.deployed();
  });

  it("should mint a new token", async function () {
    await nft.mint(addr1.address, "ipfs://test-uri");

    expect(await nft.ownerOf(1)).to.equal(addr1.address);
    expect(await nft.tokenURI(1)).to.equal("ipfs://test-uri");
    expect(await nft.totalSupply()).to.equal(1);
  });

  it("should emit TokenCreated event on mint", async function () {
    await expect(nft.mint(addr1.address, "ipfs://test-uri"))
      .to.emit(nft, "TokenCreated")
      .withArgs(1, addr1.address, "ipfs://test-uri");
  });

  it("should only allow owner to mint", async function () {
    const nftAsAddr1 = nft.connect(addr1);
    await expect(
      nftAsAddr1.mint(addr1.address, "ipfs://test-uri")
    ).to.be.reverted;
  });

  it("should allow token owner to burn", async function () {
    await nft.mint(addr1.address, "ipfs://test-uri");
    const nftAsAddr1 = nft.connect(addr1);
    await nftAsAddr1.burn(1);
    await expect(nft.ownerOf(1)).to.be.reverted;
  });
});
