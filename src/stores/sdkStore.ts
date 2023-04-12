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
import { computed, Ref, ref, UnwrapRef } from "vue";
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
  let aeSdk: AeSdkAepp | AeSdk | undefined;

  const secretKey: Ref<UnwrapRef<string | undefined>> = ref();

  const status = ref(Status.UNINITIALIZED);
  const address = ref();
  const networkId = ref();
  const nodeUrl = ref();
  const isStatic = ref(true);

  const initializedSdk = computed(() => aeSdk);

  async function scanForWallets() {
    status.value = Status.WALLET_SCANNING;

    return new Promise<void>((resolve, reject) => {
      if (aeSdk instanceof AeSdkAepp) {
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
            (aeSdk as AeSdkAepp).disconnectWallet();
          } catch (_) {
            // specifically ignore, to ensure we are disconnected before trying to connect, but disconnect will error if we are not connected
          }

          const { networkId } = await (aeSdk as AeSdkAepp).connectToWallet(
            newWallet.getConnection()
          );

          (aeSdk as AeSdkAepp).selectNode(networkId);

          await (aeSdk as AeSdkAepp).subscribeAddress(
            SUBSCRIPTION_TYPES.subscribe,
            "current"
          );

          resolve();
        };
        const scannerConnection = new BrowserWindowMessageConnection();
        const stopScan = walletDetector(scannerConnection, handleWallets);
      } else reject("AeSdk instance needed for wallet connection");
    });
  }

  async function initAeSdkAepp(customNodeUrl?: string) {
    isStatic.value = false;
    aeSdk = new AeSdkAepp({
      name: "Contract Editor",
      ...getNodes(customNodeUrl),
      onCompiler: new CompilerHttp(COMPILER_URL, { ignoreVersion: true }),
      onNetworkChange: async ({ networkId }) => {
        if (aeSdk) {
          const [{ name }] = (await aeSdk.getNodesInPool()).filter(
            (node) => node.nodeNetworkId === networkId
          );
          aeSdk.selectNode(name);
          await updateConnectionInfo();
        }
      },
      onAddressChange: () => updateConnectionInfo(),
      onDisconnect: () => alert("Aepp is disconnected"),
    });

    await scanForWallets();
  }

  function initAeSdk(secretKey: string, customNodeUrl?: string) {
    isStatic.value = true;
    aeSdk = new AeSdk({
      onCompiler: new CompilerHttp(COMPILER_URL, { ignoreVersion: true }),
      accounts: [new MemoryAccount(secretKey)],
      ...getNodes(customNodeUrl),
    });
  }

  async function initSdk(initStatic = true, customNodeUrl?: string) {
    status.value = Status.UNINITIALIZED;
    if (customNodeUrl) {
      nodeUrl.value = customNodeUrl;
    } else {
      nodeUrl.value = nodes[0].instance.$host;
    }

    try {
      if (initStatic) {
        secretKey.value = getOrGenerateSecretKey();

        if (secretKey.value) initAeSdk(secretKey.value, customNodeUrl);
      } else await initAeSdkAepp(customNodeUrl);

      await updateConnectionInfo();
    } catch (e) {
      status.value = Status.CONNECTION_ERROR;
    }
  }

  async function updateConnectionInfo() {
    status.value = Status.FETCHING_INFO;
    networkId.value = await aeSdk?.api?.getNetworkId();
    nodeUrl.value = aeSdk?.api.$host;

    address.value = aeSdk?.address;
    status.value = Status.CHECK_FUNDING;

    await fundAccountIfNeeded();
    status.value = Status.CONNECTED;
  }

  function getOrGenerateSecretKey() {
    return getSecretKey() || generateKeyPair().secretKey;
  }

  async function fundAccountIfNeeded() {
    const balance = address.value
      ? (await aeSdk?.getBalance(address.value)) || 0
      : 0;

    if (
      networkId.value === "ae_uat" &&
      address.value &&
      new BigNumber(10000000000000000).gt(balance)
    ) {
      await fetch(`https://faucet.aepps.com/account/${address.value}`, {
        method: "POST",
      }).catch(console.error);

      if (isStatic.value && secretKey.value) persistSecretKey(secretKey.value);
    }
  }

  return {
    aeSdk: initializedSdk,
    initSdk,
    status,
    address,
    networkId,
    secretKey,
    nodeUrl,
    isStatic,
  };
});
