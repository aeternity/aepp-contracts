<template>
  <div class="flex">
    <button
      v-if="isStatic"
      class="mt-2 mr-2 rounded-full bg-black hover:bg-purple-500 text-white p-2 px-4"
      @click="initSdk(false)"
    >
      Connect Wallet Extension
    </button>
    <button
      class="mt-2 mr-4 rounded-full bg-black hover:bg-purple-500 text-white p-2 px-4"
      @click="modifySettings = !modifySettings"
    >
      <span v-if="isStatic">Modify Local Account</span>
      <span v-else>Use Local Account</span>
    </button>
    <h6 v-if="!modifySettings && address" class="mt-4 text-sm text-purple">
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
              id="host"
              v-model="nodeUrlInput"
              class="w-full p-2"
              type="text"
              placeholder="https://testnet.aeternity.io"
            />
          </div>
          <div class="mx-2 w-1/3">
            <label class="text-xs block mb-1" for="accountPriv"
              >Private Key</label
            >
            <input
              id="accountPriv"
              v-model="secretKey"
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
    <span v-if="status === Status.CONNECTED" class="text-sm text-green-500">
      ({{ status }} {{ nodeUrl }})
    </span>
    <span
      v-if="status === Status.CONNECTION_ERROR"
      class="text-sm text-red-500"
    >
      ({{ status }} {{ nodeUrl }})
    </span>
    <span
      v-if="status !== Status.CONNECTION_ERROR && status !== Status.CONNECTED"
      class="text-sm text-yellow-500"
    >
      ({{ status }} {{ nodeUrl }})
    </span>
  </h1>
</template>
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { Status, useSdkStore } from "../stores/sdkStore";
import { ref, watch } from "vue";

const sdkStore = useSdkStore();
const { isStatic, address, nodeUrl, secretKey, status } = storeToRefs(sdkStore);
const { initSdk } = sdkStore;

const modifySettings = ref(false);
const nodeUrlInput = ref("");

watch(nodeUrl, () => {
  nodeUrlInput.value = nodeUrl.value;
});

async function useLocalAccount() {
  secretKey.value = undefined;
  await initSdk(true, nodeUrlInput.value);
  modifySettings.value = false;
}
</script>
