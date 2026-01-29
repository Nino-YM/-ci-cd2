// eslint.config.mjs
import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    files: ["**/*.js"],
    ignores: ["**/*.test.js", "node_modules/**"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node,
    },
    rules: {
      "no-unused-vars": "error",
      "no-undef": "error",
      "no-console": "error",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  pluginJs.configs.recommended,
];
