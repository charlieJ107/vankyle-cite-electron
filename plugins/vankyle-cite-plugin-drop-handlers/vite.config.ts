import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
    build: {
        lib: {
            entry: 'src/main.ts',
        },
        outDir: 'dist',
        rollupOptions: {
            external: ['vankyle-cite-types'],
            output: {
                globals: {
                    'vankyle-cite-types': 'vankyle-cite-types',
                },
                file: 'dist/index.js',
            },
        },
    },
});
