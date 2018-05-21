const webpack = require("webpack");
const path = require('path');
const glob = require("glob");
const scopify = require('postcss-scopify')
const CopyWebpackPlugin = require("copy-webpack-plugin");
const Dotenv = require('dotenv-webpack');

const __PRODUCTION__ = JSON.stringify(process.env.NODE_ENV === 'production')

const config = {
  entry: {
    popup: path.resolve(__dirname, 'src/popup.tsx'),
    communication: path.resolve(__dirname, 'src/contentScripts/communication.ts'),
    YoutubeContentScript: path.resolve(__dirname, 'src/contentScripts/YoutubeContentScript.ts'),
    YoutubeInjection: path.resolve(__dirname, 'src/injections/YoutubeInjection.ts'),
    TwitchContentScript: path.resolve(__dirname, 'src/contentScripts/TwitchContentScript.ts'),
    TwitchInjection: path.resolve(__dirname, 'src/injections/TwitchInjection.ts'),
    MetamaskContentScript: path.resolve(__dirname, 'src/contentScripts/MetamaskContentScript.ts'),
    MetamaskInjection: path.resolve(__dirname, 'src/injections/MetamaskInjection.ts'),
    background: path.resolve(__dirname, 'src/background.ts'),
  },
  output: {
    path: path.resolve(__dirname, 'dist/js'),
    filename: '[name].js'
  },
  devtool: 'source-map',
  module: {
    rules: [
      // Prevent AMD modules from polluting global context.
      // This was causing issues b/n sites like typeform and libs like lodash, and breaking those sites.
      // https://github.com/webpack/webpack/issues/4465#issuecomment-285850829
      // https://github.com/webpack/webpack/issues/3017#issuecomment-285954512
      { parser: { amd: false } },
      {
        test: /\.tsx?$/,
        loaders: ['awesome-typescript-loader'],
        include: path.resolve(__dirname, "src"),
        exclude: /node_modules/,
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader'
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          // Add .stream-crx as a prefix to vendor css
          {
            loader: 'postcss-loader',
            options: {
              plugins: (loader) => [
                scopify('.stream-crx')
              ]
            }
          }
        ]
      },
      {
        test: /\.jpe?g$|\.gif$|\.png$|\.ttf$|\.eot$|\.svg$/,
        use: 'file-loader?name=[name].[ext]?[hash]'
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&mimetype=application/fontwoff'
      },
      {
        // For loading custom styles
        test: /\.styl$/,
        include: path.join(__dirname, 'src'),
        use: [
          "style-loader",
          {
            loader: "typings-for-css-modules-loader",
            options: {
              sourceMap: !__PRODUCTION__,
              namedExport: true,
              camelCase: true,
              modules: true,
            }
          },
          {
            loader: "stylus-loader",
            options: {
              sourceMap: !__PRODUCTION__
            }
          }
        ]
      }
    ]
  },
  resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json', '.styl', '.css', '.json.js'],
  },
  plugins: [
    new webpack.DefinePlugin({
      __PRODUCTION__,
      'process.env': {
          'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    }),
    new Dotenv({
      path: './crx.env'
    }),
    // new webpack.WatchIgnorePlugin([
    //   /css\.d\.ts$/,
    //   /styl\.d\.ts$/,
    // ]),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, 'public'),
        to: path.resolve(__dirname, 'dist'),
      }
    ])
  ],
};

// if (__PRODUCTION__) {
//   config.plugins.push(
//     new webpack.optimize.UglifyJsPlugin({
//       compress: {
//         screw_ie8: true
//       }
//     })
//   )
// }

module.exports = config