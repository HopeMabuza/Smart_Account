const{ethers} = require("hardhat");

async function main(){
    //get signers
    const [user1, user2] = await ethers.getSigners();
    const user1Address = await user1.getAddress();
    console.log("User1 address: ", user1Address);

    //get sender address
    console.log("Deploying Account Factory......");
    const AccountFactory = await ethers.getContractFactory("contracts/Account.sol:AccountFactory");
    const accountFactory = await AccountFactory.deploy();
    await accountFactory.waitForDeployment()

    const accountFactoryAddress = await accountFactory.getAddress();
    console.log("Account factory address: ", accountFactoryAddress);

    console.log("Deploying EntryPoint.......");
    const EntryPoint = await ethers.getContractFactory("EntryPoint");
    const entryPoint = await EntryPoint.deploy();
    await entryPoint.waitForDeployment();

    console.log("Creating Account.......");
    const transaction = await accountFactory.createAccount(user1Address);
    await transaction.wait();

    const callData = await transaction.data;
    console.log("CallData to create initCode: ", callData);

    //get initCode bytecode
    const initCode = accountFactoryAddress + callData.slice(2);
    console.log("InitCode: ", initCode);

    console.log("Getting user1 sender address.....");
    // let error;
    // try{
    //     await entryPoint.getSenderAddress(initCode);
    // } catch(error){
    //     const sender = "0x" + error.data.data.slice(-40);
    //     console.log("Sender address: ", sender);
    // }

    // console.log("Sender should be same as.......");
    const sender_ = await accountFactory.createAccount.staticCall(user1Address);
    console.log("Sender address: ", sender_);

    //get callData
    console.log("Getting Account factory......");
    const Account = await ethers.getContractFactory("contracts/Account.sol:Account");

    const CallData =  Account.interface.encodeFunctionData("execute", []);
    console.log("CallData: ", CallData);

    //get signature
    // console.log("Getting user1 signature.....")
    // const UserOpHashPlaceholder = ethers.keccak256(ethers.toUtf8Bytes("0x"));
    // console.log("Hashed message: ", UserOpHashPlaceholder);

    // let signature = await user1.signMessage(ethers.getBytes(UserOpHashPlaceholder));
    // console.log("Signed message: ", signature);

    // console.log("Deploying Test contract to recover address of signer.....");
    // const Test = await ethers.getContractFactory("Test");
    // const test = await Test.deploy(signature);
    // await test.waitForDeployment();
    // console.log("Signer's address: ", test.runner.address, "should be same as: ", user1Address);

    
    let UserOp = {
        sender: sender_ ,
        nonce: await entryPoint.getNonce(sender_, 0),
        initCode: initCode,
        callData: CallData,
        callGasLimit: 1000000,
        verificationGasLimit: 1000000, 
        preVerificationGas: 1000000,
        maxFeePerGas: 1000000,
        maxPriorityFeePerGas: 1000000,
        paymasterAndData: "0x",
        signature: "0x"
    };

    console.log("Sign actual UserOp..... ");
    const userOpHash = await entryPoint.getUserOpHash.staticCall(UserOp);
    UserOp.signature  = await user1.signMessage(ethers.getBytes(userOpHash));

    console.log(UserOp);

    //send to bundler

    

}
main().catch(console.error)