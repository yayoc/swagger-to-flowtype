#! /usr/bin/env node
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
  Object: "Object",
  string: "string",
  enum: "string"
};

const definitionTypeName = (ref): string => {
  const re = /#\/definitions\/(.*)/;
  const found = ref.match(re);
  return found ? found[1] : "";
};

const stripBrackets = (name: string) => name.replace(/[[\]']+/g, "");

const typeFor = (property: any): string => {
  if (property.type === "array") {
    if ("$ref" in property.items) {
      return `Array<${definitionTypeName(property.items.$ref)}>`;
    }
    return `Array<${typeMapping[property.items.type]}>`;
  }
  return typeMapping[property.type] || definitionTypeName(property.$ref);
};

const isRequired = (propertyName: string, definition: Object): boolean => {
  const result =
    definition.required && definition.required.indexOf(propertyName) >= 0;
  return result;
};

const propertyKeyForDefinition = (
  propName: string,
  definition: Object
): string => {
  if (program.checkRequired) {
    return `${propName}${isRequired(propName, definition) ? "" : "?"}`;
  }
  return propName;
};

const propertiesList = (definition: Object) => {
  if ("allOf" in definition) {
    return definition.allOf.map(propertiesList);
  }

  if (definition.$ref) {
    return { $ref: definitionTypeName(definition.$ref) };
  }

  if (
    !definition.properties ||
    Object.keys(definition.properties).length === 0
  ) {
    return {};
  }
  return Object.assign.apply(
    null,
    Object.keys(definition.properties).reduce(
      (properties: Array<Object>, propName: string) => {
        const arr = properties.concat({
          [propertyKeyForDefinition(propName, definition)]: typeFor(
            definition.properties[propName]
          )
        });
        return arr;
      },
      [{}]
    )
  );
};

const withExact = (property: string): string => {
  return property.replace(/{/g, "{|").replace(/}/g, "|}");
};

const propertiesTemplate = (properties: Object | Array<Object>): string => {
  if (Array.isArray(properties)) {
    return properties
      .map(
        property =>
          property.$ref
            ? `& ${property.$ref}`
            : program.exact
              ? withExact(JSON.stringify(property))
              : JSON.stringify(property)
      )
      .sort(a => (a[0] === "&" ? 1 : -1))
      .join(" ");
  }
  if (program.exact) {
    return withExact(JSON.stringify(properties));
  }
  return JSON.stringify(properties);
};

const generate = (swagger: Object) => {
  const g = Object.keys(swagger.definitions)
    .reduce((acc: Array<Object>, definitionName: string) => {
      const arr = acc.concat({
        title: stripBrackets(definitionName),
        properties: propertiesList(swagger.definitions[definitionName])
      });
      return arr;
    }, [])
    .map(definition => {
      const s = `export type ${definition.title} = ${propertiesTemplate(
        definition.properties
      ).replace(/"/g, "")};`;
      return s;
    })
    .join(" ");
  return g;
};

export const generator = (file: string) => {
  const ext = path.extname(file);
  let doc;
  if (ext === ".yaml") {
    doc = yaml.safeLoad(fs.readFileSync(file, "utf8"));
  } else {
    doc = JSON.parse(fs.readFileSync(file, "utf8"));
  }
  const options = {};
  const result = `// @flow\n${generate(doc)}`;
  return prettier.format(result, options);
};

export const writeToFile = (dist: string = "./flowtype.js", result: string) => {
  fs.writeFile(dist, result, err => {
    if (err) {
      throw err;
    }
  });
};

export const distFile = (p: Object) => p.destination || "./flowtype.js";

program
  .arguments("<file>")
  .option("-d --destination <destination>", "Destination path")
  .option("-cr --check-required", "Add question mark to optional properties")
  .option("-e --exact", "Add exact types")
  .action(file => {
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
