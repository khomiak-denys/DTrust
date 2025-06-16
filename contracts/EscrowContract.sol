// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract EscrowContract {
    struct Escrow {
        address client;
        address freelancer;
        uint amount;
        bool completed;
        bool approved;
    }
    
    mapping(uint => Escrow)public contracts;
    uint public count = 0;

    function createContract(address _freelancer) public payable { 
        require (msg.value > 0);
        require (_freelancer != address(0));        
        contracts[count] = Escrow(msg.sender, _freelancer, msg.value, false, false);
        count++;
    }

    modifier onlyClient(uint _id) { 
        require(msg.sender == contracts[_id].client, "Not a client");
        _;
    }
    modifier onlyFreelancer(uint _id) {
        require(msg.sender == contracts[_id].freelancer, "Not a freelancer");
        _;
    }
    modifier existed(uint _id) {
        require(_id >= 0 && _id < count, "Contract with that _id not existed");
        _;
    }

    function markAsCompleted(uint _id) public existed(_id) onlyFreelancer(_id) {
        require (contracts[_id].completed == false, "Already competed");
        contracts[_id].completed = true;
    }
    function approveWork(uint _id) public existed(_id) onlyClient(_id) {
        require(contracts[_id].completed == true, "Not completed");
        require(contracts[_id].approved == false, "Already approved");
        contracts[_id].approved = true;
    }

    function withdraw(uint _id) public existed(_id) onlyFreelancer(_id) payable {
        require(contracts[_id].completed == true, "Not completed");
        require(contracts[_id].approved == true, "Not approved");
        require(contracts[_id].amount > 0, "Nothing to withdraw");

        uint payment = contracts[_id].amount;
        contracts[_id].amount = 0;

        (bool success, ) = payable(msg.sender).call{value: payment}("");
        require(success, "Withdrawal failed");
    }
}
