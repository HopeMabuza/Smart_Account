const {ethers} = require("hardhat");

async function main(){
    //get signers
    const [user1, user2] = await ethers.getSigners();

    //get Factory of Account
    const Account = await ethers.getContractFactory("contracts/Account.sol:Account");

    //get callData
    const callData = await Account.interface.encodeFunctionData("execute", []);
    console.log("CallData: ", callData);

}
main().catch(console.error)