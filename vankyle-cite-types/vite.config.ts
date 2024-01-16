import { builtinModules } from "module";
import path from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        lib: {
            name: "vankyle-cite-types",
            entry: [
                path.resolve(__dirname, "src", "index.ts"),
            ],
            formats: ["es"],
        },
        rollupOptions: {
            external: [...builtinModules, "electron"],
        },
        outDir: path.resolve(__dirname, "dist"),
        emptyOutDir: true,
        target: "esnext",
    },

    resolve: {
        alias: {
            "@": path.join(__dirname, "../src"),
            "@models": path.join(__dirname, "../src/models"),
            "@components": path.join(__dirname, "../src/components"),
        },
    },

    plugins: [
        dts({
            rollupTypes: true,
        }),
    ],
});
