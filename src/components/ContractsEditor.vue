<template>
  <div class="contracts-editor">
    <h1>Sofia Contract compile (Block height: {{height}})</h1>
    <form class="server-form">
      <input placeholder="External route" v-model="externalRoute" />
      <input placeholder="Internal route" v-model="internalRoute" />
      <input placeholder="Paste your hex private key" type="text" v-model="privateKey" required/>
      <input placeholder="Paste your account key" type="text" v-model="publicKey" required/>
    </form>
    <div class="contracts-deploy-panel">
      <form class="compile-form" @submit.prevent="onCompile">
        <textarea placeholder="Paste your contract source code" v-model="contractCode" required/>
        <input type="submit" value="Compile"/>
      </form>
      <form class="deploy-form" @submit.prevent="onDeploy">
        <textarea placeholder="Paste your contract byte code" v-model="byteCode" required />
        <input type="submit" value="Deploy"/>
      </form>
    </div>
    <div class="contracts-call-panel">
      <form class="call-data-form" @submit.prevent="onComputeCallData">
        <input placeholder="Enter function name" v-model="functionName" required>
        <input placeholder="Enter comma separated function arguments" v-model="functionArgs" required>
        <input type="submit" value="Generate call data" />
      </form>
      <form class="call-form" @submit.prevent="onCallFunction">
        <input placeholder="Paste your contract address" v-model="contractAddress" required />
        <input placeholder="Paste your call data" v-model="callData" required />
        <input type="submit" value="Call function" />
      </form>
    </div>
    <div>
      {{status}}
    </div>
  </div>
</template>

<script>
import AeternityClient from 'aepp-sdk'

export default {
  name: 'ContractsEditor',
  data () {
    return {
      privateKey: '3b12b6baed7aaa1a51a27b62e8cf8cecd6c41df094cb9528ec55e996cad72ad8',
      publicKey: 'ak$3hJ3Jt4uCcgUsZ4dR6TjxAyCqZX2TL7aJudN4qBSwwDsgVq9g9RcKwZQdk22GzBx7n9pNJhbtssLj8apZjZNH8kfu7NQMd',
      contractCode: '',
      byteCode: '',
      height: 0,
      status: '',
      callData: '',
      functionName: '',
      functionArgs: '',
      contractAddress: '',
      externalRoute: 'http://localhost:3001',
      internalRoute: 'http://localhost:3001/internal',
      client: undefined
    }
  },
  methods: {
    async onCompile () {
      this.status = 'Compiling'
      this.byteCode = await this.client.contracts.compile(this.contractCode, '')
      this.status = 'Compiled successfully'
    },
    async onDeploy () {
      this.status = 'Create transaction object'
      let data = await this.client.contracts.getCreateTx(
        this.byteCode,
        {owner: this.publicKey}
      )
      this.status = 'Sign and send transaction'
      this.contractAddress = data['contract_address']
      this.client.tx.sendSigned(data.tx, this.privateKey)
      this.status = 'Waiting for transaction to be mined'
      let interval = setInterval(async () => {
        let transaction = await this.client.tx.getTransaction(data['tx_hash'])
        if (transaction['block_height'] !== -1) {
          this.status = `Contract deployed successfully on block ${transaction['block_height']}`
          clearInterval(interval)
        }
      }, 2000)
    },
    async onComputeCallData () {
      let callData = await this.client.contracts.encodeCallData('ring',
        this.byteCode,
        this.functionName,
        this.functionArgs.split(',')
      )
      this.callData = callData
    },
    async onCallFunction () {
      let data = await this.client.contracts.getCallTx(
        this.contractAddress,
        this.callData,
        {caller: this.publicKey, amount: 0}
      )
      await this.client.tx.sendSigned(data.tx, this.privateKey)
      this.status = 'Waiting for contract call transaction to be mined'
      let interval = setInterval(async () => {
        let transaction = await this.client.tx.getTransaction(data['tx_hash'])
        if (transaction['block_height'] !== -1) {
          this.status = `Contract call tx successfully on block ${transaction['block_height']}`
          clearInterval(interval)
        }
      }, 2000)
    }
  },
  mounted () {
    let provider = new AeternityClient.providers.HttpProvider('localhost', 3001)
    // let provider = new AeternityClient.providers.HttpProvider('localhost', 3013, {internalPort: 3113})
    provider.setBaseUrl(this.internalRoute + '/v2/', true)
    provider.setBaseUrl(this.externalRoute + '/v2/')
    let client = new AeternityClient(provider)
    this.client = client
    let _this = this
    setInterval(
      () => {
        client.base.getHeight().then(
          (height) => {
            _this.height = height
          }
        )
      },
      5000
    )
  }
}
</script>

<style lang="scss">
  input[type="button"] {
    width: inherit;
  }
  .contracts {
    &-editor {
      form {
        display: flex;
        flex-direction: column;
        textarea {
          width: 100%;
        }
      }
    }
    &-call-panel {
      display: flex;
      flex-direction: row;
      form {
        width: 50%;
        padding: 8px;
        margin: 8px;
        border: 1px solid black;
        input {
          margin: 8px;
        }
      }
    }
    &-deploy-panel {
      display: flex;
      flex-direction: row;
      form {
        width: 50%;
        padding: 8px;
        margin: 8px;
        border: 1px solid black;
        input {
          margin: 8px;
        }
      }
    }
  }
  .deploy-form {
    textarea {
      height: 50px;
      width: 100%;
    }
    input {
      margin: 16px;
    }
  }
  .compile-form {
    textarea {
      height: 200px;
      width: 50%;
    }
    input {
      margin: 16px;
    }
  }
  .server-form {
    input {
      margin: 2px;
    }
  }
</style>
