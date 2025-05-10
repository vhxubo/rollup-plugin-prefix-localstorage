import { rollup } from "rollup";
import prefixLocalStorage from "../index";
import fs from "fs";
import path from "path";

const testCases = [
  {
    description: "should prefix localStorage.getItem with default prefix",
    input: `localStorage.getItem('myKey');`,
    output: `localStorage.getItem('_myKey');`,
  },
  {
    description: "should prefix localStorage.setItem with default prefix",
    input: `localStorage.setItem("myKey", 'value');`,
    output: `localStorage.setItem("_myKey", 'value');`,
  },
  {
    description: "should prefix localStorage.removeItem with default prefix",
    input: `localStorage.removeItem(\`myKey\`);`,
    output: `localStorage.removeItem(\`_myKey\`);`,
  },
  {
    description: "should prefix localStorage.key with default prefix",
    input: `localStorage.key('myKey');`,
    output: `localStorage.key('_myKey');`,
  },
  {
    description: "should prefix localStorage with custom prefix",
    input: `localStorage.getItem('myKey');`,
    options: { prefix: "custom_" },
    output: `localStorage.getItem('custom_myKey');`,
  },
  {
    description: "should prefix localStorage with custom prefix variable",
    input: `localStorage.getItem(\`name\${myKey}\`);`,
    options: { prefix: "custom_" },
    output: `localStorage.getItem(\`custom_name\${myKey}\`);`,
  },
  {
    description: "should handle different quote types",
    input: `localStorage.getItem("myKey"); localStorage.getItem(\`myKey\`); localStorage.getItem('myKey');`,
    output: `localStorage.getItem("_myKey"); localStorage.getItem(\`_myKey\`); localStorage.getItem('_myKey');`,
  },
  {
    description: "should not modify code without localStorage calls",
    input: `const a = 1; console.log(a);`,
    output: `const a = 1; console.log(a);`,
  },
  {
    description: "should handle empty key",
    input: `localStorage.getItem('');`,
    output: `localStorage.getItem('_');`,
  },
  {
    description: "should work with existing underscores",
    input: `localStorage.getItem('__test');`,
    output: `localStorage.getItem('___test');`,
  },
];

describe("prefix-localstorage", () => {
  testCases.forEach(({ description, input, output, options }) => {
    it(description, async () => {
      const inputFile = path.resolve(__dirname, "fixtures/input.js");
      const outputFile = path.resolve(__dirname, "output/bundle.js");
      const outputDir = path.dirname(outputFile);

      // Create input file
      fs.writeFileSync(inputFile, input);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const bundle = await rollup({
        input: inputFile,
        plugins: [prefixLocalStorage(options)],
        // Suppress warnings about external dependencies
        onwarn: () => {},
      });

      await bundle.write({
        file: outputFile,
        format: "es",
      });

      const generatedCode = fs.readFileSync(outputFile, "utf-8");

      expect(generatedCode.trim()).toBe(output.trim());

      // Clean up files
      fs.unlinkSync(inputFile);
      fs.unlinkSync(outputFile);
      fs.rmdirSync(outputDir);
    });
  });

  it("should only transform included files", async () => {
    const inputFile1 = path.resolve(__dirname, "fixtures/input1.js");
    const inputFile2 = path.resolve(__dirname, "fixtures/input2.js");
    const outputFile = path.resolve(__dirname, "output/bundle.js");
    const outputDir = path.dirname(outputFile);

    // Create input files
    fs.writeFileSync(inputFile1, `localStorage.getItem('myKey');`);
    fs.writeFileSync(inputFile2, `localStorage.getItem('myKey');`);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const bundle = await rollup({
      input: [inputFile1, inputFile2],
      plugins: [prefixLocalStorage({ include: ["**/input1.js"] })],
      onwarn: () => {},
    });

    await bundle.write({
      dir: outputDir, // Use dir instead of file when input is an array
      format: "es",
      entryFileNames: "[name].js", // Ensure each input file has its own output
    });

    const generatedCode1 = fs.readFileSync(
      path.join(outputDir, "input1.js"),
      "utf-8",
    );
    const generatedCode2 = fs.readFileSync(
      path.join(outputDir, "input2.js"),
      "utf-8",
    );

    expect(generatedCode1.trim()).toBe(`localStorage.getItem('_myKey');`);
    expect(generatedCode2.trim()).toBe(`localStorage.getItem('myKey');`);

    // Clean up files
    fs.unlinkSync(inputFile1);
    fs.unlinkSync(inputFile2);
    fs.unlinkSync(path.join(outputDir, "input1.js"));
    fs.unlinkSync(path.join(outputDir, "input2.js"));
    fs.rmdirSync(outputDir);
  });

  it("should exclude specified files", async () => {
    const inputFile = path.resolve(__dirname, "fixtures/input.js");
    const outputFile = path.resolve(__dirname, "output/bundle.js");
    const outputDir = path.dirname(outputFile);

    fs.writeFileSync(inputFile, `localStorage.getItem('myKey');`);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const bundle = await rollup({
      input: inputFile,
      plugins: [prefixLocalStorage({ exclude: ["**/input.js"] })],
      onwarn: () => {},
    });

    await bundle.write({
      file: outputFile,
      format: "es",
    });

    const generatedCode = fs.readFileSync(outputFile, "utf-8");

    expect(generatedCode.trim()).toBe(`localStorage.getItem('myKey');`);

    fs.unlinkSync(inputFile);
    fs.unlinkSync(outputFile);
    fs.rmdirSync(outputDir);
  });
});
