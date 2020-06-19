// @flow strict
export type OrderType = {
  id?: number,
  petId?: number,
  quantity?: number,
  shipDate?: string,
  status?: "placed" | "approved" | "delivered",
  complete?: boolean
};
export type CategoryType = { id?: number, name?: string };
export type UserType = {
  id?: number,
  username?: string,
  firstName?: string,
  lastName?: string,
  email?: string,
  password?: string,
  phone?: string,
  userStatus?: number
};
export type TagType = { id?: number, name?: string };
export type PetType = {
  id?: number,
  "x-dashes-id"?: string,
  snake_case_id?: string,
  category?: CategoryType,
  name: string,
  photoUrls: Array<string>,
  tags?: Array<TagType>,
  status?: "available" | "pending" | "sold",
  objectType?: {}
};
export type IGenericCollectionPetType = { items?: Array<PetType> };
export type IGenericCollectionStringType = { items?: Array<string> };
export type ApiResponseType = { code?: number, type?: string, message?: string };
