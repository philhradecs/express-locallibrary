module.exports = {
    extends: ['airbnb-base', 'prettier'],
    plugins: ['prettier'],
    rules: {
        'prettier/prettier': 'error',
        'prefer-arrow-callback': 'error',
        indent: ['error', 'tab'],
        camelcase: 'warn',
        'consistent-return': 'off',
        'no-underscore-dangle': 'off',
        'func-names': 'off',
        'no-plusplus': [2, { allowForLoopAfterthoughts: true }]
    },
};
