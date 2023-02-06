/** @type {import('prettier').Config} */
module.exports = {
  editorconfig: true,
  printWidth: 110,
  endOfLine: 'auto',
  semi: false,
  singleQuote: true,
  useTabs: true,
  // For ES5, trailing commas cannot be used in function parameters; it is counterintuitive
  // to use them for arrays only
  trailingComma: 'none'
};
