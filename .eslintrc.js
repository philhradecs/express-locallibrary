module.exports = {
    extends: ['airbnb-base', 'prettier'],
    plugins: ['prettier'],
    rules: {
        'prettier/prettier': 'error',
        'prefer-arrow-callback': 'error',
        indent: ['error', 'tab'],
        camelcase: 'warn',
        'no-underscore-dangle': 'off'
    },
};
