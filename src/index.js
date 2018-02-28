#! /usr/bin/env node
// @flow
import program from "commander";
import prettier from "prettier";
import yaml from "js-yaml";
import fs from "fs";
import path from "path";
import axios from "axios";

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
    } else if (property.items.type === "object") {
      const child = propertiesTemplate(propertiesList(property.items)).replace(
        /"/g,
        ""
      );
      return `Array<${child}>`;
    }
    return `Array<${typeMapping[property.items.type]}>`;
  } else if (property.type === "string" && "enum" in property) {
    return property.enum.map(e => `'${e}'`).join(" | ");
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

  if ("type" in definition && definition.type !== "object") {
    return typeFor(definition);
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
  const result = property.replace(/{[^|]/g, "{|").replace(/[^|]}/g, "|}");
  return result;
};

const propertiesTemplate = (
  properties: Object | Array<Object> | string
): string => {
  if (typeof properties === "string") {
    return properties;
  }
  if (Array.isArray(properties)) {
    return properties
      .map(property => {
        let p = property.$ref ? `& ${property.$ref}` : JSON.stringify(property);
        if (!property.$ref && program.exact) {
          p = withExact(p);
        }
        return p;
      })
      .sort(a => (a[0] === "&" ? 1 : -1))
      .join(" ");
  }
  if (program.exact) {
    return withExact(JSON.stringify(properties));
  }
  return JSON.stringify(properties);
};

const generate = (swagger: Object): string => {
  if (!swagger.definitions) {
    throw new Error("There is no definition");
  }
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

export const generator = (content: Object) => {
  const options = {};
  const result = `// @flow\n${generate(content)}`;
  return prettier.format(result, options);
};

export const writeToFile = (dist: string = "./flowtype.js", result: string) => {
  fs.writeFile(dist, result, err => {
    if (err) {
      throw err;
    }
  });
};

export const isUrl = (value: string): boolean =>
  value.match(/https?:\/\//) !== null;

export const distFile = (p: Object, inputFileName: string): string => {
  if (p.destination) {
    return p.destination;
  }
  if (isUrl(inputFileName)) {
    return "./flowtype.js";
  }

  const ext = path.parse(inputFileName).ext;
  return inputFileName.replace(ext, ".js");
};

export const getContentFromFile = (file: string): Object => {
  const ext = path.extname(file);
  const readFile = fs.readFileSync(file, "utf8");
  return ext === ".yaml" ? yaml.safeLoad(readFile) : JSON.parse(readFile);
};

export const isJSON = (value: string): boolean => {
  try {
    JSON.parse(value);
    return true;
  } catch (e) {
    return false;
  }
};

export const getContentFromUrl = (url: string): Promise<Object> =>
  axios({
    method: "get",
    url,
    responseType: "arraybuffer"
  }).then(response => {
    const { data } = response;
    return isJSON(data) ? JSON.parse(data) : yaml.safeLoad(data);
  });

export const getContent = (fileOrUrl: string): Promise<Object> => {
  if (isUrl(fileOrUrl)) {
    return getContentFromUrl(fileOrUrl);
  }
  const content = getContentFromFile(fileOrUrl);
  return Promise.resolve(content);
};

program
  .arguments("<file>")
  .option("-d --destination <destination>", "Destination path")
  .option("-cr --check-required", "Add question mark to optional properties")
  .option("-e --exact", "Add exact types")
  .action(async file => {
    try {
      const content = await getContent(file);
      const result = generator(content);
      const dist = distFile(program, file);
      writeToFile(dist, result);
      console.log(`Generated flow types to ${dist}`);
    } catch (e) {
      console.log(e);
    }
  })
  .parse(process.argv);
