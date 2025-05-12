import { createFilter } from "@rollup/pluginutils";
import { parse } from "acorn";
import { walk } from "estree-walker";
import { generate } from "escodegen";

/**
 * Prefixes localStorage `setItem`, `getItem`, and `removeItem` to avoid naming collisions.
 *
 * @typedef {Object} PrefixLocalStorageOptions
 * @property {string} [prefix='_'] - The prefix to add to localStorage keys. Defaults to "_".
 * @property {string[]} [include=['**\/*.js', '**\/*.ts', '**\/*.jsx', '**\/*.tsx']] - Minimatch patterns for files to include. Defaults to all common JavaScript/TypeScript source files.
 * @property {string[]} [exclude=['**\/node_modules\/**', '**\/dist\/**']] - Minimatch patterns for files to exclude. Defaults to excluding `node_modules` and `dist` directories.
 *
 * @param {PrefixLocalStorageOptions} [options={ prefix: '_', include: ['**\/*.js', '**\/*.ts', '**\/*.jsx', '**\/*.tsx'], exclude: ['**\/node_modules\/**', '**\/dist\/**'] }] - Configuration options for prefixing localStorage.
 * @returns {void}
 */
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
              node.type === "CallExpression" &&
              node.callee.type === "MemberExpression" &&
              node.callee.object.name === "localStorage" &&
              ["setItem", "getItem", "removeItem", "key"].includes(
                node.callee.property.name,
              )
            ) {
              const firstArgument = node.arguments[0];
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
                node.arguments[0] = newArgument;
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
