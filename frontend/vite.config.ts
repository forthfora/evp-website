import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	server: {
		proxy: {
			'/api': {
				target: 'http://127.0.0.1:16017',
				changeOrigin: true,
			},
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules')) {
						if (id.includes('three')) return 'threejs-engine';
						if (id.includes('react')) return 'vendor-react';
						if (id.includes('react-router')) return 'vendor-router';
						return 'vendor'; // all other third-party dependencies
					}
				},
			},
		},
	},
});
