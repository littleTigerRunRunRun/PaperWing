const path = require('path')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
 
const HOST = 'localhost'
const PORT = 8080
const HTTPS = false

module.exports = {
  mode: 'development',

  entry: './src/main.ts',

  output: {
    filename: 'main.js',
    publicPath: '/dist',
    path: path.resolve(__dirname, 'dist'),
    hotUpdateChunkFilename: 'hot/hot-update.js',
    hotUpdateMainFilename: 'hot/hot-update.json'
  },

  plugins: [
    // new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: '模块热替换',
      template: './public/index.html',
      favicon: './public/favicon.ico'
    }),
    // new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new FriendlyErrorsWebpackPlugin({
      compilationSuccessInfo: {
        messages: [`You application is running here ${HTTPS ? 'https' : 'http'}://${HOST}:${PORT}`],
        // notes: ['Some additional notes to be displayed upon successful compilation'],
        clearConsole: true
      },
    })
  ],
 
  devServer: {
    contentBase: './dist',
    quiet: true,
    hot: true,
    host: HOST,
    port: PORT,
    https: HTTPS,
    compress: true,
    noInfo: false,
    clientLogLevel: 'none'
  },

  module: {
    rules: [{
      test: /\.ts$/,
      use: "ts-loader"
    }]
  },
  resolve: {
    extensions: [
      '.ts',
      '.js'
    ]
  }
}
