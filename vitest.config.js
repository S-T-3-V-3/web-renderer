import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        setupFiles: ['./tests/setup.js'],
        globals: true,
        deps: {
            inline: ['three']
        },
        coverage: {
            provider: 'v8',
            include: ['renderer.js']
        }
    }
});
