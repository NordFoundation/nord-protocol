const hre = require(\"hardhat\");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(\"Deployer:\", deployer.address);
  console.log(\"Balance:\", hre.ethers.utils.formatEther(await deployer.getBalance()));

  // 1. NORD Token
  const NordToken = await hre.ethers.getContractFactory(\"NordToken\");
  const token = await NordToken.deploy();
  await token.deployed();
  console.log(\"\\n1. NORD Token:\", token.address);

  // 2. Set wallets & distribute
  const WALLETS = {
    founder: \"0x...\",
    dao: \"0x...\",
    platform: \"0x...\",
    liquidity: \"0x...\",
    staking: \"0x...\",
    airdrop: \"0x...\",
    grants: \"0x...\",
    listing: \"0x...\",
  };
  await token.setWallets(
    WALLETS.founder, WALLETS.dao, WALLETS.platform,
    WALLETS.liquidity, WALLETS.staking, WALLETS.airdrop,
    WALLETS.grants, WALLETS.listing
  );
  console.log(\"   Wallets set\");
  await token.distribute();
  console.log(\"   Distributed\");

  // 3. Factory
  const NordFactory = await hre.ethers.getContractFactory(\"NordFactory\");
  const factory = await NordFactory.deploy(
    deployer.address,          // feeToSetter
    WALLETS.dao,               // DAO treasury
    WALLETS.platform,          // Platform
    deployer.address           // Founder
  );
  await factory.deployed();
  console.log(\"2. NordFactory:\", factory.address);

  // 4. Router
  const WCELO = \"0x471EcE3750Da237f93B8E339c536989b8978a438\";
  const NordRouter = await hre.ethers.getContractFactory(\"NordRouter\");
  const router = await NordRouter.deploy(factory.address, WCELO);
  await router.deployed();
  console.log(\"3. NordRouter:\", router.address);

  // 5. Staking
  const NordStaking = await hre.ethers.getContractFactory(\"NordStaking\");
  const staking = await NordStaking.deploy(token.address, token.address);
  await staking.deployed();
  console.log(\"4. NordStaking:\", staking.address);

  // 6. NordUSD
  const NordUSD = await hre.ethers.getContractFactory(\"NordUSD\");
  const usd = await NordUSD.deploy(
    deployer.address,
    WALLETS.dao,
    WALLETS.platform,
    deployer.address,
    staking.address
  );
  await usd.deployed();
  console.log(\"5. NordUSD:\", usd.address);

  console.log(\"\\n=== DEPLOYMENT DONE ===\");
  console.log(\"NORD:\", token.address);
  console.log(\"Factory:\", factory.address);
  console.log(\"Router:\", router.address);
  console.log(\"Staking:\", staking.address);
  console.log(\"NordUSD:\", usd.address);
}

main().catch(console.error);