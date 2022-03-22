module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint/eslint-plugin'],
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
    ],
    ignorePatterns: ['dist'],
    rules: {
        'prettier/prettier': 'error',
        'import/extensions': 'off',
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/no-unused-vars': 'warn',
        'no-unused-vars': 'warn',
        'import/no-unresolved': 'off',
        'no-empty-function': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        'class-methods-use-this': 'off',
        'no-useless-constructor': 'off',
        'consistent-return': 'off',
        'object-curly-newline': 'off',
        'max-len': 'off',
        'implicit-arrow-linebreak': 'off',
        'import/order': [
            'error',
            {
                groups: ['builtin', 'external', ['parent', 'sibling'], 'index'],
                pathGroups: [
                    {
                        pattern: 'angular',
                        group: 'external',
                        position: 'before',
                    },
                ],
                alphabetize: {
                    order: 'asc',
                    caseInsensitive: true,
                },
                'newlines-between': 'always',
            },
        ],
    },
};
