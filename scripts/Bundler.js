require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
    const [user1] = await ethers.getSigners();
    const user1Address = await user1.getAddress();

    const entryPointAddress = process.env.ENTRYPOINT_ADDRESS.trim();
    const rpcUrl = process.env.ALCHEMY_RPC_URL.trim();
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const entryPointContract = await ethers.getContractAt("EntryPoint", entryPointAddress);

    // Deploy AccountFactory
    const AccountFactory = await ethers.getContractFactory("contracts/Account.sol:AccountFactory");
    const accountFactory = await AccountFactory.deploy();
    await accountFactory.waitForDeployment();
    const accountFactoryAddress = await accountFactory.getAddress();

    const Account = await ethers.getContractFactory("contracts/Account.sol:Account");

    // Get sender via staticCall (no deployment)
    const sender = await accountFactory.createAccount.staticCall(user1Address);
    console.log("Sender address: ", sender);

    // Build initCode
    const createAccountCalldata = accountFactory.interface.encodeFunctionData("createAccount", [user1Address]);
    const initCode = accountFactoryAddress + createAccountCalldata.slice(2);

    // Fund sender before deploying (CREATE2 address is deterministic)
    console.log("Depositing 0.05 Ether into the SCA at address: ", sender);
    await user1.sendTransaction({ to: sender, value: ethers.parseEther("0.05") });
    console.log("Deposit was successful!");

    // Deploy the account
    const tx = await accountFactory.createAccount(user1Address);
    await tx.wait();

    const callData = Account.interface.encodeFunctionData("execute", []);

    const nonce = await entryPointContract.getNonce(sender, 0);

    let userOp = {
        sender: sender,
        nonce: "0x" + nonce.toString(16),
        initCode: "0x",  // already deployed above
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
    const response = await provider.send("eth_estimateUserOperationGas", [userOp, entryPointAddress.trim()]);
    console.log("Response: ", response);

    userOp.preVerificationGas = response.preVerificationGas;
    userOp.verificationGasLimit = response.verificationGasLimit;
    userOp.callGasLimit = response.callGasLimit;

    const hashedUserOp = await entryPointContract.getUserOpHash(userOp);
    console.log("UserOp Hash: ", hashedUserOp);

    userOp.signature = await user1.signMessage(ethers.getBytes(hashedUserOp));
    console.log("UserOperation: ", userOp);
}
main().catch(console.error);
