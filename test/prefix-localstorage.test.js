import prefixLocalStorage from "../index"; // 替换为你的插件的实际路径
import { parse } from "acorn";
describe("prefixLocalStorage", () => {
  const plugin = prefixLocalStorage({ prefix: "test_" });
  it("should prefix localStorage.getItem calls", async () => {
    const code = `localStorage.getItem('myKey');`;
    let transformedCode = code;
    const ast = parse(code, {
      ecmaVersion: 6,
      sourceType: "module",
    });
    if (plugin.transform) {
      const transformed = await plugin.transform(code, "test.js");
      if (transformed) {
        transformedCode = transformed.code;
      }
    }
    expect(transformedCode).toContain(`localStorage.getItem("test_"+"myKey");`);
  });
  it("should prefix localStorage.removeItem calls", async () => {
    const code = `localStorage.removeItem('myKey');`;
    let transformedCode = code;
    const ast = parse(code, {
      ecmaVersion: 6,
      sourceType: "module",
    });
    if (plugin.transform) {
      const transformed = await plugin.transform(code, "test.js");
      if (transformed) {
        transformedCode = transformed.code;
      }
    }
    expect(transformedCode).toContain(
      `localStorage.removeItem("test_"+"myKey");`,
    );
  });
  it("should prefix localStorage.key calls", async () => {
    const code = `localStorage.key('myKey');`;
    let transformedCode = code;
    const ast = parse(code, {
      ecmaVersion: 6,
      sourceType: "module",
    });
    if (plugin.transform) {
      const transformed = await plugin.transform(code, "test.js");
      if (transformed) {
        transformedCode = transformed.code;
      }
    }
    expect(transformedCode).toContain(`localStorage.key("test_"+"myKey");`);
  });
  it("should handle existing binary expressions", async () => {
    const code = `localStorage.setItem('prefix_' + 'myKey', 'myValue');`;
    let transformedCode = code;
    const ast = parse(code, {
      ecmaVersion: 6,
      sourceType: "module",
    });
    if (plugin.transform) {
      const transformed = await plugin.transform(code, "test.js");
      if (transformed) {
        transformedCode = transformed.code;
      }
    }
    expect(transformedCode).toContain(
      `localStorage.setItem("test_"+"prefix_"+"myKey", 'myValue');`,
    );
  });
  it("should not transform code if the filter excludes the file", async () => {
    const plugin = prefixLocalStorage({
      prefix: "test_",
      exclude: ["test.js"],
    });
    const code = `localStorage.setItem('myKey', 'myValue');`;
    let transformedCode = code;
    const ast = parse(code, {
      ecmaVersion: 6,
      sourceType: "module",
    });
    if (plugin.transform) {
      const transformed = await plugin.transform(code, "test.js");
      if (transformed) {
        transformedCode = transformed.code;
      }
    }
    expect(transformedCode).toBe(code);
  });
  it("should handle errors gracefully", async () => {
    const code = `localStorage.setItem('myKey', 'myValue'`; // Missing closing parenthesis
    const plugin = prefixLocalStorage({ prefix: "test_" }); // 创建插件实例
    if (plugin.transform) {
      const transformed = await plugin.transform(code, "test.js");
      expect(transformed).toBeNull(); // 期望转换结果为 null
    }
  });
});
