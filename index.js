import { createFilter } from "@rollup/pluginutils";

/**
 * Add a custom prefix to the `setItem`, `getItem`, and `removeItem` methods of `localStorage` to avoid naming collisions.
 *
 * @typedef {Object} PrefixLocalStorageOptions
 * @property {string} [prefix='_'] - The prefix to add to localStorage keys. Defaults to "_".
 * @property {string[]} [include=['**\/*.js', '**\/*.ts', '**\/*.jsx', '**\/*.tsx']] - Minimatch patterns for files to include. Defaults to all common JavaScript/TypeScript source files.
 * @property {string[]} [exclude=['**\/node_modules\/**', '**\/dist\/**']] - Minimatch patterns for files to exclude. Defaults to excluding `node_modules` and `dist` directories.
 *
 * @param {PrefixLocalStorageOptions} [options={ prefix: '_', include: ['**\/*.js', '**\/*.ts', '**\/*.jsx', '**\/*.tsx'], exclude: ['**\/node_modules\/**', '**\/dist\/**'] }] - Configuration options for prefixing localStorage.
 * @returns
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
        const regex =
          /(localStorage|window\.localStorage)\.(setItem|getItem|removeItem)\(\s*/g;
        const transformedCode = code.replace(regex, `$1.$2('${prefix}' + `);

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
