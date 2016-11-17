import webpack from 'webpack'
import path from 'path'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import ReactStaticSitePlugin from '../lib'

import routes from './src/js/routes'

const srcPath = path.resolve(__dirname, 'src')
const jsPath = path.resolve(srcPath, 'js')
const distPath = 'dist'

export default {
  entry: {
    main: path.resolve(jsPath, 'index.js')
  },
  output: {
    filename: 'bundle.js',
    libraryTarget: 'umd',
    path: distPath,
    publicPath: '/'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') },
    ]
  },
  plugins: [
    new ExtractTextPlugin('styles.css'),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'dev'),
      }
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } }),
    new ReactStaticSitePlugin('main')
  ]
}
