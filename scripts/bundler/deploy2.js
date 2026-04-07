const {ethers} = require("hardhat");


//get sender and callData for userOp to send to bundler
async function main(){
    //get signers
    const [user1, user2] = await ethers.getSigners();
    const user1Address = await user1.getAddress();
    console.log("User1 address: ", user1Address);

    //deploy AccountFactory
    const AccountFactory = await ethers.getContractFactory("contracts/Account.sol:AccountFactory");
    const accountFactory = await AccountFactory.deploy();
    await accountFactory.waitForDeployment();

    const accountFactoryAddress = await accountFactory.getAddress();
    console.log("AccountFactory address: ", accountFactoryAddress);

    //Account account factory
    const Account = await ethers.getContractFactory("contracts/Account.sol:Account");

    //get sender
    const sender = await accountFactory.createAccount.staticCall(user1Address);
    console.log("Sender address: ", sender);

    //get initCode
    const transaction = await accountFactory.createAccount(user1Address);
    await transaction.wait();
    const calldata_ = await transaction.data;
    console.log("Account creation callData: ", calldata_);

    const initCode = accountFactoryAddress + calldata_.slice(2);
    console.log("InitCode: ", initCode);

    //fund sender 
    const fundSender = await user1.sendTransaction({
        to: sender,
        value: ethers.parseEther("0.02")
    });
    console.log("Transaction for funding sender: ", fundSender);


    //get CallData
    const callData = Account.interface.encodeFunctionData("execute", []);
    console.log("CallData: ", callData);


}
main().catch(console.error)