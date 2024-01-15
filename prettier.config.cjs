module.exports = {
  trailingComma: "all",
  plugins: [require("prettier-plugin-svelte")],
  htmlWhitespaceSensitivity: "ignore",
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
