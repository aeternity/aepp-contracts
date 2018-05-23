#!/usr/bin/env node

/*
 * ISC License (ISC)
 * Copyright © 2018 aeternity developers
 *
 *  Permission to use, copy, modify, and/or distribute this software for any
 *  purpose with or without fee is hereby granted, provided that the above
 *  copyright notice and this permission notice appear in all copies.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 *  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 *  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 *  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 *  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 *  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 *  PERFORMANCE OF THIS SOFTWARE.
 */

/*
 * INFO:
 * This is a CLI tool to easilty test contracts
 * you can find contracts methods here:
 * https://github.com/aeternity/aepp-sdk-js/blob/develop/src/legacy/providers/http/services/contracts.js
 */

const { AeternityClient } = require('@aeternity/aepp-sdk')
const program = require('commander')
const url = require('url')

const wallet = {
  priv: process.env['WALLET_PRIV'],
  pub: process.env['WALLET_PUB']
}

const contract = `contract Identity =
  type state = ()
  function main(x : int) = x`

console.log(`Deploying contract: \n\n ${contract}\n`)

function connect (host) {
  const node = url.parse(host)
  const secured = node.protocol === 'https:'
  const port = node.port || (secured ? 443 : 80)

  console.log(`Attempting to connect to ${host}...`)
  const client = new AeternityClient.providers.HttpProvider(node.hostname, port, { secured })

  return new Promise((resolve, reject) => {
    client.ready.then(status => {
      // console.log('ready: ', status)
      client.base.getHeight().then(height => {
        console.log(`Connected. Current height reported as ${height}\n`)
        resolve(client)
      }).catch((reject) => console.log(reject))
    }).catch((reject) => console.log(reject))
  })
}

function compile (client, contract) {
  console.log(`Compiling contract...`)
  return new Promise((resolve, reject) => {
    client.contracts.compile(contract, 'options')
      .then(byteCode => {
        console.log(`Compiled!\n`)
        resolve(byteCode)
      })
      .catch((reject) => console.log(`NOT compiled, reason: ${reject}`))
  })
}

function deploy (client, byteCode, account, options = {}) {
  console.log(`Deploying contract...`)
  return new Promise((resolve, reject) => {
    client.contracts.deployContract(byteCode, account, '')
      .then(data => {
        console.log(`Deployed! Data:`)
        console.log(data)
        console.log(`\n`)
        // resolve(data)
        let interval = setInterval(() => {
          client.tx.getTransaction(data.tx_hash).then(transaction => {
            // console.log(transaction)
            console.log(`Checking contract deployment (block height: ${transaction.block_height}...)`)
            if (transaction.block_height !== -1) {
              console.log(`Contract deployed successfully on block ${transaction['block_height']}`)
              resolve(data)
              clearInterval(interval)
            }
          })
        }, 2000)
      })
      .catch((reject) => console.log(`NOT deployed, reason: ${reject}`))
  })
}

function callStatic (client, abi = 'sophia', byteCode, staticFunction = 'main', staticArguments = '1') {
  // console.log(`Calling static function "${staticFunction}" with ABI "${abi}", FUNCTION ${staticFunction}, ARGS ${staticArguments} ...`)
  return new Promise((resolve, reject) => {
    client.contracts.callStatic(
      abi,
      byteCode,
      staticFunction,
      staticArguments
    )
      .then(data => {
        console.log(`Response from callStatic:`)
        console.log(data)
        console.log(`\n`)
        resolve(data)
      })
      .catch((reject) => console.log(`Cannot call static, reason: ${reject}`, reject))
  })
}

function generateCallData (client, abi = 'sophia', byteCode, staticFunction = 'main', staticArguments = ['1']) {
  // console.log(`Generating callData ...`)
  return new Promise((resolve, reject) => {
    client.contracts.encodeCallData(
      abi,
      byteCode,
      staticFunction,
      staticArguments.split(',')
    )
      .then(data => {
        // console.log(`Generated Call Data:`)
        // console.log(data)
        resolve(data)
      })
      .catch((reject) => console.log(`Cannot generate Call Data, reason: ${reject}`, reject))
  })
}

function callFunction (client, contractAddress, callData) {
  // console.log(`Calling a function ...`)
  return new Promise((resolve, reject) => {
    client.contracts.getCallTx(
      contractAddress,
      callData,
      { caller: wallet.pub,
        amount: 3
      }
    )
      .then(data => {
        // console.log(`Generated Call Data:`)
        // console.log(data)
        resolve(data)
        return new Promise((resolve, reject) => {
          client.tx.sendSigned(data.tx, wallet.priv)
        })
          .then(data => console.log(data))
          .catch((reject) => console.log(`Cannot Call Function, reason: ${reject}`, reject))
      })
      .catch((reject) => console.log(`Cannot get TX of Call, reason: ${reject}`, reject.response.data.reason))
  })
}

program
  .version('0.1.0')
  .option('--node [node]', 'Node to connect to', 'http://localhost:3013')
  .parse(process.argv)

const AeClient = connect(program.node)

AeClient.then(client => {
  // console.log(client)
  const byteCode = compile(client, contract)

  byteCode
    .then(byteCode => {
      callStatic(client, 'sophia', byteCode, 'main', '5999')
      deploy(client, byteCode, wallet, '')  // this won't be resolved until the TX is mined
        .then(deployedData => {
          generateCallData(client, 'sophia', byteCode, 'main', '5999')
          .then(callData => {
            console.log(`Generated Call Data:`)
            console.log(callData)
            console.log(`\n`)
            console.log(`Calling function with generated Call Data...`)
            // console.log(deployedData.contract_address, callData)
            callFunction(client, deployedData.contract_address, callData)
          })
        })
    })
    .catch(err => console.log(err))
}).catch(err => console.log(err))
