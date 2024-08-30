// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol"; //INterfaccia che mette a disposizione una funzione tramite cui viene chiamato il prezzo

contract PriceConsumerV3 {
    AggregatorV3Interface internal priceFeed;


    constructor(address clOracleAddress){
        priceFeed = AggregatorV3Interface(clOracleAddress);
    }

    function getLatestPrice() public view returns (int256) {
    ( /*uint80 roundID*/,
      int256 price,
      /*uint256 startedAt*/,
      /*uint256 timeStamp*/,
      /*uint80 answeredInRound*/ 
    )= priceFeed.latestRoundData();
    return price;
  }

   function getPriceDecimals() public view returns (uint) {
    return uint(priceFeed.decimals());
  }
}