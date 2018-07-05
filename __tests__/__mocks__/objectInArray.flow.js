// @flow
export type ObjectInArray = {
  array: Array<{
    requiredProp: string,
    "x-dashes-id": string,
    optionalProp?: string,
    "x-dashes-optional-id"?: string
  }>
};
