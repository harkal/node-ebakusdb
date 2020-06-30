module.exports = {
  env: {
    es6: false,
    node: true,
  },
  extends: [
    "plugin:prettier/recommended"
  ],
  plugins: [
    "prettier"
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    "prettier/prettier": "error",
    "quotes": [1, "single"]
  },
};
