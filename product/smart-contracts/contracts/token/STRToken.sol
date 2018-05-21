pragma solidity 0.4.19;

import "zeppelin-solidity/contracts/token/ERC20/PausableToken.sol";

import "./STRTokenProxyStorage.sol";


/**
 * @title Stream Token
 */
contract STRToken is STRTokenProxyStorage, PausableToken {

    function STRToken() public {
        createTotalSupply();
    }

    /**
     * @notice ERC-20 tokens descriptions must be constant functions. Normally
     * they are defined with constant public state variables. We need to
     * initialize them in the proxy, and assigning to a constant variable is, of
     * course, forbidden. We define these functions which are ABI compatible and
     * avoid those issues.
     */
    function symbol() public pure returns (string) {
        return "STR";
    }

    function name() public pure returns (string) {
        return "Stream Token";
    }

    function decimals() public pure returns (uint8) {
        return 18;
    }

    /**
     * Creates the total supply and assigns it to the owner.
     */
    function createTotalSupply() internal {
        // This should only be callable once
        require(totalSupply_ == 0);

        // STR and ETH have the same precision
        uint256 desiredSupply = 10000000000 ether;

        totalSupply_ = totalSupply_.add(desiredSupply);
        balances[owner] = balances[owner].add(desiredSupply);
        Transfer(0x0, owner, desiredSupply);
    }

    /**
     * @dev This function is used to initialize/update the storage in the proxy
     * after setting a new implementation.
     *
     * @notice This function needs to be public, but it shouldn't be directly
     * callable from an implementation. It only makes sense in the context of a
     * proxy.
     *
     * @notice This function must check that the storage is in the correct
     * version using STRTokenProxyStorage#storageVersion and update it.
     *
     * @param data Any data needed for the migration. Limited to 32 bytes
     * because of solidity's delegatecall limitations. Note that if more data
     * is needed it can be uploaded to a contract, and use this param for its
     * address.
     */
    function migrateStorage(bytes32 data) public;
}
