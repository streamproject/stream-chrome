pragma solidity 0.4.19;


/**
 * @title Stream Token Proxy Storage
 *
 * @dev This contract is used for upgradable contracts, it must be inherited by
 * the proxy and its implementation
 *
 * @notice Refer to the Stream Smart Contracts Architecture document for further
 * details
 */
contract STRTokenProxyStorage {

    address currentImplementation;

    address proxyAdmin;

    /**
     * @dev This is used to keep track of the storage version between upgrades.
     */
    uint storageVersion = 0;

}
