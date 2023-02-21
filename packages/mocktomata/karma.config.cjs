module.exports = function (config) {
	config.set({
		plugins: ['karma-webpack', 'karma-jasmine', 'karma-chrome-launcher'],

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '',

		browsers: ['ChromeHeadless'],
		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['jasmine'],

		// list of files / patterns to load in the browser
		// Here I'm including all of the the Jest tests which are all under the __tests__ directory.
		// You may need to tweak this patter to find your test files/
		files: ['./scripts/karma-setup.js', 'ts/browser/*.{spec,test,unit,accept,integrate,system}.ts'],

		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			// Use webpack to bundle our tests files
			'./scripts/karma-setup.js': ['webpack'],
			'ts/browser/*.{spec,test,unit,accept,integrate,system}.ts': ['webpack'],
		},
	});
};
