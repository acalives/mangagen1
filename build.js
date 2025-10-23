const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Clean and recreate dist directory
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
}
fs.mkdirSync('dist');

// Build CSS
const { execSync } = require('child_process');
execSync('npx tailwindcss -i ./styles.css -o ./dist/styles.css --minify');

// Copy and modify index.html
let indexHtml = fs.readFileSync('index.html', 'utf8');
indexHtml = indexHtml
  .replace('<script src="https://cdn.tailwindcss.com"></script>', '<link rel="stylesheet" href="styles.css">')
  .replace('"/index.js"', '"index.js"')
  .replace('"/index.tsx"', '"index.js"');
fs.writeFileSync('dist/index.html', indexHtml);

// Build the application
esbuild.build({
  entryPoints: ['index.tsx'],
  bundle: true,
  outfile: 'dist/index.js',
  format: 'esm',
  target: ['es2020'],
  loader: { '.tsx': 'tsx', '.ts': 'tsx' },
  external: [
    'react',
    'react-dom/client',
    '@google/genai',
    'html2canvas',
    'jszip'
  ],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
}).catch(() => process.exit(1));