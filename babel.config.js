module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current",
        },
      },
    ],
    "@babel/preset-typescript",
  ],
  plugins: [
    [
      "module-resolver",
      {
        alias: {
          "^~/(.+)": "./src/\\1",
        },
      },
    ],
    "transform-inline-environment-variables",
  ],
};
