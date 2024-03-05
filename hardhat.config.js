require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-solhint");
const { vars } = require("hardhat/config");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {   
    sepolia: {
      url: vars.get("SEPOLIA_API_KEY"),
      accounts: [`0x${vars.get("PRIVATE_KEY")}`]
    }
  },
};
