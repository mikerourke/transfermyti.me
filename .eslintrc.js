module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
  ],
  plugins: ["@typescript-eslint", "unicorn", "import", "svelte3"],
  settings: {
    "svelte3/typescript": () => require("typescript"),
    "import/resolver": {
      typescript: {
        project: ["tsconfig.json"],
        extensions: [".ts", ".d.ts", ".json", ".svelte", ".mjs"],
      },
    },
  },
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  ignorePatterns: ["node_modules"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    extraFileExtensions: [".svelte"],
  },
  rules: {
    curly: ["error", "all"],
    indent: "off",
    "no-unused-vars": "off",
    "@typescript-eslint/array-type": ["error", { default: "array" }],
    "@typescript-eslint/ban-ts-ignore": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/explicit-function-return-type": [
      "error",
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      },
    ],
    "@typescript-eslint/indent": "off",
    "@typescript-eslint/member-ordering": "error",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-parameter-properties": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        ignoreRestSiblings: true,
        argsIgnorePattern: "props|args|_",
        args: "after-used",
      },
    ],
    "@typescript-eslint/no-use-before-define": [
      "error",
      { functions: false, classes: false },
    ],
    "@typescript-eslint/no-var-requires": "off",
    "import/no-cycle": "error",
    "import/no-default-export": "error",
    "import/no-duplicates": "off",
    "import/no-unresolved": "error",
    "import/order": [
      "error",
      {
        alphabetize: { order: "asc", caseInsensitive: true },
        groups: [
          "builtin",
          "external",
          "internal",
          ["parent", "sibling"],
          "object",
        ],
        pathGroups: [
          {
            pattern: "~/**/!(*.svelte|components)",
            group: "internal",
          },
          {
            pattern: "~/**/*.svelte",
            group: "internal",
            position: "after",
          },
        ],
        "newlines-between": "always-and-inside-groups",
      },
    ],
    "unicorn/catch-error-name": [
      "error",
      {
        name: "err",
      },
    ],
    "unicorn/explicit-length-check": [
      "error",
      {
        "non-zero": "not-equal",
      },
    ],
    "unicorn/new-for-builtins": "error",
    "unicorn/no-new-buffer": "error",
    "unicorn/prefer-add-event-listener": "error",
    "unicorn/throw-new-error": "error",
  },
  overrides: [
    {
      files: ["*.svelte"],
      processor: "svelte3/svelte3",
      rules: {
        "@typescript-eslint/naming-convention": [
          "error",
          {
            selector: "default",
            format: ["camelCase", "PascalCase"],
            leadingUnderscore: "forbid",
            trailingUnderscore: "forbid",
          },
          {
            selector: "variable",
            format: ["camelCase", "PascalCase", "UPPER_CASE"],
          },
        ],
      },
    },
    {
      files: ["*.mjs"],
      rules: {
        "no-console": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "import/default": "off",
        "import/no-default-export": "off",
      },
    },
    {
      files: ["src/**/*.test.*"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "no-console": "off",
        "no-var": "off",
      },
    },
    {
      files: ["src/main.ts"],
      rules: {
        "@typescript-eslint/member-ordering": "off",
        "import/no-default-export": "off",
      },
    },
    {
      files: ["*.d.ts"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
  ],
};
