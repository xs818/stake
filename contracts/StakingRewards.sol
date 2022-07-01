// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

import "hardhat/console.sol";

contract StakingRewards is Initializable, AccessControlUpgradeable, PausableUpgradeable, UUPSUpgradeable {

    bytes32 public constant SNAPSHOT_ROLE = keccak256("SNAPSHOT_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    IERC20 public rewardsToken;
    IERC20 public stakingToken;

    uint public rewardRate;
    uint public lastUpdateTime;
    uint public rewardPerTokenStored;

    mapping(address => uint) public userRewardPerTokenPaid;
    mapping(address => uint) public rewards;

    uint private _totalSupply;
    mapping(address => uint) private _balances;

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

        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardsToken);  
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

    function rewardPerToken() public view returns (uint) {
        if (_totalSupply == 0) {
            return rewardPerTokenStored;
        }
        // s+=(Tb-Ta)*R/100
        return
            rewardPerTokenStored +
            (((block.timestamp - lastUpdateTime) * rewardRate ) / _totalSupply);
    }

    function earned(address account) public view returns (uint) {
        return
            ((_balances[account] * 
             (rewardPerToken() - userRewardPerTokenPaid[account])))  
             +  rewards[account];
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        console.log("pre user amount:",_balances[account]);
        console.log("pre L(t):",_totalSupply);
        console.log("S:",rewardPerTokenStored);
        lastUpdateTime = block.timestamp;
        console.log("pre P:",userRewardPerTokenPaid[account]);
        rewards[account] = earned(account);
        userRewardPerTokenPaid[account] = rewardPerTokenStored;
        console.log("currrent P:",userRewardPerTokenPaid[account]);
        _;
    }

    function stake(uint _amount) external updateReward(msg.sender) {
        console.log("user:",msg.sender);
        console.log("stake action");
        _totalSupply += _amount;
        _balances[msg.sender] += _amount;
        console.log("current user amount:",_balances[msg.sender]);
        console.log("current L(t):",_totalSupply);
        stakingToken.transferFrom(msg.sender, address(this), _amount);
    }

    function withdraw(uint _amount) external updateReward(msg.sender) {
        console.log("user:",msg.sender);
        console.log("withdraw action");
        _totalSupply -= _amount;
        _balances[msg.sender] -= _amount;
        console.log("current user amount:",_balances[msg.sender]);
        console.log("current L(t):",_totalSupply);
        stakingToken.transfer(msg.sender, _amount);
    }

    function getReward() external updateReward(msg.sender) {
        console.log("user:",msg.sender);
        console.log("getReward action");
        uint reward = rewards[msg.sender];
        rewards[msg.sender] = 0;
        console.log("current user amount:",_balances[msg.sender]);
        console.log("current L(t):",_totalSupply);
        rewardsToken.transfer(msg.sender, reward);
    }
}