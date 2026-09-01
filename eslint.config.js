import js from '@eslint/js';
import ts from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**', '.astro/**', 'node_modules/**', 'src/styles/tokens/**'],
  },

  js.configs.recommended,
  ...ts.configs.recommended,

  // Reglas específicas de .astro
  ...astro.configs['flat/recommended'],

  // Reglas de accesibilidad sobre el marcado de los .astro.
  // "strict" (en vez de "recommended") es deliberado: este proyecto trata la
  // accesibilidad como requisito, no como sugerencia. Si una regla estorba,
  // documentar por qué antes de desactivarla.
  ...astro.configs['flat/jsx-a11y-strict'],

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // Los scripts de build corren en Node y sí pueden imprimir en consola.
  {
    files: ['scripts/**/*.mjs'],
    rules: {
      'no-console': 'off',
    },
  },
];
