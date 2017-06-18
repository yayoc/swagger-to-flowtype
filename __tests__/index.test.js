import fs from "fs";
import path from "path";
import { FlowTypeGenerator, generator } from "../src/index";

describe("generate flow types", () => {
  describe("FlowTypeGenerator", () => {
    it("should create instance", () => {
      const c = new FlowTypeGenerator({});
      expect(c.swagger).toEqual({});
    });

    it("should create instance with withExport", () => {
      const c = new FlowTypeGenerator({}, false);
      expect(c.withExport).toEqual(false);
    });

    describe("static functions", () => {
      it("should return true when passing string type", () => {
        const passingType = "string";
        expect(FlowTypeGenerator.isPrimitiveType(passingType)).toEqual(true);
      });

      it("should return true when passing boolean type", () => {
        const passingType = "boolean";
        expect(FlowTypeGenerator.isPrimitiveType(passingType)).toEqual(true);
      });

      it("should return true when passing number type", () => {
        const passingType = "number";
        expect(FlowTypeGenerator.isPrimitiveType(passingType)).toEqual(true);
      });

      it("should return true when passing integer type", () => {
        const passingType = "integer";
        expect(FlowTypeGenerator.isPrimitiveType(passingType)).toEqual(true);
      });

      it("should return definitionType", () => {
        const string = "#/definitions/Pet";
        expect(FlowTypeGenerator.definitionType(string)).toEqual("Pet");
      });

      it("should return empty string when passing wrong defintion", () => {
        const string = "#/Pet";
        expect(FlowTypeGenerator.definitionType(string)).toEqual("");
      });

      it("should have a next property", () => {
        const target = {
          id: {
            type: "string"
          },
          petId: {
            type: "string"
          }
        };
        expect(FlowTypeGenerator.hasNext("id", target)).toEqual(true);
      });

      it("should not have a next property", () => {
        const target = {
          id: {
            type: "string"
          },
          petId: {
            type: "string"
          }
        };
        expect(FlowTypeGenerator.hasNext("petId", target)).toEqual(false);
      });
    });
  });

  it("should generate expected flow types", () => {
    const file = path.join(__dirname, "__mocks__/swagger.yaml");
    const expected = path.join(__dirname, "__mocks__/expected.flow.js");
    const expectedString = fs.readFileSync(expected, "utf8");
    expect(generator(file)).toEqual(expectedString);
  });
});
