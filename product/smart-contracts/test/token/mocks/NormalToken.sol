pragma solidity 0.4.19;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";


contract NormalToken is StandardToken {

    string public constant name = "name";

    string public constant symbol = "t";

    uint8 public constant decimals = 18;

}
