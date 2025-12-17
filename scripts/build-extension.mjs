import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const nextExportDir = path.join(projectRoot, 'out');
const extensionRoot = path.join(projectRoot, 'extension');
const distDir = path.join(extensionRoot, 'dist');
const manifestPath = path.join(extensionRoot, 'manifest.json');

if (!fs.existsSync(nextExportDir)) {
  console.error('Missing "out" directory. Run EXTENSION_BUILD=true next build before packaging.');
  process.exit(1);
}

if (!fs.existsSync(manifestPath)) {
  console.error('Missing extension/manifest.json. Ensure manifest exists before packaging.');
  process.exit(1);
}

const copyRecursive = (source, destination) => {
  const stats = fs.statSync(source);

  if (stats.isDirectory()) {
    fs.mkdirSync(destination, {recursive: true});
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(destination, entry));
    }
  } else {
    fs.copyFileSync(source, destination);
  }
};

fs.rmSync(distDir, {recursive: true, force: true});
fs.mkdirSync(distDir, {recursive: true});

copyRecursive(nextExportDir, distDir);
fs.copyFileSync(manifestPath, path.join(distDir, 'manifest.json'));

const iconsDir = path.join(extensionRoot, 'icons');
if (fs.existsSync(iconsDir)) {
  copyRecursive(iconsDir, path.join(distDir, 'icons'));
}

console.log('Chrome extension bundle created at extension/dist');
