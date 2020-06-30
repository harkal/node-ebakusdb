'use strict'

const EbakusDBClient = require('..').EbakusDBClient
const { EbakusDBError } = require('./customErrors')

EbakusDBClient.prototype.toAbiData = function (tableName, data, keysToInclude) {
  if (typeof this.schema[tableName] !== 'object') {
    throw new EbakusDBError(`Schema for table "${tableName}" not found`)
  }

  const { inputs } = this.schema[tableName]

  let types = []
  let values = []

  for (let key in inputs) {
    const { name, type } = inputs[key]

    if (
      !!keysToInclude &&
      Array.isArray(keysToInclude) &&
      !keysToInclude.includes(name)
    ) {
      continue
    }

    types.push(type)
    values.push(data[name])
  }

  return this.provider.eth.abi.encodeParameters(types, values)
}
