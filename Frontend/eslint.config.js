{
  "files": ["src/**/*.{ts,tsx}"],
  "languageOptions": {
    "ecmaVersion": 2022,
    "globals": {
      "browser": "readonly",
      "es2022": "readonly",
      "node": "readonly"
    }
  },
  "plugins": {
    "react-hooks": "eslint-plugin-react-hooks",
    "react-refresh": "eslint-plugin-react-refresh"
  },
  "rules": {
    "react-refresh/only-export-components": [
      "warn",
      { "allowConstantExport": true }
    ],
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
  }
}
