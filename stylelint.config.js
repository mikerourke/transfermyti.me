const rules = {
  "comment-empty-line-before": null,
  // See https://stylelint.io/user-guide/rules/list/declaration-colon-newline-after/
  "declaration-colon-newline-after": null,
  // See https://stylelint.io/user-guide/rules/list/value-list-comma-newline-after/
  "value-list-comma-newline-after": null,
  // See https://stylelint.io/user-guide/rules/list/indentation/
  indentation: null,
  "selector-class-pattern": null,
  // Disabling these to accommodate for older browsers:
  "alpha-value-notation": null,
  "color-function-notation": null,
};

module.exports = {
  extends: "stylelint-config-standard",
  plugins: ["@ronilaukkarinen/stylelint-a11y"],
  overrides: [
    {
      files: ["**/*.html", "**/*.svelte"],
      customSyntax: "postcss-html",
      rules: {
        ...rules,
        "custom-property-empty-line-before": null,
        "string-quotes": null,
      },
    },
  ],
  rules,
  ignoreFiles: ["**/*.js", "**/*.md", "out/**/*"],
};
