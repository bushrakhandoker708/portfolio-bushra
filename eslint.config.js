import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  { ignores: ["dist", "dist-ssr", "legacy-assets", "test-results", "playwright-report", "node_modules"] },
  {
    files: ["**/*.{js,jsx,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: "18.3" } },
    plugins: { react, "react-hooks": reactHooks },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      "react/prop-types": "off",
      // React Three Fiber elements use three.js property names.
      "react/no-unknown-property": ["error", { ignore: ["args", "position", "castShadow", "receiveShadow", "intensity", "attach", "metalness", "roughness", "clearcoat", "clearcoatRoughness", "color", "object", "rotation", "shadow-mapSize", "fetchpriority"] }],
    },
  },
  {
    files: ["src/**/*.test.{js,jsx}", "src/tests/**", "e2e/**"],
    languageOptions: { globals: { ...globals.browser, ...globals.node, ...globals.vitest } },
  },
];
