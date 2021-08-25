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
    module: {
        rules: [
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: "asset/resource",
            },
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [ ".tsx", ".ts", ".js" ],
    },
    devServer: {
        host: 'localhost'
    },
    plugins: [
        new HtmlWebPackPlugin({
            title: "Pixel Renderer Bundle",
        }),
    ],
};