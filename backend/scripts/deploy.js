async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);
  
  const IPFSStorage = await ethers.getContractFactory("IPFSStorage");
  const storage = await IPFSStorage.deploy();
  
  await storage.deployed();
  console.log("Contract deployed to:", storage.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
