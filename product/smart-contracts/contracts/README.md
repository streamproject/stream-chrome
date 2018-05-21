# Stream smart contracts

This folder cointains the implementation of the smart contracts, which concist of two different modules:

1. The STR token: An upgradable ERC20 token.

2. A vesting contract which holds STR and releases it according to a daily vesting scheme.

Each contract has inline documentation explaining how to use it.

## Token upgradability

The STR token is an upgradable contract. This has been implemented Open Zeppelin's token and the Proxy Contract pattern. For learning more about it you can start with this blog posts:

* https://blog.zeppelin.solutions/proxy-libraries-in-solidity-79fbe4b970fd
* https://blog.aragon.one/advanced-solidity-code-deployment-techniques-dc032665f434