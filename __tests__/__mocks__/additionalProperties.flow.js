// @flow strict
export type Simple = { [string]: string };
export type Complex = {
  [string]: { code?: number, text?: string },
  name: string
};
export type Messages = { [string]: Message };
export type Message = { code: number, text: string };
