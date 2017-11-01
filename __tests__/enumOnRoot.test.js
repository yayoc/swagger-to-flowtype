import fs from "fs";
import path from "path";
import { FlowTypeGenerator, generator } from "../src/index";

jest.mock('commander', () => {
  return {
    checkRequired: true,
    arguments: jest.fn().mockReturnThis(),
    option: jest.fn().mockReturnThis(),
    action: jest.fn().mockReturnThis(),
    parse: jest.fn().mockReturnThis(),
  }
});

describe("generate flow types", () => {
  describe("parse enum on root element", () => {
    it("should generate expected flow types", () => {
      const file = path.join(__dirname, "__mocks__/enumOnRoot.swagger.yaml");
      const expected = path.join(__dirname, "__mocks__/enumOnRoot.flow.js");
      const expectedString = fs.readFileSync(expected, "utf8");
      expect(generator(file)).toEqual(expectedString);
    });
  });
});
