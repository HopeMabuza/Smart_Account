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

    //deploy EntryPoint
    const EntryPoint = await ethers.getContractFactory("EntryPoint");
    const entryPoint = await EntryPoint.deploy();

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

    //get CallData
    const callData = Account.interface.encodeFunctionData("execute", []);
    console.log("CallData: ", callData);

    //fund sender account to be able to afford the gass fees
    await entryPoint.depositTo(sender, { value: ethers.parseEther("1000")});

    //userOp
    let userOp = {
        sender: sender,
        nonce: await entryPoint.getNonce(sender, 0),
        initCode: initCode,
        callData: callData,
        callGasLimit: 100,
        verificationGasLimit: 100,
        preVerificationGas: 100,
        maxFeePerGas: 100,
        maxPriorityFeePerGas:100,
        paymasterAndData: "0x",
        signature: "0x"

    }

    //send transaction to the blockchain
    const tx = await entryPoint.handleOps([userOp],user2);
    const reciept = await tx.wait();
    console.log(reciept); //should be able to see block number and all details of a successful transaction



    //const hashedUserOp = await entryPoint.getUserOpHash(userOp);
    //console.log("UserOp Hash: ", hashedUserOp);

    //userOp.signature = await user1.signMessage(ethers.getBytes(hashedUserOp));
    //console.log("UserOperation: ", userOp);



}
main().catch(console.error)