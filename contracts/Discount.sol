// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Discount is ERC20, Ownable {

    address public ticketBuyerContract;

    modifier onlyTicketBuyer() {
        require (msg.sender == ticketBuyerContract, "Only callable from the TicketBuyer contract");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        address tbContract
    ) ERC20(_name, _symbol) Ownable(){
        ticketBuyerContract = tbContract;
    }

    function deposit(address account) public onlyTicketBuyer {
        _mint(account, 1.0);
    }

    function deleteTokenForAccount(address account) public onlyTicketBuyer {
        _burn(account, balanceOf(account));
    }

}
