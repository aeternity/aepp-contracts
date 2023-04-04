<template>
  <div class="w-full p-4 bg-gray-200 rounded-sm shadow">
    <div class="flex">
      <div class="relative w-8/12">
        <h2 class="py-2 inline-block">Sophia Contract's Code:</h2>
        <h2 class="py-2 inline-block float-right pr-4">or</h2>
      </div>
      <div class="relative w-4/12">
        <h2 class="py-2 inline-block">ACI:</h2>
      </div>
    </div>

    <div class="flex">
      <div class="relative w-8/12 pr-1">
        <codemirror
          v-model="compileData.contractCode"
          :autofocus="true"
          :indent-with-tab="true"
          :tab-size="2"
          :extensions="extensions"
          style="height: 300px"
        />
      </div>
      <div class="relative w-4/12">
        <codemirror
          v-model="aci"
          :autofocus="true"
          :indent-with-tab="true"
          :tab-size="2"
          :extensions="extensions"
          style="height: 300px"
        />
      </div>
    </div>

    <div class="mt-2 mb-2" v-if="compileResult.error">
      <label class="text-xs block mb-1 text-red">Compile Errors:</label>
      <textarea
        v-model="compileResult.error"
        class="h-16 w-full text-red-500 bg-black text-xs mb-4 p-4 font-mono"
      ></textarea>
    </div>

    <div class="flex">
      <div class="relative w-8/12">
        <button
          v-if="isConnected"
          class="mt-2 mr-2 rounded-full bg-black hover:bg-purple-500 text-white p-2 px-4"
          @click="compileContractFromSource"
        >
          Compile
        </button>
        <button
          v-if="isConnected"
          class="mt-2 rounded-full bg-black hover:bg-purple-500 text-white p-2 px-4"
          @click="resetContractState"
        >
          Reset
        </button>
      </div>
      <div class="relative w-4/12">
        <input
          v-if="isConnected"
          v-model="contractAddress"
          class="mt-2 rounded-l-full bg-black hover:bg-purple-500 text-white p-2 px-4"
        />
        <button
          v-if="isConnected"
          class="mt-2 mr-2 rounded-r-full bg-black hover:bg-purple-500 text-white p-2 px-4"
          @click="initializeContractFromAci(contractAddress, aci)"
        >
          at Address
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Codemirror } from "vue-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { javascript } from "@codemirror/lang-javascript";
import { storeToRefs } from "pinia";
import { useContractStore } from "../stores/contractStore";
import { useSdkStore } from "../stores/sdkStore";
import { ref, watch } from "vue";

const extensions = [javascript(), oneDark];

const contractStore = useContractStore();
const { compileData, compileResult, deployResult } = storeToRefs(contractStore);
const {
  compileContractFromSource,
  initializeContractFromAci,
  resetContractState,
} = contractStore;

const sdkStore = useSdkStore();
const { isConnected } = storeToRefs(sdkStore);

const contractAddress = ref("");
const aci = ref("");

// want those watch here to only react to changes from store but still have local models
watch(
  deployResult,
  () => {
    contractAddress.value = deployResult.value.data || "";
  },
  { deep: true }
);

watch(
  compileResult,
  () => {
    aci.value = compileResult.value.data?.aci || "";
  },
  { deep: true }
);
</script>
