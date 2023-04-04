import { defineStore } from "pinia";
import {
  AeSdk,
  AeSdkAepp,
  BrowserWindowMessageConnection,
  CompilerHttp,
  generateKeyPair,
  MemoryAccount,
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
  UNINITIALIZED,
  FETCHING_INFO,
  CONNECTED,
  CHECK_FUNDING,
  WALLET_SCANNING,
}

export const useSdkStore = defineStore("sdk", () => {
  let aeSdk: AeSdkAepp | AeSdk | undefined;

  const secretKey: Ref<UnwrapRef<string | undefined>> = ref();

  const status = ref(Status.UNINITIALIZED);
  const address = ref();
  const networkId = ref();
  const nodeUrl = ref();
  const isConnected = ref(false);
  const isStatic = ref(true);

  const initializedSdk = computed(() => aeSdk);

  async function scanForWallets() {
    status.value = Status.WALLET_SCANNING;

    return new Promise((resolve, reject) => {
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
          if (!aeSdk) return;

          try {
            (aeSdk as AeSdkAepp).disconnectWallet();
          } catch (_) {}

          const { networkId } = await (aeSdk as AeSdkAepp).connectToWallet(
            newWallet.getConnection()
          );

          aeSdk.selectNode(networkId);

          await (aeSdk as AeSdkAepp).subscribeAddress(
            SUBSCRIPTION_TYPES.subscribe,
            "current"
          );

          resolve("");
        };
        const scannerConnection = new BrowserWindowMessageConnection();
        const stopScan = walletDetector(scannerConnection, handleWallets);
      } else reject("AeSdk instance needed for wallet connection");
    });
  }

  async function initAeSdkAepp() {
    isStatic.value = false;
    aeSdk = new AeSdkAepp({
      name: "Contract Editor",
      nodes,
      onCompiler: new CompilerHttp(COMPILER_URL, { ignoreVersion: true }),
      onNetworkChange: async ({ networkId }) => {
        isConnected.value = false;

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

  function initAeSdk(secretKey: string) {
    isStatic.value = true;
    aeSdk = new AeSdk({
      onCompiler: new CompilerHttp(COMPILER_URL, { ignoreVersion: true }),
      accounts: [new MemoryAccount(secretKey)],
      nodes,
    });
  }

  async function initSdk(initStatic: boolean = true) {
    if (initStatic) {
      secretKey.value = getOrGenerateSecretKey();

      if (secretKey.value) initAeSdk(secretKey.value);
    } else await initAeSdkAepp();

    await updateConnectionInfo();
  }

  async function updateConnectionInfo() {
    isConnected.value = false;
    status.value = Status.FETCHING_INFO;
    networkId.value = await aeSdk?.api?.getNetworkId();
    nodeUrl.value = aeSdk?.api.$host;

    address.value = aeSdk?.address;
    status.value = Status.CHECK_FUNDING;

    await fundAccountIfNeeded();
    status.value = Status.CONNECTED;
    isConnected.value = true;
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
    isConnected,
    isStatic,
  };
});
