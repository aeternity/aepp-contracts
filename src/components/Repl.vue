<template>
  <div class="w-full p-4 bg-gray-200 rounded-sm shadow">
    <div class="flex">
      <div class="relative w-8/12">
        <h2 class="py-2 inline-block">REPL:</h2>
      </div>
    </div>

    <div class="flex">
      <div class="relative w-full">
        <div
          v-html="repl_output"
          style="white-space: pre-wrap; color: white; background: black; font-family: monospace; line-height: 1; height: 300px; resize: vertical;overflow: auto !important;"
        />
      </div>
    </div>

    <div class="flex">
      <div class="relative w-8/12">
      <button class="mt-2 rounded-l-full bg-black hover:bg-purple-500 text-white p-2 px-4" v-html="repl_prompt">
            </button>
        <input
          v-model="repl_query"
          class="mt-2 bg-black hover:bg-purple-500 text-white p-2 px-4 w-8/12"
          v-on:keyup.enter="repl_submitQuery()"
          v-on:keyup.up="repl_historyUp()"
          v-on:keyup.down="repl_historyDown()"
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
          v-model="repl_contractName"
          class="mt-2 rounded-l-full bg-black hover:bg-purple-500 text-white p-2 px-4"
          v-on:keyup.enter="repl_loadFiles()"
        />
        <button
          class="mt-2 mr-2 rounded-r-full bg-black hover:bg-purple-500 text-white p-2 px-4"
          @click="repl_loadFiles()"
        >
          Deploy as
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Codemirror } from "vue-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { javascript } from "@codemirror/lang-javascript";
import { storeToRefs } from "pinia";
import { useContractStore } from "../stores/contractStore";
import { ref, watch } from "vue";

import {Socket} from "phoenix";
import {AnsiUp} from 'ansi_up';
const ansi_up = new AnsiUp();

const extensions = [javascript(), oneDark];

const contractStore = useContractStore();
const { compileData, compileResult, deployResult } = storeToRefs(contractStore);
const {
  compileContractFromSource,
  initializeContractFromAci,
  resetContractState,
} = contractStore;

const contractAddress = ref("");
const aci = ref("");
const repl_output = ref("");
const repl_query = ref("");
const repl_contractName = ref("");
const repl_prompt = ref("");

// want those watch here to only react to changes from store but still have local models
watch(
  deployResult,
  () => {
    contractAddress.value = deployResult.value.data || "";
  },
  { deep: true }
);

watch(
  compileResult,
  () => {
    aci.value = compileResult.value.data?.aci || "";
  },
  { deep: true }
);



////////////////////////////////////////////////////////////////////////////////

let socket = new Socket("ws://localhost:4000/socket");
socket.connect();

let channel = socket.channel("repl_session:lobby", {});

var session = null;
var last_prompt = "";
var last_input = "";
var history = []
var history_ptr = 0;

repl_query.value = "";

function repl_historyUp() {
    if(history_ptr == history.length) {
        last_input = repl_query.value;
    }
    history_ptr -= 1;
    history_retrieve();
}

function repl_historyDown() {
    history_ptr += 1;
    history_retrieve();
}

function history_get() {
    history_ptr = Math.min(history.length, Math.max(0, history_ptr));
    if(history_ptr == history.length) {
        return last_input;
    } else {
        return history[history_ptr];
    }
}

function history_retrieve() {
    let query = history_get();
    console.log("Q: ", query);
    repl_query.value = query;
}

function repl_loadFiles() {
    let contract = compileData.value.contractCode;
    channel.push("load", {files: [{filename: repl_contractName.value,
                                   content: contract
                                  }],
                          user_session: session
                         });
}

function repl_submitQuery() {
    let query = repl_query.value.trim();
    channel.push("query", {input: query,
                           user_session: session
                          });

    last_input = query;
    history_ptr = history.length;
    if(history[history_ptr - 1] != query) {
        history = history.concat(query);
        history_ptr += 1;
    }
    repl_query.value = "";
}

function log_response(msg) {
         let txt = ansi_up.ansi_to_html(msg);
         prompt = last_prompt ? last_prompt + "> " : "";
         repl_output.value += "\n" + prompt + last_input + "\n" + txt + "\n";
}

function update_prompt(prompt) {
         last_prompt = prompt;
         repl_prompt.value = prompt + "> ";
}

channel.on("response", payload => {
    var msg = payload.msg;
    var prompt = payload.prompt;
    session = payload.user_session ? payload.user_session : session;
    msg = payload.msg.replace(/^\n|\n$/g, '');
    if(msg) {
        log_response(msg);
    }
    if(prompt) {
        update_prompt(prompt);
    }
});

channel.onError( () => alert("Channel error.") );
channel.onClose( () => {
    update_prompt("(CLOSED)");
    alert("The channel has been closed. Please refresh to start a new session.");
});


channel.join()
    .receive("ok", resp => { console.log("Joined aerepl lobby."); })
    .receive("error", resp => {
        update_prompt("(CHANNEL ERROR)");
        alert("Could not establish the connection.");
    });



////////////////////////////////////////////////////////////////////////////////

</script>
