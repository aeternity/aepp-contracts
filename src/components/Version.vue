<template>
  <div class="w-full text-center mb-2 text-gray-500 text-sm">
    <div>
      Contribute on GitHub:
      <a
        class="underline text-blue-400"
        target="_blank"
        href="https://github.com/aeternity/aepp-contracts"
        >https://github.com/aeternity/aepp-contracts</a
      >
    </div>
    <div>Version {{ version }}</div>
  </div>
</template>
<script setup lang="ts">
// eslint-disable-next-line no-undef
const version = __APP_VERSION__;
</script>
