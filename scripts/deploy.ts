// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers, upgrades } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy

  const StakingTokenFactory = await ethers.getContractFactory("StakingToken");
  const stakingToken = await upgrades.deployProxy(StakingTokenFactory);

  console.log("StakingToken deployed to:", stakingToken.address);

  const RewardsTokenFactory = await ethers.getContractFactory("RewardsToken");
  const rewards = await upgrades.deployProxy(RewardsTokenFactory);
  console.log("Rewards deployed to:", rewards.address);

  const StakingRewardsFactory = await ethers.getContractFactory("StakingRewards");
  const stakingRewards = await upgrades.deployProxy(StakingRewardsFactory, [stakingToken.address, rewards.address]);
  console.log("StakingRewards deployed to:", stakingRewards.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
