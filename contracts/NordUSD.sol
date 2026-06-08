// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function balanceOf(address) external view returns (uint256);
    function transferFrom(address, address, uint256) external returns (bool);
    function transfer(address, uint256) external returns (bool);
    function decimals() external view returns (uint8);
}

contract NordUSD {
    string public constant name = "Nord USD";
    string public constant symbol = "NUSD";
    uint8 public constant decimals = 18;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    // Collateral management
    address[] public collateralTokens;
    mapping(address => bool) public isCollateral;
    mapping(address => uint256) public totalCollateral;  // per token

    // Fees (basis points: 10 = 0.1%, 100 = 1%)
    uint256 public mintFeeBps = 30;    // default 0.3%
    uint256 public redeemFeeBps = 20;  // default 0.2%

    // Fee distribution recipients
    address public daoWallet;
    address public platformWallet;
    address public founderWallet;
    address public stakingPool;

    // Blacklist
    mapping(address => bool) public blacklisted;
    address public owner;
    address public pendingDAO;

    event Mint(address indexed user, address indexed collateral, uint256 colAmount, uint256 nusdAmount, uint256 fee);
    event Redeem(address indexed user, address indexed collateral, uint256 nusdAmount, uint256 colAmount, uint256 fee);
    event Blacklisted(address indexed account);
    event Unblacklisted(address indexed account);
    event CollateralAdded(address indexed token);
    event CollateralRemoved(address indexed token);
    event FeesUpdated(uint256 mintFee, uint256 redeemFee);

    modifier onlyOwner() {
        require(msg.sender == owner, "NordUSD: FORBIDDEN");
        _;
    }

    modifier notBlacklisted(address account) {
        require(!blacklisted[account], "NordUSD: BLACKLISTED");
        _;
    }

    constructor(
        address _owner,
        address _dao,
        address _platform,
        address _founder,
        address _staking
    ) {
        owner = _owner;
        daoWallet = _dao;
        platformWallet = _platform;
        founderWallet = _founder;
        stakingPool = _staking;
    }

    function addCollateral(address token) external onlyOwner {
        require(!isCollateral[token], "NordUSD: ALREADY_ADDED");
        isCollateral[token] = true;
        collateralTokens.push(token);
        emit CollateralAdded(token);
    }

    function removeCollateral(address token) external onlyOwner {
        require(isCollateral[token], "NordUSD: NOT_FOUND");
        require(totalCollateral[token] == 0, "NordUSD: HAS_BALANCE");
        isCollateral[token] = false;
        for (uint256 i; i < collateralTokens.length; i++) {
            if (collateralTokens[i] == token) {
                collateralTokens[i] = collateralTokens[collateralTokens.length - 1];
                collateralTokens.pop();
                break;
            }
        }
        emit CollateralRemoved(token);
    }

    function setFees(uint256 _mintFeeBps, uint256 _redeemFeeBps) external {
        require(msg.sender == daoWallet || msg.sender == owner, "NordUSD: FORBIDDEN");
        require(_mintFeeBps >= 10 && _mintFeeBps <= 100, "NordUSD: INVALID_MINT_FEE");
        require(_redeemFeeBps >= 10 && _redeemFeeBps <= 100, "NordUSD: INVALID_REDEEM_FEE");
        mintFeeBps = _mintFeeBps;
        redeemFeeBps = _redeemFeeBps;
        emit FeesUpdated(_mintFeeBps, _redeemFeeBps);
    }

    function setWallets(address _dao, address _platform, address _founder, address _staking) external onlyOwner {
        daoWallet = _dao;
        platformWallet = _platform;
        founderWallet = _founder;
        stakingPool = _staking;
    }

    function blacklist(address account) external onlyOwner {
        blacklisted[account] = true;
        emit Blacklisted(account);
    }

    function unblacklist(address account) external {
        require(msg.sender == daoWallet, "NordUSD: DAO_ONLY");
        blacklisted[account] = false;
        emit Unblacklisted(account);
    }

    function mint(address collateralToken, uint256 collateralAmount) external notBlacklisted(msg.sender) {
        require(isCollateral[collateralToken], "NordUSD: INVALID_COLLATERAL");
        require(collateralAmount > 0, "NordUSD: ZERO_AMOUNT");

        IERC20(collateralToken).transferFrom(msg.sender, address(this), collateralAmount);
        totalCollateral[collateralToken] += collateralAmount;

        uint256 fee = collateralAmount * mintFeeBps / 10000;
        uint256 nusdAmount = collateralAmount - fee;

        _mint(msg.sender, nusdAmount);
        _distributeMintFee(collateralToken, fee);

        emit Mint(msg.sender, collateralToken, collateralAmount, nusdAmount, fee);
    }

    function redeem(address collateralToken, uint256 nusdAmount) external notBlacklisted(msg.sender) {
        require(isCollateral[collateralToken], "NordUSD: INVALID_COLLATERAL");
        require(nusdAmount > 0, "NordUSD: ZERO_AMOUNT");
        require(balanceOf[msg.sender] >= nusdAmount, "NordUSD: INSUFFICIENT_BALANCE");

        uint256 fee = nusdAmount * redeemFeeBps / 10000;
        uint256 collateralOut = nusdAmount - fee;
        require(totalCollateral[collateralToken] >= collateralOut, "NordUSD: INSUFFICIENT_COLLATERAL");

        _burn(msg.sender, nusdAmount);
        totalCollateral[collateralToken] -= collateralOut;
        IERC20(collateralToken).transfer(msg.sender, collateralOut);
        _distributeRedeemFee(collateralToken, fee);

        emit Redeem(msg.sender, collateralToken, nusdAmount, collateralOut, fee);
    }

    function _mint(address to, uint256 amount) internal {
        totalSupply += amount;
        balanceOf[to] += amount;
    }

    function _burn(address from, uint256 amount) internal {
        balanceOf[from] -= amount;
        totalSupply -= amount;
    }

    function _distributeMintFee(address collateralToken, uint256 fee) internal {
        uint256 collateralShare = fee * 50 / 100;
        totalCollateral[collateralToken] -= fee - collateralShare;

        _safeTransfer(collateralToken, daoWallet, fee * 20 / 100);
        _safeTransfer(collateralToken, platformWallet, fee * 20 / 100);
        _safeTransfer(collateralToken, founderWallet, fee * 10 / 100);
    }

    function _distributeRedeemFee(address collateralToken, uint256 fee) internal {
        totalCollateral[collateralToken] -= fee;

        _safeTransfer(collateralToken, stakingPool, fee * 20 / 100);
        _safeTransfer(collateralToken, daoWallet, fee * 20 / 100);
        _safeTransfer(collateralToken, platformWallet, fee * 20 / 100);
        _safeTransfer(collateralToken, founderWallet, fee * 10 / 100);
        // remaining 30% stays as collateral (50% total - 20% stakers)
    }

    function _safeTransfer(address token, address to, uint256 amount) internal {
        if (amount > 0 && to != address(0)) {
            IERC20(token).transfer(to, amount);
        }
    }

    function getCollateralCount() external view returns (uint256) {
        return collateralTokens.length;
    }

    function totalCollateralValue() external view returns (uint256) {
        uint256 total;
        for (uint256 i; i < collateralTokens.length; i++) {
            total += totalCollateral[collateralTokens[i]];
        }
        return total;
    }

    function transfer(address to, uint256 value) external notBlacklisted(msg.sender) notBlacklisted(to) returns (bool) {
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external notBlacklisted(from) notBlacklisted(to) returns (bool) {
        balanceOf[from] -= value;
        balanceOf[to] += value;
        return true;
    }

    function recoverBlacklisted(address from) external returns (uint256) {
        require(msg.sender == daoWallet || msg.sender == owner, "NordUSD: DAO_ONLY");
        require(blacklisted[from], "NordUSD: NOT_BLACKLISTED");
        uint256 amount = balanceOf[from];
        if (amount > 0) {
            balanceOf[from] = 0;
            totalSupply -= amount;
            _distributeSeized(from, amount);
        }
        return amount;
    }

    function _distributeSeized(address from, uint256 amount) internal {
        uint256 remainder = amount;
        if (daoWallet != address(0)) {
            balanceOf[daoWallet] += amount * 50 / 100;
            remainder -= amount * 50 / 100;
        }
        if (platformWallet != address(0)) {
            balanceOf[platformWallet] += remainder / 2;
            remainder -= remainder / 2;
        }
        if (founderWallet != address(0)) {
            balanceOf[founderWallet] += remainder;
        }
    }
}