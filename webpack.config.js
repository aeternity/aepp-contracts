const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const PurgecssPlugin = require('purgecss-webpack-plugin')
let glob = require('glob-all')

const webpack = require('webpack')

const distFolder = path.resolve(__dirname, 'dist')
const jsLoader = 'babel-loader!standard-loader?error=true'

// Custom PurgeCSS extractor for Tailwind that allows special characters in
// class names.
//
// https://github.com/FullHuman/purgecss#extractor
class TailwindExtractor {
  static extract (content) {
    return content.match(/[A-z0-9-:\/]+/g) || [];
  }
}
module.exports = {
  entry: './src/index.js',
  resolve: { symlinks: false },
  mode: process.env.NODE_ENV === 'prod' ? 'production' : 'development',
  output: {
    filename: '[name].bundle.js?[hash]',
    path: distFolder
  },
  devtool: process.env.NODE_ENV === 'prod' ? '' : 'eval-source-map',
  plugins: [
    new PurgecssPlugin({

      // Specify the locations of any files you want to scan for class names.
      paths: glob.sync([
        path.join(__dirname, 'src/**/*.vue'),
        path.join(__dirname, 'index.html')
      ]),
      extractors: [
        {
          extractor: TailwindExtractor,
          // Specify the file extensions to include when scanning for
          // class names.
          extensions: ['html', 'js', 'php', 'vue']
        }
      ]
    }),
    new HtmlWebpackPlugin({
      template: 'index.html',
      filename: 'index.html',
      inject: true,
      title: 'Contracts Æpp',
      baseUrl: '/',
      APIUrl: 'http://localhost:8080/',
      alwaysWriteToDisk: true
    }),
    new HtmlWebpackHarddiskPlugin(),
    new ExtractTextPlugin('style.css?[hash]'),
    new CleanWebpackPlugin([distFolder]),
    // debug bundle (for optimisation)
    // new BundleAnalyzerPlugin()
    new webpack.DefinePlugin({
      'process.env': {
        VUE_APP_NODE_URL: JSON.stringify(process.env.VUE_APP_NODE_URL),
        VUE_APP_NODE_INTERNAL_URL: JSON.stringify(process.env.VUE_APP_NODE_INTERNAL_URL)
      }
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        include: [/node_modules\/@aeternity/, /node_modules\/rlp/],
        loader: jsLoader
        // your babel options (or from .babelrc file)
        // options: {
        //   presets: ['@babel/preset-env'],
        //   plugins: [
        //     '@babel/plugin-proposal-object-rest-spread',
        //     '@babel/plugin-transform-runtime',
        //     '@babel/plugin-proposal-export-default-from'
        //   ]
        // }
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: [
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                config: {
                  path: 'postcss.config.js'
                }
              }
            }
          ]
          // publicPath: '/web'
        })
      },
      // allows vue compoents in '<template><html><script><style>' syntax
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            js: jsLoader
            // scss: 'vue-style-loader!css-loader!sass-loader',
            // sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax'
          }
          // extractCSS: true
          // other vue-loader options go here
        }
      }
    ]
  }
}
