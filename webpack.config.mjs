import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import CopyPlugin from "copy-webpack-plugin";
import dotenv from "dotenv";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import webpack from "webpack";

import babelConfig from "./babel.config.js";
import svelteConfig from "./svelte.config.js";

export const thisDirPath = path.dirname(fileURLToPath(import.meta.url));

const assetsDirPath = path.resolve(thisDirPath, "assets");

const buildOutDirPath = path.resolve(thisDirPath, "out", "build");

const sourceDirPath = path.resolve(thisDirPath, "src");

const htmlTemplate = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="author" content="Mike Rourke" />
    <meta
      name="description"
      content="Transfer your data between time tracking tools."
    />
    <meta property="og:title" content="transfermyti.me" />
    <meta
      name="og:description"
      content="Transfer your data between time tracking tools."
    />
    <meta
      name="og:image"
      content="https://transfermyti.me/images/logo-card.png"
    />
    <meta name="og:type" content="website" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:url" content="https://transfermyti.me" />
    <meta name="twitter:title" content="transfermyti.me" />
    <meta
      name="twitter:description"
      content="Transfer your data between time tracking tools."
    />
    <meta
      name="twitter:image"
      content="https://transfermyti.me/images/logo-card.png"
    />
    <meta name="twitter:image:width" content="600" />
    <meta name="twitter:image:height" content="600" />
    <meta name="twitter:site" content="@codelikeawolf" />
    <meta name="twitter:creator" content="@codelikeawolf" />
    <meta name="keywords" content="toggl,clockify,transfer" />
    <link
      rel="apple-touch-icon"
      sizes="180x180"
      href="/images/apple-touch-icon.png"
    />
    <link
      rel="icon"
      type="image/png"
      sizes="32x32"
      href="/images/favicon-32x32.png"
    />
    <link
      rel="icon"
      type="image/png"
      sizes="16x16"
      href="/images/favicon-16x16.png"
    />
    <link rel="manifest" href="/site.webmanifest" />
    <meta name="msapplication-TileColor" content="#1e78a1" />
    <meta name="theme-color" content="#effde8" />
    <title>transfermyti.me</title>
  </head>
  <body></body>
</html>
`;

function getEnvironmentPlugin(env, argv) {
  let envEntries;

  const envFilePath = path.resolve(thisDirPath, ".env");

  if (!fs.existsSync(envFilePath)) {
    envEntries = {
      TMT_LOCAL_API_CLOCKIFY_EMPTY: false,
      TMT_LOCAL_API_TOGGL_EMPTY: false,
      TMT_LOCAL_API_PORT: 9009,
      TMT_USE_LOCAL_API: true,
    };
  } else {
    const contents = fs.readFileSync(envFilePath);

    envEntries = dotenv.parse(contents);
  }

  envEntries = {
    ...envEntries,
    ...env,
  };

  for (const [key, value] of Object.entries(envEntries)) {
    envEntries[key] = JSON.stringify(value);
  }

  return new webpack.DefinePlugin({
    "process.env": {
      NODE_ENV: JSON.stringify(argv.mode),
      ...envEntries,
    },
  });
}

// noinspection JSUnusedGlobalSymbols
export default function webpackConfiguration(env, argv) {
  const isDevelopment = argv.mode === "development";

  const plugins = [];

  if (isDevelopment) {
    plugins.push(getEnvironmentPlugin(env, argv));
  }

  plugins.push(
    new HtmlWebpackPlugin({
      templateContent: htmlTemplate,
    }),

    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(assetsDirPath, "images"),
          to: path.resolve(buildOutDirPath, "images"),
        },
        {
          from: path.resolve(assetsDirPath, "browserconfig.xml"),
          to: path.resolve(buildOutDirPath, "browserconfig.xml"),
        },
        {
          from: path.resolve(assetsDirPath, "robots.txt"),
          to: path.resolve(buildOutDirPath, "robots.txt"),
        },
        {
          from: path.resolve(assetsDirPath, "site.webmanifest"),
          to: path.resolve(buildOutDirPath, "site.webmanifest"),
        },
      ],
    }),
  );

  if (!isDevelopment) {
    plugins.push(
      // Extract CSS to a separate file in production:
      new MiniCssExtractPlugin(),
    );
  }

  return {
    devtool: isDevelopment ? "source-map" : false,
    mode: argv.mode,
    entry: path.join(sourceDirPath, "index.tsx"),
    module: {
      rules: [
        {
          test: /\.(js|ts|tsx)$/i,
          exclude: /node_modules|\.svelte/,
          use: {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
              ...babelConfig,
            },
          },
        },
        {
          test: /\.(html|svelte)$/,
          use: {
            loader: "svelte-loader",
            options: {
              compilerOptions: {
                dev: isDevelopment,
              },
              emitCss: !isDevelopment,
              hotReload: isDevelopment,
              preprocess: svelteConfig.preprocess,
            },
          },
        },
        {
          // Required to prevent errors from Svelte on Webpack 5+:
          test: /node_modules\/svelte\/.*\.mjs$/,
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.css$/,
          use: [
            isDevelopment ? "style-loader" : MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                url: true,
              },
            },
          ],
        },
        {
          test: /\.(png|jp(e)g|gif|svg)$/i,
          type: "asset/inline",
        },
        {
          test: /\.(woff(2)?|eot)$/,
          type: "asset/resource",
          generator: {
            filename: "assets/[name][ext]",
          },
        },
        {
          test: /\.ttf$/,
          type: "asset/resource",
        },
      ],
    },
    output: {
      filename: "[name].js",
      path: buildOutDirPath,
    },
    plugins,
    resolve: {
      alias: {
        svelte: path.resolve("node_modules", "svelte"),
        "~": path.resolve(thisDirPath, "src/"),
      },
      extensions: [".mjs", ".js", ".ts", ".tsx", ".svelte"],
      mainFields: ["svelte", "browser", "module", "main"],
    },
    stats: "errors-only",
    devServer: {
      compress: true,
      historyApiFallback: true,
      client: {
        logging: "error",
        overlay: {
          warnings: false,
          errors: true,
        },
      },
      hot: true,
      open: false,
    },
  };
}
