const path = require('path');

module.exports = {
    entry: './src/index.ts',
    mode: process.env.NODE_ENV || 'development',
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        alias: {
            '@': path.resolve(__dirname, "..", 'src'),
            "@models": path.resolve(__dirname, "..", 'src/models'),
        }

    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: 'ts-loader'
            }
        ]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "index.js",
        library: {
            name: 'vankyle-cite-plugin',
            type: 'umd',
            export: 'default',
        }
    },
};