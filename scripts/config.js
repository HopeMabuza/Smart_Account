import { alchemy, sepolia } from "@account-kit/infra";
 
const YOUR_API_KEY = "ALCHEMY_API_KEY";
 
export const chain = sepolia;
 
export const policyId = "POLICY_ID";
 
export const transport = alchemy({
  apiKey: YOUR_API_KEY,
});