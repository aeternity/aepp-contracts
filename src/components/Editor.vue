<template>
  <div class="home container mx-auto">
    <Account />
    <CodeAci />
    <div class="flex mt-8 mb-8">
      <Deploy />
      <CallStatic />
    </div>
    <Call />
  </div>
</template>
<script setup lang="ts">
import CodeAci from "./CodeAci.vue";
import Deploy from "./Deploy.vue";
import Account from "./Account.vue";
import CallStatic from "./CallStatic.vue";
import Call from "./Call.vue";
</script>
