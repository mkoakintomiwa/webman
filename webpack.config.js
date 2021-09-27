const fx = require("./scripts/functions");
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

 module.exports = {
   mode: 'development',
   entry: {
     index: path.join('c:/Icitify/portal/src/admin/test/test.tsx')
   },
   devtool: 'inline-source-map',
  devServer: {
    static: './dist',
    hot: true
  },
   plugins: [
     new HtmlWebpackPlugin({
       title: 'Development',
     }),
   ],
   output: {
     filename: '[name].bundle.js',
     path: path.resolve(__dirname, 'dist'),
     clean: true
   },
 };