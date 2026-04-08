require("dotenv").config();
const { ethers } = require("hardhat");

const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
const SCA_ADDRESS = "0xF19cDCEc4d2f160f865082ebf4FDb2cE2b913e3D"

async function main() {
    const [user1, user2] = await ethers.getSigners();
    const user1Address = await user1.getAddress();

    // const entryPointAddress = process.env.ENTRYPOINT_ADDRESS.trim();
    // const rpcUrl = process.env.ALCHEMY_RPC_URL.trim();
    // const provider = new ethers.JsonRpcProvider(rpcUrl);

    const entryPoint = await ethers.getContractAt("EntryPoint", EP_ADDRESS);

    // Deploy AccountFactory
    const AccountFactory = await ethers.getContractFactory("contracts/Account.sol:AccountFactory");
    const accountFactory = await AccountFactory.deploy();
    await accountFactory.waitForDeployment();
    const accountFactoryAddress = await accountFactory.getAddress();

    const Account = await ethers.getContractFactory("contracts/Account.sol:Account");

    // Get sender via staticCall (no deployment)
    const sender = await accountFactory.createAccount.staticCall(user1Address);
    console.log("Sender address: ", sender);

    // // Build initCode
    const createAccountCalldata = accountFactory.interface.encodeFunctionData("createAccount", [user1Address]);
    const initCode = accountFactoryAddress + createAccountCalldata.slice(2);

    // Fund sender 
    console.log("Depositing 0.05 Ether into the SCA at address: ", sender);
    await entryPoint.depositTo(sender, {value: ethers.parseEther("0.05") });
    console.log("Deposited was 0.05 eth");

    // // Deploy the account
    // const tx = await accountFactory.createAccount(user1Address);
    // await tx.wait();

    const callData = Account.interface.encodeFunctionData("execute", []);

    let userOp = {
        sender : sender,
        nonce: "0x" + (await entryPoint.getNonce(sender, 0)).toString(16),
        initCode: initCode, 
        callData: callData,
        callGasLimit: "0x0",
        verificationGasLimit: "0x0",
        preVerificationGas: "0x0",
        maxFeePerGas: "0x0",
        maxPriorityFeePerGas: "0x0",
        paymasterAndData: "0x",
        signature: "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c"
    };

    console.log("Getting gas estimations...");
    const userOpFees = await ethers.provider.send("eth_estimateUserOperationGas", [userOp, EP_ADDRESS]);
    console.log("UserOp fees: ", userOpFees);

    userOp.preVerificationGas = userOpFees.preVerificationGas;
    userOp.verificationGasLimit = userOpFees.verificationGasLimit;
    userOp.callGasLimit = userOpFees.callGasLimit;

    console.log("Getting max gas fees.....");
    const maxFees = await ethers.provider.getFeeData();
    console.log("Max gas fees: ", maxFees);
    userOp.maxFeePerGas = "0x" + (maxFees.maxFeePerGas).toString(16);
    userOp.maxPriorityFeePerGas = "0x" + (BigInt(100000010)).toString(16);

    const hashedUserOp = await entryPoint.getUserOpHash(userOp);
    console.log("UserOp Hash: ", hashedUserOp);

    console.log("Signing userOp..");
    userOp.signature = await user1.signMessage(ethers.getBytes(hashedUserOp));
    console.log("UserOperation: ", userOp);

    console.log("Sending transaction to alt mempool...");
    const UserOpHash = await ethers.provider.send("eth_sendUserOperation", [userOp, EP_ADDRESS]);
    console.log("UserOpHash: ", UserOpHash);




}
main().catch(console.error);
