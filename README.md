# rollup-plugin-prefix-localstorage

Add a custom prefix to the `setItem`, `getItem`, and `removeItem` methods of `localStorage` to avoid naming collisions.

## Install

```bash
npm install rollup-plugin-prefix-localstorage --save-dev
```

```bash
pnpm add rollup-plugin-prefix-localstorage -D
```

```bash
yarn add rollup-plugin-prefix-localstorage --dev
```

## Usage

```js
// rollup.config.mjs
import prefixLocalStorage from "rollup-plugin-prefix-localstorage";

export default {
  input: "src/main.js",
  output: {
    file: "bundle.js",
    format: "cjs",
  },
  plugins: [prefixLocalStorage({ prefix: "vr_" })],
};
```

```js
// before
export default function () {
  const a = 1;
  const getName = () => "v";
  localStorage.setItem(a, a);
  localStorage.getItem(`${a}item`);
  localStorage.getItem("v" + a + getName());
  localStorage.removeItem("v" + a + a);
  const b = localStorage.getItem("v", a);
  console.log(b);
}

// after
function main() {
  const a = 1;
  const getName = () => "v";
  localStorage.setItem("vr_" + a, a);
  localStorage.getItem("vr_" + `${a}item`);
  localStorage.getItem("vr_" + "v" + a + getName());
  localStorage.removeItem("vr_" + "v" + a + a);
  const b = localStorage.getItem("vr_" + "v", a);
  console.log(b);
}
```

## Options

| Option    | Type       | Default                                          | Description                                                                     |
| --------- | ---------- | ------------------------------------------------ | ------------------------------------------------------------------------------- |
| `prefix`  | `string`   | `"_"`                                            | The prefix string to add to localStorage keys.                                  |
| `include` | `string[]` | `['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx']` | A minimatch pattern, or array of patterns, that specifies the files to include. |
| `exclude` | `string[]` | `['**/node_modules/**', '**/dist/**']`           | A minimatch pattern, or array of patterns, that specifies the files to exclude. |
