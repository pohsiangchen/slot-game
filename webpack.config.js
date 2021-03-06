const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');

module.exports = (env, argv) => {
  const devMode = argv.mode !== 'production';
  const optimizationOptions = {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          warnings: false,
          compress: {
            comparisons: false
          },
          parse: {},
          mangle: true,
          output: {
            comments: false,
            ascii_only: true
          }
        },
        parallel: true,
        cache: true,
        sourceMap: false
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  };
  return {
    entry: {
      'index': './src/js/index.js'
    },
    devtool: devMode ? 'inline-source-map' : 'cheap-source-map',
    devServer: {
      contentBase: './dist'
    },
    optimization: devMode ? {} : optimizationOptions,
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
        inject: true,
        minify: devMode ? {} : {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true
        }
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
