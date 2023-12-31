import path from 'node:path';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import electronSimple from 'vite-plugin-electron/simple';

/** @type {import('vite').UserConfig} */
export default {
    plugins: [
        react(),
        electronSimple({
            main: {
                // Shortcut of `build.lib.entry`.
                entry: 'src/main.ts',
                vite: {
                    build: {
                        outDir: "dist",
                    }
                }
            },
            preload: {
                // Shortcut of `build.rollupOptions.input`.
                // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
                input: path.join(__dirname, 'src/preload.ts'),
                vite: {
                    build: {
                        outDir: "dist",
                    }
                }
            },
            // Ployfill the Electron and Node.js built-in modules for Renderer process.
            // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
            renderer: {},
        }),
        electron([
            {
                entry: "src/plugins/index.ts",
                vite: {
                    build: {
                        outDir: "dist/plugins",
                    }
                }
            },
            {
                entry: "src/services/index.ts",
                vite: {
                    build: {
                        outDir: "dist/services",
                    }
                }
            }
        ])
    ]
};