module.exports = {
  bracketSpacing: true,
  singleQuote: false,
  printWidth: 80,
  trailingComma: "all",
  endOfLine: "auto",
  plugins: ["./node_modules/prettier-plugin-svelte"],
  overrides: [
    {
      files: "*.svelte",
      options: {
        parser: "svelte",
        svelteSortOrder: "scripts-styles-options-markup",
      },
    },
    {
      files: ["*.test.ts"],
      options: {
        printWidth: 100,
      },
    },
  ],
};
