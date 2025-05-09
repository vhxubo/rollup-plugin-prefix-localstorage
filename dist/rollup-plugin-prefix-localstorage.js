import { createFilter } from '@rollup/pluginutils';

function prefixLocalStorage(options) {
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

      const prefixedCode = code
        .replace(
          /localStorage\.getItem\((['"`])(.*?)\1\)/g,
          `localStorage.getItem($1${prefix}$2$1)`,
        )
        .replace(
          /localStorage\.setItem\((['"`])(.*?)\1,\s/g,
          `localStorage.setItem($1${prefix}$2$1, `,
        )
        .replace(
          /localStorage\.removeItem\((['"`])(.*?)\1\)/g,
          `localStorage.removeItem($1${prefix}$2$1)`,
        )
        .replace(
          /localStorage\.key\((['"`])(.*?)\1\)/g,
          `localStorage.key($1${prefix}$2$1)`,
        );

      return {
        code: prefixedCode,
        map: null,
      };
    },
  };
}

export { prefixLocalStorage as default };
