// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol"; //INterfaccia che mette a disposizione una funzione tramite cui viene chiamato il prezzo
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"; //Interfaccia per fare trasferimenti di file
import "./PriceConsumer.sol";

contract Wallet is Ownable{
  error noEthDeposited();
  error noEthToWithdraw();
  error noEthSent();

  uint public constant usdDecimals = 2;
  uint public constant nftDecimals = 18;

  uint public nftPrice;
  uint public ownerEthAmountToWithdraw;
  uint public ownerTokenAmountToWithdraw;

  address public oracleEthUsdPrice; //Indirizzo dell'oracolo che viene passato nel costruttore
  address public oracleTokenEthPrice;

  PriceConsumerV3 public ethUsdContract;
  PriceConsumerV3 public tokenEthContract;

  mapping(address => uint256) public userEthDeposits;
  mapping(address => uint256) public userTokenDeposits;

  constructor(address clEthUsd, address clTokenUsd) Ownable(msg.sender){
    oracleEthUsdPrice = clEthUsd;
    oracleTokenEthPrice = clTokenUsd;

    ethUsdContract = new PriceConsumerV3(oracleEthUsdPrice);
    tokenEthContract = new PriceConsumerV3(oracleTokenEthPrice); 
}

  receive() external payable{
    registerUserDeposit(msg.sender, msg.value);
  }

  function registerUserDeposit(address sender, uint256 value) internal{
    userEthDeposits[sender] += value;
  }

  function convertNFTPriceInUSD() public view returns (uint) {
    uint tokenPriceDecimals = tokenEthContract.getPriceDecimals();
    uint tokenPrice = uint(tokenEthContract.getLatestPrice());

    uint ethPriceDecimals = ethUsdContract.getPriceDecimals();
    uint ethPrice = uint(ethUsdContract.getLatestPrice());

    uint divDecs = tokenPriceDecimals + ethPriceDecimals - usdDecimals;

    uint tokenUSDPrice = tokenPrice * ethPrice / (10 ** divDecs);

    return tokenUSDPrice;
  }

  function getNFTPrice() external view returns(uint256){
    uint256 price;
    int256 iPrice;
    AggregatorV3Interface nftOraclePrice = AggregatorV3Interface(oracleTokenEthPrice);
    (,iPrice,,,) = nftOraclePrice.latestRoundData();
    price = uint256(iPrice);
    return price;
  }

  // function getPriceDecimals() public view returns (uint) {
  //   return uint(ethUsdOracle.decimals());
  // }

  function convertEthInUSD(address user) public view returns (uint){
    uint userUSDDeposit = 0;
    if(userEthDeposits[user] > 0){
      uint ethPriceDecimals = ethUsdContract.getPriceDecimals();
      uint ethPrice = uint(ethUsdContract.getLatestPrice());
      uint divDecs = 18 + ethPriceDecimals - usdDecimals;
      userUSDDeposit = userEthDeposits[user] * ethPrice / (10 **divDecs);
    }
    return userUSDDeposit;
  }

  function convertUSDInEth(uint usdAmount) public view returns (uint){
    uint convertAmountInEth = 0;
    if(usdAmount > 0){
      uint ethPriceDecimals = ethUsdContract.getPriceDecimals();
      uint ethPrice = uint(ethUsdContract.getLatestPrice());
      uint mulDecs = 18 + ethPriceDecimals - usdDecimals;
      convertAmountInEth = usdAmount * (10 ** mulDecs) / ethPrice;
    }
    return convertAmountInEth;
  }

  function getNativeCoinsBalance() external view returns (uint256){
    return address(this).balance;
  }

  function userETHWithdraw() external{
    if(userEthDeposits[msg.sender] == 0){
      revert noEthDeposited();
    }

    uint tmpValue = userEthDeposits[msg.sender];
    userEthDeposits[msg.sender] = 0;

    (bool sent, ) = payable(_msgSender()).call{value: tmpValue}("");
    if(!sent){
      revert noEthSent();
    }
  }

}
