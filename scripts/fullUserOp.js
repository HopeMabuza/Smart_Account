const{ethers} = require("hardhat");

async function main(){
    const [user1, user2] = await ethers.getSigners();
    const user1Address = await user1.getAddress();

    const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
    const entryPoint = await ethers.getContractAt("EntryPoint", EP_ADDRESS);
    const sender = '0x75FaFdAEA8036BD56F89062F0CB5f1dAD93bfeD3'

    let userOp = {
        sender: sender,
        nonce: "0x" + (await entryPoint.getNonce(sender, 0)).toString(16),
        initCode: '0x',
        callData: '0x61461954',
        callGasLimit: '0x0',
        verificationGasLimit: '0x0',
        preVerificationGas: '0x0',
        maxFeePerGas: '0x0',
        maxPriorityFeePerGas: '0x0',
        paymasterAndData: '0x',
        signature: "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c"
        }

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
main().catch(console.error)


