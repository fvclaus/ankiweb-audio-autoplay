// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import eslint from "eslint-plugin-prettier/recommended";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
  js.configs.recommended,
  {
    rules: {
      "no-unused-vars": "warn",
    },
  },
  eslint,
];
