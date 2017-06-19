# swagger-to-flowtype

`swagger-to-flowtype` is a tool for generating type definitions of [Flow](https://flow.org/) from swagger file.

## Getting started

#### Install package

1. `npm i -g swagger-to-flowtype`

#### Generating flow type definitions

2. `$swagger-to-flowtype <YOUR SWAGGER FILE>`

This command generates a file named **flowtype.js** includes type definitions as default.  
You can also specify output path with `-d option`.

`$swagger-to-flowtype <YOUR SWAGGER FILE> -d <OUTPUT FILE PATH>` 

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
  status: string,
  complete: boolean
};
export type Category = { id: number, name: string };

```

## Requirements

**Node 4+ is required**

## Tests

`npm test`

