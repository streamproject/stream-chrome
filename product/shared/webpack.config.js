const webpack = require("webpack");
const path = require('path');

const __PRODUCTION__ = JSON.stringify(process.env.NODE_ENV === 'production')

const config = {
  entry: {
    index: path.resolve(__dirname, 'src/index.ts'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  devtool: 'source-map',
  module: {
    rules: [
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
      // For loading semantic-ui https://medium.com/webmonkeys/webpack-2-semantic-ui-theming-a216ddf60daf
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
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
    new webpack.WatchIgnorePlugin([
      /css\.d\.ts$/,
      /styl\.d\.ts$/,
    ]),
  ]
};

module.exports = config