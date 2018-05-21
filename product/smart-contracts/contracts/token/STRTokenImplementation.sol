pragma solidity 0.4.19;

import "./STRToken.sol";


/**
 * @title Stream Token
 */
contract STRTokenImplementation is STRToken {

    /**
     * @dev True if a signed trasnfer nonce has been used.
     */
    mapping(address => mapping(uint256 => bool)) public isSignedTransferNonceUsed;

    function migrateStorage(bytes32 /* data */) public {
        /**
         * Check that it hasn't been initialized yet. The owner is
         * initialized on construction, except in the proxy, where the token's
         * constructor isn't executed.
         */
        require(owner == address(0));

        /**
         * Check that we are in the previous storage version.
         */
        require(storageVersion == 0);

        owner = msg.sender;
        paused = false;

        createTotalSupply();

        storageVersion = 1;
    }

    /**
     * @dev Executes a signed transfer.
     *
     * @dev To generate a signed transfer you should call #getSignableTransfer
     * with a set of parameters, sign the returned value, and then call this
     * function with the same parameters and the signature.
     *
     * @param from The sender and signer of the transfer.
     * @param to The receiver of the transfer.
     * @param value The number of STR units being transfered.
     * @param expiration The max timestamp when the signed trasnfer is valid.
     * @param nonce The nonce used to sign the transfer. It's up to the user
     * what to use here, as long as it hasn't been used before. You can check
     * #isSignedTransferNonceUsed to be sure a nonce hasn't been used.
     * @param v The v parameter of the ECDSA signature.
     * @param r The r parameter of the ECDSA signature.
     * @param s The s parameter of the ECDSA signature.
     */
    function signedTransfer(
        address from,
        address to,
        uint256 value,
        uint256 expiration,
        uint256 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    )
        public
    {
        require(from != address(0));
        require(to != address(0));
        require(value > 0);
        require(expiration >= now);

        require(!isSignedTransferNonceUsed[from][nonce]);

        bytes32 dataToSign = getSignableTransfer(
            from,
            to,
            value,
            expiration,
            nonce
        );

        address recovered = ecrecover(dataToSign, v, r, s);
        require(recovered == from);

        isSignedTransferNonceUsed[from][nonce] = true;

        balances[from] = balances[from].sub(value);
        balances[to] = balances[to].add(value);
        Transfer(from, to, value);
    }

    /**
     * @return The message to sign to create a signed transfer. See
     * #signedTransfer for more info.
     */
    function getSignableTransfer(
        address from,
        address to,
        uint256 value,
        uint256 expiration,
        uint256 nonce
    )
        public constant returns (bytes32)
    {
        bytes32 signedTransferSelector = keccak256(
            "signedTransfer(address,address,uint256,uint256,uint256,uint8,bytes32,bytes32)"
        );

        return keccak256(
            signedTransferSelector,
            address(this),
            from,
            to,
            value,
            expiration,
            nonce
        );
    }

}