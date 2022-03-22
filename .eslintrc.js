module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:jsx-a11y/recommended",
  ],
  plugins: [
    "@typescript-eslint",
    "react",
    "unicorn",
    "import",
    "jsx-a11y",
    "svelte3",
  ],
  settings: {
    "svelte3/typescript": () => require("typescript"),
    react: {
      version: "detect",
    },
    "import/resolver": {
      alias: {
        map: [["~", "./src/"]],
        extensions: [".ts", ".mjs", ".js", ".tsx", ".svelte"],
      },
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx", ".svelte"],
      },
    },
  },
  env: {
    es6: true,
    browser: true,
    node: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
    extraFileExtensions: [".ts", ".tsx", ".svelte"],
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
    "import/no-default-export": "error",
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
            pattern: "~/**",
            group: "internal",
          },
        ],
        "newlines-between": "always-and-inside-groups",
      },
    ],
    "react/jsx-curly-spacing": [
      "error",
      {
        when: "never",
      },
    ],
    "react/prop-types": "off",
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
      files: ["*.svelte", "*.ts"],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.json"],
      },
    },
    {
      files: ["*.svelte"],
      processor: "svelte3/svelte3",
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
      files: ["*.tsx"],
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
