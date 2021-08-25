const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
module.exports = {
    entry: "./src/index.ts",
    mode: "development",
    output: {
        filename: '[name].js',
        sourceMapFilename: "[name].map",
        path: path.resolve(__dirname, "dist"),
    },
    devServer: {
        host: 'localhost'
    },
    experiments: {
        asyncWebAssembly: true,
        topLevelAwait: true
    },
    resolve: {
        extensions: [ ".tsx", ".ts", ".js" ],
    },
    module: {
        rules: [
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: "asset/resource",
            },
            {
                test: /\.(fragment|vertex)\.fx$/i,
                type: "asset/resource",
            },
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [
                  'style-loader',
                  'css-loader'
                ]
            }
        ],
    },
    plugins: [
        new HtmlWebPackPlugin({
            title: "Pixel Renderer Bundle",
        })
    ]
}