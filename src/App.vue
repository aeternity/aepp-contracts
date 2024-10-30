<template>
  <Editor />
  <Version />
</template>

<script setup lang="ts">
import Editor from "./components/Editor.vue";

import { onMounted } from "vue";
import { useContractStore } from "./stores/contractStore";
import Version from "./components/Version.vue";

const contractStore = useContractStore();
const { initContractState } = contractStore;

onMounted(async () => {
  await initContractState();
});
</script>
