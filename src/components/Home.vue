<template>
  <div class="home container mx-auto">
    <div v-if="!this.account">
      <span>Error: Account not been set!</span>
    </div>
    <div v-if="!this.client">

    </div>
    <div v-if="this.account">
      <h1 class="py-2">
        Test contracts
        <span v-if="!this.client" class="text-sm text-red">(connecting to client...)</span>
        <span v-if="this.client" class="text-sm text-green">(client connected to {{this.host}})</span>
      </h1>
      <div class="mt-8 -mx-2">
        <div class="w-full p-4 bg-grey-light rounded-sm shadow">
          <h2 class="py-2">
            Sophia Contract's Code:
          </h2>
          <textarea v-model="contractCode" class="h-64 w-full border border-solid border-black font-mono bg-black text-white"></textarea>
          <div v-if="compileError">
            <textarea v-model="compileError" class="h-64 w-full border border-solid border-black font-mono bg-black text-white"></textarea>
          </div>

          <button v-if="this.client" class="mt-2 rounded-full bg-black hover:bg-purple text-white p-2 px-4" @click="onCompile">Compile</button>
        </div>

        <div class="flex mt-8 mb-8" v-if="byteCode">
          <div class="w-1/2 p-4 bg-grey-light rounded-sm shadow">
            <h2 class="py-2">
              Byte Code <span class="text-sm" v-bind:class="{ 'text-red' : !deployedDataObj, 'text-green' : deployedDataObj }">{{deployInfo}}</span>
            </h2>
            <textarea v-model="byteCode" class="h-16 w-full border border-solid border-black font-mono bg-black text-white text-xs"></textarea>

            <div class="mt-2 mb-2" v-if="deployError">Issues with Deploy: <br></div>
            <div v-if="deployError" class="w-full text-white bg-black text-xs mb-4 font-mono">
              {{deployError}}
            </div>

            <div class="flex -mx-2 mt-4 mb-4">
              <input v-model="deployFunc" class="mx-2 w-1/2 p-2" type="text" value="init" disabled>
              <input v-model="deployArgs" class="mx-2 w-1/2 p-2" type="text" placeholder="arguments">
            </div>
            <div class="flex -mx-2 mt-4 mb-4">
              <input v-model="deployOpts.deposit" class="mx-2 w-1/2 p-2" type="text" placeholder="deposit">
              <input v-model="deployOpts.gasPrice" class="mx-2 w-1/2 p-2" type="text" placeholder="gas price">
              <input v-model="deployOpts.amount" class="mx-2 w-1/2 p-2" type="text" placeholder="amount">
              <input v-model="deployOpts.fee" class="mx-2 w-1/2 p-2" type="text" placeholder="fee">
              <input v-model="deployOpts.gas" class="mx-2 w-1/2 p-2" type="text" placeholder="gas">
              <input v-model="deployOpts.callData" class="mx-2 w-1/2 p-2" type="hidden" value="callData">
            </div>

            <button class="py-2 rounded-full bg-black hover:bg-purple text-white p-2 px-4" @click="onDeploy">Deploy</button>
          </div>

          <div class="w-1/2 p-4 bg-grey-light rounded-sm shadow">
            <h2 class="py-2">
              ⬅ Call Static Function
            </h2>
            <div class="flex -mx-2 mt-4 mb-4">
              <input v-model="staticFunc" class="mx-2 w-1/2 p-2" type="text" placeholder="function">
              <input v-model="staticArgs" class="mx-2 w-1/2 p-2" type="text" placeholder="arguments">
            </div>

            <div class="mt-2 mb-2" v-if="callStaticRes && !callStaticError">Call Result: <br>
              <div class="w-full text-white bg-black text-xs mb-4 p-4 overflow-x-scroll font-mono">
                {{callStaticRes}}
              </div>
            </div>
            <div class="mt-2 mb-2" v-if="callStaticError">Errors: <br>
              <textarea v-model="callStaticError" class="h-16 w-full border border-solid border-black font-mono bg-black text-white mb-2"></textarea>
            </div>

            <button class="py-2 rounded-full bg-black hover:bg-purple text-white p-2 px-4" @click="onCallStatic">Call Static</button>
          </div>
        </div>

        <div v-if="deployedDataObj && byteCode" class="w-full p-4 bg-grey-light rounded-sm shadow mb-8">
          <h2 class="py-2">
            ⬆ Call Function
          </h2>
          <div class="flex -mx-2 mt-4 mb-4">
            <input v-model="callOpts.deposit" class="mx-2 w-1/2 p-2" type="text" placeholder="deposit">
            <input v-model="callOpts.gasPrice" class="mx-2 w-1/2 p-2" type="text" placeholder="gas price">
            <input v-model="callOpts.amount" class="mx-2 w-1/2 p-2" type="text" placeholder="amount">
            <input v-model="callOpts.fee" class="mx-2 w-1/2 p-2" type="text" placeholder="fee">
            <input v-model="callOpts.gas" class="mx-2 w-1/2 p-2" type="text" placeholder="gas">
            <input v-model="callOpts.callData" class="mx-2 w-1/2 p-2" type="hidden" value="callData">
          </div>
          <div class="flex -mx-2 mt-4 mb-4">
            <input v-model="nonStaticFunc" class="mx-2 w-1/2 p-2" type="text" placeholder="function">
              <input v-model="nonStaticArgs" class="mx-2 w-1/2 p-2" type="text" placeholder="arguments">
          </div>

          <div class="mt-2 mb-2" v-if="callRes && !callError">Call Result: <br>
            <div class="w-full text-white bg-black text-xs mb-4 p-4 overflow-x-scroll font-mono">
              {{callRes}}
            </div>
          </div>
          <div class="mt-2 mb-2" v-if="callError">Errors: <br>
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
import Ae, { Contract, Wallet } from '@aeternity/aepp-sdk'
import account from '../account.js'

export default {
  name: 'Home',
  components: {
  },
  data () {
    return {
      contractCode: `contract Identity =
  type state = ()
  function main(x : int) = x`,
      account: account,
      byteCode: '',
      client: false,
      host: 'https://sdk-testnet.aepps.com',
      deployedDataObj: false,
      deployInfo: '',
      minedData: false,
      miningStatus: '',
      wallet: false,
      byteCodeObj: {},
      deployFunc: 'init',
      deployArgs: '()',
      staticFunc: '',
      staticArgs: '()',
      nonStaticFunc: '',
      nonStaticArgs: '',
      deployOpts: {
        deposit: 1,
        gasPrice: 1,
        amount: 1,
        fee: 1,
        gas: 40000000,
        callData: ''
      },
      callOpts: {
        deposit: 1,
        gasPrice: 1,
        amount: 1,
        fee: 1,
        gas: 40000000,
        callData: ''
      },
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
    async compile (client, code) {
      console.log(`Compiling contract...`)
      const wallet = Wallet.create(this.client, account)
      const contract = Contract.create(this.client, { wallet })
      try {
        console.log(`Compiled!`)
        return await contract.compile(code)
      } catch (err) {
        this.compileError = err
        console.log(err)
      }
    },
    async deploy (options = {}) {
      console.log(`Deploying contract...`, account)
      try {
        return this.byteCodeObj.deploy(options)
      } catch (err) {
        console.log(err)
      }
    },
    async callStatic (func, args = '1') {
      console.log(`calling static func ${func} with args ${args}`)
      try {
        return this.byteCodeObj.call(
          func,
          { args: args }
        )
      } catch (err) {
        console.log(err)
      }
    },
    async callContract (func, args, opts) {
      console.log(`calling a function on a deployed contract with func: ${func}, args: ${args} and options:`, opts)

      try {
        return this.deployedDataObj.call(
          func,
          {
            args,
            opts
          }
        )
      } catch (err) {
        console.log(err)
      }
    },
    onCompile () {
      this.compileError = ''
      this.callError = ''
      this.deployError = ''
      this.callStaticError = ''
      this.deployedData = false
      this.deployInfo = ''
      this.minedData = false
      this.miningStatus = false
      this.byteCode = false

      this.compile(this.client, this.contractCode)
        .then(byteCodeObj => {
          this.byteCodeObj = byteCodeObj
          this.byteCode = byteCodeObj.bytecode
        })
    },
    onDeploy () {
      this.deployInfo = 'Deploying and checking for mining status...'
      this.miningStatus = true
      const extraOpts = {
        'owner': account.pub,
        'code': this.contractCode,
        'vmVersion': 1,
        'nonce': 0,
        'ttl': 9999999
      }
      const opts = Object.assign(extraOpts, this.deployOpts)

      this.deploy(opts) // this waits until the TX is mined
        .then(data => {
          this.deployInfo = `Deployed, and mined (Address: ${data.address})`
          this.miningStatus = false
          this.deployedDataObj = data
        })
        .catch(err => {
          this.deployError = `${err}`
        })
    },
    onCallStatic () {
      if (this.staticFunc && this.staticArgs) {
        this.callStatic(this.staticFunc, this.staticArgs)
          .then(data => {
            this.callStaticRes = data
            this.callStaticError = ''
          })
          .catch(err => {
            this.callStaticError = `${err}`
          })
      } else {
        this.callStaticError = 'Please enter a Function and 1 or more Arguments.'
      }
    },
    onCallDataAndFunction () {
      const extraOpts = {
        'owner': account.pub,
        'code': this.contractCode,
        'vmVersion': 1,
        'nonce': 0,
        'ttl': 9999999
      }
      const opts = Object.assign(extraOpts, this.callOpts)

      if (this.nonStaticFunc && this.nonStaticArgs) {
        this.waitingCall = true
        this.callContract(this.nonStaticFunc, this.nonStaticArgs, opts)
          .then(data => {
            this.callRes = data
            this.callError = ''
            this.waitingCall = false
          })
          .catch(err => {
            this.callError = `${err}`
            this.waitingCall = false
          })
      } else {
        this.callError = 'Please enter a Function and 1 or more Arguments.'
      }
    }
  },
  async mounted () {
    this.client = await Ae.create(this.host, {debug: true})
  }
}
</script>

<style scoped lang="css">
</style>
