pragma solidity 0.4.19;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/token/ERC20/ERC20.sol';


/**
 * @title Linear daily vesting.
 *
 * @dev This contract holds ERC20 tokens and releases them to its #beneficiary
 * according to a linear cliff vesting scheme proportional to the number of days
 * since #vestingStart. If #cliffDays is greater than 0, no token will be
 * released until #vestingStart + #cliffDays days.
 *
 * @dev This vesting contract is optionally revocable by a #revoker, which makes
 * any non-released vested token to be sent to the #beneficiary, and any
 * non-vested token to the #revokedTokensDestination.
 *
 * @dev This contract manages every token sent to it before its revokation.
 * Tokens sent after revoking the contract will be lost.
 *
 * @dev When or in how many transactions are the tokens sent to this contract
 * doesn't change the way it computes whow many tokens are vested each day. It
 * can always be assumed that all tokens have been sent before #vestingStart,
 * and the numbers will be the same.
 *
 * @dev The roles involved in this contract are:
 *      - #beneficiary: The account that will receive the vested tokens.
 *
 *      - #revoker: The only one who can #revoke() the contract.
 *
 *      - #revokedTokensDestination: The account that will receive any
 *          non-vested token in case of a revokation.
 *
 *      - #revokedTokensDestinationChanger: The only account that can change
 *          the #revokedTokensDestination address.
 *
 *      - Any account: can release the already vested tokens, sending them
 *          to the #beneficiary.
 */
contract LinearDailyVesting {
    using SafeMath for uint256;

    ERC20 public token;

    uint256 public relasedTokens;

    address public beneficiary;

    uint256 public vestingStart;

    uint256 public vestingDays;

    uint256 public cliffDays;

    bool public revocable;

    address public revoker;

    uint256 public revokedTokens;

    address public revokedTokensDestination;

    address public revokedTokensDestinationChanger;

    bool public revoked;

    event TokensReleased(uint256 amount);

    event Revoked(
        uint256 totalTokens,
        uint256 revokedTokens,
        address revokedTokensDestination
    );

    event RevokedTokensDestinationChanged(address previous, address current);

    event RevokedTokensDestinationChangerChanged(
        address previous,
        address current
    );

    /**
     * @dev Creates a vesting contract.
     *
     * @param _token The token involved in the vesting contract.
     * @param _beneficiary The account that will receive the vested tokens.
     * @param _vestingStart The number of seconds from the EPOCH where the
     * vesting period starts.
     * @param _vestingDays The duration of the vesting period in days.
     * @param _cliffDays The number of days after _vestingStart before the
     * tokens start vesting.
     * @param _revocable True if this contract can be revoced.
     * @param _revoker The only account that can #revoke() the contract.
     * @param _revokedTokensDestination The account that will receive non-vested
     * tokens on revokation.
     * @param _revokedTokensDestinationChanger The only account that can change
     * the value of #revokedTokensDestination.
     */
    function LinearDailyVesting(
        ERC20 _token,
        address _beneficiary,
        uint256 _vestingStart,
        uint256 _vestingDays,
        uint256 _cliffDays,
        bool _revocable,
        address _revoker,
        address _revokedTokensDestination,
        address _revokedTokensDestinationChanger
    )
        public
    {
        require(_token != address(0));
        require(_beneficiary != address(0));
        require(_vestingStart > 0);
        require(_vestingDays > 0);
        require(_cliffDays <= _vestingDays);
        require(!_revocable || _revoker != address(0));
        require(!_revocable || _revokedTokensDestination != address(0));
        require(!_revocable || _revokedTokensDestinationChanger != address(0));

        token = _token;
        beneficiary = _beneficiary;
        vestingStart = _vestingStart;
        vestingDays = _vestingDays;
        cliffDays = _cliffDays;

        revoked = false;
        revokedTokens = 0;
        revocable = _revocable;
        revoker = _revoker;
        revokedTokensDestination = _revokedTokensDestination;
        revokedTokensDestinationChanger = _revokedTokensDestinationChanger;
    }

    /**
     * @dev Sends any vested token being held by this contract to the
     * #beneficiary.
     */
    function release() public {
        require(revoked == false);

        uint256 releasable = releasableTokens();
        require(releasable > 0);

        assert(token.transfer(beneficiary, releasable));
        relasedTokens = relasedTokens.add(releasable);

        TokensReleased(releasable);
    }

    /**
     * @return The total number of tokens that have already vested, whether they
     * have been released or not.
     */
    function vestedTokens() public constant returns (uint256) {
        if (vestingStart > now) {
            return 0;
        }

        uint256 vestedDays = now.sub(vestingStart).div(1 days);

        if (vestedDays < cliffDays) {
            return 0;
        }

        if (vestedDays > vestingDays) {
            vestedDays = vestingDays;
        }

        return totalTokens().mul(vestedDays).div(vestingDays);
    }

    /**
     * @return The total number of tokens that this contract is or has managed.
     */
    function totalTokens() public constant returns (uint256) {
        return token.balanceOf(this).add(relasedTokens).add(revokedTokens);
    }

    /**
     * @return The number of non-vested tokens held by this contract.
     */
    function lockedTokens() public constant returns (uint256) {
        if (revoked) {
            return 0;
        }

        return totalTokens().sub(vestedTokens());
    }

    /**
     * @return The number of non-released vested tokens.
     */
    function releasableTokens() public constant returns (uint256) {
        return vestedTokens().sub(relasedTokens);
    }

    /**
     * @dev Revokes the contract, sending all non-released vested token to the
     * #beneficiary, and all non-vested ones to the #revokedTokensDestination.
     *
     * @notice This contract enters in a locked mode after calling this method,
     * so no token should be send after calling it.
     */
    function revoke() public {
        require(revocable == true);
        require(msg.sender == revoker);
        require(revoked == false);

        uint256 locked = lockedTokens();
        require(locked > 0);

        if (releasableTokens() > 0) {
            release();
        }

        revoked = true;
        revokedTokens = locked;
        assert(token.transfer(revokedTokensDestination, revokedTokens));

        Revoked(totalTokens(), revokedTokens, revokedTokensDestination);
    }

    /**
     * @dev Changes #revokedTokensDestination address.
     */
    function changeRevokedTokensDestination(address _revokedTokensDestination)
        public
    {
        require(revocable == true);
        require(msg.sender == revokedTokensDestinationChanger);
        require(revoked == false);
        require(_revokedTokensDestination != address(0));
        require(_revokedTokensDestination != revokedTokensDestination);

        address previous = revokedTokensDestination;
        revokedTokensDestination = _revokedTokensDestination;

        RevokedTokensDestinationChanged(previous, revokedTokensDestination);
    }

    /**
     * @dev Changes #revokedTokensDestinationChanger address.
     */
    function changeRevokedTokensDestinationChanger(
        address _revokedTokensDestinationChanger
    )
        public
    {
        require(revocable == true);
        require(msg.sender == revokedTokensDestinationChanger);
        require(revoked == false);
        require(_revokedTokensDestinationChanger != address(0));
        require(
            _revokedTokensDestinationChanger != revokedTokensDestinationChanger
        );

        address previous = revokedTokensDestinationChanger;
        revokedTokensDestinationChanger = _revokedTokensDestinationChanger;

        RevokedTokensDestinationChangerChanged(
            previous,
            revokedTokensDestinationChanger
        );
    }

}