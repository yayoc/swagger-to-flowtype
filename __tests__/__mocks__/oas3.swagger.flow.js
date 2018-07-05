// @flow
export type Pet = {
  id: number,
  name: string,
  tag?: string,
  "x-dashes-id": string
};
export type Pets = Array<Pet>;
export type Error = { code: number, message: string };
