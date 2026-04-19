import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { ModuleFederationPlugin } from '@module-federation/enhanced/webpack';

interface SharedConfigOptions {
  name: string;
  filename: string;
  exposes?: Record<string, string>;
  remotes?: Record<string, string>;
  shared?: Record<string, any>;
  port: number;
}

export function createBaseConfig(options: SharedConfigOptions): webpack.Configuration {
  const { name, filename, exposes = {}, remotes = {}, port } = options;

  const isHost = Object.keys(remotes).length > 0 || Object.keys(exposes).length === 0;

  return {
    mode: 'development',
    entry: './src/index.tsx',
    devtool: 'source-map',
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new ModuleFederationPlugin({
        name,
        filename,
        exposes,
        remotes,
        shared: {
          react: {
            singleton: true,
            requiredVersion: '^18.3.1',
          },
          'react-dom': {
            singleton: true,
            requiredVersion: '^18.3.1',
          },
          'react-router-dom': {
            singleton: true,
            requiredVersion: '^6.30.3',
          },
          '@reduxjs/toolkit': {
            singleton: true,
            requiredVersion: '^2.11.2',
          },
          'react-redux': {
            singleton: true,
            requiredVersion: '^9.2.0',
          },
          antd: {
            singleton: true,
            requiredVersion: '^5.29.3',
          },
        },
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
    ],
    devServer: {
      port,
      hot: true,
      historyApiFallback: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    output: {
      publicPath: `http://localhost:${port}/`,
    },
  };
}

export { HtmlWebpackPlugin, ModuleFederationPlugin };
