// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error NotEnoughAmountUnlocked();
error UnauthorizedAccess();
error NotEnoughBalanceToVest();
error NotEnoughBalanceToVestForAccountAtIndex(uint256 index);

contract Dripper is ERC20, ERC20Burnable, Ownable {
    mapping(address => uint256) public userUnlockTime;
    mapping(address => bool) public isAdmin;

    struct VestingAgreement {
        uint256 vestStartTime; // timestamp at which vesting starts in UNIX time, acts as a vesting delay
        uint256 vestPeriod; // time period over which vesting occurs
        uint256 totalAmount; // total KAP amount to which the beneficiary is promised
        uint256 vestPeriodSize;// vesting period size in seconds
        address sender; // sender of the vesting amount
        address recipient; // recipient of the vest
        uint amountWithdrawn; // total amount withdrawn by the reciepient
    }

    mapping(address => VestingAgreement[]) vestingAgreements;

    mapping(address => uint256) public depositedAmount;

    constructor() ERC20("Dripper", "DRP") Ownable(msg.sender) {
        _mint(msg.sender, 600000000 * 10 ** 18);
        isAdmin[msg.sender] = true;
    }

    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Admin is only allowed!");
        _;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function lockToVestAndTransfer(
        uint256 amount,
        address recipient,
        uint256 vestStartTime,
        uint256 vestPeriod,
        uint256 vestPeriodSize
    ) public returns (bool) {
        require(
            vestStartTime > block.timestamp,
            "Vest Start Date should be later than now"
        );
        require(vestPeriod > 0, "Vest Period is too short");
        if (balanceOf(msg.sender) < amount) {
            revert NotEnoughBalanceToVest();
        }
        vestingAgreements[msg.sender].push(
            VestingAgreement({
                vestStartTime: vestStartTime,
                vestPeriod: vestPeriod,
                totalAmount: amount,
                recipient: recipient,
                vestPeriodSize: vestPeriodSize,
                sender: msg.sender,
                amountWithdrawn: 0
            })
        );
        _transfer(_msgSender(), address(this), amount);
        return true;
    }

    function lockToVestAndTransfer(
        address walletAddress,
        address recipient,
        uint256 amount,
        uint256 vestStartTime,
        uint256 vestPeriod,
        uint256 vestPeriodSize
    ) public onlyAdmin returns (bool) {
        require(
            vestStartTime > block.timestamp,
            "Vest Start Date should be later than now"
        );
        require(vestPeriod > 0, "Vest Period is too short");
        if (balanceOf(msg.sender) < amount) {
            revert NotEnoughBalanceToVest();
        }
        vestingAgreements[walletAddress].push(
            VestingAgreement({
                vestStartTime: vestStartTime,
                vestPeriod: vestPeriod,
                totalAmount: amount,
                recipient: recipient,
                vestPeriodSize: vestPeriodSize,
                sender: walletAddress,
                amountWithdrawn: 0
            })
        );
        _transfer(_msgSender(), address(this), amount);
        return true;
    }

    function multipleLockToVestAndTransfer(
        address[] calldata recipients,
        uint256[] memory amounts,
        uint256 vestStartTime,
        uint256 vestPeriod,
        uint256 vestPeriodSize
    ) public returns (bool) {
        require(
            vestStartTime > block.timestamp,
            "Vest Start Date should be later than now"
        );
        require(vestPeriod > 0, "Vest Period is too short");
        require(
            recipients.length == amounts.length,
            "The number of addresses must be equal with the number of amount"
        );

        uint256 totalAmountToVest;
        for (uint256 i = 0; i < recipients.length; i++) {
            if (balanceOf(msg.sender) < totalAmountToVest) {
                revert NotEnoughBalanceToVestForAccountAtIndex(i);
            }
            totalAmountToVest += amounts[i];
            vestingAgreements[msg.sender].push(
                VestingAgreement({
                    vestStartTime: vestStartTime,
                    vestPeriod: vestPeriod,
                    totalAmount: amounts[i],
                    recipient: recipients[i],
                    vestPeriodSize: vestPeriodSize,
                    sender: msg.sender,
                    amountWithdrawn: 0
                })
            );
            _transfer(_msgSender(), address(this), amounts[i]);
        }
        return true;
    }

    function multipleLockToVestAndTransfer(
        address[] memory walletAddresses,
        address[] calldata recipients,
        uint256[] memory amounts,
        uint256 vestStartTime,
        uint256 vestPeriod,
        uint256 vestPeriodSize
    ) public onlyAdmin returns (bool) {
        require(
            vestStartTime > block.timestamp,
            "Vest Start Date should be later than now"
        );
        require(vestPeriod > 0, "Vest Period is too short");
        require(
            walletAddresses.length == amounts.length,
            "The number of addresses must be equal with the number of amount"
        );

        uint256 totalAmountToVest;

        for (uint256 i = 0; i < walletAddresses.length; i++) {
            if (balanceOf(msg.sender) < totalAmountToVest) {
                revert NotEnoughBalanceToVestForAccountAtIndex(i);
            }
            totalAmountToVest += amounts[i];
            vestingAgreements[walletAddresses[i]].push(
                VestingAgreement({
                    vestStartTime: vestStartTime,
                    vestPeriod: vestPeriod,
                    totalAmount: amounts[i],
                    recipient: recipients[i],
                    vestPeriodSize: vestPeriodSize,
                    sender: walletAddresses[i],
                    amountWithdrawn: 0
                })
            );
            _transfer(_msgSender(), address(this), amounts[i]);
        }
        return true;
    }

    function setAdmin(address user, bool value) external onlyOwner {
        isAdmin[user] = value;
    }

    function getNumberOfVestingAgreement(
        address walletAddress
    ) public view returns (uint256) {
        if (!isAdmin[msg.sender] && msg.sender != walletAddress) {
            revert UnauthorizedAccess();
        }
        return vestingAgreements[walletAddress].length;
    }

    function getTotalLockedAmountForAddress(
        address walletAddress
    ) external view returns (uint256) {
        if (!isAdmin[msg.sender] && msg.sender != walletAddress) {
            revert UnauthorizedAccess();
        }
        uint256 lockedAmount = 0;

        for (uint i = 0; i < vestingAgreements[walletAddress].length; i++) {
            (uint256 tempLockedAmount, ) = getLockedAndUnlockedPerAgreement(
                walletAddress,
                i
            );
            lockedAmount += tempLockedAmount;
        }
        return lockedAmount;
    }

    function getLockedAndUnlockedPerAgreement(
    address walletAddress,
    uint index
) public view returns (uint256, uint256) {
   if (
            !isAdmin[msg.sender] &&
            msg.sender != walletAddress &&
            msg.sender != vestingAgreements[walletAddress][index].recipient
        ) {
            revert UnauthorizedAccess();
        }
        uint256 lockedAmount = 0;
        uint256 unLockedAmount = 0;


    VestingAgreement memory currentVest = vestingAgreements[walletAddress][index];

    uint256 elapsedPeriods = block.timestamp > currentVest.vestStartTime ?
                              (block.timestamp - currentVest.vestStartTime) / currentVest.vestPeriodSize :
                              0;

    if (elapsedPeriods == 0) {
        lockedAmount = currentVest.totalAmount;
        unLockedAmount = 0;
        return (lockedAmount, unLockedAmount);
    }

    uint256 unlockedPeriods = elapsedPeriods > currentVest.vestPeriod ? currentVest.vestPeriod : elapsedPeriods;
    unLockedAmount = currentVest.totalAmount * unlockedPeriods / currentVest.vestPeriod;
    lockedAmount = currentVest.totalAmount - unLockedAmount;

    return (lockedAmount, unLockedAmount);
}


    function getVestingAgreements(
        address walletAddress,
        uint index
    ) public view returns (VestingAgreement memory) {
        if (
            !isAdmin[msg.sender] &&
            msg.sender != walletAddress &&
            msg.sender != vestingAgreements[walletAddress][index].recipient
        ) {
            revert UnauthorizedAccess();
        }
        return vestingAgreements[walletAddress][index];
    }

    function getWithdrawableAmount(
        address walletAddress,
        uint index
    ) public view returns (uint) {
        if (
            !isAdmin[msg.sender] &&
            msg.sender != walletAddress &&
            msg.sender != vestingAgreements[walletAddress][index].recipient
        ) {
            revert UnauthorizedAccess();
        }
        (, uint unlocked) = getLockedAndUnlockedPerAgreement(
            walletAddress,
            index
        );
        return
            unlocked - vestingAgreements[walletAddress][index].amountWithdrawn;
    }

    function withdraw(address senderAddress, uint index, uint amount) public {
        require(
            msg.sender == vestingAgreements[senderAddress][index].recipient,
            "Only Receipient Can Withdraw"
        );
        (, uint unlocked) = getLockedAndUnlockedPerAgreement(
            senderAddress,
            index
        );
        VestingAgreement memory _vestingAgreements = vestingAgreements[
            senderAddress
        ][index];
        if (unlocked - _vestingAgreements.amountWithdrawn < amount) {
            revert NotEnoughAmountUnlocked();
        }
        _vestingAgreements.amountWithdrawn =
            _vestingAgreements.amountWithdrawn +
            amount;
        vestingAgreements[senderAddress][index] = _vestingAgreements;
        _transfer(address(this), msg.sender, amount);
    }   
}