/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

 import path from "path";
 import type webpack from "webpack";
 import HtmlWebpackPlugin from "html-webpack-plugin";
 import MiniCssExtractPlugin from "mini-css-extract-plugin";
 import ForkTsCheckerPlugin from "fork-ts-checker-webpack-plugin";
 import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";
 import CircularDependencyPlugin from "circular-dependency-plugin";
 import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
 import type { WebpackPluginInstance } from "webpack";
 import { DefinePlugin } from "webpack";
 import { assetsFolderName, isDevelopment, rendererDir, buildDir, htmlTemplate, publicPath, sassCommonVars } from "./vars";
 import { platform } from "process";
 
 const renderer: webpack.Configuration = {
  target: "electron-renderer",
  name: "lens-app-renderer",
  mode: isDevelopment ? "development" : "production",
  // https://webpack.js.org/configuration/devtool/ (see description of each option)
  devtool: isDevelopment ? "cheap-module-source-map" : "source-map",
  cache: isDevelopment ? { type: "filesystem" } : false,
  entry: {
    lens: path.resolve(rendererDir, "index.ts"),
  },
  output: {
    libraryTarget: "global",
    globalObject: "this",
    publicPath,
    path: buildDir,
    filename: "[name].js",
    chunkFilename: "chunks/[name].js",
    assetModuleFilename: `${assetsFolderName}/[name][ext][query]`,
  },
  watchOptions: {
    ignored: /node_modules/, // https://webpack.js.org/configuration/watch/
  },
  ignoreWarnings: [
    /Critical dependency: the request of a dependency is an expression/,
    /require.extensions is not supported by webpack./, // handlebars
    /\[ReactRefreshPlugin] .*?HMR.*? is not enabled/, // enabled in webpack.dev-server
  ],
  resolve: {
    extensions: [
      ".js", ".jsx", ".json",
      ".ts", ".tsx",
    ],
  },
  externals: [
    "npm",
    "win-ca"
  ],
  optimization: {
    minimize: false,
  },
  module: {
    parser: {
      javascript: {
        commonjsMagicComments: true,
      },
    },
    rules: [
      {
        test: /\.node$/,
        use: "node-loader",
      },
      {
      test: /\.tsx?$/,
      loader: "ts-loader",
      options: {},
      },
      cssModulesWebpackRule(),
      ...iconsAndImagesWebpackRules(),
      ...fontsLoaderWebpackRules(),
    ],
  },

  plugins: [
    new DefinePlugin({
      CONTEXT_MATCHER_FOR_NON_FEATURES: `/\\.injectable(\\.${platform})?\\.tsx?$/`,
      CONTEXT_MATCHER_FOR_FEATURES: `/\\/(renderer|common)\\/.+\\.injectable(\\.${platform})?\\.tsx?$/`,
    }),
    new ForkTsCheckerPlugin(),

    // see also: https://github.com/Microsoft/monaco-editor-webpack-plugin#options
    new MonacoWebpackPlugin({
      // publicPath: "/",
      // filename: "[name].worker.js",
      languages: ["json", "yaml"],
      globalAPI: isDevelopment,
    }),

    new HtmlWebpackPlugin({
      filename: "index.html",
      template: htmlTemplate,
      inject: true,
      hash: true,
      templateParameters: {
        assetPath: `${publicPath}${assetsFolderName}`,
      },
    }),

    new CircularDependencyPlugin({
      cwd: __dirname,
      exclude: /node_modules/,
      failOnError: true,
    }) as unknown as WebpackPluginInstance,

    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),

    ...(
      isDevelopment
        ? [new ReactRefreshWebpackPlugin()]
        : []
    ),
  ],
};
 
 /**
  * Import icons and image files.
  * Read more about asset types: https://webpack.js.org/guides/asset-modules/
  */
 export function iconsAndImagesWebpackRules(): webpack.RuleSetRule[] {
   return [
     {
       test: /\.svg$/,
       type: "asset/source", // exports the source code of the asset, so we get XML
     },
     {
       test: /\.(jpg|png|ico)$/,
       type: "asset/resource", // path to file, e.g. "/static/build/assets/*"
     },
   ];
 }
 
 /**
  * Import custom fonts as URL.
  */
 export function fontsLoaderWebpackRules(): webpack.RuleSetRule[] {
   return [
     {
       test: /\.(ttf|eot|woff2?)$/,
       type: "asset/resource",
     },
   ];
 }
 
 export interface CssModulesWebpackRuleOptions {
   styleLoader?: string;
 }
 
 /**
  * Import CSS or SASS styles with modules support (*.module.scss)
  */
 export function cssModulesWebpackRule({ styleLoader }: CssModulesWebpackRuleOptions = {}): webpack.RuleSetRule {
   styleLoader ??= isDevelopment
     ? "style-loader"
     : MiniCssExtractPlugin.loader;
 
   return {
     test: /\.s?css$/,
     use: [
       styleLoader,
       {
         loader: "css-loader",
         options: {
           sourceMap: isDevelopment,
           modules: {
             auto: /\.module\./i, // https://github.com/webpack-contrib/css-loader#auto
             mode: "local", // :local(.selector) by default
             localIdentName: "[name]__[local]--[hash:base64:5]",
           },
         },
       },
     ],
   };
 }
 
 export default renderer;
 