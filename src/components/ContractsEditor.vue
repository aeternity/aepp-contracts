<template>
  <div class="contracts-editor">
    <h1>Ring Contract compile (Block height: {{height}})</h1>
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

let provider = new AeternityClient.providers.HttpProvider('localhost', 3001)
provider.setBaseUrl('http://localhost:3001/internal/v2/', true)
let client = new AeternityClient(provider)

export default {
  name: 'ContractsEditor',
  data () {
    return {
      privateKey: '',
      contractCode: '',
      byteCode: '',
      height: 0,
      status: ''
    }
  },
  methods: {
    async onCompile () {
      this.status = 'Compiling'
      this.byteCode = await client.contracts.compile(this.contractCode, '')
      this.status = 'Compiled successfully'
    },
    async onDeploy () {
      this.status = 'Create transaction object'
      let data = await client.contracts.getCreateTx(this.byteCode)
      this.status = 'Sign and send transaction'
      client.tx.sendSigned(data.tx, this.privateKey)
      this.status = 'Waiting for transaction to be mined'
      let interval = setInterval(async () => {
        let transaction = await client.tx.getTransaction(data['tx_hash'])
        if (transaction['block_height'] !== -1) {
          this.status = `Contract deployed successfully on block ${transaction['block_height']}`
          clearInterval(interval)
        }
      }, 2000)
    }
  },
  mounted () {
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
      input {
        margin: 16px;
      }
    }
  }
  .deploy-form {
    textarea {
      height: 50px;
      width: 100%;
    }
  }
  .compile-form {
    textarea {
      height: 200px;
      width: 100%;
    }
  }
</style>
