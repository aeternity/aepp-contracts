<template>
  <div class="home container mx-auto">

    <h6 class="mt-8 font-mono text-sm text-purple" v-if="!modifySettings" @click="modifySettings = true">
      <span class="text-black">Account: </span> {{ account.pub }}
    </h6>
    <h6 class="mt-8 cursor-pointer hover:text-purple" v-if="!modifySettings" @click="modifySettings = true">
      Settings
    </h6>

    <div v-if="!this.account.priv || !this.account.pub || !this.url || this.modifySettings">
      <div class="flex mt-8 mb-8">
        <div class="w-full p-4 bg-grey-light rounded-sm shadow">
          <h2 class="py-2">
            Settings
          </h2>
          <div class="flex -mx-2 mt-4 mb-4">
            <div class="mx-2 w-1/3">
              <label class="text-xs block mb-1" for="host">Host</label>
              <input v-model="url" class="w-full p-2" id="host" type="text" placeholder="https://sdk-testnet.aepps.com">
            </div>
            <div class="mx-2 w-1/3">
              <label class="text-xs block mb-1" for="accountPriv">Private Key</label>
              <input v-model="account.priv" class="w-full p-2" id="accountPriv" type="password" placeholder="Private Key">
            </div>
            <div class="mx-2 w-1/3">
              <label class="text-xs block mb-1" for="accountPub">Public Key</label>
              <input v-model="account.pub" class="w-full p-2" id="accountPub" type="text" placeholder="Public Key">
            </div>
          </div>
          <button class="mt-2 rounded-full bg-black hover:bg-purple text-white p-2 px-4" @click="onSettings">Save</button>
        </div>
      </div>
    </div>

    <div v-if="this.account.priv && this.account.pub && this.url">
      <h1 class="py-2">
        Test contracts
        <span v-if="!this.client && !this.clientError" class="text-sm text-red">
          (connecting to {{this.url}}...)
        </span>
        <span v-if="this.clientError" class="text-sm text-red">
          Error connecting to {{this.url}} – <span class="cursor-pointer underline" @click="modifySettings = true">Modify Settings</span>
          <br>
          {{this.clientError}}
        </span>
        <span v-if="this.client" class="text-sm text-green">
          ({{this.url}})
        </span>
      </h1>
      <div class="mt-8 -mx-2" v-if="!this.clientError">
        <div class="w-full p-4 bg-grey-light rounded-sm shadow">
          <h2 class="py-2 inline-block">
            Sophia Contract's Code:
          </h2>

          <div class="relative">
            <codemirror v-model="contractCode" :options="cmOption"></codemirror>
            <div class='absolute pin-b pin-r'>
              <select v-model="cmOption.keyMap" class="block appearance-none w-full py-2 px-4 rounded-none pr-8">
                <option :key="idx" v-for='(m, idx) in keymaps'>
                  {{m}}
                </option>
              </select>
              <div class="pointer-events-none absolute pin-y pin-r flex items-center px-2 text-grey-darker">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            </div>

          <div v-if="compileError">
            <label class="text-xs block mb-1 text-red">Errors</label>
            <textarea v-model="compileError" class="h-64 w-full border border-solid border-black font-mono bg-black text-red"></textarea>
          </div>

          <button v-if="this.client" class="mt-2 rounded-full bg-black hover:bg-purple text-white p-2 px-4" @click="onCompile">Compile</button>
        </div>

        <div class="flex mt-8 mb-8" v-if="byteCode">
          <div class="w-1/2 p-4 bg-grey-light rounded-sm shadow">
            <h2 class="py-2">
              Byte Code
              <div class="w-full text-xs" v-bind:class="{ 'text-red' : !deployedDataObj, 'text-green' : deployedDataObj }">
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
                <input v-model="deployArgs" class="w-full p-2" id="deployArgs" type="text" placeholder="()">
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
              <div class="mx-2 w-1/2">
                <label class="text-xs block mb-1" for="staticArgs">Arguments</label>
                <input v-model="staticArgs" class="w-full p-2" id="staticArgs" type="text" placeholder="()">
              </div>
              <div class="mx-2 w-1/2">
                <label class="text-xs block mb-1" for="staticSophiaTypeInput">Return Type</label>
                <input v-model="staticSophiaType" class="w-full p-2" id="staticSophiaTypeInput" type="text" placeholder="Sophia Type" value="int">
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

        <div v-if="deployedDataObj && byteCode" class="w-full p-4 bg-grey-light rounded-sm shadow mb-8">
          <h2 class="py-2">
            ⬆ Call Function
          </h2>
          <div class="flex -mx-2 mt-4 mb-4">
            <div class="mx-2 w-1/5">
              <label class="text-xs block mb-1" for="cGasPrice">Gas Price <a class="text-black no-underline" target="_blank" href="https://en.wikipedia.org/wiki/Atto-"> (a)</a></label>
              <input v-model.number="callOpts.gasPrice" class="w-full p-2" id="cGasPrice" type="number" min="1000000000" placeholder="gas price">
            </div>
            <div class="mx-2 w-1/5">
              <label class="text-xs block mb-1" for="cAmount">Amount <a class="text-black no-underline" target="_blank" href="https://en.wikipedia.org/wiki/Atto-"> (a)</a></label>
              <input v-model.number="callOpts.amount" class="w-full p-2" id="cAmount" type="number" min="0" placeholder="amount">
            </div>
            <div class="mx-2 w-1/5">
              <label class="text-xs block mb-1" for="cFee">Fee <a class="text-black no-underline" target="_blank" href="https://en.wikipedia.org/wiki/Atto-"> (a)</a></label>
              <input v-model.number="callOpts.fee" class="w-full p-2" id="cFee" type="number" placeholder="auto">
            </div>
            <div class="mx-2 w-1/5">
              <label class="text-xs block mb-1" for="cGas">Gas Limit</label>
              <input v-model.number="callOpts.gas" class="w-full p-2" id="cGas" type="number" min="0" placeholder="gas">
            </div>

            <input v-model="callOpts.callData" class="mx-2 w-1/2 p-2" type="hidden" value="callData">

          </div>
          <div class="flex -mx-2 mt-4 mb-4">
            <div class="mx-2 w-1/3">
              <label class="text-xs block mb-1" for="func">Function</label>
              <input v-model="nonStaticFunc" class="w-full p-2" id="func" type="text" placeholder="function">
            </div>
            <div class="mx-2 w-1/3">
              <label class="text-xs block mb-1" for="args">Arguments</label>
              <input v-model="nonStaticArgs" class="w-full p-2" id="args" type="text" placeholder="()">
            </div>
            <div class="mx-2 w-1/3">
              <label class="text-xs block mb-1" for="sophiaTypeInput">Return Type</label>
              <input v-model="sophiaType" class="w-full p-2" id="sophiaTypeInput" type="text" placeholder="Sophia Type">
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
  </div>
</template>

<script>
// import Wallet from '@aeternity/aepp-sdk/es/ae/wallet.js'
import Ae from '@aeternity/aepp-sdk/es/ae/universal'
// import Contract from '@aeternity/aepp-sdk/es/ae/contract.js'
// import MemoryAccount from '@aeternity/aepp-sdk/es/account/memory.js'
import settingsData from '../settings.js'
import { codemirror } from 'vue-codemirror'
import { contractSource } from './contractSrc'
const compilerUrl = 'https://latest.compiler.aepps.com'

export default {
  name: 'Home',
  components: {
    codemirror
  },
  data () {
    return {
      modifySettings: false,
      keymaps: [
        'sublime',
        'vim',
        'emacs'
      ],
      cmOption: {
        keyMap: 'sublime',
        indentUnit: 2,
        styleActiveLine: true,
        lineNumbers: true,
        mode: 'text/javascript',
        theme: 'base16-dark',
        extraKeys: { Tab: this.usingSpacesInsteadTab }
      },
      contractCode: contractSource,
      account: settingsData.account ? settingsData.account : {priv: null, pub: null},
      balance: 0,
      balanceInterval: null,
      byteCode: '',
      client: false,
      url: settingsData.url ? settingsData.url : null,
      deployedDataObj: false,
      deployInfo: '',
      minedData: false,
      miningStatus: '',
      wallet: false,
      deployFunc: 'init',
      deployArgs: '',
      staticFunc: 'main',
      staticArgs: '',
      staticSophiaType: 'int',
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
      waitingCall: false,
      sophiaType: 'int',
      sophiaTypes: [
        'uint',
        'int',
        'address',
        'bool',
        'string',
        'list',
        'tuple',
        'record',
        'map',
        'option(\'a)',
        'state',
        'transactions',
        'events',
        'oracle(\'a, \'b)',
        'oracle_query(\'a, \'b)'
      ],
      deployedInfo: ''
    }
  },
  props: {
    query: {
      type: Object
    }
  },
  watch: {
    keyMap (mapName) {
      try {
        window.localStorage.setItem('cmkeyMap', mapName)
      } catch (e) {
        /* handle error */
      }
    }
  },
  computed: {
    keyMap () {
      return this.cmOption.keyMap
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

      console.log(`Deploying contract...`, this.account)
      try {
        const contractInstance = await this.client.getContractInstance(this.contractCode)
        this.deployedInfo = await contractInstance.deploy(initArgs, options)
        return contractInstance
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    async callStatic (func, args) {
      console.log(`calling static func ${func} with args ${args}`)
      args = args ? args.split(',').map((arg) => { return arg.trim() }) : []
      const options = { callStatic: true }
      const res = await this.deployedDataObj.call(func, args, options)
      return { decoded: await res.decode(this.staticSophiaType), result: res.result }
    },
    async callContract (func, args, options) {
      args = args ? args.split(',').map((arg) => { return arg.trim() }) : []
      console.log(`calling a function on a deployed contract with func: ${func}, args: ${args} and options:`, options)
      try {
        return await this.deployedDataObj.call(func, args, options)
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
      this.deployedData = false
      this.deployedDataObj = false
      this.deployInfo = ''
      this.minedData = false
      this.miningStatus = false
      this.byteCode = false

      this.modifySettings = false
      this.deployedInfo = ''
      // const self = this
      // this.assignBalance(this.account.pub).then(balance => { self.balance = balance })
    },
    onSettings () {
      this.client = false
      this.clientError = false
      this.resetData()
      this.getClient()
    },
    onCompile () {
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
        'owner': this.account.pub,
        'code': this.contractCode
        // 'vmVersion': 1
        // 'nonce': 0,
        // 'ttl': 9999999
      }
      const opts = Object.assign(extraOpts, this.deployOpts)

      this.deploy(this.deployArgs, opts) // this waits until the TX is mined
        .then(data => {
          this.contractAddress = this.deployedInfo.address
          this.deployInfo = `Deployed, and mined at this address: ${this.deployedInfo.address}`
          this.miningStatus = false
          this.deployedDataObj = data
          this.deployError = ''
        })
        .catch(err => {
          this.deployError = `${err}`
        })
    },
    onCallStatic () {
      if (this.staticFunc) {
        this.callStatic(this.staticFunc, this.staticArgs)
          .then(data => {
            this.callStaticRes = `Result: ` + JSON.stringify(data.decoded)
            this.callStaticError = ''
          })
          .catch(err => {
            err = err.response ? err.response.data.reason : 'Unknown error'
            this.callStaticError = `${err}`
          })
      } else {
        this.callStaticError = 'Please enter a Function and 1 or more Arguments.'
      }
    },
    async assignBalance (accountPub) {
      return this.client.balance(accountPub).then(balance => {
        return balance
      })
    },
    onCallDataAndFunction () {
      const extraOpts = {
        'owner': this.account.pub,
        'code': this.contractCode
        // 'vmVersion': 1
        // 'nonce': 0,
        // 'ttl': 9999999
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
            this.callError = `${JSON.stringify(err.message)}`
            this.waitingCall = false
          })
      } else {
        this.callError = 'Please enter a Function and 1 or more Arguments.'
      }
    },
    async getClient () {
      if (this.account.priv && this.account.pub && this.url) {
        try {
          const networkId = settingsData.networkId

          const clientNative = await Ae.compose({
            props: {
              url: this.url,
              internalUrl: settingsData.internalUrl,
              compilerUrl: compilerUrl
            }
          })({nativeMode: true, networkId})

          const account = { secretKey: this.account.priv, publicKey: this.account.pub }

          await clientNative.setKeypair(account)

          this.client = clientNative
        } catch (err) {
          this.clientError = `${err} (wrong private/public key)`
        }
      }
    }
  },
  mounted () {
    try {
      const mapName = window.localStorage.getItem('cmkeyMap')
      if (mapName) this.cmOption.keyMap = mapName
    } catch (e) {
      /* handle error */
    }

    this.getClient()
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
