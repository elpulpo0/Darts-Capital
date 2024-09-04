module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: [
        "plugin:vue/vue3-essential", // Support Vue 3
        "eslint:recommended", // Règles ESLint de base
        "plugin:@typescript-eslint/recommended", // Règles TypeScript
    ],
    parser: "vue-eslint-parser",
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        parser: "@typescript-eslint/parser", // Utiliser le parser TypeScript
    },
    rules: {
        "quote-props": ["error", "always"],
        "vue/comment-directive": "off",
        "no-console": ["warn", { allow: ["warn", "error"] }],
        "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    },
};
