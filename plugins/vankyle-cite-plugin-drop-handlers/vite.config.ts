import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
    build: {
        lib: {
            name: 'vankyle-cite-plugin-drop-handlers',
            entry: 'src/main.ts',
        },
        outDir: 'dist',
        rollupOptions:{
            output: {
                entryFileNames: "index.js"
            }
        }
    },
});
