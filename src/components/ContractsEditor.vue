<template>
  <div class="contracts-editor">
    <h1>Ring Contract compile (Block height: {{height}})</h1>
    <form class="server-form">
      <input placeholder="External route" v-model="externalRoute" />
      <input placeholder="Internal route" v-model="internalRoute" />
    </form>
    <form class="compile-form" @submit.prevent="onCompile">
      <input placeholder="Paste your hex private key" type="text" v-model="privateKey" required/>
      <textarea placeholder="Paste your contract source code" v-model="contractCode" required/>
      <input type="submit" value="Compile"/>
    </form>
    <form class="deploy-form" @submit.prevent="onDeploy">
      <textarea placeholder="Paste your contract byte code" v-model="byteCode" required />
      <input type="submit" value="Deploy"/>
    </form>
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
      privateKey: '',
      contractCode: '',
      byteCode: '',
      height: 0,
      status: '',
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
      let data = await this.client.contracts.getCreateTx(this.byteCode)
      this.status = 'Sign and send transaction'
      this.client.tx.sendSigned(data.tx, this.privateKey)
      this.status = 'Waiting for transaction to be mined'
      let interval = setInterval(async () => {
        let transaction = await this.client.tx.getTransaction(data['tx_hash'])
        if (transaction['block_height'] !== -1) {
          this.status = `Contract deployed successfully on block ${transaction['block_height']}`
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
  .contracts-editor {
    form {
      display: flex;
      flex-direction: column;
      textarea {
        width: 100%;
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
      width: 100%;
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
