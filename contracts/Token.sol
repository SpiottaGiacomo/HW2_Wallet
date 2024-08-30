// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20, Ownable{
    address public blAddress;

    constructor(string memory tokenName, string memory tokenSym) ERC20 (tokenName, tokenSym) Ownable(msg.sender) {
     }

    function mint (address account, uint256 amount) public onlyOwner{
        //  _beforeTokenTransfer(msg.sender, account, amount);
        _mint(account, amount);
    }

    function burn(uint256 amount) public{ //Ognuno puo' bruciare i suoi token ma non quelli degli altri
        // _beforeTokenTransfer(msg.sender, address(0), amount);
        _burn(msg.sender, amount);
    }

    function transfer(address to, uint256 value) public override returns (bool){ 
        // _beforeTokenTransfer(msg.sender, to, value);
        super._transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public override returns (bool) {
        // _beforeTokenTransfer(from, to, value);
        super._transfer(from, to, value);
        return true;
    }

}