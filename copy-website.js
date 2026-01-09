// Copy website files to root for Vercel deployment
import { copyFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filesToCopy = ['index.html', 'main.js', 'style.css'];

filesToCopy.forEach(file => {
  const source = join(__dirname, 'website', file);
  const dest = join(__dirname, file);
  
  if (existsSync(source)) {
    try {
      copyFileSync(source, dest);
      console.log(`✓ Copied ${file} to root`);
    } catch (error) {
      console.error(`✗ Error copying ${file}:`, error);
    }
  } else {
    console.warn(`⚠ Source file not found: ${source}`);
  }
});

console.log('Website files copied successfully!');

