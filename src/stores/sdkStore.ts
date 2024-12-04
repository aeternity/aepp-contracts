import { defineStore } from "pinia";
import { Buffer } from "buffer";
import {
  AccountBase,
  AeSdk,
  BrowserWindowMessageConnection,
  CompilerHttp,
  encode,
  Encoded,
  Encoding,
  isAddressValid,
  MemoryAccount,
  Node,
  SUBSCRIPTION_TYPES,
  WalletConnectorFrame,
  walletDetector,
} from "@aeternity/aepp-sdk";
import { COMPILER_URL, nodes } from "../utils/config";
import { computed, ref, shallowRef } from "vue";
import { getSecretKey, persistSecretKey } from "../utils/utils";

type Wallet = Parameters<Parameters<typeof walletDetector>[1]>[0]["newWallet"];

export enum Status {
  UNINITIALIZED = "Uninitialized",
  FETCHING_INFO = "Fetching Information",
  CONNECTED = "Connected",
  CHECK_FUNDING = "Checking Funding",
  WALLET_SCANNING = "Wallet Scanning, Please Confirm Connection",
  CONNECTION_ERROR = "Connection Error",
}

export const useSdkStore = defineStore("sdk", () => {
  const secretKey = computed({
    get(): Encoded.AccountSecretKey {
      const key = getSecretKey();
      if (key == null) {
        const sk = MemoryAccount.generate().secretKey;
        persistSecretKey(sk);
        return sk;
      }
      if (!isAddressValid(key, Encoding.AccountSecretKey)) {
        const buffer = Buffer.from(key, "hex");
        const sk = encode(buffer.subarray(0, 32), Encoding.AccountSecretKey);
        persistSecretKey(sk);
        return sk;
      }
      return key;
    },

    set(sk: Encoded.AccountSecretKey) {
      persistSecretKey(sk);
    },
  });

  const aeSdk = new AeSdk({
    onCompiler: new CompilerHttp(COMPILER_URL),
    accounts: [new MemoryAccount(secretKey.value)],
    nodes,
  });
  let walletConnector: WalletConnectorFrame | undefined;

  const sdkStatus = ref(Status.UNINITIALIZED);
  const address = ref(aeSdk.address);
  const nodeUrl = ref(aeSdk.api.$host);
  const isLocalAccount = ref(true);

  function disconnectWallet() {
    if (walletConnector == null) return;
    walletConnector.disconnect();
    walletConnector.removeAllListeners();
    walletConnector = undefined;
  }

  async function setupWalletConnector() {
    sdkStatus.value = Status.WALLET_SCANNING;
    disconnectWallet();

    const wallet = await new Promise<Wallet>((resolve) => {
      const scannerConnection = new BrowserWindowMessageConnection();
      const stopScan = walletDetector(scannerConnection, ({ newWallet }) => {
        resolve(newWallet);
        stopScan();
      });
    });

    const connector = await WalletConnectorFrame.connect(
      "Contract Editor",
      wallet.getConnection(),
    );
    connector.addListener("accountsChange", async (accounts: AccountBase[]) => {
      aeSdk.removeAccount(aeSdk.address);
      aeSdk.addAccount(accounts[0], { select: true });
      address.value = aeSdk.address;
      await updateConnectionInfo();
    });
    connector.addListener("networkIdChange", async (networkId: string) => {
      aeSdk.selectNode(networkId);
      nodeUrl.value = aeSdk.api.$host;
      await updateConnectionInfo();
    });
    connector.addListener("disconnect", () => alert("Aepp is disconnected"));
    await connector.subscribeAccounts(SUBSCRIPTION_TYPES.subscribe, "current");
  }

  async function setAccountAndNode(
    customSecretKey: Encoded.AccountSecretKey,
    customNodeUrl: string,
  ) {
    sdkStatus.value = Status.UNINITIALIZED;
    disconnectWallet();
    isLocalAccount.value = true;

    aeSdk.removeAccount(aeSdk.address);
    aeSdk.addAccount(new MemoryAccount(customSecretKey), { select: true });
    address.value = aeSdk.address;
    secretKey.value = customSecretKey;

    aeSdk.pool.delete("custom");
    aeSdk.addNode("custom", new Node(customNodeUrl), true);
    nodeUrl.value = aeSdk.api.$host;
    await updateConnectionInfo();
  }

  async function connectWallet() {
    sdkStatus.value = Status.UNINITIALIZED;
    isLocalAccount.value = false;
    try {
      await setupWalletConnector();
    } catch (e) {
      console.error(e);
      sdkStatus.value = Status.CONNECTION_ERROR;
      isLocalAccount.value = true;
    }
    await updateConnectionInfo();
  }

  async function updateConnectionInfo() {
    try {
      sdkStatus.value = Status.FETCHING_INFO;
      const { address } = aeSdk;
      const networkId = await aeSdk.api.getNetworkId();
      sdkStatus.value = Status.CHECK_FUNDING;
      const balance = +(await aeSdk.getBalance(address));
      if (networkId === "ae_uat" && +balance < 1e16) {
        const response = await fetch(
          `https://faucet.aepps.com/account/${address}`,
          { method: "POST" },
        );
        if (response.status !== 200)
          throw new Error(`Faucet response code: ${response.status}`);
      }
      sdkStatus.value = Status.CONNECTED;
    } catch (e) {
      console.error(e);
      sdkStatus.value = Status.CONNECTION_ERROR;
    }
  }

  void updateConnectionInfo();

  return {
    aeSdk: shallowRef(aeSdk),
    connectWallet,
    setAccountAndNode,
    sdkStatus,
    address,
    secretKey,
    nodeUrl,
    isLocalAccount,
  };
});
