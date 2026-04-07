const {ethers} = require("hardhat");
const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";

async function main() {
    const [deployer, signer1] = await ethers.getSigners();
    const deployer_address = await deployer.getAddress();

    console.log("Deployer's address: ", deployer_address);

    const AccountFactoryFactory = await ethers.getContractFactory("contracts/Account.sol:AccountFactory");
    const accountFactory = await AccountFactoryFactory.deploy(AccountFactoryFactory);
    await accountFactory.waitForDeployment();

    const accountFactoryAddress = await accountFactory.getAddress();
    console.log("Account Factory deployed to: ", accountFactoryAddress);

    // Now we are using an EP from alchemy.
    const entrypoint = await ethers.getContractAt("EntryPoint", EP_ADDRESS);
    console.log("Using EntryPoint at address: ", await entrypoint.getAddress());



    // Get fields to build UserOp object
    console.log("Creating an account using public address: ", deployer_address);


    // sender 
    // const senderAddress = await accountFactory.createAccount.staticCall(deployer_address);
    const senderAddress = "0x855439299fa6329777DAA683204d683a03afeE5d";
    console.log("Created SCA at address: ", senderAddress);

    // // Deposit funds to SCA - so that it can pay ITSELF! | DEPOSIT ONCE
    // console.log("Depositing 0.05 Ether into the SCA at address: ", senderAddress);
    // await entrypoint.depositTo(senderAddress, {
    //     value: ethers.parseEther(".05"),
    // });

    // console.log("Deposit was successful!");




    // Init code
    const tx = await accountFactory.createAccount(deployer_address);
    await tx.wait();
    const InitCode = accountFactoryAddress + tx.data.slice(2);

    console.log("InitCode: ", InitCode);

    //Calldata
    console.log("Getting the callData now...");
    const Account_Factory = await ethers.getContractFactory("contracts/Account.sol:Account");

    const call1 = {
        target: senderAddress,
        value: 0,
        data: Account_Factory.interface.encodeFunctionData("addNums", [2,5])
    }

    const call2 = {
        target: senderAddress,
        value: 0,
        data: Account_Factory.interface.encodeFunctionData("MultNum", [2,5])       
    }

    const call3 = {
        target: senderAddress,
        value: 0,
        data: Account_Factory.interface.encodeFunctionData("execute", [5])
    }

        // encode these calls into executeBatch
    const batchCallData = Account_Factory.interface.encodeFunctionData("executeBatch", [
        [call1.target, call2.target, call3.target],
        [call1.value, call2.value, call3.value],
        [call1.data, call2.data, call3.data] 
    ]);

    // console.log("The batch call data encoded hex: ", batchCallData);

    console.log("STARTING TO CONSTRUCT THE USEROP...");

    let userOp = {
        sender: senderAddress,

        // For interacting with the API, the needs to be in a Hex or i will get errors. It returns a BigInt normally
        nonce: "0x" + (await entrypoint.getNonce(senderAddress, 0)).toString(16),
        initCode: "0x",
        callData: batchCallData,
        paymasterAndData: "0x",

        // Pass in dummy signature from alchemy docs so the UserOp doesnt give errors.
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
    const response = await ethers.provider.send("eth_estimateUserOperationGas", [userOp, EP_ADDRESS]);

    //FIll in userop gas fields
    userOp.preVerificationGas = response.preVerificationGas;
    userOp.verificationGasLimit = response.verificationGasLimit;
    userOp.callGasLimit = response.callGasLimit;

    // Get the MAX fees!
    const maxResponse = await ethers.provider.getFeeData();
    userOp.maxFeePerGas = maxResponse.maxFeePerGas;

    // const maxPriorityFeePerGas = await ethers.provider.send("rundler_maxPriorityFeePerGas");
    // userOp.maxPriorityFeePerGas = maxPriorityFeePerGas;


//     Signature
    console.log("Getting Signature of the UserOpHash");

//     Get userOpHash bytes as you cannot sign an object directly. Convert it to 32-bytes
    const userOpHash = await entrypoint.getUserOpHash.staticCall(userOp);

//     Sign the 32-byte hash then store it back into the field
    const signature = await deployer.signMessage(ethers.toBeArray(userOpHash));
    userOp.signature = signature;

    console.log("Signature of UserOpHash: ", signature);
    console.log(userOp);

    // Get the gas estimates here then update UserOp.




    // Paymaster



    
} main().catch(console.error)