import js from "@eslint/js";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import jest from "eslint-plugin-jest";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
    "supabase/**",
    "public/**",
  ]),

  // Base JavaScript and TypeScript recommendations.
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Next.js rules: App Router correctness, Core Web Vitals, react-hooks,
  // jsx-a11y, plus the TypeScript-aware parser defaults.
  ...nextCoreWebVitals,
  ...nextTypescript,

  // Type-aware linting, limited to the few rules that catch real bugs. The
  // full `recommendedTypeChecked` preset is deliberately not used: its
  // no-unsafe-* rules would bury the signal in this codebase.
  {
    name: "naturelog/type-aware",
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // A dropped promise from a server action means the failure never
      // surfaces and the UI reports success anyway.
      "@typescript-eslint/no-floating-promises": "error",
      // e.g. an async function passed to onClick, where the rejection is lost.
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/require-await": "warn",
    },
  },

  {
    name: "naturelog/rules",
    rules: {
      // Unused code is the most common source of drift here. Underscore
      // prefixes are the documented escape hatch.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      // `any` defeats the strict tsconfig, but flagging it should not block.
      "@typescript-eslint/no-explicit-any": "warn",
      eqeqeq: ["error", "always", { null: "ignore" }],
      // German prose uses a narrow no-break space in abbreviations such as
      // "z. B."; that is deliberate typography, not a stray character.
      "no-irregular-whitespace": ["error", { skipJSXText: true }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-var": "error",
      "prefer-const": ["error", { destructuring: "all" }],
      "object-shorthand": ["warn", "properties"],
      "react/jsx-key": "error",
      "react/no-unescaped-entities": "off",
    },
  },

  // Server-only modules legitimately log to the server console.
  {
    name: "naturelog/server-only",
    files: ["app/**/actions/**/*.ts", "utils/**/*.ts", "middleware.ts"],
    rules: {
      "no-console": "off",
    },
  },

  // Tests: jest globals and test-specific correctness rules.
  {
    name: "naturelog/tests",
    files: [
      "__tests__/**/*.{ts,tsx,js,jsx}",
      "__mocks__/**/*.{ts,tsx,js,jsx}",
      "**/*.{test,spec}.{ts,tsx,js,jsx}",
      "jest.setup.*",
    ],
    ...jest.configs["flat/recommended"],
    rules: {
      ...jest.configs["flat/recommended"].rules,
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
      // `jest.mock` factories are hoisted above imports, so the factory body
      // has to use require() and has to reach into __mocks__ directly.
      "@typescript-eslint/no-require-imports": "off",
      "jest/no-mocks-import": "off",
    },
  },

  // Config and build files run in Node, outside the app bundle.
  {
    name: "naturelog/config-files",
    files: ["*.{js,mjs,cjs,ts}", "**/*.config.{js,mjs,cjs,ts}", "i18n/**/*.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "no-console": "off",
    },
  },
]);
