// @flow
export type NestedObject = {
  nestedProperty: { base: Example, special: Example }
};
export type Example = { value: number, name: string };
