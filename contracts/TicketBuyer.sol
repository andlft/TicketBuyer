// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TicketBuyer is ERC721, Ownable {
    uint256 public totalOccasions;
    uint256 public totalSupply;
    address public hostContractAddress;
    address public discountContractAddress;
    
    struct Occasion {
        uint256 id;
        string name;
        uint256 cost;
        uint256 tickets;
        uint256 maxTickets;
        string date;
        string time;
        string location;
        address host;
    }

    mapping (uint256 => Occasion) occasions;
    mapping (uint256 => mapping(uint256 => address)) public seatTaken;
    mapping (uint256 => uint256[]) seatsTaken;
    mapping (uint256 => mapping(address => bool)) public hasBought;
    mapping (address => uint256) ownedSum;

    event TicketBought(address buyer, uint256 occasionId, uint256 seat);
    event EventAdded();
    event Withdrawal(address indexed account, uint256 amount);

    modifier checkHost() {
        (bool success, bytes memory data) = hostContractAddress.call(abi.encodeWithSignature("checkHost(address)", msg.sender));
        require(success);
        require(abi.decode(data, (bool)) == true); 
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) Ownable(){}

    function list(
        string memory _name,
        uint256 _cost,
        uint256 _maxTickets,
        string memory _date,
        string memory _time,
        string memory _location
    ) public checkHost{

        totalOccasions++;
        occasions[totalOccasions] = Occasion(
            totalOccasions,
            _name,
            _cost,
            _maxTickets,
            _maxTickets,
            _date,
            _time,
            _location,
            msg.sender
        );
        emit EventAdded();
    }

    function mint(uint256 _id, uint256 _seat) public payable {

        require(_id != 0);
        require(_id <= totalOccasions);
        require(msg.value >= occasions[_id].cost);
        require(seatTaken[_id][_seat] == address(0));
        require(_seat <= occasions[_id].maxTickets);

        occasions[_id].tickets -= 1;

        hasBought[_id][msg.sender] = true;

        seatTaken[_id][_seat] = msg.sender;

        seatsTaken[_id].push(_seat);

        totalSupply++;

        ownedSum[occasions[_id].host] += msg.value;
        _safeMint(msg.sender, totalSupply);
        (bool success, ) = discountContractAddress.call(abi.encodeWithSignature("deposit(address)", msg.sender));
        require(success);
        emit TicketBought(msg.sender, _id, _seat);
    }

    function mintWithDiscount(uint256 _id, uint256 _seat) public payable {

        require(_id != 0);
        require(_id <= totalOccasions);
        require(msg.value >= 2 ether, "msg.value less than 0");
        require(msg.value >= occasions[_id].cost - 1 ether, "msg.value too low!");
        require(seatTaken[_id][_seat] == address(0));
        require(_seat <= occasions[_id].maxTickets);

        (bool success, bytes memory data) = discountContractAddress.call(abi.encodeWithSignature("balanceOf(address)", msg.sender));
        require(success);
        require(abi.decode(data, (uint256)) >= 3.0);

        occasions[_id].tickets -= 1;

        hasBought[_id][msg.sender] = true;

        seatTaken[_id][_seat] = msg.sender;

        seatsTaken[_id].push(_seat);

        totalSupply++;

        ownedSum[occasions[_id].host] += msg.value;
        _safeMint(msg.sender, totalSupply);
        (bool success2, ) = discountContractAddress.call(abi.encodeWithSignature("deleteTokenForAccount(address)", msg.sender));
        require(success2);
        emit TicketBought(msg.sender, _id, _seat);
    }

    function getOccasion(uint256 _id) public view returns (Occasion memory) {
        return occasions[_id];
    }

    function getSeatsTaken(uint256 _id) public view returns (uint256[] memory) {
        return seatsTaken[_id];
    }

    function withdraw() public checkHost {
        uint256 amount = ownedSum[msg.sender];
        ownedSum[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
        emit Withdrawal(msg.sender, amount);
    }

    function changeHostContract(address newHostContract) public onlyOwner {
        require(newHostContract != address(0));
        hostContractAddress = newHostContract;
    }
    
    function changeDiscountContract(address newDiscountContract) public onlyOwner {
        require(newDiscountContract != address(0));
        discountContractAddress = newDiscountContract;
    }

    function getTotalCost(uint256 costPerTicket, uint256 numTickets) public pure returns (uint256){
        require(costPerTicket > 0, "Invalid price");
        require(numTickets > 0, "Invalid number");
        uint256 totalCost = costPerTicket * numTickets;
        return totalCost;
    }
}
