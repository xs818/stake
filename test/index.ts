import { expect } from "chai";
import { Contract } from "ethers";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

export const Sleep = (ms:any)=> {
  return new Promise(resolve=>setTimeout(resolve, ms))
}

describe("satke samrt contract", function () {
  let stakingToken: Contract;
  let rewards: Contract;
  let stakingRewards: Contract;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];
  
  let ownerSTConn: Contract;
  let ownerRConn: Contract;
  let ownerSRConn: Contract;
  let addr1SRConn: Contract;
  let addr1STConn: Contract;
  let addr2SRConn: Contract;
  
  this.beforeAll(async () => {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    const StakingTokenFactory = await ethers.getContractFactory("StakingToken");
    stakingToken = await StakingTokenFactory.attach("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
    
    console.log("StakingToken deployed to:", stakingToken.address);
  
    const RewardsTokenFactory = await ethers.getContractFactory("RewardsToken");
    rewards = await RewardsTokenFactory.attach("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9");
    console.log("Rewards deployed to:", rewards.address);
  
    const StakingRewardsFactory = await ethers.getContractFactory("StakingRewards");
    stakingRewards = await StakingRewardsFactory.attach("0x5FC8d32690cc91D4c39d9d3abcBD16989F875707");
    console.log("StakingRewards deployed to:", stakingRewards.address);
  
    ownerSTConn = stakingToken.connect(owner);
    ownerRConn = rewards.connect(owner);
    ownerSRConn = stakingRewards.connect(owner);

    addr1SRConn = stakingRewards.connect(addr1);
    addr1STConn = stakingToken.connect(addr1);

    addr2SRConn = stakingRewards.connect(addr2);
   
  });


  describe("StakingToken", () => {
    it("transfer", async () => {
      await ownerSTConn.transfer(addr1.address, 2000);
      const addr1Balance = await ownerSTConn.balanceOf(addr1.address);
      console.log("addr1Balance:", addr1Balance.toString());

      await ownerSTConn.transfer(addr2.address, 2000);
      const addr2Balance = await ownerSTConn.balanceOf(addr2.address);
      console.log("addr2Balance:", addr2Balance.toString());
    })


  })

  describe("StakingRewards", () => {


    it("approve", async () => {
    
      const spaceCoinApprove = await ownerSTConn.approve(stakingRewards.address, 1000);
      console.log("owner approve", spaceCoinApprove)
      
      const addr1Approve = await addr1STConn.approve(stakingRewards.address, 1000);
      console.log("addr1 approve:", addr1Approve);


    });

    it("test the stake token", async () => {
      
      const ownerStake = await ownerSRConn.stake(100);
      console.log(ownerStake);
      
      const ownerRewards = await ownerSRConn.rewards(owner.address);
      console.log("owner rewards:",ownerRewards);

      
      const addr1Stake = await addr1SRConn.stake(100);
      console.log("addr1 staking:", addr1Stake);

      const addr1Rewards = await addr1SRConn.rewards(addr1.address);
      console.log("addr1 rewards:", addr1Rewards);

      const ownerEarned = await ownerSRConn.earned(owner.address);
      console.log("ownerEarned:", ownerEarned);

  
      const ownerRewardPT = await ownerSRConn.rewardPerToken()
      console.log("ownerRewardsPerToken:", ownerRewardPT);
      
      const addr1RewardsPT = await ownerSRConn.rewardPerToken();
      console.log("addr1RewardsPerToken:", addr1RewardsPT);
      

    });

    

  })
})
