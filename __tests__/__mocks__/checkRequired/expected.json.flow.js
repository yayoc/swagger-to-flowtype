// @flow
export type Pet = { id: number, "x-dashes-id"?: string } & NewPet;
export type NewPet = { name: string, tag?: string, category?: Category };
export type ErrorModel = { code: number, message: string };
export type IGenericCollectionPet = { items?: Array<Pet> };
export type IGenericCollectionString = { items?: Array<string> };
