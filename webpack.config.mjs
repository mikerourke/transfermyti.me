import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import CopyPlugin from "copy-webpack-plugin";
import dotenv from "dotenv";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import webpack from "webpack";

import babelConfig from "./babel.config.js";

export const thisDirPath = path.dirname(fileURLToPath(import.meta.url));

const assetsDirPath = path.resolve(thisDirPath, "assets");

const buildOutDirPath = path.resolve(thisDirPath, "out", "build");

const sourceDirPath = path.resolve(thisDirPath, "src");

function getEnvironmentPlugin(env, argv) {
  let envEntries;

  const envFilePath = path.resolve(thisDirPath, ".env");

  if (!fs.existsSync(envFilePath)) {
    envEntries = {
      TMT_LOCAL_API_CLOCKIFY_EMPTY: false,
      TMT_LOCAL_API_TOGGL_EMPTY: false,
      TMT_LOCAL_API_PORT: 9009,
      TMT_USE_LOCAL_API: true,
      GA_DEBUG: true,
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
      template: path.resolve(sourceDirPath, "index.html"),
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
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
              ...babelConfig,
            },
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
        "~": path.resolve(thisDirPath, "src/"),
      },
      extensions: [".mjs", ".js", ".ts", ".tsx"],
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
