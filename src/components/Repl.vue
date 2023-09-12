<template>
  <div class="w-full p-4 bg-gray-200 rounded-sm shadow">
    <div class="flex">
      <div class="relative w-8/12">
        <button
          class="my-2 mr-2 rounded-full bg-black hover:bg-purple-500 text-white p-2 px-4"
          @click="show = !show"
        >
          {{ show ? "Close" : "Open" }}
        </button>
        <h2 class="py-2 inline-block">REPL Interactive Sophia Shell</h2>
      </div>
    </div>

    <div :class="show ? '' : 'hidden'">
      <div class="flex">
        <div class="relative w-full">
          <!-- eslint-disable vue/no-v-html -->
          <div
            id="repl_output"
            class="p-2 whitespace-pre-wrap text-white bg-black font-mono leading-none h-96 resize-y overflow-auto"
            v-html="replOutput"
          />
          <!-- eslint-enable -->
        </div>
      </div>

      <div class="flex">
        <div class="relative w-8/12">
          <button
            class="mt-2 rounded-l-full bg-black hover:bg-purple-500 text-white p-2 px-4"
          >
            {{ replPrompt }}
          </button>
          <input
            v-model="replQuery"
            class="mt-2 bg-black hover:bg-purple-500 text-white p-2 px-4 w-8/12"
            @keyup.enter="repl_submitQuery()"
            @keyup.up="repl_historyUp()"
            @keyup.down="repl_historyDown()"
          />
          <button
            class="mt-2 mr-2 rounded-r-full bg-black hover:bg-purple-500 text-white p-2 px-4"
            @click="repl_submitQuery()"
          >
            Query
          </button>
        </div>
        <div class="relative w-4/12">
          <input
            v-model="replContractName"
            class="mt-2 rounded-l-full bg-black hover:bg-purple-500 text-white p-2 px-4"
            @keyup.enter="repl_loadFiles()"
          />
          <button
            class="mt-2 mr-2 rounded-r-full bg-black hover:bg-purple-500 text-white p-2 px-4"
            @click="repl_loadFiles()"
          >
            Load Contract
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useContractStore } from "../stores/contractStore";
import { ref, watch } from "vue";

import { Socket } from "phoenix";
import { AnsiUp } from "ansi_up";

const ansiUp = new AnsiUp();

const contractStore = useContractStore();
const { compileData, compileResult } = storeToRefs(contractStore);

const show = ref(false);
const replOutput = ref("");
const replQuery = ref("");
const replContractName = ref("");
const replPrompt = ref("");

watch(
  compileResult,
  () => {
    replContractName.value = compileResult.value.data?.aci
      ? JSON.parse(compileResult.value.data?.aci)[0]?.contract.name + ".aes"
      : "";
  },
  { deep: true }
);

////////////////////////////////////////////////////////////////////////////////

const socket = new Socket("wss://repl.prd.aepps.com/socket");
socket.connect();

const channel = socket.channel("repl_session:lobby", {});

let session: string | null = null;
let lastPrompt = "";
let lastInput = "";
let history: string[] = [];
let historyIndex = 0;

replQuery.value = "";

function repl_historyUp() {
  if (historyIndex == history.length) {
    lastInput = replQuery.value;
  }
  historyIndex -= 1;
  history_retrieve();
}

function repl_historyDown() {
  historyIndex += 1;
  history_retrieve();
}

function history_get() {
  historyIndex = Math.min(history.length, Math.max(0, historyIndex));
  if (historyIndex == history.length) {
    return lastInput;
  } else {
    return history[historyIndex];
  }
}

function history_retrieve() {
  replQuery.value = history_get();
}

function repl_loadFiles() {
  const contract = compileData.value.contractCode;
  channel.push("load", {
    files: [{ filename: replContractName.value, content: contract }],
    user_session: session,
  });
}

function repl_submitQuery() {
  const query = replQuery.value.trim();
  channel.push("query", { input: query, user_session: session });

  lastInput = query;
  historyIndex = history.length;
  if (history[historyIndex - 1] != query) {
    history = history.concat(query);
    historyIndex += 1;
  }
  replQuery.value = "";
}

function log_response(msg: string) {
  const txt = ansiUp.ansi_to_html(msg);
  const prompt = lastPrompt ? lastPrompt + "> " : "";
  replOutput.value += "\n" + prompt + lastInput + "\n" + txt + "\n";
  setTimeout(() => updateScroll(), 10);
}

function update_prompt(prompt: string) {
  lastPrompt = prompt;
  replPrompt.value = prompt + "> ";
}

function updateScroll() {
  const element = document.getElementById("repl_output");
  if (element) element.scrollTop = element.scrollHeight;
}

channel.on(
  "response",
  (payload: { prompt: string; user_session: string; msg: string }) => {
    const prompt = payload.prompt;
    session = payload.user_session || session;
    const msg = payload.msg.replace(/^\n|\n$/g, "");
    if (msg) {
      log_response(msg);
    }
    if (prompt) {
      update_prompt(prompt);
    }
  }
);

channel.onError(() => alert("Channel error."));
channel.onClose(() => {
  update_prompt("(CLOSED)");
  alert("The channel has been closed. Please refresh to start a new session.");
});

channel
  .join()
  .receive("ok", () => {
    console.log("Joined aerepl lobby.");
  })
  .receive("error", (e) => {
    console.error(e);
    update_prompt("(CHANNEL ERROR)");
    alert("Could not establish the connection.");
  });

////////////////////////////////////////////////////////////////////////////////
</script>
