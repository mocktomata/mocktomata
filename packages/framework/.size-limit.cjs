module.exports = [
	{
		path: './esm/index.js',
		modifyWebpackConfig
	}
]

function modifyWebpackConfig(config) {
	config.resolve = { fallback: { module: false } }
	return config
}
