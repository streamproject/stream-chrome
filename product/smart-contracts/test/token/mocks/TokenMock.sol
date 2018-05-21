pragma solidity ^0.4.19;

import "../../../contracts/token/STRToken.sol";


contract TokenMock is STRToken {

    bool public fallbackFunctionCalled = false;

    bool public overriddenPauseCalled = false;

    bool public newFunctionCalled = false;

    bool public storageInitialized = false;

    bytes32 public dataFromMigration;

    function () payable public {
        fallbackFunctionCalled = true;
    }

    function pause() onlyOwner whenNotPaused public {
        overriddenPauseCalled = true;
    }

    function newFunction() public {
        newFunctionCalled = true;
    }

    function migrateStorage(bytes32 data) public {
        storageInitialized = true;
        dataFromMigration = data;
    }

}
