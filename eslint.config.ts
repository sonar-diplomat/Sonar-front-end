// eslint.config.ts
import * as eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import * as importPlugin from 'eslint-plugin-import';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
        plugins: {
            import: importPlugin,
        },
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
            },
        },
        settings: {
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                    project: './tsconfig.json',
                },
                node: true,
            },
        },
        rules: {
            // Import validation
            'import/no-unresolved': 'error',
            'import/no-duplicates': 'error',
            'import/no-cycle': 'warn',

            // Import ordering (FSD architecture aware)
            'import/order': [
                'error',
                {
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        'parent',
                        'sibling',
                        'index',
                    ],
                    pathGroups: [
                        {
                            pattern: 'react',
                            group: 'external',
                            position: 'before',
                        },
                        {
                            pattern: 'app/**',
                            group: 'internal',
                            position: 'before',
                        },
                        {
                            pattern: 'entities/**',
                            group: 'internal',
                            position: 'before',
                        },
                        {
                            pattern: 'features/**',
                            group: 'internal',
                            position: 'before',
                        },
                        {
                            pattern: 'pages/**',
                            group: 'internal',
                            position: 'before',
                        },
                        {
                            pattern: 'shared/**',
                            group: 'internal',
                            position: 'before',
                        },
                        {
                            pattern: 'widgets/**',
                            group: 'internal',
                            position: 'before',
                        },
                    ],
                    pathGroupsExcludedImportTypes: ['react'],
                    'newlines-between': 'always',
                    alphabetize: {
                        order: 'asc',
                        caseInsensitive: true,
                    },
                },
            ],

            // TypeScript type imports
            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports',
                    fixStyle: 'separate-type-imports',
                },
            ],
        },
    }
);