<template>
  <div
    v-if="deployResult.final"
    class="w-full p-4 bg-gray-200 rounded-sm shadow mb-8"
  >
    <h2 class="py-2">⬆ Call Function</h2>
    <div class="flex -mx-2 mt-4 mb-4">
      <div class="mx-2 w-1/4">
        <label class="text-xs block mb-1" for="cGasPrice"
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
          v-model.number="callData.options.gasPrice"
          class="w-full p-2"
          id="cGasPrice"
          type="number"
          min="1000000000"
          placeholder="gas price"
        />
      </div>
      <div class="mx-2 w-1/4">
        <label class="text-xs block mb-1" for="cAmount"
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
          v-model.number="callData.options.amount"
          class="w-full p-2"
          id="cAmount"
          type="number"
          min="0"
          placeholder="amount"
        />
      </div>
      <div class="mx-2 w-1/4">
        <label class="text-xs block mb-1" for="cFee"
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
          v-model.number="callData.options.fee"
          class="w-full p-2"
          id="cFee"
          type="number"
          placeholder="auto"
        />
      </div>
      <div class="mx-2 w-1/4">
        <label class="text-xs block mb-1" for="cGas">Gas Limit</label>
        <input
          v-model.number="callData.options.gas"
          class="w-full p-2"
          id="cGas"
          type="number"
          min="0"
          placeholder="auto"
        />
      </div>

      <input
        v-model="callData.options.callData"
        class="mx-2 w-1/2 p-2"
        type="hidden"
      />
    </div>
    <div class="flex -mx-2 mt-4 mb-4">
      <div class="mx-2 w-1/3">
        <label class="text-xs block mb-1" for="func">Function</label>
        <input
          v-model="callData.func"
          class="w-full p-2"
          id="func"
          type="text"
          placeholder="function"
        />
      </div>
      <div class="mx-2 w-2/3">
        <label class="text-xs block mb-1" for="args">Arguments</label>
        <input
          v-model="callData.args"
          class="w-full p-2"
          id="args"
          type="text"
          placeholder="comma separated args"
        />
      </div>
    </div>

    <div class="mt-2 mb-2">
      <label class="text-xs block mb-1">{{ callResult.info }}</label>
      <div
        class="w-full text-white bg-black text-xs mb-4 p-4 font-mono"
        v-if="callResult.final"
      >
        {{ callResult.data }}
      </div>
    </div>
    <div class="mt-2 mb-2" v-if="callResult.error">
      <label class="text-xs block mb-1 text-red">Errors</label>
      <textarea
        v-model="callResult.error"
        class="h-16 w-full text-red-500 bg-black text-xs mb-4 p-4 font-mono"
      ></textarea>
    </div>

    <button
      class="py-2 mr-2 rounded-full bg-black hover:bg-purple-500 text-white p-2 px-4"
      @click="callContract"
    >
      Call Function
    </button>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useContractStore } from "../stores/contractStore";

const contractStore = useContractStore();
const { deployResult, callData, callResult } = storeToRefs(contractStore);
const { callContract } = contractStore;
</script>
