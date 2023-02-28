module.exports = {
	stories: ["../ts/**/*.mdx", "../ts/**/*.stories.@(js|jsx|ts|tsx)"],
	addons: [
		"@storybook/addon-links",
		"@storybook/addon-essentials",
		"@storybook/addon-interactions",
	],
	framework: {
		name: "@storybook/html-vite",
		options: {},
	},
	docs: {
		autodocs: "tag",
	},
};
