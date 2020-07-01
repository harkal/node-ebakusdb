'use strict'

// var ebakusdb = require('ebakusdb')
const ebakusdb = require('..')

// TODO: change address to the one unlocked on the remote ebakus node
console.log(
  'TODO: change address to the one unlocked on the remote ebakus node'
)

const client = ebakusdb.createClient({
  secure: false,
  host: 'localhost',
  port: 8545,

  address: '0x...',

  schema: {
    Users: {
      type: 'table',
      name: 'Users',
      inputs: [
        { name: 'Id', type: 'uint64' },
        { name: 'Name', type: 'string' },
        { name: 'Pass', type: 'string' },
        { name: 'Email', type: 'string' },
      ],
    },
  },
})

const exampleFlow = async () => {
  client
    .createTable('Users', ['Name', 'Email'])
    .then((res) => {
      console.log('createTable: Table has been created', res)
    })
    .catch((err) => {
      // will fail if the table is already created, which is probably true as you use the example keystore account
      console.log('createTable err:', err.message)
    })

  client
    .insertObj('Users', {
      Id: 0,
      Name: 'Harry',
      Pass: '123',
      Email: 'harry@ebakus.com',
    })
    .then((res) => {
      console.log('insertObj: Object inserted', res)
    })
    .catch((err) => {
      console.log('insertObj err:', err.message)
    })

  client
    .insertObj('Users', {
      Id: 1,
      Name: 'Chris',
      Pass: '456',
      Email: 'chris@ebakus.com',
    })
    .then((res) => {
      console.log('insertObj: Object inserted', res)
    })
    .catch((err) => {
      console.log('insertObj err:', err.message)
    })

  client
    .get('Users', 'Id=1', 'Email ASC')
    .then((res) => {
      console.log('get User Id=1:', res)
    })
    .catch((err) => {
      console.log('get err:', err)
    })

  console.group('Select all users')
  const users = client.select('Users', '', 'Email ASC')

  for await (const user of users) {
    console.log(user)
  }
  console.groupEnd('Select all users')

  client
    .deleteObj('Users', {
      Id: 1,
    })
    .then((res) => {
      console.log('deleteObj: Object deleted', res)
    })
    .catch((err) => {
      console.log('deleteObj err:', err.message)
    })

  console.group('Select all users')
  const users2 = client.select('Users', '', 'Email ASC')

  for await (const user of users2) {
    console.log(user)
  }
  console.groupEnd('Select all users')
}
exampleFlow()
