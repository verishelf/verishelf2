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
        // IMPORTANT: This middleware runs BEFORE Vite's middleware
        // So we need to be careful not to interfere with Vite's handling
        server.middlewares.use((req, res, next) => {
          // Let Vite handle ALL /dashboard/ routes (including assets, HMR, etc.)
          // Vite will serve the React app HTML and transform paths correctly
          if (req.url.startsWith('/dashboard')) {
            next();
            return;
          }
          
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
          if (req.url.startsWith('/') && req.url.endsWith('.html')) {
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
  // For local dev: use '/dashboard/' so React app is at /dashboard/ and website at root
  // For production: also use '/dashboard/' when building
  base: process.env.VITE_BASE_PATH || '/dashboard/',
  build: {
    outDir: 'dist',
    // Ensure assets are correctly referenced
    assetsDir: 'assets',
  }
})
