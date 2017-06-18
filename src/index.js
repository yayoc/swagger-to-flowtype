#! /usr/local/bin/node
// @flow
import program from "commander";
import prettier from "prettier";
import yaml from "js-yaml";
import fs from "fs";

// Swagger data types are base on types supported by the JSON-Scheme Draft4.

const swaggerFlowTypeMapping = {
  array: "Array<*>",
  boolean: "boolean",
  integer: "number",
  number: "number",
  null: "null",
  object: "Object",
  string: "string"
};

const isPrimitiveType = (type: string) => {
  return ["integer", "number", "string", "boolean"].indexOf(type) !== -1;
};

const definitionType = (ref: string) => {
  const re = /#\/definitions\/(.*)/;
  const found = ref.match(re);
  return found ? found[1] : null;
};

const hasNext = (key: string, definitions: Object) => {
  return (
    Object.keys(definitions).findIndex(v => v === key) <
    Object.keys(definitions).length - 1
  );
};

const generateFlowType = (key, definition) => {
  const returnString = "";
  const types = determineTypes(key, definition);
  return `type ${key} = ${types}`;
};

class FlowTypeGenerator {
  result: string;
  withExport: boolean;
  +swagger: Object;

  constructor(swagger, withExport = true) {
    this.result = "// @flow \n";
    this.withExport = withExport;
    (this: any).swagger = swagger;
  }

  definitions(): string {
    Object.keys(this.swagger).forEach((k, i) => {
      this.result += this.withExport ? `export type ${k} = ` : `type ${k} = `;
      const properties = this.swagger[k];
      this.determineTypes(k, this.swagger, true);
      this.result += `\n`;
    });
    return this.result;
  }

  determineTypes(key, properties, isPrimary = false) {
    const property = properties[key];
    if ("$ref" in property) {
      this.result += `${key}: ${definitionType(property["$ref"])}`;
      if (hasNext(key, properties)) {
        this.result += ",";
      }
    }

    if (isPrimitiveType(property.type)) {
      this.result += `${key}: ${swaggerFlowTypeMapping[property.type]}`;
      if (hasNext(key, properties)) {
        this.result += ",";
      }
    }

    if (property.type === "object") {
      if ("properties" in property) {
        if (!isPrimary) {
          this.result += `${key}: `;
        }
        this.result += `{`;
        Object.keys(property.properties).forEach(k => {
          this.determineTypes(k, property.properties);
        });
        this.result += `}`;
        if (hasNext(key, properties) && !isPrimary) {
          this.result += ",";
        }
      } else {
        this.result += `${key}: ${swaggerFlowTypeMapping[property.type]}`;
        if (hasNext(key, properties)) {
          this.result += ",";
        }
      }
    }

    if (property.type === "array") {
      const type: * = "$ref" in property.items
        ? definitionType(property.items["$ref"])
        : property.items.type;
      const typeString = `Array<${type}>`;
      this.result += `${key}: ${typeString}`;
      if (hasNext(key, properties)) {
        this.result += ",";
      }
    }
  }
}
program
  .arguments("<file>")
  .option("-d --distination <distination>", "Distination path")
  .action(function(file) {
    try {
      var doc = yaml.safeLoad(fs.readFileSync(file, "utf8"));
      const { definitions } = doc;
      const g = new FlowTypeGenerator(definitions);
      const options = {};
      const result = prettier.format(g.definitions(), options);
      const dist = program.distination ? program.distination : "./flowtype.js";
      fs.writeFile(dist, result, function(err) {
        console.log(err);
      });
      console.log("Generated flow types.");
    } catch (e) {
      console.log(e);
    }
  })
  .parse(process.argv);
