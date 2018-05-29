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
          <textarea v-model="contract" class="h-64 w-full border border-solid border-black font-mono bg-black text-white"></textarea>
          <button v-if="this.client" class="mt-2 rounded-full bg-black hover:bg-purple text-white p-2 px-4" @click="onCompile">Compile</button>
        </div>

        <div class="flex mt-8" v-if="byteCode">
          <div class="w-1/2 p-4 bg-grey-light rounded-sm shadow">
            <h2 class="py-2">
              Byte Code <span class="text-sm" v-bind:class="{ 'text-red' : !deployedData, 'text-green' : deployedData }">{{deployInfo}}</span>
            </h2>
            <textarea v-model="byteCode" class="h-16 w-full border border-solid border-black font-mono bg-black text-white text-xs"></textarea>

            <div class="flex -mx-2 mt-4 mb-4">
              <input class="mx-2 w-1/2 p-2" type="text" value="init" disabled>
              <input class="mx-2 w-1/2 p-2" type="text" placeholder="arguments">
            </div>
            <div class="flex -mx-2 mt-4 mb-4">
              <input class="mx-2 w-1/2 p-2" type="text" placeholder="deposit">
              <input class="mx-2 w-1/2 p-2" type="text" placeholder="gas price">
              <input class="mx-2 w-1/2 p-2" type="text" placeholder="amount">
              <input class="mx-2 w-1/2 p-2" type="text" placeholder="fee">
              <input class="mx-2 w-1/2 p-2" type="text" placeholder="gas">
              <input class="mx-2 w-1/2 p-2" type="hidden" value="callData">
            </div>
            <button class="py-2 rounded-full bg-black hover:bg-purple text-white p-2 px-4" @click="onDeploy">Deploy</button>

            <button v-if="!minedData && deployedData" class="py-2 rounded-full bg-black hover:bg-purple text-white p-2 px-4" @click="onCheckMininStatus">Check Mining Status</button>
            <span v-if="minedInfo" class="text-sm" v-bind:class="{ 'text-red' : !minedData, 'text-green' : minedData }">{{minedInfo}}</span>
          </div>

          <div class="w-1/2 p-4 bg-grey-light rounded-sm shadow">
            <h2 class="py-2">
              ⬅ Call Static Function
            </h2>
            <div class="flex -mx-2 mt-4 mb-4">
              <input class="mx-2 w-1/2 p-2" type="text" placeholder="function">
              <input class="mx-2 w-1/2 p-2" type="text" placeholder="arguments">
            </div>
            <button class="py-2 rounded-full bg-black hover:bg-purple text-white p-2 px-4" @click="onCallStatic">Call Static</button>
          </div>
        </div>

        <div class="w-full p-4 bg-grey-light rounded-sm shadow mt-8" v-if="minedData">
          <h2 class="py-2">Function Call</h2>
          <div class="flex -mx-2 mt-4 mb-4">
            <input class="mx-2 w-1/2 p-2" type="text" placeholder="function">
            <input class="mx-2 w-1/2 p-2" type="text" placeholder="arguments">
          </div>
          <button class="py-2 rounded-full bg-black hover:bg-purple text-white p-2 px-4" @click="onCallDataAndFunction">Call!</button>
        </div>

         <div v-if="minedData">
           <h2>
              Call Function
            </h2>
         </div>

      </div>
    </div>
  </div>
</template>

<script>
import { AeternityClient } from '@aeternity/aepp-sdk'
import url from 'url'
import account from '../account.js'

export default {
  name: 'Home',
  components: {
  },
  data () {
    return {
      contract: `contract Identity =
  type state = ()
  function main(x : int) = x`,
      account: account,
      byteCode: '',
      client: false,
      host: 'https://sdk-testnet.aepps.com',
      deployedData: false,
      deployInfo: '',
      minedData: false,
      minedInfo: ''
    }
  },
  props: {
    query: {
      type: Object
    }
  },
  methods: {
    async aeClient (host) {
      const node = url.parse(host)
      const secured = node.protocol === 'https:'
      const port = node.port || (secured ? 443 : 80)

      console.log(`Attempting to connect to ${host}...`)
      const provider = new AeternityClient.providers.HttpProvider(node.hostname, port, { secured })
      await provider.ready
      const client = new AeternityClient(provider)

      return client
    },
    async compile (client, contract) {
      console.log(`Compiling contract...`)
      try {
        console.log(`Compiled!`)
        return await client.contracts.compile(contract, 'options')
      } catch (err) {
        console.log(err)
      }
    },
    async deployAndWait (client, byteCode, account, options = {}) {
      console.log(`Deploying contract...`, account)
      try {
        const deployedContract = await client.contracts.deployContract(byteCode, account, {amount: 10})
        return await client.tx.waitForTransaction(deployedContract.txHash).then((blockHeight) => {
          console.log(`Contract deployed successfully on block ${blockHeight}`)
          return deployedContract
        })
      } catch (err) {
        console.log(err)
      }
    },
    async deploy (client, byteCode, account, options = {}) {
      console.log(`Deploying contract...`, account)
      try {
        return await client.contracts.deployContract(byteCode, account, {amount: 10})
      } catch (err) {
        console.log(err)
      }
    },
    async waitForMining (client, txHash) {
      try {
        return await client.tx.waitForTransaction(txHash).then((blockHeight) => {
          console.log(`Contract deployed successfully on block ${blockHeight}`)
          return blockHeight
        })
      } catch (err) {
        console.log(err)
      }
    },
    async callStatic (client, abi = 'sophia', byteCode, staticFunction = 'main', staticArguments = '1') {
      // console.log(`Calling static function "${staticFunction}" with ABI "${abi}", FUNCTION ${staticFunction}, ARGS ${staticArguments} ...`)
      try {
        return await client.contracts.callStatic(
          abi,
          byteCode,
          staticFunction,
          staticArguments
        )
      } catch (err) {
        console.log(err)
      }
    },
    async generateCallData (client, abi = 'sophia', byteCode, staticFunction = 'main', staticArguments = ['1']) {
      // console.log(`Generating callData ...`)
      try {
        return await client.contracts.encodeCallData(
          abi,
          byteCode,
          staticFunction,
          staticArguments.split(',')
        )
      } catch (err) {
        console.log(err)
      }
    },
    async callFunction (client, contractAddress, callData) {
      // console.log(`Calling a function ...`)
      try {
        return await client.contracts.getCallTx(
          contractAddress,
          callData,
          { caller: this.account.pub,
            amount: 10
          }
        )
      } catch (err) {
        console.log(err)
      }
    },
    onCompile () {
      this.deployedData = false
      this.deployInfo = ''
      this.minedData = false
      this.minedInfo = ''
      const byteCodeRes = this.compile(this.client, this.contract)
      byteCodeRes
        .then(code => {
          this.byteCode = code
        })
        .catch(err => {
          console.log(`Error: ${err}`)
        })
    },
    onDeploy () {
      this.deployInfo = 'Deploying...'
      this.deploy(this.client, this.byteCode, this.account, '') // this won't be resolved until the TX is mined
        .then(data => {
          this.deployInfo = 'Deployed, but not mined'
          this.deployedData = data
        })
        .catch(err => {
          console.log(`Error: ${err}`)
        })
    },
    onCheckMininStatus () {
      this.minedInfo = 'Checking for mining status...'
      this.waitForMining(this.client, this.deployedData.txHash)
        .then(data => {
          this.deployInfo = `Deployed and mined! #${data}`
          this.minedInfo = false
          this.minedData = data
        })
        .catch(err => {
          console.log(`Error: ${err}`)
        })
    },
    onCallStatic () {

    },
    onCallDataAndFunction () {

    }
  },
  mounted () {
    const AeClient = this.aeClient(this.host)
    AeClient.then(client => {
      console.log('connected')
      this.client = client
    })
    // AeClient.then(client => {
    //   console.log(this.contract)
    //   const byteCode = this.compile(client, this.contract)

    //   byteCode
    //     .then(byteCode => {
    //       this.callStatic(client, 'sophia', byteCode, 'main', '5999')
    //       this.deploy(client, byteCode, this.account, '') // this won't be resolved until the TX is mined
    //         .then(deployedData => {
    //           this.byteCode = byteCode
    //           console.log('deployedData', deployedData)
    //           this.generateCallData(client, 'sophia', byteCode, 'main', '5999')
    //             .then(callData => {
    //               console.log(`Generated Call Data:`)
    //               console.log(callData)
    //               console.log(`\n`)
    //               console.log(`Calling function with generated Call Data...`)
    //               this.callFunction(client, deployedData.contractAddress, callData)
    //                 .then(res => console.log(res))
    //                 .catch(err => console.log(err))
    //             // console.log('res', res)
    //             }).catch(err => console.log(err))
    //         }).catch(err => console.log(err))
    //     }).catch(err => console.log(err))
    //     .catch(err => console.log(err))
    // }).catch(err => console.log(err))
  }
}
</script>

<style scoped lang="css">
</style>
