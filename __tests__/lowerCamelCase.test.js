import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { generator } from "../src/index";

jest.mock("commander", () => ({
  lowerCamelCase: true,
  arguments: jest.fn().mockReturnThis(),
  option: jest.fn().mockReturnThis(),
  action: jest.fn().mockReturnThis(),
  parse: jest.fn().mockReturnThis()
}));

describe("generate flow types", () => {
  describe("with --lower-camel-case", () => {
    it("should generate expected flow types", () => {
      const file = path.join(__dirname, "__mocks__/swagger.yaml");
      const content = yaml.safeLoad(fs.readFileSync(file, "utf8"));
      const expected = path.join(
        __dirname,
        "__mocks__/lowerCamelCase/expected.yaml.flow.js"
      );
      const expectedString = fs.readFileSync(expected, "utf8");
      expect(generator(content)).toEqual(expectedString);
    });

    it("should generate expected flow types from swagger.json", () => {
      const file = path.join(__dirname, "__mocks__/swagger.json");
      const content = JSON.parse(fs.readFileSync(file, "utf8"));
      const expected = path.join(
        __dirname,
        "__mocks__/lowerCamelCase/expected.json.flow.js"
      );
      const expectedString = fs.readFileSync(expected, "utf8");
      expect(generator(content)).toEqual(expectedString);
    });
  });
});
