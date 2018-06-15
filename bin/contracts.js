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

const aeClient = async (host) => {
  const node = url.parse(host)
  const secured = node.protocol === 'https:'
  const port = node.port || (secured ? 443 : 80)

  console.log(`Attempting to connect to ${host}...`)
  const provider = new AeternityClient.providers.HttpProvider(node.hostname, port, { secured })
  await provider.ready
  const client = new AeternityClient(provider)

  return client
}

const compile = async (client, contract) => {
  console.log(`Compiling contract...`)
  try {
    return await client.contracts.compile(contract, 'options')
  } catch (err) {
    console.log(err)
  }
}

const deploy = async (client, byteCode, account, options = {}) => {
  console.log(`Deploying contract...`)
  try {
    const deployedContract = await client.contracts.deployContract(byteCode, account, {amount: 10})
    return await client.tx.waitForTransaction(deployedContract.txHash).then((blockHeight) => {
      console.log(`Contract deployed successfully on block ${blockHeight}`)
      return deployedContract
    })
  } catch (err) {
    console.log(err)
  }
}

const callStatic = async (client, abi = 'sophia', byteCode, staticFunction = 'main', staticArguments = '1') => {
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
}

const generateCallData = async (client, abi = 'sophia', byteCode, staticFunction = 'main', staticArguments = ['1']) => {
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
}

const callFunction = async (client, contractAddress, callData) => {
  // console.log(`Calling a function ...`)
  return await client.contracts.getCallTx(
    contractAddress,
    callData,
    { caller: wallet.pub,
      amount: 10
    }
  )
}

program
  .version('0.1.0')
  .option('--node [node]', 'Node to connect to', 'http://localhost:3013')
  .parse(process.argv)

const AeClient = aeClient(program.node)

AeClient.then(client => {
  // console.log(client)
  const byteCode = compile(client, contract)

  byteCode
    .then(byteCode => {
      callStatic(client, 'sophia', byteCode, 'main', '5999')
      deploy(client, byteCode, wallet, '')  // this won't be resolved until the TX is mined
        .then(deployedData => {
          console.log('deployedData', deployedData)
          generateCallData(client, 'sophia', byteCode, 'main', '5999')
          .then(callData => {
            console.log(`Generated Call Data:`)
            console.log(callData)
            console.log(`\n`)
            console.log(`Calling function with generated Call Data...`)
            callFunction(client, deployedData.contractAddress, callData)
              .then(res => console.log(res))
              .catch(err => console.log(err))
            // console.log('res', res)
          }).catch(err => console.log(err))
        }).catch(err => console.log(err))
    }).catch(err => console.log(err))
    .catch(err => console.log(err))
}).catch(err => console.log(err))
