// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract HostManager is Ownable {

    mapping (address => bool) public occasionHost;
    uint256 public HOST_FEE = 10 ether;

    constructor() Ownable() {
        occasionHost[msg.sender] = true;
    }

    function _addHost(
        address newHostAddress
    ) internal {
        occasionHost[newHostAddress] = true;
    }

    function payHostFee() public payable {
        require(msg.value >= HOST_FEE);
        _addHost(msg.sender);
    }

    function checkHost(address hostAddress) external view returns (bool){
        return occasionHost[hostAddress];
    }

    function withdraw() public {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success);
    }
}
