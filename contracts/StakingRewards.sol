// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";

contract StakingRewards is Initializable, AccessControlUpgradeable, PausableUpgradeable, UUPSUpgradeable {

    bytes32 public constant SNAPSHOT_ROLE = keccak256("SNAPSHOT_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    IERC20Upgradeable public rewardsToken;
    IERC20Upgradeable public stakingToken;

    uint public rewardRate;
    uint public lastUpdateTime;
    uint public rewardPerTokenStored;

    mapping(address => uint256) private userRewardPerTokenPaid;
    mapping(address => uint256) private rewards;
    uint256 private _totalSupply;
    mapping(address => uint) private _balances;

    event Event(address _from, string _name, uint256 _value);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _stakingToken, address _rewardsToken) initializer public {
        
        __AccessControl_init();
        __Pausable_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SNAPSHOT_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);

        stakingToken = IERC20Upgradeable(_stakingToken);
        rewardsToken = IERC20Upgradeable(_rewardsToken);  
        rewardRate = 100;      
    }


    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyRole(UPGRADER_ROLE)
        override
    {}

    function rewardPerToken() private view returns (uint) {
        if (_totalSupply == 0) {
            return rewardPerTokenStored;
        }
        // s+=(Tb-Ta)*R/100
        
        return
            rewardPerTokenStored +
            (((block.timestamp - lastUpdateTime) * rewardRate) / _totalSupply);
    }

    function earned(address account) public view returns (uint) {
        
        uint earnedToken = ((_balances[account] * 
             (rewardPerToken() - userRewardPerTokenPaid[account])))  
             +  rewards[account];
        
        return earnedToken;
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        rewards[account] = earned(account);
        userRewardPerTokenPaid[account] = rewardPerTokenStored;
        _;
    }

    function stake(uint _amount) external updateReward(msg.sender) {
        require(tx.origin == msg.sender, "invalid address");
        _totalSupply += _amount;
        _balances[msg.sender] += _amount;

        stakingToken.transferFrom(msg.sender, address(this), _amount);
    }

    function withdraw(uint _amount) external updateReward(msg.sender) {
        require(tx.origin == msg.sender, "invalid address");
        _totalSupply -= _amount;
        _balances[msg.sender] -= _amount;
        stakingToken.transfer(msg.sender, _amount);
    }

    function getRewards() external updateReward(msg.sender) {
        require(tx.origin == msg.sender, "invalid address");
        uint reward = rewards[msg.sender];
        rewards[msg.sender] = 0;
        rewardsToken.transfer(msg.sender, reward);
    }

    function totalSupply() public view returns (uint){
        return _totalSupply;
    }

    function stakeBalance() public view returns (uint) {
        return _balances[msg.sender];
    }

    function balanceRewards() public view  returns (uint256){
        return rewardsToken.balanceOf(msg.sender);
    }

    function balanceStaking() public view returns (uint256){
        return stakingToken.balanceOf(msg.sender);
    }

}