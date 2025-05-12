// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IPFSStorage {
    mapping(address => string) private userCIDs;
    
    event CIDStored(address indexed user, string cid);
    
    function storeCID(string memory _cid) public {
        userCIDs[msg.sender] = _cid;
        emit CIDStored(msg.sender, _cid);
    }
    
    function retrieveCID() public view returns (string memory) {
        return userCIDs[msg.sender];
    }
}
