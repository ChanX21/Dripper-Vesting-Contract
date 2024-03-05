
Dripper Vesting Contract Documentation
-----------------------------

This document provides an overview of the Dripper contract, a smart contract written in Solidity.

## Contract Flow
![image](https://github.com/ChanX21/Dripper-Vesting-Contract/assets/47290661/a4b3c703-c053-4e7a-9d23-865fef954db5)


### Functionality

Dripper is a token contract with vesting capabilities. It allows users to lock tokens for a specific period and gradually release them over time. The contract also includes functionalities for administrators to manage vesting agreements and user permissions.

### Key Features

-   ERC20 compliant: Dripper implements the ERC20 standard, making it compatible with other ERC20 tokens and tools.
-   Burnable tokens: Users can burn their Dripper tokens permanently.
-   Vesting agreements: Users can lock tokens for a specific period (vesting period) and define the recipient who will receive the tokens gradually.
-   Admin roles: The contract owner can grant admin privileges to other users, allowing them to manage vesting agreements for other users.
-   Access control: Users can only access information and perform actions related to their own vesting agreements or those they have explicit permission for.

### Dependencies

Dripper utilizes the following external libraries:

-   `@openzeppelin/contracts/token/ERC20/ERC20.sol`: Provides the ERC20 token standard implementation.
-   `@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol`: Extends the ERC20 standard with functionality for burning tokens.
-   `@openzeppelin/contracts/access/Ownable.sol`: Provides access control mechanisms with the Ownable contract.

### Code Structure

The contract consists of the following functionalities:

-   Constructor: Initializes the contract with a total supply of tokens and sets the deployer as the owner and admin.
-   Modifiers:
    -   `onlyAdmin`: Restricts function calls to users with admin privileges.
-   Functions:
    -   `mint(address to, uint256 amount)`: Mints new tokens for the specified address (only owner can call).
    -   `lockToVestAndTransfer(uint256 amount, address recipient, uint256 vestStartTime, uint256 vestPeriod, uint256 vestPeriodSize)`: Locks a specified amount of tokens for the sender, defines the recipient, vesting start time, vesting period, and vesting period size, and transfers the tokens to the contract.
    -   `lockToVestAndTransfer(address walletAddress, address recipient, uint256 amount, uint256 vestStartTime, uint256 vestPeriod, uint256 vestPeriodSize)`: Similar to the previous function, but allows admins to lock tokens for other users.
    -   `multipleLockToVestAndTransfer(address[] calldata recipients, uint256[] memory amounts, uint256 vestStartTime, uint256 vestPeriod, uint256 vestPeriodSize)`: Locks tokens for multiple recipients with different amounts, defining the vesting details (only owner can call).
    -   `multipleLockToVestAndTransfer(address[] memory walletAddresses, address[] calldata recipients, uint256[] memory amounts, uint256 vestStartTime, uint256 vestPeriod, uint256 vestPeriodSize)`: Similar to the previous function, but allows admins to lock tokens for multiple users with different amounts.
    -   `setAdmin(address user, bool value)`: Grants or revokes admin privileges for a user (only owner can call).
    -   `getNumberOfVestingAgreement(address walletAddress)`: Returns the number of vesting agreements for a specific address.
    -   `getTotalLockedAmountForAddress(address walletAddress)`: Retrieves the total locked amount of tokens for a specific address.
    -   `getLockedAndUnlockedPerAgreement(address walletAddress, uint index)`: Calculates the locked and unlocked amounts for a specific vesting agreement.
    -   `getVestingAgreements(address walletAddress, uint index)`: Retrieves the details of a specific vesting agreement.
    -   `getWithdrawableAmount(address walletAddress, uint index)`: Calculates the withdrawable amount for a specific vesting agreement.
    -   `withdraw(address senderAddress, uint index, uint amount)`: Allows the recipient of a vesting agreement to withdraw unlocked tokens.

### Custom Errors

The contract defines the following custom errors:

-   `NotEnoughAmountUnlocked`: Reverted when the attempted withdrawal amount exceeds the unlocked amount in a vesting agreement.
-   `UnauthorizedAccess`: Reverted when a user attempts to access information or perform actions without proper permissions.
-   `NotEnoughBalanceToVest`: Reverted when the sender does not have enough tokens to lock for vesting.
-   `NotEnoughBalanceToVestForAccountAtIndex`: Reverted when the sender does not have enough tokens to lock for vesting for a specific recipient at a specific index in the `multipleLockToVestAndTransfer` functions.

### Additional Notes

-   The contract utilizes access control mechanisms to ensure only authorized users can
-   A simple UI interface is provided for with file name ``frontend-ui``

