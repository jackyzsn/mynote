const prettierrc = require('./.prettierrc.js');

module.exports = {
  root: true,
  extends: '@react-native-community',
  rules: {
    'prettier/prettier': ['error', prettierrc],
  },
};
