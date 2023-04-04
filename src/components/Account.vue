<template>
  <div class="flex">
    <button
      class="mt-2 mr-2 rounded-full bg-black hover:bg-purple-500 text-white p-2 px-4"
      v-if="isStatic"
      @click="initSdk(false)"
    >
      Connect Wallet Extension
    </button>
    <button
      class="mt-2 mr-4 rounded-full bg-black hover:bg-purple-500 text-white p-2 px-4"
      @click="modifySettings = !modifySettings"
    >
      <span v-if="isStatic">Modify Local Account</span>
      <span v-if="!isStatic">Use Local Account</span>
    </button>
    <h6 class="mt-4 text-sm text-purple" v-if="!modifySettings && address">
      <span class="font-mono text-black">Account: </span> {{ address }}
    </h6>
  </div>

  <div v-if="!secretKey || !address || !nodeUrl || modifySettings">
    <div class="flex mt-8 mb-8">
      <div class="w-full p-4 bg-gray-200 rounded-sm shadow">
        <h2 class="py-2">Settings</h2>
        <div class="flex -mx-2 mt-4 mb-4">
          <div class="mx-2 w-1/3">
            <label class="text-xs block mb-1" for="host">Host</label>
            <input
              v-model="nodeUrl"
              class="w-full p-2"
              id="host"
              type="text"
              placeholder="https://testnet.aeternity.io"
            />
          </div>
          <div class="mx-2 w-1/3">
            <label class="text-xs block mb-1" for="accountPriv"
              >Private Key</label
            >
            <input
              v-model="secretKey"
              class="w-full p-2"
              id="accountPriv"
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
    <span v-if="!isConnected && !clientError" class="text-sm text-red-500">
      (connecting to {{ nodeUrl }} ...)
    </span>
    <span v-if="!isConnected && clientError" class="text-sm text-red-500">
      {{ clientError }}
    </span>
    <span v-if="isConnected && clientError" class="text-sm text-red-500">
      Error connecting to {{ nodeUrl }} <br />
      {{ clientError }}
    </span>

    <span v-if="isConnected && !clientError" class="text-sm text-green-500">
      ({{ nodeUrl }})
    </span>
  </h1>
</template>
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useSdkStore } from "../stores/sdkStore";
import { ref } from "vue";

const sdkStore = useSdkStore();
const { isStatic, address, nodeUrl, secretKey, isConnected } =
  storeToRefs(sdkStore);
const { initSdk } = sdkStore;

const modifySettings = ref(false);
const clientError = ref(false);

async function useLocalAccount() {
  secretKey.value = undefined;
  await initSdk(true);
  modifySettings.value = false;
}
</script>
