const{ethers} = require("hardhat");

async function main(){
    //get signers
    const [user1, user2] = await ethers.getSigners();
    const user1Address = await user1.getAddress();
    console.log("User1 address: ", user1Address);

    //get message and hash it
    const hashedMessage = ethers.keccak256(ethers.toUtf8Bytes("hello"));
    console.log("Hashed message: ", hashedMessage);

    //sign hashed message
    const signature = await user1.signMessage(ethers.getBytes(hashedMessage));
    console.log("Signature: ", signature);

    //deploy Test contract and verify
    const Test = await ethers.getContractFactory("Test");
    const test = await Test.deploy(signature);
    await test.waitForDeployment();

    //get signers address
    console.log("Signer's address: ", test.runner.address);
    

}
main().catch(console.error)