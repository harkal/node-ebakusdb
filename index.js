'use strict'

const fs = require('fs')
const util = require('util')

const createConnection = require('./lib/connection')
const {
  EbakusDBError,
  ReplyError,
  TransactionFailureError,
} = require('./lib/customErrors')

/**
 * Create a connection with EbakusDB.
 * @class
 * @classdesc This class allows interaction with the EbaksuDB running on the Ebakus Blockchain node.
 *
 * @param {Object} options - The options for this connections.
 * @param {boolean} [options.secure=false] - Whether to use https or not.
 * @param {string} [options.host=localhost] - The Ebakus node RPC host.
 * @param {number} [options.port=8545] - The Ebakus node RPC port.
 * @param {boolean} [localSigning=false] - Whether signing will be done locally or on the remote Ebakus Node.
 * @param {string} address - The unlocked address on the remote Ebakus node.
 * @param {string|object} keystoreV3 - The keystore V3 object or full path to a keystore file.
 * @param {string} keystoreV3Pass - The password to unlock the keystoreV3.
 * @param {Object} schema - EbakusDB tables schema.
 *
 * @throws {EbakusDBError}
 */
function EbakusDBClient(options) {
  this.secure = options.secure || false
  this.host = options.host || 'localhost'
  this.port = options.port || 8545
  this.schema = options.schema || {}

  this.localSigning = options.localSigning || false
  this.address = options.address || undefined
  this.keystoreV3 = options.keystoreV3 || null
  this.keystoreV3Pass = options.keystoreV3Pass || null

  if (!this.schema || Object.keys(this.schema).length === 0) {
    throw new EbakusDBError('Please define table schema')
  }

  this.provider = createConnection(this.secure, this.host, this.port)
  this._connectionId = EbakusDBClient._connectionId++

  if (this.localSigning) {
    if (!this.keystoreV3 && !this.keystoreV3Pass) {
      throw new EbakusDBError(
        'For using localSigning please provide both keystoreV3 and keystoreV3Pass'
      )
    }

    let keystore = this.keystoreV3
    if (typeof this.keystoreV3 === 'string' && fs.existsSync(this.keystoreV3)) {
      keystore = fs.readFileSync(this.keystoreV3)
      try {
        keystore = JSON.parse(keystore)
      } catch (err) {}
    }

    try {
      const wallet = this.provider.eth.accounts.wallet.decrypt(
        keystore,
        this.keystoreV3Pass
      )
      if (
        wallet &&
        typeof wallet[0] !== 'undefined' &&
        typeof wallet[0].address !== 'undefined'
      ) {
        this.provider.eth.accounts.wallet.add(wallet[0])

        this.account = wallet[0]
        this.address = wallet[0].address
        this.provider.eth.defaultAccount = this.address
      }
    } catch (err) {
      throw new EbakusDBError(err)
    }
  } else {
    if (!this.address) {
      throw new EbakusDBError(
        'Please set the address to be used on the remote Ebakus node'
      )
    }
  }
}

EbakusDBClient._connectionId = 0

EbakusDBClient.prototype.sendCommand = async function (txData) {
  try {
    const tx = {
      from: this.address,
      ...txData,
    }

    let receipt
    if (this.localSigning) {
      let txWithPow
      try {
        tx.nonce = await this.provider.eth.getTransactionCount(tx.from)
        tx.gas = await this.provider.eth.estimateGas(tx)

        const difficulty = await this.provider.eth.suggestDifficulty(tx.from)
        txWithPow = await this.provider.eth.calculateWorkForTransaction(
          tx,
          difficulty
        )
      } catch (err) {
        throw new EbakusDBError(
          `Failed to create locally signed transaction: ${err.message}`
        )
      }

      const signedTx = await this.account.signTransaction(txWithPow)
      receipt = await this.provider.eth.sendSignedTransaction(
        signedTx.rawTransaction
      )
    } else {
      receipt = await this.provider.eth.sendTransaction(tx)
    }

    if (!receipt.status) {
      throw new TransactionFailureError('Transaction failed', receipt)
    }

    return receipt
  } catch (err) {
    throw new ReplyError(err)
  }
}

Object.defineProperty(EbakusDBClient.prototype, 'connectionId', {
  get: function () {
    return this._connectionId
  },
})

exports.createClient = function () {
  return new EbakusDBClient(...arguments)
}
exports.EbakusDBClient = EbakusDBClient

exports.EbakusDBError = EbakusDBError
exports.ReplyError = ReplyError
exports.TransactionFailureError = TransactionFailureError

// Add all commands / api
require('./lib/schema')
require('./lib/dbCommands')
