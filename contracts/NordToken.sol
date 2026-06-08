// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./NordERC20.sol";

contract NordToken is NordERC20 {
    string public constant name = "Nord Protocol";
    string public constant symbol = "NORD";
    uint8 public constant decimals = 18;
    uint256 public constant MAX_SUPPLY = 5_000_000 * 10**18;

    address public owner;
    bool public distributed;

    struct Allocation {
        address wallet;
        uint256 amount;
        bool isVested;
    }

    Allocation[8] public allocations;
    uint256 public constant FOUNDER_AMOUNT = 375_000 * 10**18;
    uint256 public constant VESTING_MONTHS = 3;
    uint256 public constant VESTING_PER_MONTH = FOUNDER_AMOUNT / VESTING_MONTHS;
    uint256 public founderStartTime;
    uint256 public founderClaimed;

    modifier onlyOwner() {
        require(msg.sender == owner, "NordToken: FORBIDDEN");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setWallets(
        address _founder,
        address _dao,
        address _platform,
        address _liquidity,
        address _staking,
        address _airdrop,
        address _grants,
        address _listing
    ) external onlyOwner {
        require(!distributed, "NordToken: ALREADY_DISTRIBUTED");
        allocations[0] = Allocation(_founder,  FOUNDER_AMOUNT, true);
        allocations[1] = Allocation(_dao,       750_000 * 10**18, false);
        allocations[2] = Allocation(_platform,  500_000 * 10**18, false);
        allocations[3] = Allocation(_liquidity, 1_500_000 * 10**18, false);
        allocations[4] = Allocation(_staking,   750_000 * 10**18, false);
        allocations[5] = Allocation(_airdrop,   500_000 * 10**18, false);
        allocations[6] = Allocation(_grants,    375_000 * 10**18, false);
        allocations[7] = Allocation(_listing,   250_000 * 10**18, false);
        emit WalletsSet();
    }

    function distribute() external onlyOwner {
        require(!distributed, "NordToken: ALREADY_DISTRIBUTED");
        require(allocations[0].wallet != address(0), "NordToken: WALLETS_NOT_SET");
        distributed = true;
        founderStartTime = block.timestamp;
        for (uint8 i = 0; i < 8; i++) {
            if (!allocations[i].isVested) {
                _mint(allocations[i].wallet, allocations[i].amount);
            }
        }
        emit Distributed();
    }

    function claimFounder() external returns (uint256) {
        require(distributed, "NordToken: NOT_DISTRIBUTED");
        require(msg.sender == allocations[0].wallet, "NordToken: NOT_FOUNDER");
        uint256 monthsPassed = (block.timestamp - founderStartTime) / 30 days;
        if (monthsPassed >= VESTING_MONTHS) monthsPassed = VESTING_MONTHS;
        uint256 totalVested = monthsPassed * VESTING_PER_MONTH;
        uint256 claimable = totalVested - founderClaimed;
        require(claimable > 0, "NordToken: NOTHING_TO_CLAIM");
        founderClaimed += claimable;
        _mint(msg.sender, claimable);
        emit FounderClaimed(claimable);
        return claimable;
    }

    function founderVested() external view returns (uint256) {
        if (!distributed) return 0;
        uint256 monthsPassed = (block.timestamp - founderStartTime) / 30 days;
        if (monthsPassed >= VESTING_MONTHS) monthsPassed = VESTING_MONTHS;
        return monthsPassed * VESTING_PER_MONTH;
    }

    function founderUnlocked() external view returns (uint256) {
        if (!distributed) return 0;
        return founderVested() - founderClaimed;
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    event WalletsSet();
    event Distributed();
    event FounderClaimed(uint256 amount);
}