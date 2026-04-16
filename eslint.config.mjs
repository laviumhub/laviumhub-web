import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "scripts/**",
      "src/components/**",
      "src/lib/delivery-engine/**",
      "src/Delivery.tsx"
    ]
  },
  ...tseslint.configs.recommended,
  {
    files: [
      "src/app/**/*.{ts,tsx}",
      "src/domain/**/*.ts",
      "src/data/**/*.ts",
      "src/repositories/**/*.ts",
      "src/services/**/*.ts",
      "src/lib/theme/**/*.ts",
      "src/features/**/*.{ts,tsx}",
      "src/ui/**/*.{ts,tsx}"
    ],
    plugins: {
      "@next/next": nextPlugin
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "@typescript-eslint/consistent-type-imports": "error"
    }
  }
);
