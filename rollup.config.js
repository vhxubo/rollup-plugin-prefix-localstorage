import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "index.js",
  output: {
    file: "dist/rollup-plugin-prefix-localstorage.js",
    format: "es",
  },
  plugins: [nodeResolve()],
};
