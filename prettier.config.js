module.exports = {
  bracketSpacing: true,
  singleQuote: false,
  printWidth: 80,
  trailingComma: "all",
  endOfLine: "auto",
  overrides: [
    {
      files: ["*.test.ts"],
      options: {
        printWidth: 100,
      },
    },
  ],
};
