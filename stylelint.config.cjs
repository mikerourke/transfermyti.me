const rules = {
  "comment-empty-line-before": null,
  "selector-class-pattern": null,
  // Disabling these to accommodate for older browsers:
  "alpha-value-notation": null,
  "color-function-notation": null,
  "media-feature-range-notation": null,
  "declaration-block-no-redundant-longhand-properties": null,
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
      },
    },
  ],
  rules,
  ignoreFiles: ["**/*.js", "**/*.ts", "**/*.snap", "**/*.md", "out/**/*"],
};
