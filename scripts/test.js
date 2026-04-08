const {ethers} = require("hardhat");

async function main(){

    const SENDER = "0x75FaFdAEA8036BD56F89062F0CB5f1dAD93bfeD3";
    const USEROPHASH = "0xbd5cda25382a3b0876ec2fdf72b1463bee41fce1d48acf2bbaebe54bc2271e84";

//     setTimeout(async () => {
//     const { transactionHash } = await ethers.provider.send(
//       "eth_getUserOperationByHash",
//       [USEROPHASH]
//     );

//     console.log(transactionHash);
//   }, 5000);

  setTimeout(async () => {
    const { transaction } = await ethers.provider.send(
      "eth_getUserOperationReceipt",
      [USEROPHASH]
    );

    console.log(transaction);
  }, 5000);


}
main().catch(console.error)