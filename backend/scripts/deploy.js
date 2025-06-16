const hre = require("hardhat");

async function main() {
  const EcrowContract = await hre.ethers.getContractFactory("EscrowContract");
  const escrow = await EcrowContract.deploy();
  console.log("Contract deployed to:", escrow.address); 
  await escrow.waitForDeployment(); 
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });