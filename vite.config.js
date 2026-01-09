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
          // If requesting root or website files, serve from website directory
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
  base: '/dashboard/',  // Base path for deployment on verishelf.com/dashboard/
})
