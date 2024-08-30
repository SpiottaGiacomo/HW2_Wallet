const { expect } = require("chai");
const { ethers } = require("hardhat");

const fromWei = (x) => ethers.formatEther(x.toString());
const toWei = (x) => ethers.parseEther(x.toString());
const fromWei8Dec = (x) => Number(x) / Math.pow(10, 8);
const fromWei2Dec = (x) => Number(x) / Math.pow(10, 2);
const toWei2Dec = (x) => BigInt(x) * BigInt(Math.pow(10, 2));


describe("Wallet Test", function () {
  it("should deploy the contracts and perform operations", async function () {
    // Deploy Contracts
    const [deployer, firstAccount, secondAccount, fakeOwner] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    const tokenContract = await Token.deploy("First Token", "FT1");
    await tokenContract.waitForDeployment();

    const Wallet = await ethers.getContractFactory("Wallet");
    const walletContract = await Wallet.deploy("0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419", "0xD6aA3D25116d8dA79Ea0246c4826EB951872e02e"); // ETH/USD Oracle address
    await walletContract.waitForDeployment();

    const PriceConsumerV3 = await ethers.getContractFactory("PriceConsumerV3");
    const priceEthUsd = await PriceConsumerV3.deploy("0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"); // ETH/USD Oracle address
    await priceEthUsd.waitForDeployment();

    const priceUniCREth = await PriceConsumerV3.deploy("0xD6aA3D25116d8dA79Ea0246c4826EB951872e02e"); // UniCR/ETH Oracle address
    await priceUniCREth.waitForDeployment();

    // Verify Deployment
    expect(await tokenContract.getAddress()).to.not.equal(ethers.AddressZero);
    expect(await walletContract.getAddress()).to.not.equal(ethers.AddressZero);
    expect(await priceEthUsd.getAddress()).to.not.equal(ethers.AddressZero);
    expect(await priceUniCREth.getAddress()).to.not.equal(ethers.AddressZero);
    console.log("Contracts deployed successfully:", await tokenContract.getAddress(), await walletContract.getAddress(), await priceEthUsd.getAddress(), await priceUniCREth.getAddress());

    // Mint Tokens
    await tokenContract.mint(deployer.address, toWei(1000000));
    const balDepl = await tokenContract.balanceOf(deployer.address);
    console.log("Deployer balance after mint:", fromWei(balDepl));
    expect(balDepl).to.equal(toWei(1000000));

    // Distribute Tokens
    await tokenContract.transfer(firstAccount.address, toWei(100000));
    await tokenContract.transfer(secondAccount.address, toWei(150000));

    const balDeplAfter = await tokenContract.balanceOf(deployer.address);
    const balFA = await tokenContract.balanceOf(firstAccount.address);
    const balSA = await tokenContract.balanceOf(secondAccount.address);

    console.log("Balances after distribution:", fromWei(balDeplAfter), fromWei(balFA), fromWei(balSA));
    expect(balFA).to.equal(toWei(100000));
    expect(balSA).to.equal(toWei(150000));

    // Fetch ETH/USD Price
    try {
      const ethUsdPrice = await priceEthUsd.getLatestPrice();
      const formattedEthUsdPrice = ethers.formatUnits(ethUsdPrice, await priceEthUsd.getPriceDecimals()); // Correct format for Chainlink price feeds
      console.log(`Latest ETH/USD Price: ${formattedEthUsdPrice}`);
    } catch (error) {
      console.log("Error while getting ETH/USD price:", error.message);
    }

    // Fetch UniCR/ETH Price
    try {
      const UniCREthPrice = await priceUniCREth.getLatestPrice(); // Fetching UniCR/ETH price
      const formattedUniCREthPrice = ethers.formatUnits(UniCREthPrice, await priceUniCREth.getPriceDecimals()); // Format the price using 8 decimals
      console.log(`UniCR/ETH Price: ${formattedUniCREthPrice}`);
    } catch (error) {
      console.log("Error while getting UniCR/ETH price:", error.message);
    }

    // Convert ETH to USD using Wallet contract
    await firstAccount.sendTransaction({
      to: await walletContract.getAddress(),
      value: toWei(2)
    });

    let ret = await walletContract.convertEthInUSD(firstAccount.address);
    console.log("ETH in USD:", fromWei2Dec(ret)); // Adjusted to use Number conversion

    // Convert USD to ETH using Wallet contract
    ret = await walletContract.convertUSDInEth(toWei2Dec(5000));
    console.log("USD to ETH:", fromWei(ret));

    // Convert NFT Price in USD using Wallet contract
    ret = await walletContract.convertNFTPriceInUSD();
    console.log("NFT Price in USD:", fromWei2Dec(ret));
  });
});


