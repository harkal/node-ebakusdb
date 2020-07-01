# node-ebakusdb
A driver for node.js for interacting with the EbakusDB running on an Ebakus Blockchain network.

You can find example use cases in the [examples](./examples) folder.

## EbakusDBClient
This class allows interaction with the EbaksuDB running on the Ebakus Blockchain node.

**Kind**: global class

- [node-ebakusdb](#node-ebakusdb)
  - [EbakusDBClient](#ebakusdbclient)
    - [new EbakusDBClient(options, [localSigning], address, keystoreV3, keystoreV3Pass, schema)](#new-ebakusdbclientoptions-localsigning-address-keystorev3-keystorev3pass-schema)
      - [Example schema object](#example-schema-object)
    - [ebakusDBClient.createTable(tableName, [indexes]) ⇒ <code>boolean</code>](#ebakusdbclientcreatetabletablename-indexes--boolean)
    - [ebakusDBClient.get(tableName, whereClause, orderClause, [blockNumber]) ⇒ <code>Object</code>](#ebakusdbclientgettablename-whereclause-orderclause-blocknumber--object)
    - [ebakusDBClient.select(tableName, whereClause, orderClause, [blockNumber])](#ebakusdbclientselecttablename-whereclause-orderclause-blocknumber)
    - [ebakusDBClient.insertObj(tableName, object) ⇒ <code>boolean</code>](#ebakusdbclientinsertobjtablename-object--boolean)
    - [ebakusDBClient.deleteObj(tableName, input) ⇒ <code>boolean</code>](#ebakusdbclientdeleteobjtablename-input--boolean)

<a name="new_EbakusDBClient_new"></a>

### new EbakusDBClient(options, [localSigning], address, keystoreV3, keystoreV3Pass, schema)
Create a connection with EbakusDB.

**Throws**:

- <code>EbakusDBError</code>


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  | The options for this connections. |
| [options.secure] | <code>boolean</code> | <code>false</code> | Whether to use https or not. |
| [options.host] | <code>string</code> | <code>&quot;localhost&quot;</code> | The Ebakus node RPC host. |
| [options.port] | <code>number</code> | <code>8545</code> | The Ebakus node RPC port. |
| [localSigning] | <code>boolean</code> | <code>false</code> | Whether signing will be done locally or on the remote Ebakus Node. |
| address | <code>string</code> |  | The unlocked address on the remote Ebakus node. |
| keystoreV3 | <code>string</code> \| <code>object</code> |  | The keystore V3 object or full path to a keystore file. |
| keystoreV3Pass | <code>string</code> |  | The password to unlock the keystoreV3. |
| schema | <code>Object</code> |  | EbakusDB tables schema. Read more below. |


#### Example schema object

The schema has to be defined correctly once and cannot be changed. The schema will be stored on the Ebakus blockchain during the table creation.

> IMPORTANT: The inputs names has to be pascal case, which means the first character has to be uppercase.

```js
  schema: {
    Users: {
      type: 'table',
      name: 'Users',
      inputs: [
        { name: 'Id', type: 'uint64' },
        { name: 'Name', type: 'string' },
        { name: 'Email', type: 'string' },
      ],
    },
    Files: {
      type: 'table',
      name: 'Files',
      inputs: [
        { name: 'Id', type: 'string' },
        { name: 'Type', type: 'string' },
      ],
    },
  },
```

<a name="EbakusDBClient+createTable"></a>

### ebakusDBClient.createTable(tableName, [indexes]) ⇒ <code>boolean</code>
This has to be called once per table. Important, "Id" field has to exist in every table/struct.

**Kind**: instance method of [<code>EbakusDBClient</code>](#EbakusDBClient)
**Throws**:

- <code>EbakusDBError</code><code>TransactionFailureError</code><code>ReplyError</code>


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| tableName | <code>string</code> |  | Table name as defined in the schema. |
| [indexes] | <code>Array.&lt;string&gt;</code> | <code>[]</code> | List of indexed fields. |

<a name="EbakusDBClient+get"></a>

### ebakusDBClient.get(tableName, whereClause, orderClause, [blockNumber]) ⇒ <code>Object</code>
Transaction will fail if nothing is mathed in EbakusDB.

**Kind**: instance method of [<code>EbakusDBClient</code>](#EbakusDBClient)
**Returns**: <code>Object</code> - The data object read from EbakusDB.
**Throws**:

- <code>Error</code>


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| tableName | <code>string</code> |  | Table name as defined in the schema. |
| whereClause | <code>string</code> |  | WhereClause for finding an entry.                 Supported conditions are "<", ">", "=", "==", "<=", ">=", "!=", "LIKE"                 Example use case: Phone = "555-1111"                                   Id >= 3 |
| orderClause | <code>string</code> |  | OrderClause for sorting the results using "ASC" or "DESC".                 Example use case: Phone DESC |
| [blockNumber] | <code>string</code> | <code>&quot;latest&quot;</code> | The block number from which to read data |

<a name="EbakusDBClient+select"></a>

### ebakusDBClient.select(tableName, whereClause, orderClause, [blockNumber])
Select entries from EbakusDB

**Kind**: instance method of [<code>EbakusDBClient</code>](#EbakusDBClient)
**Throws**:

- <code>EbakusDBError</code>


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| tableName | <code>string</code> |  | Table name as defined in the schema. |
| whereClause | <code>string</code> |  | WhereClause for finding an entry.                 Supported conditions are "<", ">", "=", "==", "<=", ">=", "!=", "LIKE"                 Example use case: Phone = "555-1111"                                   Id >= 3 |
| orderClause | <code>string</code> |  | OrderClause for sorting the results using "ASC" or "DESC".                 Example use case: Phone DESC |
| [blockNumber] | <code>string</code> | <code>&quot;latest&quot;</code> | The block number from which to read data |

<a name="EbakusDBClient+insertObj"></a>

### ebakusDBClient.insertObj(tableName, object) ⇒ <code>boolean</code>
Insert/Update an entry in EbakusDB.

**Kind**: instance method of [<code>EbakusDBClient</code>](#EbakusDBClient)
**Returns**: <code>boolean</code> - Whether entry has been inserted/updated.
**Throws**:

- <code>TransactionFailureError</code><code>ReplyError</code>


| Param | Type | Description |
| --- | --- | --- |
| tableName | <code>string</code> | Table name as defined in the schema. |
| object | <code>Object</code> | Object data. |

<a name="EbakusDBClient+deleteObj"></a>

### ebakusDBClient.deleteObj(tableName, input) ⇒ <code>boolean</code>
Delete an entry in EbakusDB.

**Kind**: instance method of [<code>EbakusDBClient</code>](#EbakusDBClient)
**Returns**: <code>boolean</code> - Whether entry has been deleted.
**Throws**:

- <code>TransactionFailureError</code><code>ReplyError</code>


| Param | Type | Description |
| --- | --- | --- |
| tableName | <code>string</code> | Table name as defined in the schema. |
| input | <code>Object</code> \| <code>\*</code> | Object data. |
| input.Id | <code>\*</code> | The Id of the entry for this table. |

