#! /usr/local/bin/node
// @flow
import program from "commander";
import prettier from "prettier";
import yaml from "js-yaml";
import fs from "fs";
import path from "path";

// Swagger data types are base on types supported by the JSON-Scheme Draft4.
const typeMapping = {
  array: "Array<*>",
  boolean: "boolean",
  integer: "number",
  number: "number",
  null: "null",
  object: "Object",
  string: "string"
};

export class FlowTypeGenerator {
  result: string;
  +withExport: boolean;
  +swagger: Object;

  constructor(swagger: Object, withExport: boolean = true) {
    if (!swagger) {
      throw new Error("Can't create FlowTypeGenerator");
    }
    this.result = "// @flow \n";
    (this: any).withExport = withExport;
    (this: any).swagger = swagger;
  }

  static isPrimitiveType(type: string) {
    return ["integer", "number", "string", "boolean"].indexOf(type) !== -1;
  }

  static definitionType(ref: string) {
    const re = /#\/definitions\/(.*)/;
    const found = ref.match(re);
    return found ? found[1] : "";
  }

  static hasNext(key: string, definitions: Object) {
    const keys = Object.keys(definitions);
    return keys.findIndex(v => v === key) < keys.length - 1;
  }

  definitions(): string {
    const { definitions } = this.swagger;
    Object.keys(definitions).forEach((k) => {
      const headLine = this.withExport ? `export type ${k} = ` : `type ${k} = `;
      this.appendResult(headLine);
      this.determineTypes(k, definitions, true);
      this.appendResult("\n");
    });
    return this.result;
  }

  appendResult(text: string) {
    this.result += text;
  }

  determineTypes(key: string, properties: Object, isPrimary: boolean = false) {
    const property = properties[key];
    if ("$ref" in property) {
      this.appendResult(
        `${key}: ${FlowTypeGenerator.definitionType(property.$ref)}`
      );
      if (FlowTypeGenerator.hasNext(key, properties)) {
        this.appendResult(",");
      }
    }

    if (FlowTypeGenerator.isPrimitiveType(property.type)) {
      this.appendResult(`${key}: ${typeMapping[property.type]}`);
      if (FlowTypeGenerator.hasNext(key, properties)) {
        this.appendResult(",");
      }
    }

    if (property.type === "object") {
      if ("properties" in property) {
        if (!isPrimary) {
          this.appendResult(`${key}: `);
        }
        this.appendResult("{");
        Object.keys(property.properties).forEach((k) => {
          this.determineTypes(k, property.properties);
        });
        this.appendResult("}");
        if (FlowTypeGenerator.hasNext(key, properties) && !isPrimary) {
          this.appendResult(",");
        }
      } else if (isPrimary) {
        this.appendResult(`${typeMapping[property.type]}`);
      } else {
        this.appendResult(`${key}: ${typeMapping[property.type]}`);
        if (FlowTypeGenerator.hasNext(key, properties)) {
          this.appendResult(",");
        }
      }
    }

    if (property.type === "array") {
      const type: * = "$ref" in property.items
        ? FlowTypeGenerator.definitionType(property.items.$ref)
        : property.items.type;
      const typeString = `Array<${type}>`;
      this.appendResult(`${key}: ${typeString}`);
      if (FlowTypeGenerator.hasNext(key, properties)) {
        this.appendResult(",");
      }
    }
  }
}

export const generator = (file: string) => {
  const doc: Object = path.extname(file) === ".yaml"
    ? yaml.safeLoad(fs.readFileSync(file, "utf8"))
    : JSON.parse(fs.readFileSync(file, "utf8"));
  const g = new FlowTypeGenerator(doc);
  const options = {};
  return prettier.format(g.definitions(), options);
};

export const writeToFile = (dist: string = "./flowtype.js", result: string) => {
  fs.writeFile(dist, result, (err) => {
    if (err) {
      throw err;
    }
  });
};

export const distFile = (p: Object) => p.distination || "./flowtype.js";

program
  .arguments("<file>")
  .option("-d --distination <distination>", "Distination path")
  .action((file) => {
    try {
      const result = generator(file);
      const dist = distFile(program);
      writeToFile(dist, result);
      console.log(`Generated flow types to ${dist}`);
    } catch (e) {
      console.log(e);
    }
  })
  .parse(process.argv);
