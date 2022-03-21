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
    "@babel/plugin-proposal-numeric-separator",
    [
      "transform-inline-environment-variables",
      {
        exclude: ["USE_LOCAL_API", "PARCEL_SERVE"],
      },
    ],
    [
      "jsx-pragmatic",
      {
        export: "jsx",
        module: "@emotion/react",
        import: "___EmotionJSX",
      },
    ],
    [
      "@babel/plugin-transform-react-jsx",
      {
        pragma: "___EmotionJSX",
        pragmaFrag: "React.Fragment",
      },
    ],
    [
      "@emotion/babel-plugin",
      {
        autoLabel: "dev-only",
        labelFormat: "[local]",
      },
    ],
  ],
};
