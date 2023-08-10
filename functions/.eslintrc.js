module.exports = {
	root: true,
	env: {
		es6: true,
		node: true,
	},
	plugins: ["prettier"],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ["tsconfig.json", "tsconfig.dev.json"],
		sourceType: "module",
	},
	ignorePatterns: [
		"/lib/**/*", // Ignore built files.
	],
	plugins: ["@typescript-eslint", "import"],
	rules: {
		quotes: ["error", "double"],
		"import/no-unresolved": 0,
	},
};
