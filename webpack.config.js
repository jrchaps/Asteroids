const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
	entry: {
		main: './src/main.ts',
	},
	output: {
		path: path.resolve(__dirname, './build'),
		filename: '[name].js',
		publicPath: '',
	},
	devServer: {
		contentBase: './build',
		hot: true,
	},
	module: {
		rules: [
			{
				test: /\.(png|svg|jpg|jpeg|gif|mp4|pdf|webm|ttf)$/i,
				loader: 'file-loader',
				options: {
					name: '[name].[ext]',
				},
			},
			{
				test: /\.html$/i,
				use: ['html-loader'],
			},
			{
				test: /\.ts?$/,
				use: ['ts-loader'],
				exclude: /node_modules/,
			},
		],
	},
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: './src/main.html',
			chunks: ['main'],
		}),
	],
	resolve: {
		extensions: ['.ts', '.js'],
	},
}

