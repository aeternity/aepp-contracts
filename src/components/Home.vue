<template>
  <div class="home container mx-auto">

     <h1 class="py-2">
        Test contracts
        <span v-if="!this.client && !this.clientError" class="text-sm text-red">
          (connecting to {{this.nodeUrl}} ...)
        </span>
        <span v-if="this.clientError" class="text-sm text-red">
          Error connecting to {{this.nodeUrl}}
          <br>
          {{this.clientError}}
        </span>
        <span v-if="this.client" class="text-sm text-green">
          ({{this.nodeUrl}})
        </span>
      </h1>
      <div class="mt-8 -mx-2" v-if="!this.clientError">
        <div class="w-full p-4 bg-grey-light rounded-sm shadow">
          <h2 class="py-2 inline-block">
            Sophia Contract's Code:
          </h2>

          <div class="relative">
            <codemirror v-model="contractCode" :options="cmOption"></codemirror>
          </div>

          <div v-if="compileError">
            <label class="text-xs block mb-1 text-red">Errors</label>
            <textarea v-model="compileError" class="h-64 w-full border border-solid border-black font-mono bg-black text-red"></textarea>
          </div>

          <button v-if="this.client" class="mt-2 rounded-full bg-black hover:bg-purple text-white p-2 px-4" @click="onCompile">Compile</button>
          <input v-if="this.client" v-model="contractAddress" class="mt-2 rounded-l-full bg-black hover:bg-purple text-white p-2 px-4" />
          <button v-if="this.client" class="mt-2 rounded-r-full bg-black hover:bg-purple text-white p-2 px-4" @click="atAddress">at Address</button>
          <button v-if="this.client" class="mt-2 rounded-full bg-black hover:bg-purple text-white p-2 px-4" @click="resetContract">Reset</button>
        </div>

        <div class="flex mt-8 mb-8" v-if="byteCode">
          <div class="w-1/2 p-4 bg-grey-light rounded-sm shadow">
            <h2 class="py-2">
              Byte Code
              <div class="w-full text-xs" v-bind:class="{ 'text-red' : !deployedContractInstance, 'text-green' : deployedContractInstance }">
                {{deployInfo}}
              </div>
            </h2>
            <textarea v-model="byteCode" class="h-16 w-full border border-solid border-black font-mono bg-black text-white text-xs"></textarea>

            <div class="mt-2 mb-2" v-if="deployError">
              <label class="text-xs block mb-1 text-red">Deploy Errors:</label>
              <div class="w-full border border-solid border-black font-mono bg-black text-red text-sm">
                {{deployError}}
              </div>
            </div>

            <div class="flex -mx-2 mt-4 mb-4">
              <div class="mx-2">
                <label class="text-xs block mb-1" for="deployFunc">Function</label>
                <input v-model="deployFunc" class="w-full p-2" id="deployFunc" type="text" value="init" disabled>
              </div>
              <div class="mx-2">
                <label class="text-xs block mb-1" for="deployArgs">Arguments</label>
                <input v-model="deployArgs" class="w-full p-2" id="deployArgs" type="text" placeholder="comma separated args">
              </div>
            </div>
            <div class="flex -mx-2 mt-4 mb-4">

              <div class="mx-2 w-1/5">
                <label class="text-xs block mb-1" for="dGasPrice">Gas Price <a class="text-black no-underline" target="_blank" href="https://en.wikipedia.org/wiki/Atto-"> (a)</a></label>
                <input v-model.number="deployOpts.gasPrice" class="w-full p-2" id="dGasPrice" type="number" min="1000000000" placeholder="gas price">
              </div>
              <div class="mx-2 w-1/5">
                <label class="text-xs block mb-1" for="dAmount">Amount <a class="text-black no-underline" target="_blank" href="https://en.wikipedia.org/wiki/Atto-"> (a)</a></label>
                <input v-model.number="deployOpts.amount" class="w-full p-2" id="dAmount" type="number" min="0" placeholder="amount">
              </div>
              <div class="mx-2 w-1/5">
                <label class="text-xs block mb-1" for="dFee">Fee <a class="text-black no-underline" target="_blank" href="https://en.wikipedia.org/wiki/Atto-"> (a)</a></label>
                <input v-model.number="deployOpts.fee" class="w-full p-2" id="dFee" type="number" placeholder="auto">
              </div>
              <div class="mx-2 w-1/5">
                <label class="text-xs block mb-1" for="dGas">Gas Limit</label>
                <input v-model.number="deployOpts.gas" class="w-full p-2" id="dGas" type="number" min="0" placeholder="gas">
              </div>

              <input v-model="deployOpts.callData" class="w-full p-2" type="hidden" value="callData">

            </div>

            <button class="py-2 rounded-full bg-black hover:bg-purple text-white p-2 px-4" @click="onDeploy">Deploy</button>
          </div>
          <div v-if="contractAddress" class="w-1/2 p-4 bg-grey-light rounded-sm shadow">
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
                <input v-model.number="staticGas" class="w-full p-2" id="staticGas" type="number" min="0" placeholder="gas">
              </div>
            </div>
            <div class="flex -mx-2 mt-4 mb-4">
              <div class="mx-2 w-full">
                <label class="text-xs block mb-1" for="staticArgs">Arguments</label>
                <input v-model="staticArgs" class="w-full p-2" id="staticArgs" type="text" placeholder="comma separated args">
              </div>
            </div>

            <div class="mt-2 mb-2" v-if="callStaticRes && !callStaticError">
              <label class="text-xs block mb-1">Call Result</label>
              <div class="w-full text-white bg-black text-xs mb-4 p-4 overflow-x-scroll font-mono">
                {{callStaticRes}}
              </div>
            </div>
            <div class="mt-2 mb-2" v-if="callStaticError">
              <label class="text-xs block mb-1 text-red">Errors</label>
              <textarea v-model="callStaticError" class="h-48 w-full text-red bg-black text-xs mb-4 p-4 overflow-x-scroll font-mono"></textarea>
            </div>

            <button class="py-2 rounded-full bg-black hover:bg-purple text-white p-2 px-4" @click="onCallStatic">Call Static</button>
          </div>
        </div>

        <div v-if="deployedContractInstance && byteCode" class="w-full p-4 bg-grey-light rounded-sm shadow mb-8">
          <h2 class="py-2">
            ⬆ Call Function
          </h2>
          <div class="flex -mx-2 mt-4 mb-4">
            <div class="mx-2 w-1/4">
              <label class="text-xs block mb-1" for="cGasPrice">Gas Price <a class="text-black no-underline" target="_blank" href="https://en.wikipedia.org/wiki/Atto-"> (a)</a></label>
              <input v-model.number="callOpts.gasPrice" class="w-full p-2" id="cGasPrice" type="number" min="1000000000" placeholder="gas price">
            </div>
            <div class="mx-2 w-1/4">
              <label class="text-xs block mb-1" for="cAmount">Amount <a class="text-black no-underline" target="_blank" href="https://en.wikipedia.org/wiki/Atto-"> (a)</a></label>
              <input v-model.number="callOpts.amount" class="w-full p-2" id="cAmount" type="number" min="0" placeholder="amount">
            </div>
            <div class="mx-2 w-1/4">
              <label class="text-xs block mb-1" for="cFee">Fee <a class="text-black no-underline" target="_blank" href="https://en.wikipedia.org/wiki/Atto-"> (a)</a></label>
              <input v-model.number="callOpts.fee" class="w-full p-2" id="cFee" type="number" placeholder="auto">
            </div>
            <div class="mx-2 w-1/4">
              <label class="text-xs block mb-1" for="cGas">Gas Limit</label>
              <input v-model.number="callOpts.gas" class="w-full p-2" id="cGas" type="number" min="0" placeholder="gas">
            </div>

            <input v-model="callOpts.callData" class="mx-2 w-1/2 p-2" type="hidden" value="callData">

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
            <textarea v-model="callError" class="h-16 w-full border border-solid border-black font-mono bg-black text-white mb-2"></textarea>
          </div>

          <button class="py-2 rounded-full bg-black hover:bg-purple text-white p-2 px-4" @click="onCallDataAndFunction">Call Function</button>
          <span v-if="waitingCall" class="text-sm text-red">Calling Function...</span>
        </div>
    </div>
  </div>
</template>

<script>
import { Universal, Node, MemoryAccount } from '@aeternity/aepp-sdk/es'
import * as Crypto from '@aeternity/aepp-sdk/es/utils/crypto'

import 'codemirror/keymap/sublime'
import 'codemirror/mode/haskell/haskell'
import 'codemirror/addon/merge/merge'

const compilerUrl = 'https://latest.compiler.aeternity.art'

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
      keypair: null,
      balance: 0,
      balanceInterval: null,
      byteCode: '',
      client: false,
      nodeUrl: 'https://testnet.aeternity.art',
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
        gas: 1000000,
        callData: ''
      },
      callOpts: {
        gasPrice: 1000000000,
        amount: 0,
        fee: null, // sdk will automatically select this
        gas: 1000000,
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
        return await this.client.compileContractAPI(code)
      } catch (err) {
        this.compileError = err
        console.log(err)
      }
    },
    async deploy (initArgs, options = {}) {
      initArgs = initArgs ? initArgs.split(',').map((arg) => { return arg.trim() }) : []

      console.log(`Deploying contract...`)
      try {
        const contractInstance = await this.client.getContractInstance(this.contractCode)
        this.deployedContractInstance = await contractInstance.deploy(initArgs, options)
        return contractInstance
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    async callStatic (func, args, gas) {
      console.log(`calling static func ${func} with args ${args}`)
      args = args ? args.split(',').map((arg) => { return arg.trim() }) : []
      const options = { callStatic: true, gas }
      const res = await this.deployedContractInstance.call(func, args, options)
      return { decoded: res.decodedResult, result: res.result }
    },
    async callContract (func, args, options) {
      args = args ? args.split(',').map((arg) => { return arg.trim() }) : []
      console.log(`calling a function on a deployed contract with func: ${func}, args: ${args} and options:`, options)
      try {
        return await this.deployedContractInstance.call(func, args, options)
      } catch (err) {
        console.log(err)
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

      this.modifySettings = false
      this.deployedContractInstance = ''
    },
    onCompile () {
      this.saveContract()
      this.resetData()
      this.compile(this.contractCode)
        .then(byteCodeObj => {
          this.contractAddress = undefined
          this.byteCode = byteCodeObj
        })
    },
    onDeploy () {
      this.deployInfo = 'Deploying and checking for mining status...'
      this.miningStatus = true
      const extraOpts = {
        'owner': this.keypair.publicKey,
        'code': this.contractCode
      }
      const opts = Object.assign(extraOpts, this.deployOpts)

      this.deploy(this.deployArgs, opts) // this waits until the TX is mined
        .then(data => {
          this.contractAddress = this.deployedContractInstance.address
          this.deployInfo = `Deployed, and mined at this address: ${this.contractAddress}`
          this.miningStatus = false
          this.deployedContractInstance = data
          this.deployError = ''
        })
        .catch(err => {
          this.deployError = `${err}`
        })
    },
    onCallStatic () {
      if (this.staticFunc) {
        this.callStatic(this.staticFunc, this.staticArgs, this.staticGas)
          .then(data => {
            this.callStaticRes = `Result: ` + JSON.stringify(data.decoded)
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
      const extraOpts = {
        'owner': this.keypair.publicKey,
        'code': this.contractCode
      }
      const opts = Object.assign(extraOpts, this.callOpts)

      if (this.nonStaticFunc) {
        this.waitingCall = true
        this.callContract(this.nonStaticFunc, this.nonStaticArgs, opts)
          .then(dataRes => {
            this.callRes = `Gas Used: ${dataRes.result.gasUsed} <br><br>---<br><br> Result: <br><br> ${dataRes.decodedResult}`
            this.callError = ''
            this.waitingCall = false
          })
          .catch(err => {
            this.callError = `${JSON.stringify(err)}`
            this.waitingCall = false
          })
      } else {
        this.callError = 'Please enter a Function and 1 or more Arguments.'
      }
    },
    async getClient () {
      this.client = await Universal({
        compilerUrl: compilerUrl,
        nodes: [
          {
            name: 'node',
            instance: await Node({ url: this.nodeUrl })
          }],
        accounts: [
          MemoryAccount({ keypair: this.keypair })
        ]
      })
    },
    getKeypair () {
      let keypairString = window.localStorage.getItem('testnet-keypair')
      let keypair = keypairString ? JSON.parse(keypairString) : Crypto.generateKeyPair()
      window.localStorage.setItem('testnet-keypair', JSON.stringify(keypair))
      return keypair
    },
    async fundAccount (publicKey) {
      const fundingClient = await Universal({
        compilerUrl: compilerUrl,
        nodes: [
          {
            name: 'node',
            instance: await Node({ url: this.nodeUrl })
          }],
        accounts: [
          MemoryAccount({
            keypair: {
              publicKey: 'ak_2qb5NUA8Dt41moZU7X2Tc2462Vb2nwRBrdWTuT2nUyAvdk8dHU',
              secretKey: '0f34e79602f94c9300509b71c1fed42a9f47eafeef1e25b6922e9044eb3d8e14f2051cda7937da54a4a568c60b60a69293469059bafd927a7a0d160a2ac208aa'
            }
          })
        ]
      })

      await fundingClient.spend(100000000000000000, publicKey)
    },
    saveContract () {
      window.localStorage.setItem('contract-code', this.contractCode)
    },
    getContract () {
      return window.localStorage.getItem('contract-code') ? window.localStorage.getItem('contract-code') : this.example
    },
    atAddress () {
      this.saveContract()
      this.resetData()

      this.byteCode = 'calling at address doesn\'t need bytecode'

      this.deployInfo = 'Instantiating Contract at address ...'
      this.miningStatus = true

      this.client.getContractInstance(this.contractCode, {contractAddress: this.contractAddress})
        .then(data => {
          console.log(data)
          this.deployInfo = `Instantiated Contract at address: ${this.contractAddress}`
          this.miningStatus = false
          this.deployedContractInstance = data
          this.deployError = ''
        })
        .catch(err => {
          this.deployError = `${err}`
        })
    },
    resetContract () {
      this.contractCode = this.example
      this.saveContract()
    }
  },
  async mounted () {
    try {
      this.keypair = this.getKeypair()
      this.contractCode = this.getContract()
      await this.getClient()
      if ((await this.client.balance(this.keypair.publicKey).catch(() => 0)) < 50000000000000000) await this.fundAccount(this.keypair.publicKey)
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
