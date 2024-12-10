<template>
  <div>
    <span v-if="result?.events?.length" class="text-xs block mb-1 font-bold">
      Events:
    </span>
    <span
      v-for="callResult in result?.events"
      :key="JSON.stringify(callResult)"
      class="text-xs block mb-1"
    >
      {{ callResult.name }}: {{ JSON.stringify(callResult.args) }} (Contract:
      {{ callResult.contract.name }})
    </span>
  </div>
</template>
<script setup lang="ts">
import { Result } from "../utils/utils";

defineProps({
  result: Result,
});
</script>
