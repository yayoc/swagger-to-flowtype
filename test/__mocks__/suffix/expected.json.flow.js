// @flow strict
export type PetType = {
  id: number,
  "x-dashes-id"?: string,
  snake_case_id?: string,
  objectType?: {}
} & NewPetType;
export type NewPetType = { name: string, tag?: string, category?: CategoryType };
export type ErrorModelType = { code: number, message: string };
export type IGenericCollectionPetType = { items?: Array<PetType> };
export type IGenericCollectionStringType = { items?: Array<string> };
