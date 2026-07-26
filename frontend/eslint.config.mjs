import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Fronteira de arquitetura: shared/ nao conhece rota nem feature.
  {
    files: ["shared/**"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{
          group: [
            "@/features/*", "@/features/**",
            "@/app/*", "@/app/**",
            "@/components/*", "@/components/**",
            "@/hooks/*", "@/hooks/**",
            "@/services/*", "@/services/**",
            "@/stores/*", "@/stores/**",
          ],
          message:
            "shared/ nao importa de rota nem de feature — isso inverte a " +
            "dependencia. Se e comum de verdade, mova para dentro de shared/.",
        }],
      }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
