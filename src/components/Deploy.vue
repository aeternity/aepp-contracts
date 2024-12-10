<template>
  <div class="w-1/2 p-4 bg-gray-200 rounded-sm shadow">
    <h2 class="py-2">
      Byte Code
      <span class="block w-full text-xs">{{ deployResult.info }}</span>
    </h2>
    <textarea
      v-model="deployData.bytecode"
      class="h-16 w-full font-mono bg-black text-white text-xs mb-4 p-4"
    ></textarea>

    <div v-if="deployResult.error" class="mt-2 mb-2">
      <label class="text-xs block mb-1 text-red">Deploy Errors:</label>
      <textarea
        v-model="deployResult.error"
        class="h-16 w-full text-red-500 bg-black text-xs mb-4 p-4 font-mono"
      ></textarea>
    </div>

    <div class="flex -mx-2 mt-4 mb-4">
      <div class="mx-2 w-1/3">
        <label class="text-xs block mb-1" for="deployFunc">Function</label>
        <input
          id="deployFunc"
          value="init"
          class="w-full p-2"
          type="text"
          disabled
        />
      </div>
      <div class="mx-2 w-2/3">
        <label class="text-xs block mb-1" for="deployArgs">Arguments</label>
        <input
          id="deployArgs"
          v-model="deployData.args"
          class="w-full p-2"
          type="text"
          placeholder="comma separated args"
        />
      </div>
    </div>
    <div class="flex -mx-2 mt-4 mb-4">
      <div class="mx-2 w-1/4">
        <label class="text-xs block mb-1" for="dGasPrice"
          >Gas Price
          <a
            class="text-black no-underline"
            target="_blank"
            href="https://en.wikipedia.org/wiki/Atto-"
          >
            (aetto)</a
          ></label
        >
        <input
          id="dGasPrice"
          v-model.number="deployData.options.gasPrice"
          class="w-full p-2"
          type="number"
          min="1000000000"
          placeholder="gas price"
        />
      </div>
      <div class="mx-2 w-1/4">
        <label class="text-xs block mb-1" for="dAmount"
          >Amount
          <a
            class="text-black no-underline"
            target="_blank"
            href="https://en.wikipedia.org/wiki/Atto-"
          >
            (aetto)</a
          ></label
        >
        <input
          id="dAmount"
          v-model.number="deployData.options.amount"
          class="w-full p-2"
          type="number"
          min="0"
          placeholder="amount"
        />
      </div>
      <div class="mx-2 w-1/4">
        <label class="text-xs block mb-1" for="dFee"
          >Fee
          <a
            class="text-black no-underline"
            target="_blank"
            href="https://en.wikipedia.org/wiki/Atto-"
          >
            (aetto)</a
          ></label
        >
        <input
          id="dFee"
          v-model.number="deployData.options.fee"
          class="w-full p-2"
          type="number"
          placeholder="auto"
        />
      </div>
      <div class="mx-2 w-1/4">
        <label class="text-xs block mb-1" for="dGas">Gas Limit</label>
        <input
          id="dGas"
          v-model.number="deployData.options.gas"
          class="w-full p-2"
          type="number"
          min="0"
          placeholder="auto"
        />
      </div>

      <input
        v-model="deployData.options.callData"
        class="w-full p-2"
        type="hidden"
      />
    </div>
    <decoded-events :result="deployResult" class="mt-2" />
    <button
      class="py-2 rounded-full bg-black hover:bg-purple-500 text-white p-2 px-4"
      :disabled="!canDeploy"
      @click="deployContract"
    >
      Deploy
    </button>
    <span v-if="!canDeploy"> Bytecode and ACI is needed to deploy </span>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useContractStore } from "../stores/contractStore";
import { computed, watch } from "vue";
import DecodedEvents from "./DecodedEvents.vue";

const contractStore = useContractStore();
const { deployData, deployResult, compileResult } = storeToRefs(contractStore);
const { deployContract } = contractStore;

const canDeploy = computed(
  () => deployData.value.aci !== "" && !!deployData.value.bytecode,
);

watch(
  compileResult,
  () => {
    deployData.value.bytecode =
      compileResult.value.data?.byteCode || deployData.value.bytecode;
  },
  { deep: true },
);
</script>
