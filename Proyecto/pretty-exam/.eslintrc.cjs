module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'standard',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  plugins: ['react-refresh', 'jest'],
  rules: {
    'react-hooks/exhaustive-deps': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.test.jsx'],
      env: {
        jest: true,
      },
      rules: {
        // Reglas específicas para archivos de test
        'no-console': 'off', // Permitir console.log en tests para debugging
        'max-lines': 'off', // Los archivos de test pueden ser largos
        'max-lines-per-function': 'off', // Las funciones de test pueden ser largas
        'prefer-const': 'error', // Usar const cuando sea posible
        'no-var': 'error', // No usar var en tests
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Ignorar variables que empiecen con _
        'no-magic-numbers': 'off', // Permitir números mágicos en tests (son comunes)
        'jest/no-disabled-tests': 'warn', // Advertir sobre tests deshabilitados
        'jest/no-focused-tests': 'error', // Error en tests con .only
        'jest/prefer-to-be': 'error', // Preferir toBe sobre toEqual para primitivos
        'jest/prefer-to-have-length': 'error', // Usar toHaveLength en lugar de .length
        'jest/valid-expect': 'error', // Validar uso correcto de expect
        'jest/no-identical-title': 'error', // No permitir títulos de test idénticos
        'jest/prefer-strict-equal': 'warn', // Preferir toStrictEqual
        'jest/no-test-return-statement': 'error', // No return en tests
      },
    },
  ],
}
