import { Node } from "@aeternity/aepp-sdk";

export const defaultNetworkId: string = "ae_uat";

export const COMPILER_URL: string = "https://v7.compiler.aepps.com";

export const nodes: ({ instance: Node; name: string })[] = [
  {
    name: "ae_uat",
    instance: new Node("https://testnet.aeternity.io"),
  },
  {
    name: "ae_mainnet",
    instance: new Node("https://mainnet.aeternity.io"),
  },
];
