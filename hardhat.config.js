require("@nomiclabs/hardhat-waffle");

const RINKEBY_PRIVATE_KEY = "1a0a64fb455e4d873c26922f4c3cb3adb587c4d8916c7ad9cc5a51852177e9de";


 task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  solidity: "0.7.3",
  networks: {
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/R5m3DeYuvfOu1FilQHMH7MyMoqQT0-QG`,
      accounts: [`0x${RINKEBY_PRIVATE_KEY}`],
    },
  },
};


