<template>
  <div
    v-if="deployResult.final"
    class="w-1/2 ml-8 p-4 bg-gray-200 rounded-sm shadow"
  >
    <h2 class="py-2">⬅ Call Static Function</h2>
    <div class="flex -mx-2 mt-4 mb-4">
      <div class="mx-2 w-2/3">
        <label class="text-xs block mb-1" for="staticFunc">Function</label>
        <input
          v-model="callStaticData.func"
          class="w-full p-2"
          id="staticFunc"
          type="text"
          placeholder="function"
        />
      </div>
      <div class="mx-2 w-1/3">
        <label class="text-xs block mb-1" for="staticGas">Gas Limit</label>
        <input
          v-model.number="callStaticData.gas"
          class="w-full p-2"
          id="staticGas"
          type="number"
          min="0"
          placeholder="gas"
        />
      </div>
    </div>
    <div class="flex -mx-2 mt-4 mb-4">
      <div class="mx-2 w-full">
        <label class="text-xs block mb-1" for="staticArgs">Arguments</label>
        <input
          v-model="callStaticData.args"
          class="w-full p-2"
          id="staticArgs"
          type="text"
          placeholder="comma separated args"
        />
      </div>
    </div>

    <div class="mt-2 mb-2">
      <label class="text-xs block mb-1">{{ callStaticResult.info }}</label>
      <div
        class="w-full text-white bg-black text-xs mb-4 p-4 overflow-x-scroll font-mono"
        v-if="callStaticResult.final"
      >
        {{ callStaticResult.data }}
      </div>
    </div>
    <div class="mt-2 mb-2" v-if="callStaticResult.error">
      <label class="text-xs block mb-1 text-red">Errors</label>
      <textarea
        v-model="callStaticResult.error"
        class="h-16 w-full text-red-500 bg-black text-xs mb-4 p-4 font-mono"
      ></textarea>
    </div>

    <button
      class="py-2 rounded-full bg-black hover:bg-purple-500 text-white p-2 px-4"
      @click="callContractStatic"
    >
      Call Static
    </button>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useContractStore } from "../stores/contractStore";

const contractStore = useContractStore();
const { deployResult, callStaticData, callStaticResult } =
  storeToRefs(contractStore);
const { callContractStatic } = contractStore;
</script>
