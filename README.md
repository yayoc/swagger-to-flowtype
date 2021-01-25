# swagger-to-flowtype

`swagger-to-flowtype` is a tool for generating type definitions of [Flow](https://flow.org/) from swagger file.

## Getting started

#### Install package

`npm i -g swagger-to-flowtype`

#### Generating flow type definitions

`$swagger-to-flowtype <YOUR SWAGGER FILE OR URL>`

This command generates a file named **flowtype.js** includes type definitions as default.  

##### Options

*`Specify an output path`*

You can also specify an output path with `-d option`.

`$swagger-to-flowtype <YOUR SWAGGER FILE PATH OR URL> -d <OUTPUT FILE PATH>` 

*`Supporting Maybe type`*

If you pass a `--check-required` option, `swagger-to-flowtype` will check `required field` on your swagger file, then output flow definitions with Maybe type.

```json
"NewPet": {
  "type": "object",
  "required": [
    "name"
  ],
  "properties": {
    "name": {
      "type": "string"
    },
    "tag": {
      "type": "string"
    }
  }
}
```

will be

```js
export type NewPet = {
  name: string,
  tag?: string
}
```

*`Transform property key to lower camel case`*

`--lower-camel-case` option transforms each property keys to lower camel case.

```json
"Cat": {
  "type": "object",
  "properties": {
    "long_long_key": {
      "type": "string"
    }
  }
}
```

will be

```js
export type Cat = { longLongKey?: string };
```

## Example

swagger file like following 

```yaml
...

definitions:
  Order:
    type: "object"
    properties:
      id:
        type: "integer"
        format: "int64"
      petId:
        type: "integer"
        format: "int64"
      quantity:
        type: "integer"
        format: "int32"
      shipDate:
        type: "string"
        format: "date-time"
      status:
        type: "string"
        description: "Order Status"
        enum:
        - "placed"
        - "approved"
        - "delivered"
      complete:
        type: "boolean"
        default: false
    xml:
      name: "Order"
  Category:
    type: "object"
    properties:
      id:
        type: "integer"
        format: "int64"
      name:
        type: "string"
    xml:
      name: "Category"
...

```

Output will be like below

```js
// @flow
export type Order = {
  id: number,
  petId: number,
  quantity: number,
  shipDate: string,
  status: 'placed' | 'approved' | 'delivered',
  complete: boolean
};
export type Category = { id: number, name: string };

```

## Requirements

**Node 4+ is required**

## Tests

`npm test`

