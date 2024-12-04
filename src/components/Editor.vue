<template>
  <div class="home container mx-auto">
    <Account />
    <div v-if="sdkStatus === Status.CONNECTED">
      <CodeAci />
      <Repl />
      <div class="flex mt-8 mb-8">
        <Deploy />
        <CallStatic />
      </div>
      <Call />
    </div>
  </div>
</template>
<script setup lang="ts">
import CodeAci from "./CodeAci.vue";
import Repl from "./Repl.vue";
import Deploy from "./Deploy.vue";
import Account from "./Account.vue";
import CallStatic from "./CallStatic.vue";
import Call from "./Call.vue";
import { Status, useSdkStore } from "../stores/sdkStore";
import { storeToRefs } from "pinia";

const sdkStore = useSdkStore();
const { sdkStatus } = storeToRefs(sdkStore);
</script>
