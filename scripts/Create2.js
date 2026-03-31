const {ethers} = require("hardhat");

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

    //call createAccount
    //it returns the whole transaction
    const account = await accountFactory.createAccount(user1Address);
    await account.wait();

    const calldata = account.data.slice(2);//remove "0x"
    console.log("CallData: ", calldata);

    //add factory address with callData to get  initCode
    const initCode = accountFactoryAddress + calldata;
    console.log("InitCode: ", initCode);

    //deploy EntryPoint
    const EntryPoint = await ethers.getContractFactory("EntryPoint");
    const entryPoint = await EntryPoint.deploy();

    //use try catch of EntryPoint to get sender address
    let error;
    try{
        await entryPoint.getSenderAddress(initCode);
    } catch(error){
        const sender = "0x" + error.data.data.slice(-40);
        console.log("Sender: ", sender);
    }

    const sameSender = await accountFactory.createAccount.staticCall(user1Address);
    console.log("Same sender: ", sameSender);

}
main().catch(console.error)