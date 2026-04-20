const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;

module.exports = {
  mode: "development",
  entry: "./src/index.tsx",
  devServer: {
    port: 3000,
    historyApiFallback: true,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
          name: "shell",

          remotes: {
            auth: "auth@http://localhost:3001/remoteEntry.js",
            catalog: "catalog@http://localhost:3002/remoteEntry.js",
          },

          exposes: {
            "./api": "./src/api/index.ts",
          },

          shared: {
              react: { singleton: true },
              "react-dom": { singleton: true },
              "react-router-dom": { singleton: true },
              "react-redux": { singleton: true },
            },
        }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
};