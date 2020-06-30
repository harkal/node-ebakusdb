'use strict'

class EbakusDBError extends Error {
  constructor(...args) {
    super(...args)
    this.name = this.constructor.name

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

class ReplyError extends EbakusDBError {
  constructor(message, ...args) {
    super(message || 'Reply from Ebakus node failed', ...args)
  }
}

class TransactionFailureError extends EbakusDBError {
  constructor(message, receipt, ...args) {
    super(message || 'Transaction failed', ...args)

    this.receipt = receipt || {}
  }
}

module.exports = {
  EbakusDBError,
  ReplyError,
  TransactionFailureError,
}
