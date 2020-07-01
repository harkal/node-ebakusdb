'use strict'

// var ebakusdb = require('ebakusdb')
const ebakusdb = require('..')

const client = ebakusdb.createClient({
  secure: false,
  host: 'localhost',
  port: 8545,

  localSigning: true,

  // keystoreV3:
  //   '<fullpath>/examples/keystoreV3.json',
  keystoreV3: [
    {
      version: 3,
      id: '7bc174c7-f858-4ce8-b528-46d803d2d2b2',
      address: '42ecbef3897cba296725bfed074db4f1474f2f29',
      crypto: {
        ciphertext:
          'a9d038595be4bb028be92127b5a9a2e9d617d7f4d51e15252606fd6ff8ea70fd',
        cipherparams: { iv: '80fdfa2ca0a0a2a43dd5993c173ccee0' },
        cipher: 'aes-128-ctr',
        kdf: 'scrypt',
        kdfparams: {
          dklen: 32,
          salt:
            '854adfde061e944a21f6c16e8768f571ab0e2e7efbe26b3635e6080b4fd9a05b',
          n: 8192,
          r: 8,
          p: 1,
        },
        mac: '156f0c7beb8020a6364aa548d0808bd1b0f281feb430dda9e1d985cbfd465436',
      },
    },
  ],
  keystoreV3Pass: '123',

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
