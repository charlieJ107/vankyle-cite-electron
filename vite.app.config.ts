import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
    resolve: {
        alias: [
            { find: '@', replacement: path.resolve(__dirname, 'src') },
            { find: '@components', replacement: path.resolve(__dirname, 'src/components') },
            { find: '@models', replacement: path.resolve(__dirname, 'src/models') },
        ]
    },
    plugins: [
        react()
    ],
});
