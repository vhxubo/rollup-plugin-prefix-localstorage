import { createFilter } from "@rollup/pluginutils";
import { parse } from "acorn";
import { walk } from "estree-walker";
import { generate } from "escodegen";

export default function prefixLocalStorage(options) {
  const {
    prefix = "_",
    include = ["**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx"],
    exclude = ["**/node_modules/**", "**/dist/**"],
  } = options || {};

  const filter = createFilter(include, exclude);

  return {
    name: "prefix-localstorage",
    transform(code, id) {
      if (!filter(id)) {
        return null;
      }

      try {
        const ast = parse(code, {
          ecmaVersion: 6,
          sourceType: "module",
        });

        walk(ast, {
          enter(node) {
            if (
              node.type === "ExpressionStatement" &&
              node.expression.type === "CallExpression" &&
              node.expression.callee.type === "MemberExpression" &&
              node.expression.callee.object.name === "localStorage" &&
              ["setItem", "getItem", "removeItem", "key"].includes(
                node.expression.callee.property.name,
              )
            ) {
              const firstArgument = node.expression.arguments[0];
              if (firstArgument) {
                const newArgument = {
                  type: "BinaryExpression",
                  operator: "+",
                  left: {
                    type: "Literal",
                    value: prefix,
                    raw: `'${prefix}'`,
                  },
                  right: firstArgument,
                };
                node.expression.arguments[0] = newArgument;
                this.replace(node);
              }
            }
          },
        });

        const transformedCode = generate(ast);

        return {
          code: transformedCode,
          map: null,
        };
      } catch (error) {
        console.error(`Error processing file ${id}: ${error.message}`);
        return null;
      }
    },
  };
}
