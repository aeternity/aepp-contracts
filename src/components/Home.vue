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
          <button v-if="this.client" class="mt-2 rounded-full bg-black hover:bg-purple text-white p-2 px-4" @click="onCompile">Compile</button>
        </div>

        <div class="flex mt-8" v-if="byteCode">
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
              <input v-model="deployDeposit" class="mx-2 w-1/2 p-2" type="text" placeholder="deposit">
              <input v-model="deployGasPrice" class="mx-2 w-1/2 p-2" type="text" placeholder="gas price">
              <input v-model="deployAmount" class="mx-2 w-1/2 p-2" type="text" placeholder="amount">
              <input v-model="deployFee" class="mx-2 w-1/2 p-2" type="text" placeholder="fee">
              <input v-model="deployGas" class="mx-2 w-1/2 p-2" type="text" placeholder="gas">
              <input v-model="deployCallData" class="mx-2 w-1/2 p-2" type="hidden" value="callData">
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
            <div class="mt-2 mb-2" v-if="callStaticRes">Call Result: <br></div>
            <div v-if="callStaticRes" class="w-full text-white bg-black text-xs mb-4 font-mono">
              {{callStaticRes}}
            </div>
            <button class="py-2 rounded-full bg-black hover:bg-purple text-white p-2 px-4" @click="onCallStatic">Call Static</button>
          </div>
        </div>

        <div v-if="deployedDataObj" class="w-full p-4 bg-grey-light rounded-sm shadow mt-8">
          <h2 class="py-2">
            Call Function
          </h2>
          <div class="flex -mx-2 mt-4 mb-4">
            <input v-model="staticDeposit" class="mx-2 w-1/2 p-2" type="text" placeholder="deposit">
            <input v-model="staticGasPrice" class="mx-2 w-1/2 p-2" type="text" placeholder="gas price">
            <input v-model="staticAmount" class="mx-2 w-1/2 p-2" type="text" placeholder="amount">
            <input v-model="staticFee" class="mx-2 w-1/2 p-2" type="text" placeholder="fee">
            <input v-model="staticGas" class="mx-2 w-1/2 p-2" type="text" placeholder="gas">
            <input v-model="staticCallData" class="mx-2 w-1/2 p-2" type="hidden" value="callData">
          </div>
          <div class="flex -mx-2 mt-4 mb-4">
            <input v-model="nonStaticFunc" class="mx-2 w-1/2 p-2" type="text" placeholder="function">
              <input v-model="nonStaticArgs" class="mx-2 w-1/2 p-2" type="text" placeholder="arguments">
          </div>
          <button class="py-2 rounded-full bg-black hover:bg-purple text-white p-2 px-4" @click="onCallDataAndFunction">Call Function</button>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import Ae, { Contract, Wallet } from '@aeternity/aepp-sdk/src'
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
      callStaticRes: '',
      staticFunc: '',
      staticArgs: '',
      nonStaticFunc: '',
      nonStaticArgs: '',
      deployDeposit: 1,
      deployGasPrice: 1,
      deployAmount: 1,
      deployFee: 1,
      deployGas: 40000000,
      deployCallData: '',
      deployError: '',
      callDeposit: '',
      callGasPrice: '',
      callFee: '',
      callGas: '',
      callAmount: '',
      callCallData: ''
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
        return contract.compile(code)
      } catch (err) {
        console.log(err)
      }
    },
    async deploy (options = {}) {
      console.log(`Deploying contract...`, account)
      try {
        return this.byteCodeObj.deploy(options) // TODO: send more options like: {amount: 10, abi: 'sophia'}
      } catch (err) {
        console.log(err)
      }
    },
    async callStatic (func, arg = '1') {
      console.log(`calling static func ${func} with args ${arg}`)
      try {
        return this.byteCodeObj.call(
          func,
          { args: arg }
        )
      } catch (err) {
        console.log(err)
      }
    },
    async callContract (contractAddress, func, arg) {
      // console.log(`Calling a function ...`)
      try {
        return this.deployedDataObj.call(
          contractAddress,
          func,
          { args: arg }
        )
      } catch (err) {
        console.log(err)
      }
    },
    onCompile () {
      this.deployedData = false
      this.deployInfo = ''
      this.minedData = false
      this.miningStatus = false
      this.compile(this.client, this.contractCode)
        .then(byteCodeObj => {
          this.byteCodeObj = byteCodeObj
          this.byteCode = byteCodeObj.bytecode
        })
    },
    onDeploy () {
      this.deployInfo = 'Deploying and checking for mining status...'
      this.miningStatus = true

      const opts = {
        'owner': account.pub,
        'code': this.contractCode,
        'deposit': this.deployDeposit || 1,
        'vmVersion': 1,
        'gasPrice': this.deployGasPrice || 1,
        'amount': this.deployAmount || 1,
        'fee': this.deployFee || 1,
        'gas': this.deployGas || 40000000,
        // 'callData': this.deployCallData,
        // 'nonce': 0,
        'ttl': 9999999
      }

      this.deploy(opts) // this waits until the TX is mined
        .then(data => {
          this.deployInfo = 'Deployed, and mined'
          this.miningStatus = false
          this.deployedDataObj = data
        })
        .catch(err => {
          this.deployError = `${err}`
          console.log(`Error during Deploy: ${err}`)
        })
    },
    onCallStatic () {
      this.callStatic(this.staticFunc, this.staticArgs)
        .then(data => {
          this.callStaticRes = data
        })
        .catch(err => {
          console.log(`Error: ${err}`)
        })
      // this.staticFuncField
      // this.staticArgsField
    },
    onCallDataAndFunction () {
      // const opts = {
      //   'owner': account.pub,
      //   'code': this.contractCode,
      //   'deposit': this.callDeposit,
      //   'vm_version': 153,
      //   'gasPrice': this.callGasPrice,
      //   'amount': this.callAmount,
      //   'fee': this.callFee,
      //   'gas': this.callGas,
      //   // 'callData': this.callCallData,
      //   // 'nonce': 0,
      //   'ttl': 99999
      // }
      // this.nonStaticFuncField
      // this.nonStaticArgsField
    }
  },
  mounted () {
    console.log(account)
    Ae.create(this.host, {debug: true}).then(client => {
      this.client = client
    })
  }
}
</script>

<style scoped lang="css">
</style>
