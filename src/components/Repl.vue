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
            {{ cmdPrompt }}
          </button>
          <input
            v-model="query"
            class="mt-2 bg-black hover:bg-purple-500 text-white p-2 px-4 w-8/12"
            :disabled="repl_disabled"
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
            :disabled="repl_disabled"
            class="mt-2 rounded-l-full bg-black hover:bg-purple-500 text-white p-2 px-4"
            @keyup.enter="loadFiles()"
          />
          <button
            :disabled="repl_disabled"
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
const cmdPrompt = ref("");

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
let cmdHistory: string[] = [];
let cmdHistoryIndex = 0;
let repl_disabled = true;
let repl_console_log = false;

function toggleRepl() {
  show.value = !show.value;

  if (show.value) {
    const socket = new Socket("wss://repl.prd.aepps.com/socket");
    socket.connect();

    channel = socket.channel("repl_session:lobby", {});

    if (!channel) {
      console.error("AEREPL: Could not create the channel");
      return;
    }

    session = null;
    lastPrompt = "";
    lastInput = "";
    cmdHistory = [];
    cmdHistoryIndex = 0;

    query.value = "";

    channel
      .join()
      .receive("ok", (resp: { prompt: string; user_session: string }) => {
        session = resp.user_session;

        if (!channel) {
          console.error("AEREPL: Channel died after successful opening");
          return;
        }

        console.log("AEREPL: Joined lobby. Session ID =", session);
        repl_disabled = false;

        channel
          .push("banner", { user_session: session })
          .receive("ok", handle_response)
          .receive("error", handle_error("Could not make the initial call"));
      })
      .receive("error", handle_error("Could not establish the connection"));
  } else {
    channel?.leave();
  }
}

function handle_error(msg: string) {
  return (e: unknown) => {
    updatePrompt("(CHANNEL ERROR)");
    repl_disabled = true;

    console.error("AEREPL: ", msg);
    console.error("AEREPL: ", e);
  };
}

function handle_response(payload: {
  prompt: string;
  user_session: string;
  msg: string;
}) {
  const prompt = payload.prompt;
  session = payload.user_session || session;
  const msg = payload.msg.replace(/^\n|\n$/g, "");

  if (msg) {
    logResponse(msg);
  }
  if (prompt) {
    updatePrompt(prompt);
  }
}

function handle_file_load(filename: string) {
  return (payload: { prompt: string; user_session: string; msg: string }) => {
    const prompt = payload.prompt;
    session = payload.user_session || session;

    logResponse("[loaded " + filename + "]");

    if (prompt) {
      updatePrompt(prompt);
    }
  };
}

function historyUp() {
  if (cmdHistoryIndex == cmdHistory.length) {
    lastInput = query.value;
  }
  cmdHistoryIndex -= 1;
  historyRetrieve();
}

function historyDown() {
  cmdHistoryIndex += 1;
  historyRetrieve();
}

function historyGet() {
  cmdHistoryIndex = Math.min(cmdHistory.length, Math.max(0, cmdHistoryIndex));
  if (cmdHistoryIndex == cmdHistory.length) {
    return lastInput;
  } else {
    return cmdHistory[cmdHistoryIndex];
  }
}

function historyRetrieve() {
  query.value = historyGet();
}

function loadFiles() {
  if (repl_disabled) return;

  const contract = compileData.value.contractCode;
  let name = contractName.value.trim();
  if (!name) name = "Contract.aes";

  // Update file cache in REPL
  channel
    ?.push("update_files", {
      files: [{ filename: name, content: contract }],
      user_session: session,
    })
    .receive("ok", handle_response)
    .receive("error", handle_error("Could not upload files"));

  // Order REPL to load the file into the context
  channel
    ?.push("load", {
      files: [name],
      user_session: session,
    })
    .receive("ok", handle_file_load(name))
    .receive("error", handle_error("Could not load files"));
}

function submitQuery() {
  if (repl_disabled) return;

  const trimmedQuery = query.value.trim();

  lastInput = trimmedQuery;
  cmdHistoryIndex = cmdHistory.length;
  if (cmdHistory[cmdHistoryIndex - 1] != trimmedQuery) {
    cmdHistory = cmdHistory.concat(trimmedQuery);
    cmdHistoryIndex += 1;
  }
  query.value = "";

  channel
    ?.push("query", {
      input: trimmedQuery,
      render: true,
      user_session: session,
    })
    .receive("ok", handle_response)
    .receive("error", handle_error("Could not submit query"));
}

function logResponse(msg: string) {
  const txt = ansiUp.ansi_to_html(msg);
  const prompt = lastPrompt ? lastPrompt + "> " : "";
  output.value += "\n" + prompt + lastInput + "\n" + txt + "\n";

  if (repl_console_log) {
    console.log("AEREPL: ", txt);
  }

  setTimeout(() => updateScroll(), 10);
}

function updatePrompt(updatePrompt: string) {
  lastPrompt = updatePrompt;
  cmdPrompt.value = updatePrompt + "> ";
}

function updateScroll() {
  const element = document.getElementById("repl_output");
  if (element) element.scrollTop = element.scrollHeight;
}

////////////////////////////////////////////////////////////////////////////////
</script>
