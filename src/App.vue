<template>
  <Editor />
  <Version />
</template>

<script setup lang="ts">
import Editor from "./components/Editor.vue";

import { useSdkStore } from "./stores/sdkStore";
import { onMounted } from "vue";
import { useContractStore } from "./stores/contractStore";
import Version from "./components/Version.vue";

const sdkStore = useSdkStore();
const { initSdk } = sdkStore;

const contractStore = useContractStore();
const { initContractState } = contractStore;

onMounted(async () => {
  await initSdk();
  await initContractState();
});
</script>
