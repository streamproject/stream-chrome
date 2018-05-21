var webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');
var WebpackShellPlugin = require('webpack-shell-plugin');
const path = require('path');
const glob = require("glob");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const __PRODUCTION__ = JSON.stringify(process.env.NODE_ENV === 'development')

var config = {
    entry: './all-tests.js',
    output: {
        filename: 'testBundle.js'
    },
 
    target: 'node',
    externals: [nodeExternals()],
    node: {
        fs: 'empty'
    },

    plugins: [
        new WebpackShellPlugin({
            onBuildExit: "mocha testBundle.js"
        })
    ],
    module: {
        rules: [
          // Prevent AMD modules from polluting global context.
          // This was causing issues b/n sites like typeform and libs like lodash, and breaking those sites.
          // https://github.com/webpack/webpack/issues/4465#issuecomment-285850829
          // https://github.com/webpack/webpack/issues/3017#issuecomment-285954512
          { parser: { amd: false } },
          {
            test: /\.tsx?$/,
            loaders: 'awesome-typescript-loader',
            include: path.resolve(__dirname, "src"),
            exclude: /node_modules/,
          },
          {
            enforce: 'pre',
            test: /\.js$/,
            loader: 'source-map-loader'
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

module.exports = config;
