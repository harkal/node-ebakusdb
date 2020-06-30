'use strict'

const EbakusDBClient = require('..').EbakusDBClient
const { EbakusDBError } = require('./customErrors')

const EBAKUS_DB_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000102'
const EBAKUS_DB_ABI = [
  {
    type: 'function',
    name: 'createTable',
    inputs: [
      {
        name: 'tableName',
        type: 'string',
      },
      {
        name: 'indexes',
        type: 'string',
      },
      {
        name: 'abi',
        type: 'string',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'insertObj',
    inputs: [
      {
        name: 'tableName',
        type: 'string',
      },
      {
        name: 'data',
        type: 'bytes',
      },
    ],
    outputs: [
      {
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'deleteObj',
    inputs: [
      {
        name: 'tableName',
        type: 'string',
      },
      {
        name: 'id',
        type: 'bytes',
      },
    ],
    outputs: [
      {
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
  },
]

/**
 * Create a table at EbakusDB.
 * @desc This has to be called once per table. Important, "Id" field has to exist in every table/struct.
 * @async
 *
 * @param {string} tableName - Table name.
 * @param {string[]} [indexes=[]] - List of indexed fields.
 *
 * @throws {EbakusDBError|TransactionFailureError|ReplyError}
 * @returns {boolean}
 */
EbakusDBClient.prototype.createTable = async function createTable(
  tableName,
  indexes = []
) {
  if (typeof this.schema[tableName] !== 'object') {
    throw new EbakusDBError(`Schema for table "${tableName}" not found`)
  }

  if (indexes && !Array.isArray(indexes)) {
    throw new EbakusDBError('Indexes param must be an array')
  }

  // schema object has to be passed into an array
  const schema = [this.schema[tableName]]

  const dbContract = new this.provider.eth.Contract(
    EBAKUS_DB_ABI,
    EBAKUS_DB_CONTRACT_ADDRESS
  )

  const data = dbContract.methods
    .createTable(tableName, indexes.join(','), JSON.stringify(schema))
    .encodeABI()

  const receipt = await this.sendCommand({
    to: EBAKUS_DB_CONTRACT_ADDRESS,
    data,
  })

  return receipt.status || false
}

/**
 * Get a single entry from EbakusDB.
 * @desc Transaction will fail if nothing is mathed in EbakusDB.
 * @async
 *
 * @param {string} tableName - Table name.
 * @param {string} whereClause - WhereClause for finding an entry.
 *                 Supported conditions are "<", ">", "=", "==", "<=", ">=", "!=", "LIKE"
 *                 Example use case: Phone = "555-1111"
 *                                   Id >= 3
 * @param {string} orderClause - OrderClause for sorting the results using "ASC" or "DESC".
 *                 Example use case: Phone DESC
 * @param {string} [blockNumber=latest] - The block number from which to read data
 *
 * @throws
 * @returns {?Object} The data object read from EbakusDB.
 */
EbakusDBClient.prototype.get = async function get(
  tableName,
  whereClause,
  orderClause,
  blockNumber = 'latest'
) {
  return await this.provider.db.get(
    this.address,
    tableName,
    whereClause,
    orderClause,
    blockNumber
  )
}

/**
 * Select entries from EbakusDB
 * @async
 *
 * @param {string} tableName - Table name.
 * @param {string} whereClause - WhereClause for finding an entry.
 *                 Supported conditions are "<", ">", "=", "==", "<=", ">=", "!=", "LIKE"
 *                 Example use case: Phone = "555-1111"
 *                                   Id >= 3
 * @param {string} orderClause - OrderClause for sorting the results using "ASC" or "DESC".
 *                 Example use case: Phone DESC
 * @param {string} [blockNumber=latest] - The block number from which to read data
 *
 * @throws {EbakusDBError}
 * @yields {Object} The next data object read from EbakusDB.
 */
EbakusDBClient.prototype.select = async function* select(
  tableName,
  whereClause,
  orderClause,
  blockNumber = 'latest'
) {
  let iter
  try {
    iter = await this.provider.db.select(
      this.address,
      tableName,
      whereClause,
      orderClause,
      blockNumber
    )
  } catch (err) {
    throw new EbakusDBError(`Failed to query table: ${err.message}`)
  }

  let obj
  do {
    try {
      obj = await this.provider.db.next(iter)
    } catch (err) {
      throw new EbakusDBError(
        `Failed to read next entry in table: ${err.message}`
      )
    }

    if (!obj) return
    yield obj
  } while (obj)
}

/**
 * Insert/Update an entry in EbakusDB.
 * @async
 *
 * @param {string} tableName - Table name.
 * @param {Object} object - Object data.
 *
 * @throws {TransactionFailureError|ReplyError}
 * @returns {boolean} Whether entry has been inserted/updated.
 */
EbakusDBClient.prototype.insertObj = async function insertObj(tableName, obj) {
  const dbContract = new this.provider.eth.Contract(
    EBAKUS_DB_ABI,
    EBAKUS_DB_CONTRACT_ADDRESS
  )

  const objAbiData = this.toAbiData(tableName, obj)

  const data = dbContract.methods.insertObj(tableName, objAbiData).encodeABI()

  const receipt = await this.sendCommand({
    to: EBAKUS_DB_CONTRACT_ADDRESS,
    data,
  })

  return receipt.status || false
}

/**
 * Delete an entry in EbakusDB.
 * @async
 *
 * @param {string} tableName - Table name.
 * @param {Object|*} input - Object data.
 * @param {*} input.Id - The Id of the entry for this table.
 *
 * @throws {TransactionFailureError|ReplyError}
 * @returns {boolean} Whether entry has been deleted.
 */
EbakusDBClient.prototype.deleteObj = async function deleteObj(
  tableName,
  input
) {
  const dbContract = new this.provider.eth.Contract(
    EBAKUS_DB_ABI,
    EBAKUS_DB_CONTRACT_ADDRESS
  )

  let obj = input
  if (typeof input !== 'object' || typeof input.Id === 'undefined') {
    obj = { Id: input }
  }

  const idAbiData = this.toAbiData(tableName, obj, ['Id'])

  const data = dbContract.methods.deleteObj(tableName, idAbiData).encodeABI()

  const receipt = await this.sendCommand({
    to: EBAKUS_DB_CONTRACT_ADDRESS,
    data,
  })

  return receipt.status || false
}
