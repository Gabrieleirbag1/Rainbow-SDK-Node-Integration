import * as esbuild from 'esbuild';
import { copyFileSync, mkdirSync, readdirSync } from 'fs';
import { join, extname } from 'path';

const copyStaticPlugin = {
    name: 'copy-static',
    setup(build) {
        build.onEnd(() => {
            const srcDir = 'src';
            const destDir = 'dist';
            function copyRecursive(src, dest) {
                mkdirSync(dest, { recursive: true });
                for (const entry of readdirSync(src, { withFileTypes: true })) {
                    const srcPath = join(src, entry.name);
                    const destPath = join(dest, entry.name);
                    if (entry.isDirectory()) copyRecursive(srcPath, destPath);
                    else if (extname(entry.name) !== '.ts') copyFileSync(srcPath, destPath);
                }
            }
            copyRecursive(srcDir, destDir);
        });
    }
};

await esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    format: 'esm',
    outdir: 'dist',
    plugins: [copyStaticPlugin]
});

console.log('⚡ Build complete! ⚡');
