const path = require('path');

module.exports = {
    mode: process.env.NODE_ENV || 'development',
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            '@': path.resolve(__dirname, "..", 'src'),
            '@models': path.resolve(__dirname, "..", 'src/models'),
            '@components': path.resolve(__dirname, "..", 'src/components'),
        },
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
    }

};