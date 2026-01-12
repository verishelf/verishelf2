import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { join } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-website-at-root',
      configureServer(server) {
        // Serve website files at root for local development
        server.middlewares.use((req, res, next) => {
          // If requesting root, serve website index.html
          if (req.url === '/' || req.url === '/index.html') {
            try {
              const websiteHtml = readFileSync(join(__dirname, 'website', 'index.html'), 'utf-8');
              res.setHeader('Content-Type', 'text/html');
              res.end(websiteHtml);
              return;
            } catch (e) {
              console.error('Error serving website:', e);
            }
          }
          
          // Serve other website HTML pages
          if (req.url.startsWith('/') && req.url.endsWith('.html') && !req.url.startsWith('/dashboard')) {
            try {
              const pageName = req.url === '/' ? 'index.html' : req.url.substring(1);
              const websiteHtml = readFileSync(join(__dirname, 'website', pageName), 'utf-8');
              res.setHeader('Content-Type', 'text/html');
              res.end(websiteHtml);
              return;
            } catch (e) {
              // File doesn't exist, continue to next middleware
            }
          }
          
          // Serve website CSS and JS
          if (req.url === '/style.css') {
            try {
              const css = readFileSync(join(__dirname, 'website', 'style.css'), 'utf-8');
              res.setHeader('Content-Type', 'text/css');
              res.end(css);
              return;
            } catch (e) {
              console.error('Error serving style.css:', e);
            }
          }
          
          if (req.url === '/main.js') {
            try {
              const js = readFileSync(join(__dirname, 'website', 'main.js'), 'utf-8');
              res.setHeader('Content-Type', 'application/javascript');
              res.end(js);
              return;
            } catch (e) {
              console.error('Error serving main.js:', e);
            }
          }
          
          next();
        });
      }
    }
  ],
  base: '/',  // Use root base - website at /, dashboard will be handled by routing
  build: {
    outDir: 'dist',
    // Ensure assets are correctly referenced
    assetsDir: 'assets',
  }
})
