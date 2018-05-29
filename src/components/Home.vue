<template>
  <div class="home">
    <div v-if="!this.account">
      <span>Account has not been set</span>
    </div>
    <div v-if="this.account">
      <span>Go ahead and test contracts!</span>
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
      account: account
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
        return await client.contracts.compile(contract, 'options')
      } catch (err) {
        console.log(err)
      }
    },
    async deploy (client, byteCode, account, options = {}) {
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
    }
  },
  mounted () {
    const AeClient = this.aeClient('https://sdk-testnet.aepps.com')
    AeClient.then(client => {
      console.log(this.contract)
      const byteCode = this.compile(client, this.contract)

      byteCode
        .then(byteCode => {
          this.callStatic(client, 'sophia', byteCode, 'main', '5999')
          this.deploy(client, byteCode, this.account, '') // this won't be resolved until the TX is mined
            .then(deployedData => {
              console.log('deployedData', deployedData)
              this.generateCallData(client, 'sophia', byteCode, 'main', '5999')
                .then(callData => {
                  console.log(`Generated Call Data:`)
                  console.log(callData)
                  console.log(`\n`)
                  console.log(`Calling function with generated Call Data...`)
                  this.callFunction(client, deployedData.contractAddress, callData)
                    .then(res => console.log(res))
                    .catch(err => console.log(err))
                // console.log('res', res)
                }).catch(err => console.log(err))
            }).catch(err => console.log(err))
        }).catch(err => console.log(err))
        .catch(err => console.log(err))
    }).catch(err => console.log(err))
  }
}
</script>

<style scoped lang="scss">
</style>
