const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;

module.exports = {
  mode: "development",
  entry: "./src/index.tsx",
  devServer: {
    port: 3002,
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
          name: "catalog",
          filename: "remoteEntry.js",
          exposes: {
            "./App": "./src/App"
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