const {ethers} = require("hardhat");

async function main(){
    //get signers
    const [user1, user2] = await ethers.getSigners();
    const user1Address = await user1.getAddress();
    //console.log("User1 address: ", user1Address);

    //deploy AccountFactory
    const AccountFactory = await ethers.getContractFactory("contracts/Account.sol:AccountFactory");
    const accountFactory = await AccountFactory.deploy();
    await accountFactory.waitForDeployment();

    const accountFactoryAddress = await accountFactory.getAddress();
    //console.log("AccountFactory address: ", accountFactoryAddress);

    //deploy EntryPoint
    const EntryPoint = await ethers.getContractFactory("EntryPoint");
    const entryPoint = await EntryPoint.deploy();

    //Account account factory
    const Account = await ethers.getContractFactory("contracts/Account.sol:Account");

    //get sender
    const sender = await accountFactory.createAccount.staticCall(user1Address);
    //console.log("Sender address: ", sender);

    //get initCode
    const transaction = await accountFactory.createAccount(user1Address);
    await transaction.wait();
    const calldata_ = await transaction.data;
    //console.log("Account creation callData: ", calldata_);

    const initCode = accountFactoryAddress + calldata_.slice(2);
    //console.log("InitCode: ", initCode);

    //get CallData
    const action1 = {
        target: sender,
        value: 0,
        data: Account.interface.encodeFunctionData("greetings", ["Khensani"])
    }

    const action2 = {
        target: sender,
        value: 0,
        data: Account.interface.encodeFunctionData("multiply", [2, 5])
    }

    const action3 = {
        target: sender,
        value: 0,
        data: Account.interface.encodeFunctionData("check", [])
    }

    const callData = Account.interface.encodeFunctionData("executeBatch", [
        [action1.target, action2.target, action3.target],
        [action1.value, action2.value, action3.value],
        [action1.data, action2.data, action3.data]
    ]);
    //console.log("CallData: ", callData);

    //userOp
    let userOp = {
        sender: sender,
        nonce: await entryPoint.getNonce(sender, 0),
        initCode: initCode,
        callData: callData,
        callGasLimit: 10000,
        verificationGasLimit: 10000,
        preVerificationGas: 10000,
        maxFeePerGas: 10000,
        maxPriorityFeePerGas:10000,
        paymasterAndData: "0x",
        signature: "0x"

    }

    const hashedUserOp = await entryPoint.getUserOpHash(userOp);
    console.log("UserOp Hash: ", hashedUserOp);

    userOp.signature = await user1.signMessage(ethers.getBytes(hashedUserOp));
    console.log("UserOperation: ", userOp);



}
main().catch(console.error)