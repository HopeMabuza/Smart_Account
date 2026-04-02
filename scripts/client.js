import { createModularAccountV2Client } from "@account-kit/smart-contracts";
import { chain, transport, policyId } from "./config";
import { LocalAccountSigner } from "@aa-sdk/core";
import { generatePrivateKey } from "viem/accounts";
 
export async function createClient() {
  return createModularAccountV2Client({
    chain,
    transport,
    signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey()),
    policyId,
  });
}