'use strict'

const Web3 = require('web3')
const Web3Ebakus = require('web3-ebakus')

/**
 * Get an RPC connection to the Ebakus node.
 * NOTE: it supports only HTTP for now
 *
 * @param {boolean} secure - Whether to use http or https.
 * @param {string} [host=localhost] - Ebakus node host.
 * @param {number} [port=8545] - Ebakus node port.
 *
 * @returns {web3} The web3 instance.
 */
module.exports = function createConnection(
  secure = false,
  host = 'localhost',
  port = 8545
) {
  let provider = 'http'
  provider += secure ? 's' : ''
  provider += `://${host}`
  if (!!port) provider += `:${port}`

  return Web3Ebakus(new Web3(provider))
}
