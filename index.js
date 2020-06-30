'use strict'

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
 * @param {Object} schema - EbakusDB tables schema.
 *
 * @throws {EbakusDBError}
 */
function EbakusDBClient(options) {
  this.secure = options.secure || false
  this.host = options.host || 'localhost'
  this.port = options.port || 8545
  this.schema = options.schema || {}

  this.address = options.address || undefined
  this.localSigning = options.localSigning || false

  if (!this.address && !this.localSigning) {
    throw new EbakusDBError(
      'Please use localSigning or set the address to be used on remote Ebakus node'
    )
  }

  if (!this.schema || Object.keys(this.schema).length === 0) {
    throw new EbakusDBError('Please define table schema')
  }

  this.provider = createConnection(this.secure, this.host, this.port)

  this._connectionId = EbakusDBClient._connectionId++
}

EbakusDBClient._connectionId = 0

EbakusDBClient.prototype.sendCommand = async function (txData) {
  try {
    const tx = {
      from: this.address,
      ...txData,
    }

    const receipt = await this.provider.eth.sendTransaction(tx)

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
