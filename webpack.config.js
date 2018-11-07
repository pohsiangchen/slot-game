const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');

module.exports = (env, argv) => {
  const devMode = argv.mode !== 'production';
  return {
    entry: {
      'index': './src/js/index.js'
    },
    devtool: 'inline-source-map',
    devServer: {
      contentBase: './dist'
    },
    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          cache: true,
          parallel: true,
          sourceMap: !!devMode
        }),
        new OptimizeCSSAssetsPlugin({})
      ]
    },
    output: {
      filename: 'js/[name].js',
      path: path.join(__dirname, '/dist')
    },
    plugins: [
      new CleanWebpackPlugin(['dist']),
      new CopyWebpackPlugin([
        { from: 'src/images', to: 'images' }
        // { from: 'src/fonts', to: 'fonts' },
        // { from: 'src/favicon' }
      ]),
      new HtmlWebpackPlugin({
        hash: true,
        template: './src/index.html',
        filename: './index.html',
        inject: false
      }),
      new webpack.ProvidePlugin({
        /* Use when importing individual BS components */
        // '$': 'jquery/dist/jquery.slim.js',
        // 'jQuery': 'jquery/dist/jquery.slim.js',
        // 'Popper': 'popper.js/dist/umd/popper', /* required for tooltips */
        // 'Util': 'exports-loader?Util!bootstrap/js/dist/util'
      }),
      new MiniCssExtractPlugin({
        filename: 'css/main.css',
        chunkFilename: '[id].css'
      }),
      new WriteFilePlugin(),
      new CompressionPlugin()
    ],
    module: {
      rules: [
        {
          test: /\.(scss|css)$/,
          use: [{
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader?url=false' // translates CSS into CommonJS modules
          }]
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            'babel-loader'
          ]
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/,
          use: {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'images/'
            }
          }
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          use: {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/'
            }
          }
        },
        {
          test: /\.html$/,
          loader: 'raw-loader'
        }
      ]
    }
  };
};
// const webpack = require('webpack');
//
// module.exports = {
//   entry: './src/index.js',
//   module: {
//     rules: [
//       {
//         test: /\.(js|jsx)$/,
//         exclude: /node_modules/,
//         use: ['babel-loader']
//       }
//     ]
//   },
//   resolve: {
//     extensions: ['*', '.js', '.jsx']
//   },
//   output: {
//     path: __dirname + '/dist',
//     publicPath: '/',
//     filename: 'bundle.js'
//   },
//   plugins: [
//     new webpack.HotModuleReplacementPlugin()
//   ],
//   devServer: {
//     contentBase: './dist',
//     hot: true
//   }
// };
