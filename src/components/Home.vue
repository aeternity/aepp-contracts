<template>
  <div class="home container mx-auto">

    <h6 class="mt-4 text-sm text-purple" v-if="!modifySettings && keypair && keypair.publicKey"
        @click="modifySettings = true">
      <span class="font-mono text-black">Account: </span> {{ keypair.publicKey }}
    </h6>

    <div v-if="!keypair || !keypair.secretKey || !keypair.publicKey || !nodeUrl || this.modifySettings">
      <div class="flex mt-8 mb-8">
        <div class="w-full p-4 bg-gray-200 rounded-sm shadow">
          <h2 class="py-2">
            Settings
          </h2>
          <div class="flex -mx-2 mt-4 mb-4">
            <div class="mx-2 w-1/3">
              <label class="text-xs block mb-1" for="host">Host</label>
              <input v-model="nodeUrl" class="w-full p-2" id="host" type="text"
                     placeholder="https://testnet.aeternity.io">
            </div>
            <div class="mx-2 w-1/3">
              <label class="text-xs block mb-1" for="accountPub">Public Key</label>
              <input v-model="keypair.publicKey" class="w-full p-2" id="accountPub" type="text"
                     placeholder="Public Key">
            </div>
            <div class="mx-2 w-1/3">
              <label class="text-xs block mb-1" for="accountPriv">Private Key</label>
              <input v-model="keypair.secretKey" class="w-full p-2" id="accountPriv" type="text"
                     placeholder="Private Key">
            </div>
          </div>
          <button class="mt-2 mr-2 rounded-full bg-black hover:bg-purple-500 text-white p-2 px-4" @click="saveSettings">
            Save
          </button>
          <button class="mt-2 rounded-full bg-black hover:bg-purple-500 text-white p-2 px-4" @click="createKeypair">
            Create Keypair
          </button>
        </div>
      </div>
    </div>

    <h1 class="py-2">
      Test contracts
      <span v-if="!client && !clientError" class="text-sm text-red-500">
          (connecting to {{ nodeUrl }} ...)
        </span>
      <span v-if="!client && clientError" class="text-sm text-red-500">
          {{ clientError }}
        </span>
      <span v-if="client && clientError" class="text-sm text-red-500">
           Error connecting to {{ nodeUrl }} <br/>
           {{ clientError }}
        </span>

      <span v-if="client && !clientError" class="text-sm text-green-500">
          ({{ nodeUrl }})
        </span>
    </h1>

    <div class="mt-2 -mx-2" v-if="!clientError">
      <div class="w-full p-4 bg-gray-200 rounded-sm shadow">
        <div class="flex">
          <div class="relative w-6/12">
            <h2 class="py-2 inline-block">
              Sophia Contract's Code:
            </h2>
            <h2 class="py-2 inline-block float-right pr-4">
              or
            </h2>
          </div>
          <div class="relative w-6/12">
            <h2 class="py-2 inline-block">
              ACI:
            </h2>
          </div>
        </div>

        <div class="flex">
          <div class="relative w-6/12 pr-1">
            <codemirror v-model="contractCode" :options="cmOption"></codemirror>
          </div>
          <div class="relative w-6/12">
            <codemirror v-model="aci" :options="cmOption"></codemirror>
          </div>
        </div>


        <div class="mt-2 mb-2" v-if="compileError">
          <label class="text-xs block mb-1 text-red">Compile Errors:</label>
          <textarea v-model="compileError"
                    class="h-16 w-full text-red-500 bg-black text-xs mb-4 p-4 font-mono"></textarea>
        </div>


        <div class="flex">
          <div class="relative w-6/12">
            <button v-if="this.client" class="mt-2 mr-2 rounded-full bg-black hover:bg-purple-500 text-white p-2 px-4"
                    @click="onCompile">Compile
            </button>
            <button v-if="this.client" class="mt-2 rounded-full bg-black hover:bg-purple-500 text-white p-2 px-4"
                    @click="resetContract">Reset
            </button>
          </div>
          <div class="relative w-6/12">
            <input v-if="this.client" v-model="contractAddress"
                   class="mt-2 rounded-l-full bg-black hover:bg-purple-500 text-white p-2 px-4"/>
            <button v-if="this.client" class="mt-2 mr-2 rounded-r-full bg-black hover:bg-purple-500 text-white p-2 px-4"
                    @click="atAddress">at Address
            </button>
          </div>
        </div>
      </div>

      <div class="flex mt-8 mb-8" v-if="byteCode">
        <div class="w-1/2 p-4 bg-gray-200 rounded-sm shadow">
          <h2 class="py-2">
            Byte Code
            <span class="block w-full text-xs"
                  v-bind:class="{ 'text-red' : !deployedContractInstance, 'text-green' : deployedContractInstance }">
                {{ deployInfo }}
              </span>
          </h2>
          <textarea v-model="byteCode" class="h-16 w-full font-mono bg-black text-white text-xs mb-4 p-4"></textarea>

          <div class="mt-2 mb-2" v-if="deployError">
            <label class="text-xs block mb-1 text-red">Deploy Errors:</label>
            <textarea v-model="deployError"
                      class="h-16 w-full text-red-500 bg-black text-xs mb-4 p-4 font-mono"></textarea>
          </div>

          <div class="flex -mx-2 mt-4 mb-4">
            <div class="mx-2">
              <label class="text-xs block mb-1" for="deployFunc">Function</label>
              <input v-model="deployFunc" class="w-full p-2" id="deployFunc" type="text" value="init" disabled>
            </div>
            <div class="mx-2">
              <label class="text-xs block mb-1" for="deployArgs">Arguments</label>
              <input v-model="deployArgs" class="w-full p-2" id="deployArgs" type="text"
                     placeholder="comma separated args">
            </div>
          </div>
          <div class="flex -mx-2 mt-4 mb-4">

            <div class="mx-2 w-1/5">
              <label class="text-xs block mb-1" for="dGasPrice">Gas Price <a class="text-black no-underline"
                                                                             target="_blank"
                                                                             href="https://en.wikipedia.org/wiki/Atto-">
                (a)</a></label>
              <input v-model.number="deployOpts.gasPrice" class="w-full p-2" id="dGasPrice" type="number"
                     min="1000000000" placeholder="gas price">
            </div>
            <div class="mx-2 w-1/5">
              <label class="text-xs block mb-1" for="dAmount">Amount <a class="text-black no-underline" target="_blank"
                                                                        href="https://en.wikipedia.org/wiki/Atto-">
                (a)</a></label>
              <input v-model.number="deployOpts.amount" class="w-full p-2" id="dAmount" type="number" min="0"
                     placeholder="amount">
            </div>
            <div class="mx-2 w-1/5">
              <label class="text-xs block mb-1" for="dFee">Fee <a class="text-black no-underline" target="_blank"
                                                                  href="https://en.wikipedia.org/wiki/Atto-">
                (a)</a></label>
              <input v-model.number="deployOpts.fee" class="w-full p-2" id="dFee" type="number" placeholder="auto">
            </div>
            <div class="mx-2 w-1/5">
              <label class="text-xs block mb-1" for="dGas">Gas Limit</label>
              <input v-model.number="deployOpts.gas" class="w-full p-2" id="dGas" type="number" min="0"
                     placeholder="auto">
            </div>

            <input v-model="deployOpts.callData" class="w-full p-2" type="hidden">

          </div>

          <button class="py-2 rounded-full bg-black hover:bg-purple-500 text-white p-2 px-4" @click="onDeploy">Deploy
          </button>
        </div>
        <div v-if="contractAddress" class="w-1/2 p-4 bg-gray-200 rounded-sm shadow">
          <h2 class="py-2">
            ⬅ Call Static Function
          </h2>
          <div class="flex -mx-2 mt-4 mb-4">
            <div class="mx-2 w-1/2">
              <label class="text-xs block mb-1" for="staticFunc">Function</label>
              <input v-model="staticFunc" class="w-full p-2" id="staticFunc" type="text" placeholder="function">
            </div>
            <div class="mx-2 w-1/4">
              <label class="text-xs block mb-1" for="staticGas">Gas Limit</label>
              <input v-model.number="staticGas" class="w-full p-2" id="staticGas" type="number" min="0"
                     placeholder="gas">
            </div>
          </div>
          <div class="flex -mx-2 mt-4 mb-4">
            <div class="mx-2 w-full">
              <label class="text-xs block mb-1" for="staticArgs">Arguments</label>
              <input v-model="staticArgs" class="w-full p-2" id="staticArgs" type="text"
                     placeholder="comma separated args">
            </div>
          </div>

          <div class="mt-2 mb-2" v-if="callStaticRes && !callStaticError">
            <label class="text-xs block mb-1">Call Result</label>
            <div class="w-full text-white bg-black text-xs mb-4 p-4 overflow-x-scroll font-mono">
              {{ callStaticRes }}
            </div>
          </div>
          <div class="mt-2 mb-2" v-if="callStaticError">
            <label class="text-xs block mb-1 text-red">Errors</label>
            <textarea v-model="callStaticError"
                      class="h-16 w-full text-red-500 bg-black text-xs mb-4 p-4 font-mono"></textarea>
          </div>

          <button class="py-2 rounded-full bg-black hover:bg-purple-500 text-white p-2 px-4" @click="onCallStatic">Call
            Static
          </button>
        </div>
      </div>

      <div v-if="deployedContractInstance && byteCode" class="w-full p-4 bg-gray-200 rounded-sm shadow mb-8">
        <h2 class="py-2">
          ⬆ Call Function
        </h2>
        <div class="flex -mx-2 mt-4 mb-4">
          <div class="mx-2 w-1/4">
            <label class="text-xs block mb-1" for="cGasPrice">Gas Price <a class="text-black no-underline"
                                                                           target="_blank"
                                                                           href="https://en.wikipedia.org/wiki/Atto-">
              (a)</a></label>
            <input v-model.number="callOpts.gasPrice" class="w-full p-2" id="cGasPrice" type="number" min="1000000000"
                   placeholder="gas price">
          </div>
          <div class="mx-2 w-1/4">
            <label class="text-xs block mb-1" for="cAmount">Amount <a class="text-black no-underline" target="_blank"
                                                                      href="https://en.wikipedia.org/wiki/Atto-">
              (a)</a></label>
            <input v-model.number="callOpts.amount" class="w-full p-2" id="cAmount" type="number" min="0"
                   placeholder="amount">
          </div>
          <div class="mx-2 w-1/4">
            <label class="text-xs block mb-1" for="cFee">Fee <a class="text-black no-underline" target="_blank"
                                                                href="https://en.wikipedia.org/wiki/Atto-">
              (a)</a></label>
            <input v-model.number="callOpts.fee" class="w-full p-2" id="cFee" type="number" placeholder="auto">
          </div>
          <div class="mx-2 w-1/4">
            <label class="text-xs block mb-1" for="cGas">Gas Limit</label>
            <input v-model.number="callOpts.gas" class="w-full p-2" id="cGas" type="number" min="0" placeholder="auto">
          </div>

          <input v-model="callOpts.callData" class="mx-2 w-1/2 p-2" type="hidden">

        </div>
        <div class="flex -mx-2 mt-4 mb-4">
          <div class="mx-2 w-1/2">
            <label class="text-xs block mb-1" for="func">Function</label>
            <input v-model="nonStaticFunc" class="w-full p-2" id="func" type="text" placeholder="function">
          </div>
          <div class="mx-2 w-1/2">
            <label class="text-xs block mb-1" for="args">Arguments</label>
            <input v-model="nonStaticArgs" class="w-full p-2" id="args" type="text" placeholder="comma separated args">
          </div>
        </div>

        <div class="mt-2 mb-2" v-if="callRes && !callError">
          <label class="text-xs block mb-1">Call Result</label>
          <div class="w-full text-white bg-black text-xs mb-4 p-4 font-mono" v-html="callRes">
          </div>
        </div>
        <div class="mt-2 mb-2" v-if="callError">
          <label class="text-xs block mb-1 text-red">Errors</label>
          <textarea v-model="callError" class="h-16 w-full text-red-500 bg-black text-xs mb-4 p-4 font-mono"></textarea>
        </div>

        <button class="py-2 mr-2 rounded-full bg-black hover:bg-purple-500 text-white p-2 px-4"
                @click="onCallDataAndFunction">Call Function
        </button>
        <span v-if="waitingCall" class="text-sm text-red-500">Calling Function...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { AeSdk, Node, MemoryAccount } from '@aeternity/aepp-sdk/es'
import * as Crypto from '@aeternity/aepp-sdk/es/utils/crypto'

import 'codemirror/keymap/sublime'
import 'codemirror/mode/haskell/haskell'
import 'codemirror/addon/merge/merge'

const compilerUrl = 'https://latest.compiler.aepps.com'

BigInt.prototype.toJSON = function() { return this.toString() }
Uint8Array.prototype.toJSON = function() { return Buffer.from(this).toString('hex') };

export default {
  name: 'Home',
  data () {
    return {
      modifySettings: false,
      cmOption: {
        keyMap: 'sublime',
        indentUnit: 2,
        styleActiveLine: true,
        lineNumbers: true,
        mode: 'haskell',
        theme: 'monokai',
        extraKeys: { Tab: this.usingSpacesInsteadTab }
      },
      example: `@compiler >= 4

contract Example =
  entrypoint example(x : int) = x`,
      contractCode: '',
      aci: '',
      keypair: { publicKey: null, secretKey: null },
      balance: 0,
      balanceInterval: null,
      byteCode: '',
      client: false,
      nodeUrl: 'https://testnet.aeternity.io',
      deployedContractInstance: null,
      deployInfo: '',
      minedData: false,
      miningStatus: '',
      wallet: false,
      deployFunc: 'init',
      deployArgs: '',
      staticFunc: 'example',
      staticGas: 1000000,
      staticArgs: '',
      nonStaticFunc: '',
      nonStaticArgs: '',
      contractAddress: '',
      deployOpts: {
        gasPrice: 1000000000,
        amount: 0,
        fee: null, // sdk will automatically select this
        gas: null, // sdk will automatically select this
        callData: ''
      },
      callOpts: {
        gasPrice: 1000000000,
        amount: 0,
        fee: null, // sdk will automatically select this
        gas: null, // sdk will automatically select this
        callData: ''
      },
      clientError: false,
      callRes: '',
      callError: '',
      deployError: '',
      compileError: '',
      callStaticRes: '',
      callStaticError: '',
      waitingCall: false
    }
  },
  props: {
    query: {
      type: Object
    }
  },
  methods: {
    usingSpacesInsteadTab (cm) {
      const spaces = Array(cm.getOption('indentUnit') + 1).join(' ')
      cm.replaceSelection(spaces)
    },
    async compile (code) {
      console.log(`Compiling contract...`)
      try {
        return Promise.all([this.client.compilerApi.compileContract({
          code,
          options: {}
        }), this.client.compilerApi.generateACI({ code, options: {} })])
      } catch (err) {
        this.compileError = err.response && err.response.body ? err.response.body.map(e => e.message).join('\n') : err
      }
    },
    async deploy (initArgs, options = {}) {
      initArgs = initArgs ? initArgs.split(',').map((arg) => { return arg.trim() }) : []

      console.log(`Deploying contract...`)
      try {
        const contractInstance = await this.client.getContractInstance({ source: this.contractCode })
        // eslint-disable-next-line no-unused-vars
        options = Object.fromEntries(Object.entries(options).filter(([_, v]) => v != null));
        this.deployedContractInstance = await contractInstance.deploy(initArgs, options)
        return contractInstance
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    async callStatic (func, args, gas) {
      console.log(`calling static func ${func} with args ${args}`)
      args = args ? args.split(',').map((arg) => { return arg.trim() }) : []
      const options = { callStatic: true, gas }
      try {
        return await this.deployedContractInstance.call(func, args, options)
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    async callContract (func, args, options) {
      args = args ? args.split(',').map((arg) => { return arg.trim() }) : []
      // eslint-disable-next-line no-unused-vars
      options = Object.fromEntries(Object.entries(options).filter(([_, v]) => v != null));

      console.log(`calling a function on a deployed contract with func: ${func}, args: ${args} and options:`, options)
      try {
        return await this.deployedContractInstance.call(func, args, options)
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    resetData () {
      this.compileError = ''
      this.callError = ''
      this.callRes = ''
      this.deployError = ''
      this.callStaticError = ''
      this.deployedContractInstance = false
      this.deployInfo = ''
      this.minedData = false
      this.miningStatus = false
      this.byteCode = false
      this.aci = ''

      this.modifySettings = false
      this.deployedContractInstance = ''
    },
    onCompile () {
      this.saveContract()
      this.resetData()
      this.compile(this.contractCode)
          .then(([{ bytecode }, aci]) => {
            this.contractAddress = undefined
            this.byteCode = bytecode
            delete aci.interface
            this.aci = JSON.stringify(aci, null, 2)
          })
    },
    onDeploy () {
      this.deployInfo = 'Deploying and checking for mining status...'
      this.miningStatus = true

      this.deploy(this.deployArgs, this.deployOpts) // this waits until the TX is mined
          .then(data => {
            this.contractAddress = this.deployedContractInstance.address
            this.saveContract()
            this.deployInfo = `Deployed, and mined at this address: ${this.contractAddress}`
            this.miningStatus = false
            this.deployedContractInstance = data
            this.deployError = ''
          })
          .catch(err => {
            this.deployError = err.response && err.response.body ? err.response.body.map(e => e.message).join('\n') : err
          })
    },
    onCallStatic () {
      if (this.staticFunc) {
        this.callStatic(this.staticFunc, this.staticArgs, this.staticGas)
            .then(res => {
              this.callStaticRes = `Result: ` + JSON.stringify(res.decodedResult)
              this.callStaticError = ''
            })
            .catch(err => {
              this.callStaticError = err
            })
      } else {
        this.callStaticError = 'Please enter a Function and 1 or more Arguments.'
      }
    },
    onCallDataAndFunction () {
      if (this.nonStaticFunc) {
        this.waitingCall = true
        this.callContract(this.nonStaticFunc, this.nonStaticArgs, this.callOpts)
            .then(dataRes => {
              this.callRes = `Gas Used: ${dataRes.result.gasUsed} <br><br>---<br><br> Result: <br><br> ${JSON.stringify(dataRes.decodedResult)}`
              this.callError = ''
              this.waitingCall = false
            })
            .catch(err => {
              this.callError = err
              this.waitingCall = false
            })
      } else {
        this.callError = 'Please enter a Function and 1 or more Arguments.'
      }
    },
    async getClient () {
      this.clientError = null
      try {
        this.client = new AeSdk({
          compilerUrl: compilerUrl,
          nodes: [
            {
              name: 'node',
              instance: new Node(this.nodeUrl)
            }],
        })
        await this.client.addAccount(new MemoryAccount({ keypair: this.keypair }), { select: true })
        if ((await this.client.getBalance(this.keypair.publicKey)) < 10000000000000000) await this.fundAccount(this.keypair.publicKey)
        await this.client.getBalance(this.keypair.publicKey)
      } catch (err) {
        this.clientError = err.toString().includes('404') ? 'Account not found' : err
        console.log(this.clientError)
      }
    },
    getKeypair () {
      let keypairString = window.localStorage.getItem('testnet-keypair')
      let keypair = keypairString ? JSON.parse(keypairString) : Crypto.generateKeyPair()
      window.localStorage.setItem('testnet-keypair', JSON.stringify(keypair))
      return keypair
    },
    async fundAccount (publicKey) {
      await fetch(`https://testnet.faucet.aepps.com/account/${publicKey}`, {
        method: 'POST',
        body: {},
        headers: { 'content-type': 'application/x-www-form-urlencoded' }
      }).catch(console.error)
    },
    async createKeypair () {
      this.keypair = Crypto.generateKeyPair()
      window.localStorage.setItem('testnet-keypair', JSON.stringify(this.keypair))
      await this.fundAccount(this.keypair.publicKey)
      await this.getClient()
      this.modifySettings = false
    },
    async saveSettings () {
      window.localStorage.setItem('testnet-keypair', JSON.stringify(this.keypair))
      await this.getClient()
      this.modifySettings = false
    },
    saveContract () {
      window.localStorage.setItem('contract-code', this.contractCode)
      window.localStorage.setItem('aci', this.aci)
      window.localStorage.setItem('contract-address', this.contractAddress)
      window.localStorage.setItem('byte-code', this.byteCode)
    },
    getContract () {
      this.contractCode = window.localStorage.getItem('contract-code') ? window.localStorage.getItem('contract-code') : this.example
      this.aci = window.localStorage.getItem('aci') ? window.localStorage.getItem('aci') : ''
      this.contractAddress = window.localStorage.getItem('contract-address') ? window.localStorage.getItem('contract-address') : ''
      this.byteCode = window.localStorage.getItem('byte-code') ? window.localStorage.getItem('byte-code') : ''
    },
    atAddress () {
      this.saveContract()
      this.resetData()

      this.byteCode = 'calling at address doesn\'t need bytecode'

      this.deployInfo = 'Instantiating Contract at address ...'
      this.miningStatus = true

      const opts = this.aci !== '' ? { aci: JSON.parse(this.aci) } : { source: this.contractCode }
      this.client.getContractInstance({ ...opts, contractAddress: this.contractAddress })
          .then(data => {
            this.deployInfo = `Instantiated Contract at address: ${this.contractAddress}`
            this.miningStatus = false
            this.deployedContractInstance = data
            this.deployError = ''
          })
          .catch(err => {
            this.deployError = err
          })
    },
    resetContract () {
      this.contractCode = this.example
      this.aci = ''
      this.contractAddress = ''
      this.byteCode = ''
      this.saveContract()
      this.resetData()
    }
  },
  async mounted () {
    try {
      this.keypair = this.getKeypair()
      this.getContract()
      await this.getClient()
    } catch (e) {
      console.error(e)
    }
  }
}
</script>

<style lang="css">
.no-underline {
  text-decoration: none;
}

button,
button:hover,
button:focus,
button:active {
  outline: none;
  outline: 0;
}

.CodeMirror {
  height: auto;
  min-height: 300px;
}

.CodeMirror-scroll {
  min-height: 300px;
}
</style>
