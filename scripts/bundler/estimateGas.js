require("dotenv").config();
const {ethers} = require("hardhat");

async function main() {

    const sender = "0x78fE59336933fd3D5c09a5D4697f519F783834D8";
    const callData = "0x61461954";
    const initCode = "0x02E36572bF4954af8a6E054f7219D128B5a16e599859387b0000000000000000000000007c3a06a537159b967693ce348a5dfd39c973dd38"
    const entryPointAddress = process.env.ENTRYPOINT_ADDRESS;

    const rpcUrl = process.env.ALCHEMY_RPC_URL;
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    console.log("STARTING TO CONSTRUCT THE USEROP...");

   let userOp = {
    sender: sender,
    nonce: "0x0",
    initCode: "0x",          
    callData: callData,
    callGasLimit: "0x0",
    verificationGasLimit: "0x0",
    preVerificationGas: "0x0",
    maxFeePerGas: "0x0",
    maxPriorityFeePerGas: "0x0",
    paymasterAndData: "0x",  
    signature: "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
};

    // Getting the gas Numbers for the sections
        // These 3 limits come from on the same method "eth_estimateUserOperationGas"
            // callGasLimit: 200000,    // from Bundler estimation
            // verificationGasLimit: 150000,
            // preVerificationGas: 50000,
        // For this, it is a similar approach 
    // maxFeePerGas: 20000000000, - this is obtained from ethers
    // maxPriorityFeePerGas: 20000000000, - this is obtained from ethers!

    console.log("Getting gas estimations...");

    // This below will get the gas Estimates for you. It takes the EntryPoint address and the UserOp as args
    const response =  await provider.send("eth_estimateUserOperationGas", [userOp, entryPointAddress]);
    console.log("Response: ", response);

    userOp.preVerificationGas = response.preVerificationGas;
    userOp.verificationGasLimit = response.verificationGasLimit;
    userOp.callGasLimit = response.callGasLimit;



    
} main().catch(console.error)