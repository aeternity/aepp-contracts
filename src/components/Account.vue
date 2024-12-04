<template>
  <div class="flex">
    <button
      v-if="isLocalAccount"
      class="mt-2 mr-2 rounded-full bg-black hover:bg-purple-500 text-white p-2 px-4"
      @click="connectWallet"
    >
      Connect Wallet Extension
    </button>
    <button
      class="mt-2 mr-4 rounded-full bg-black hover:bg-purple-500 text-white p-2 px-4"
      @click="modifySettings = !modifySettings"
    >
      {{ isLocalAccount ? "Modify" : "Use" }} Local Account
    </button>
    <h6 v-if="!modifySettings && address" class="mt-4 text-sm text-purple">
      <span class="font-mono text-black">Account: </span> {{ address }}
    </h6>
  </div>

  <div v-if="modifySettings">
    <div class="flex mt-8 mb-8">
      <div class="w-full p-4 bg-gray-200 rounded-sm shadow">
        <h2 class="py-2">Settings</h2>
        <div class="flex -mx-2 mt-4 mb-4">
          <div class="mx-2 w-1/3">
            <label class="text-xs block mb-1" for="host">Host</label>
            <input
              id="host"
              v-model="nodeUrlInput"
              class="w-full p-2"
              type="text"
              placeholder="https://testnet.aeternity.io"
            />
          </div>
          <div class="mx-2 w-1/3">
            <label class="text-xs block mb-1" for="accountPrivateKey">
              Private Key
            </label>
            <input
              id="accountPrivateKey"
              v-model="secretKeyInput"
              class="w-full p-2"
              type="text"
              placeholder="Private Key"
            />
          </div>
        </div>
        <button
          class="mt-2 mr-2 rounded-full bg-black hover:bg-purple-500 text-white p-2 px-4"
          @click="useLocalAccount"
        >
          Use Local Account
        </button>
      </div>
    </div>
  </div>

  <h1 class="py-2">
    Test contracts
    <span
      class="text-sm"
      :class="
        (sdkStatus === Status.CONNECTED && 'text-green-500') ||
        (sdkStatus === Status.CONNECTION_ERROR && 'text-red-500') ||
        'text-yellow-500'
      "
    >
      ({{ sdkStatus }} {{ nodeUrl }})
    </span>
  </h1>
</template>
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { Status, useSdkStore } from "../stores/sdkStore";
import { ref, watch } from "vue";
import { Encoding, isAddressValid } from "@aeternity/aepp-sdk";

const sdkStore = useSdkStore();
const { isLocalAccount, address, nodeUrl, secretKey, sdkStatus } =
  storeToRefs(sdkStore);
const { connectWallet, setAccountAndNode } = sdkStore;

const modifySettings = ref(false);
const nodeUrlInput = ref("");
const secretKeyInput = ref("");

watch(modifySettings, () => {
  nodeUrlInput.value = nodeUrl.value;
  secretKeyInput.value = secretKey.value;
});

async function useLocalAccount() {
  if (!isAddressValid(secretKeyInput.value, Encoding.AccountSecretKey)) {
    alert("Invalid secret key, it should be encoded as sk_");
    return;
  }
  await setAccountAndNode(secretKeyInput.value, nodeUrlInput.value);
  modifySettings.value = false;
}
</script>
