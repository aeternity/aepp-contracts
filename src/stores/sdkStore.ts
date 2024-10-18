import { defineStore } from "pinia";
import {
  AeSdk,
  AeSdkAepp,
  BrowserWindowMessageConnection,
  CompilerHttp,
  generateKeyPair,
  MemoryAccount,
  Node,
  SUBSCRIPTION_TYPES,
  walletDetector,
} from "@aeternity/aepp-sdk";
import { COMPILER_URL, nodes } from "../utils/config";
import { Ref, ref, ShallowRef, shallowRef, UnwrapRef } from "vue";
import BigNumber from "bignumber.js";
import { getSecretKey, persistSecretKey } from "../utils/utils";

interface Wallet {
  info: {
    id: string;
    type: string;
    origin: string;
  };
  getConnection: () => BrowserWindowMessageConnection;
}
interface Wallets {
  [key: string]: Wallet;
}

export enum Status {
  UNINITIALIZED = "Uninitialized",
  FETCHING_INFO = "Fetching Information",
  CONNECTED = "Connected",
  CHECK_FUNDING = "Checking Funding",
  WALLET_SCANNING = "Wallet Scanning, Please Confirm Connection",
  CONNECTION_ERROR = "Connection Error",
}

function getNodes(nodeUrl?: string) {
  return nodeUrl
    ? {
        nodes: [
          {
            name: "custom",
            instance: new Node(nodeUrl),
          },
        ],
      }
    : { nodes };
}

export const useSdkStore = defineStore("sdk", () => {
  const aeSdk: ShallowRef<AeSdk | AeSdkAepp | undefined> = shallowRef();
  const secretKey: Ref<UnwrapRef<string | undefined>> = ref();
  const status = ref(Status.UNINITIALIZED);
  const address = ref();
  const networkId = ref();
  const nodeUrl = ref();
  const isLocalAccount = ref(true);

  async function scanForWallets() {
    status.value = Status.WALLET_SCANNING;

    return new Promise<void>((resolve, reject) => {
      if (aeSdk.value instanceof AeSdkAepp) {
        const handleWallets: ({
          wallets,
          newWallet,
        }: {
          wallets: Wallets;
          newWallet?: Wallet | undefined;
        }) => Promise<void> = async ({ wallets, newWallet }) => {
          newWallet = newWallet || Object.values(wallets)[0];
          stopScan();

          try {
            (aeSdk.value as AeSdkAepp).disconnectWallet();
          } catch (_) {
            // specifically ignore, to ensure we are disconnected before trying to connect, but disconnect will error if we are not connected
          }

          const { networkId } = await (
            aeSdk.value as AeSdkAepp
          ).connectToWallet(newWallet.getConnection());

          (aeSdk.value as AeSdkAepp).selectNode(networkId);

          await (aeSdk.value as AeSdkAepp).subscribeAddress(
            SUBSCRIPTION_TYPES.subscribe,
            "current",
          );

          resolve();
        };
        const scannerConnection = new BrowserWindowMessageConnection();
        const stopScan = walletDetector(scannerConnection, handleWallets);
      } else reject("AeSdk instance needed for wallet connection");
    });
  }

  async function initAeSdkAepp(customNodeUrl?: string) {
    isLocalAccount.value = false;
    aeSdk.value = new AeSdkAepp({
      name: "Contract Editor",
      ...getNodes(customNodeUrl),
      onCompiler: new CompilerHttp(COMPILER_URL, { ignoreVersion: true }),
      onNetworkChange: async ({ networkId }) => {
        if (aeSdk.value) {
          const [{ name }] = (await aeSdk.value.getNodesInPool()).filter(
            (node) => node.nodeNetworkId === networkId,
          );
          aeSdk.value.selectNode(name);
          await updateConnectionInfo();
        }
      },
      onAddressChange: () => updateConnectionInfo(),
      onDisconnect: () => alert("Aepp is disconnected"),
    });

    await scanForWallets();
  }

  function initAeSdk(customSecretKey: string, customNodeUrl?: string) {
    secretKey.value = customSecretKey;
    isLocalAccount.value = true;
    aeSdk.value = new AeSdk({
      onCompiler: new CompilerHttp(COMPILER_URL, { ignoreVersion: true }),
      accounts: [new MemoryAccount(customSecretKey)],
      ...getNodes(customNodeUrl),
    });
  }

  async function initSdk(
    initStatic = true,
    customNodeUrl?: string,
    customSecretKey?: string,
  ) {
    status.value = Status.UNINITIALIZED;
    if (customNodeUrl) nodeUrl.value = customNodeUrl;
    else nodeUrl.value = nodes[0].instance.$host;

    try {
      if (initStatic)
        initAeSdk(customSecretKey || getOrGenerateSecretKey(), customNodeUrl);
      else await initAeSdkAepp(customNodeUrl);

      await updateConnectionInfo();
    } catch (e) {
      console.error(e);
      status.value = Status.CONNECTION_ERROR;
    }
  }

  async function updateConnectionInfo() {
    status.value = Status.FETCHING_INFO;
    networkId.value = await aeSdk.value?.api?.getNetworkId();
    nodeUrl.value = aeSdk.value?.api.$host;

    address.value = aeSdk.value?.address;
    status.value = Status.CHECK_FUNDING;

    await fundAccountIfNeeded();
    status.value = Status.CONNECTED;
  }

  function getOrGenerateSecretKey() {
    return getSecretKey() || generateKeyPair().secretKey;
  }

  async function fundAccountIfNeeded() {
    const balance = address.value
      ? (await aeSdk.value?.getBalance(address.value)) || 0
      : 0;

    if (
      networkId.value === "ae_uat" &&
      address.value &&
      new BigNumber(10000000000000000).gt(balance)
    ) {
      await fetch(`https://faucet.aepps.com/account/${address.value}`, {
        method: "POST",
      }).catch(console.error);

      if (isLocalAccount.value && secretKey.value)
        persistSecretKey(secretKey.value);
    }
  }

  return {
    aeSdk,
    initSdk,
    status,
    address,
    networkId,
    secretKey,
    nodeUrl,
    isLocalAccount,
  };
});
