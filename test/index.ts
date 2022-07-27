// import { expect } from "chai";
import { Contract, utils } from "ethers";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import BN from "bn.js";
import { expect } from "chai";


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
  let ownerRTConn: Contract;
  let ownerSRConn: Contract;
  let addr1SRConn: Contract;
  let addr1STConn: Contract;
  let addr2SRConn: Contract;
  let addr2STConn: Contract;

  this.beforeAll(async () => {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    stakingToken = await ethers.getContractAt("StakingToken", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
    
    console.log("StakingToken deployed to:", stakingToken.address);
  

    rewards = await ethers.getContractAt("RewardsToken", "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9")
    console.log("Rewards deployed to:", rewards.address);
  
    
    stakingRewards = await ethers.getContractAt("StakingRewards", "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707");
    console.log("StakingRewards deployed to:", stakingRewards.address);
  
    // const rewardsBalance = await rewards.balanceOf(rewards.address);
    // console.log("rewardsBalance:", ethers.utils.formatUnits(rewardsBalance, "ether"));
    // await rewards.transferTo(stakingRewards.address, rewardsBalance);

    
    ownerSTConn = stakingToken.connect(owner);
    ownerRTConn = rewards.connect(owner);
    ownerSRConn = stakingRewards.connect(owner);

    addr1SRConn = stakingRewards.connect(addr1);
    addr1STConn = stakingToken.connect(addr1);

    addr2SRConn = stakingRewards.connect(addr2);
    addr2STConn  = stakingToken.connect(addr2)
    
   
  });


  describe("Claim StakingToken", () => {
    it("transfer", async () => {
      console.log("StakingToken contract Balance:", ethers.utils.formatUnits(await ownerSTConn.balanceOf(stakingToken.address), "ether"));
      
      await ownerSTConn.claim();
      const ownerBalance = await ownerSTConn.balanceOf(owner.address)
      console.log("ownerBalance:", ethers.utils.formatUnits(ownerBalance, "ether"));

      await addr1STConn.claim();
      const addr1Balance = await addr1STConn.balanceOf(addr1.address)
      console.log("addr1Balance:", ethers.utils.formatUnits(addr1Balance, "wei"));

      await addr2STConn.claim();
      const addr2Balance = await addr2STConn.balanceOf(addr2.address);
      console.log("addr2Balance:", ethers.utils.formatUnits(addr2Balance, "wei"));

       
    })


  })

  describe("StakingRewards", () => {


    it("approve", async () => {
      const amount = ethers.utils.parseEther('100')
      await ownerSTConn.approve(stakingRewards.address, amount);
      
      await addr1STConn.approve(stakingRewards.address, amount);

     await addr2STConn.approve(stakingRewards.address, amount);

    });

    it("test the stake token", async () => {

      // const amount = ethers.utils.parseEther('10')
      await ownerSRConn.stake(100);
      
      await addr1SRConn.stake(100);

      await addr2SRConn.stake(100);

      const addr1Rewards = await addr1SRConn.earned(addr1.address);
      console.log("addr1 earned:", addr1Rewards);

      // const etherValue = ethers.utils.formatUnits(ownerEarned, "ether");
      // console.log("ownerEarned:", etherValue);

      
      for (let i = 0; i < 10; i++) {
        let earned = await stakingRewards.earned(owner.address);
        console.log("owner earned:", earned.toString());
        const etherValue = ethers.utils.formatUnits(earned, "wei");
        console.log("earned:", etherValue);
        await ownerSTConn.transfer(addr2.address, 2);
        await Sleep(2000);
      }

      // await ownerSRConn.getRewards();
      const stakeBalance = await ownerSRConn.stakeBalance();
      console.log("Stake Balance:", ethers.utils.formatUnits(stakeBalance, "wei"));

      const balance = await ownerSRConn.balanceRewards();
      console.log("balance:", ethers.utils.formatUnits(balance, "ether"));

      await ownerSRConn.getRewards();
      

      // const addr2RewardsPT = await addr2SRConn.rewardPerToken();
      // console.log("addr2RewardsPerToken:", addr2RewardsPT);

      
    });

    

  })
})

