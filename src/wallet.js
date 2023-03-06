import {
  AeSdkAepp,
  BrowserWindowMessageConnection,
  AeSdk,
  CompilerHttp,
  walletDetector,
  MemoryAccount,
} from '@aeternity/aepp-sdk'

import { COMPILER_URL, nodes, defaultNetworkId } from './config'

export let sdk = null

// eslint-disable-next-line no-unused-vars
let activeWallet = null
// eslint-disable-next-line no-unused-vars
let walletStatus = null
export let networkId = null

export const initWallet = async (keypair = null) => {
  walletStatus = 'connecting'

  try {
    // connect to static Wallet
    if (keypair) {
      sdk = new AeSdk({
        onCompiler: new CompilerHttp(COMPILER_URL),
        nodes,
        accounts: [new MemoryAccount(keypair.secretKey)],
      })

      await aeConnectToNode(defaultNetworkId)

      walletStatus = 'connected'
      await fetchWalletInfo()
    } else {
      // connect to Superhero Wallet
      sdk = new AeSdkAepp({
        name: 'AEPP',
        nodes,
        onCompiler: new CompilerHttp(COMPILER_URL),
        onNetworkChange: async ({ networkId }) => {
          await aeConnectToNode(networkId)
        },
        onAddressChange: async (addresses) => {
          console.info('onAddressChange :: ', addresses)
          await fetchWalletInfo()
        },
      })
      await scanForWallets()
    }
  } catch (err) {
    console.error('initWallet . error: ', err)
    throw err
  }
}

export const scanForWallets = async () => {
  walletStatus = 'scanning'

  return new Promise((resolve) => {
    const handleWallets = async ({ wallets, newWallet }) => {
      newWallet = newWallet || Object.values(wallets)[0]
      stopScan()
      if (!sdk) return

      activeWallet = newWallet

      const { networkId } = await sdk.connectToWallet(newWallet.getConnection())
      await sdk.subscribeAddress('subscribe', 'current')

      await aeConnectToNode(networkId)

      resolve()
    }
    const scannerConnection = new BrowserWindowMessageConnection()
    const stopScan = walletDetector(scannerConnection, handleWallets)
  })
}

export const fetchWalletInfo = async () => {
  walletStatus = 'fetching_info'

  try {
    networkId = await sdk.api.getNetworkId()

    walletStatus = 'connected'
    return true
  } catch (error) {
    walletStatus = 'fetching failed'
    console.info('fetchWalletInfo error::', error)
    return false
  }
}

export const aeConnectToNode = async (selectedNetworkId) => {
  sdk.selectNode(selectedNetworkId)
  await fetchWalletInfo()
}
