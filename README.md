# openapi-to-flowtype

`openapi-to-flowtype` is a tool for generating type definitions of [Flow](https://flow.org/) from OpenAPI 3.0 file.

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Downloads][downloads-image]][downloads-url]

## Getting started

#### Install package

`npm i -g openapi-to-flowtype`

#### Generating flow type definitions

`$openapi-to-flowtype <YOUR SWAGGER FILE OR URL>`

This command generates a file named **flowtype.js** includes type definitions as default.  

##### Options

*`Specify an output path`*

You can also specify an output path with `-d option`.

`$openapi-to-flowtype <YOUR SWAGGER FILE PATH OR URL> -d <OUTPUT FILE PATH>`

*`Generate types for operation titled responses as well`*

You can enable type generation for operation responses (if the have schema title specified) with `--responses`.

`$openapi-to-flowtype <YOUR SWAGGER FILE PATH OR URL> --responses`

*`Specify a suffix for generated types`*

You can specify a suffix for all generated types with `--suffix <suffix>`.

`$openapi-to-flowtype <YOUR SWAGGER FILE PATH OR URL> -suffix <YOUR SUFFIX>`

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

components:
  schemas:
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
  id?: number,
  petId?: number,
  quantity?: number,
  shipDate?: string,
  status?: 'placed' | 'approved' | 'delivered',
  complete?: boolean
};
export type Category = { id?: number, name?: string };

```

## Requirements
* Node 12+ is required

## Tests

`npm test`

# Testimonials
Based on [swagger-to-flowtype](https://github.com/yayoc/swagger-to-flowtype) by [yayoc](http://yayoc.com).

[npm-image]: https://img.shields.io/npm/v/openapi-to-flowtype.svg?style=flat-square
[npm-url]: https://npmjs.org/package/openapi-to-flowtype
[travis-image]: https://travis-ci.com/vlsergey/openapi-to-flowtype.svg?branch=master
[travis-url]: https://travis-ci.com/vlsergey/openapi-to-flowtype
[downloads-image]: http://img.shields.io/npm/dm/openapi-to-flowtype.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/openapi-to-flowtype
