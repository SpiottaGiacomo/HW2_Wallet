const Wallet = artifacts.require("Wallet");
const Token = artifacts.require("Token");
const PriceConsumerV3 = artifacts.require("PriceConsumerV3");

const ethUsdContract = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";
const azukiUsdContract = "0xA8B9A447C73191744D5B79BcE864F343455E1150";

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(Wallet, ethUsdContract, azukiUsdContract);
  const wallet = await Wallet.deployed();
  console.log("Deployed wallet is: @", wallet.address);

  await deployer.deploy(Token, "First Token", "FT1");
  const token = await Token.deployed();
  console.log("Token deployed @: ", token.address);

  await deployer.deploy(PriceConsumerV3, ethUsdContract)
  const ethUsdPrice = await PriceConsumerV3.deployed();
  console.log("Deployed Price ETH/USD Mockup is @: ", ethUsdPrice.address);

  // await deployer.deploy(PriceConsumerV3, azukiUsdContract)
  // const azukiUsdPrice = await PriceConsumerV3.deployed();
  // console.log("Deployed Price ETH/USD Mockup is @: ", azukiUsdPrice.address);
}
