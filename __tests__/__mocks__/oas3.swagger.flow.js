// @flow strict
export type Pet = {
  id: ?number,
  name: string,
  tag?: string,
  "x-dashes-id": string,
  owner?: Person | Company
};
export type Pets = Array<Pet>;
export type Error = { code: number, message: string };
export type Person = { name?: string };
export type Company = { "tax-id"?: number };
