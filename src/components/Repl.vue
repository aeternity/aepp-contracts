<template>
  <div class="w-full p-4 bg-gray-200 rounded-sm shadow">
    <div class="flex">
      <div class="relative w-8/12">
        <button
          class="my-2 mr-2 rounded-full bg-black hover:bg-purple-500 text-white p-2 px-4"
          @click="toggleRepl()"
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
            v-html="output"
          />
          <!-- eslint-enable -->
        </div>
      </div>

      <div class="flex">
        <div class="relative w-8/12">
          <button
            class="mt-2 rounded-l-full bg-black hover:bg-purple-500 text-white p-2 px-4"
          >
            {{ prompt }}
          </button>
          <input
            v-model="query"
            class="mt-2 bg-black hover:bg-purple-500 text-white p-2 px-4 w-8/12"
            @keyup.enter="submitQuery()"
            @keyup.up="historyUp()"
            @keyup.down="historyDown()"
          />
          <button
            class="mt-2 mr-2 rounded-r-full bg-black hover:bg-purple-500 text-white p-2 px-4"
            @click="submitQuery()"
          >
            Query
          </button>
        </div>
        <div class="relative w-4/12">
          <input
            v-model="contractName"
            class="mt-2 rounded-l-full bg-black hover:bg-purple-500 text-white p-2 px-4"
            @keyup.enter="loadFiles()"
          />
          <button
            class="mt-2 mr-2 rounded-r-full bg-black hover:bg-purple-500 text-white p-2 px-4"
            @click="loadFiles()"
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

import { Channel, Socket } from "phoenix";
import { AnsiUp } from "ansi_up";

const ansiUp = new AnsiUp();

const contractStore = useContractStore();
const { compileData, compileResult } = storeToRefs(contractStore);

const show = ref(false);
const output = ref("");
const query = ref("");
const contractName = ref("");
const prompt = ref("");

watch(
  compileResult,
  () => {
    contractName.value = compileResult.value.data?.aci
      ? JSON.parse(compileResult.value.data?.aci).find(
          (aci: { contract: { kind: string } | undefined }) =>
            aci.contract?.kind === "contract_main",
        )?.contract.name + ".aes"
      : "";
  },
  { deep: true },
);

////////////////////////////////////////////////////////////////////////////////

let channel: Channel | null = null;
let session: string | null = null;
let lastPrompt = "";
let lastInput = "";
let history: string[] = [];
let historyIndex = 0;

function toggleRepl() {
  show.value = !show.value;

  if (show.value) {
    const socket = new Socket("wss://repl.prd.aepps.com/socket");
    socket.connect();

    channel = socket.channel("repl_session:lobby", {});

    session = null;
    lastPrompt = "";
    lastInput = "";
    history = [];
    historyIndex = 0;

    query.value = "";

    channel.on(
      "response",
      (payload: { prompt: string; user_session: string; msg: string }) => {
        const prompt = payload.prompt;
        session = payload.user_session || session;
        const msg = payload.msg.replace(/^\n|\n$/g, "");
        if (msg) {
          logResponse(msg);
        }
        if (prompt) {
          updatePrompt(prompt);
        }
      },
    );

    channel.onError(() => alert("Channel error."));

    channel
      .join()
      .receive("ok", () => {
        console.log("Joined aerepl lobby.");
      })
      .receive("error", (e) => {
        console.error(e);
        updatePrompt("(CHANNEL ERROR)");
        alert("Could not establish the connection.");
      });
  } else {
    channel?.leave();
  }
}

function historyUp() {
  if (historyIndex == history.length) {
    lastInput = query.value;
  }
  historyIndex -= 1;
  historyRetrieve();
}

function historyDown() {
  historyIndex += 1;
  historyRetrieve();
}

function historyGet() {
  historyIndex = Math.min(history.length, Math.max(0, historyIndex));
  if (historyIndex == history.length) {
    return lastInput;
  } else {
    return history[historyIndex];
  }
}

function historyRetrieve() {
  query.value = historyGet();
}

function loadFiles() {
  const contract = compileData.value.contractCode;
  channel?.push("load", {
    files: [{ filename: contractName.value, content: contract }],
    user_session: session,
  });
}

function submitQuery() {
  const trimmedQuery = query.value.trim();
  channel?.push("query", { input: trimmedQuery, user_session: session });

  lastInput = trimmedQuery;
  historyIndex = history.length;
  if (history[historyIndex - 1] != trimmedQuery) {
    history = history.concat(trimmedQuery);
    historyIndex += 1;
  }
  query.value = "";
}

function logResponse(msg: string) {
  const txt = ansiUp.ansi_to_html(msg);
  const prompt = lastPrompt ? lastPrompt + "> " : "";
  output.value += "\n" + prompt + lastInput + "\n" + txt + "\n";
  setTimeout(() => updateScroll(), 10);
}

function updatePrompt(updatePrompt: string) {
  lastPrompt = updatePrompt;
  prompt.value = updatePrompt + "> ";
}

function updateScroll() {
  const element = document.getElementById("repl_output");
  if (element) element.scrollTop = element.scrollHeight;
}

////////////////////////////////////////////////////////////////////////////////
</script>
