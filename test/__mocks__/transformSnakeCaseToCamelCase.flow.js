// @flow strict
export type Cat = {
  id?: number,
  camelCaseId?: string,
  xDashesId?: string,
  snakeCaseId?: string,
  requiredSnakeCaseId: string
};
export type Dog = {
  nestedProperty: {
    snakeCaseId?: string,
    requiredSnakeCaseId: string,
    category?: Category
  }
};
export type Category = {
  snakeCaseValue?: number,
  requiredSnakeCaseValue: number
};
