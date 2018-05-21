pragma solidity 0.4.19;

import "../dependencies/aragon-core/contracts/common/DelegateProxy.sol";

import "./STRTokenProxyStorage.sol";
import "./STRToken.sol";


/**
 * @title Stream Token Proxy
 *
 * @dev This contract is a proxy used in front of the Stream Token to make it
 * upgradable
 */
contract STRTokenProxy is STRTokenProxyStorage, DelegateProxy {

    event ImplementationChanged(address previous, address current);

    event AdminChanged(address previous, address current);

    /**
     * @param _admin The address of the admin who can upgrade the token
     * @param _implementation The address of the current implementation of the
     * token. It must be a contract
     */
    function STRTokenProxy(address _admin, address _implementation) public {
        require(_admin != address(0));

        proxyAdmin = _admin;
        setImplementationAndInitializeStorage(_implementation, 0x00);
    }

    /**
     * @dev Forwards everything to the implementation token using a DELEGATECALL
     */
    function () payable public {
        delegatedFwd(currentImplementation, msg.data);
    }

    /**
     * @dev Changes the token implementation. Only callable by the admin
     * @param newImplementation It must be a contract
     * @param data Any data needed by the #migrateStorage(bytes) of the new
     * implementation.
     */
    function changeTokenImplementation(address newImplementation, bytes32 data)
        public
    {
        require(msg.sender == proxyAdmin);

        ImplementationChanged(currentImplementation, newImplementation);

        setImplementationAndInitializeStorage(newImplementation, data);
    }

    /**
     * @dev Changes the admin. Only callable by the current admin
     */
    function changeAdmin(address newAdmin) public {
        require(msg.sender == proxyAdmin);
        require(newAdmin != address(0));

        AdminChanged(proxyAdmin, newAdmin);

        proxyAdmin = newAdmin;
    }

    /**
     * @notice We don't declare the state variable as public because that would
     * pollute the implementation's interface.
     */
    function admin() public constant returns (address) {
        return proxyAdmin;
    }

    /**
     * @notice We don't declare the state variable as public because that would
     * pollute the implementation's interface.
     */
    function implementation() public constant returns (address) {
        return currentImplementation;
    }

    function setImplementationAndInitializeStorage(
        address _implementation,
        bytes32 data
    )
        internal
    {
        require(isContract(_implementation));
        currentImplementation = _implementation;

        assert(currentImplementation.delegatecall(
            STRToken(_implementation).migrateStorage.selector,
            data
        ));
    }

}
