import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import http from 'http';
import { handleMockApi } from './mockApi.js';

function embeddedApiPlugin() {
  return {
    name: 'embedded-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url.startsWith('/api')) {
          return next();
        }

        const chunks = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', () => {
          const bodyBuffer = Buffer.concat(chunks);

          // Forward to port 5000 Express backend if available
          const proxyHeaders = { ...req.headers, host: '127.0.0.1:5000' };
          const proxyReq = http.request(
            {
              hostname: '127.0.0.1',
              port: 5000,
              path: req.url,
              method: req.method,
              headers: proxyHeaders,
              timeout: 10000,
            },
            (proxyRes) => {
              res.writeHead(proxyRes.statusCode, proxyRes.headers);
              proxyRes.pipe(res);
            }
          );

          proxyReq.on('error', () => {
            // Port 5000 is offline or refused -> seamlessly use embedded mock API!
            handleMockApi(req, res, bodyBuffer);
          });

          proxyReq.on('timeout', () => {
            proxyReq.destroy();
            handleMockApi(req, res, bodyBuffer);
          });

          if (bodyBuffer.length > 0) {
            proxyReq.write(bodyBuffer);
          }
          proxyReq.end();
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    embeddedApiPlugin(),
  ],
  server: {
    port: 5173,
  },
});
