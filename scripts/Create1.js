const{ethers} = require("hardhat");

async function main(){
    const [user1, user2] = await ethers.getSigners();
    const user1Address = await user1.getAddress();

    const AccountFactory = await ethers.getContractFactory("contracts/create1.sol:AccountFactory");
    const accountFactory = await AccountFactory.deploy();
    await accountFactory.waitForDeployment();

    const accountFactoryAddress = await accountFactory.getAddress();

    const account = await accountFactory.createAccount(user1Address); 
    await account.wait();
    console.log("Account tx: ", account.data); 

    const sender1 = await ethers.getCreateAddress({ 
        from: accountFactoryAddress,
        nonce: account.nonce + 1
    });

    console.log("Sender: ", sender1);

    const sameSender = await accountFactory.createAccount.staticCall(user1Address);
    console.log("Same sender: ", sameSender);
}
main().catch(console.error)
