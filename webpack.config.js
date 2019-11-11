const path = require("path")
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: "production",
  entry: {
    index: './src/index',
    enrollAdmin: './src/enrollAdmin',
    registerUser: './src/registerUser',
    invoke: './src/invoke',
    query: './src/query'
  },
  output: {
    path: path.resolve("./build"),
    filename: "[name].js"
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  target: "node",
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        loader: "ts-loader",
        options: {
          configFile: "tsconfig.json"
        }
      }
    ]
  }
}
