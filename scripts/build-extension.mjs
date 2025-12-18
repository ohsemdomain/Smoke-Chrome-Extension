import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import zlib from 'node:zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const extensionRoot = path.join(projectRoot, 'extension');
const distDir = path.join(extensionRoot, 'dist');
const manifestPath = path.join(extensionRoot, 'manifest.json');
const iconsDir = path.join(extensionRoot, 'icons');

const readPackageVersion = () => {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
    return typeof pkg.version === 'string' ? pkg.version : '1.0.0';
  } catch {
    return '1.0.0';
  }
};

const defaultManifest = () => ({
  manifest_version: 3,
  name: 'Smoke Break Tracker',
  version: readPackageVersion(),
  description: 'Log smoke breaks and track the time since your last cigarette directly from the Chrome toolbar.',
  action: {
    default_popup: 'index.html',
    default_title: 'Smoke Break Tracker',
    default_icon: {
      16: 'icons/icon16.png',
      48: 'icons/icon48.png',
      128: 'icons/icon128.png',
    },
  },
  icons: {
    16: 'icons/icon16.png',
    48: 'icons/icon48.png',
    128: 'icons/icon128.png',
  },
  permissions: ['storage'],
});

const readManifest = () => {
  if (!fs.existsSync(manifestPath)) return defaultManifest();
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (typeof manifest?.version !== 'string') manifest.version = readPackageVersion();
    if (!manifest?.action?.default_popup) manifest.action = {...manifest.action, default_popup: 'index.html'};
    return manifest;
  } catch {
    return defaultManifest();
  }
};

const crc32 = (buffer) => {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i++) {
    crc ^= buffer[i];
    for (let bit = 0; bit < 8; bit++) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const pngChunk = (type, data) => {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const crcBuffer = Buffer.alloc(4);
  const crcValue = crc32(Buffer.concat([typeBuffer, data]));
  crcBuffer.writeUInt32BE(crcValue, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
};

const createPng = (width, height, rgbaData) => {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const bytesPerPixel = 4;
  const stride = width * bytesPerPixel;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // no filter
    rgbaData.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }

  const idat = zlib.deflateSync(raw, {level: 9});
  const iend = Buffer.alloc(0);

  return Buffer.concat([signature, pngChunk('IHDR', ihdr), pngChunk('IDAT', idat), pngChunk('IEND', iend)]);
};

const renderIconPng = (size) => {
  const width = size;
  const height = size;
  const data = Buffer.alloc(width * height * 4);

  const bg = {r: 0x45, g: 0x5c, b: 0x3d, a: 0xff};
  const fg = {r: 0xff, g: 0xff, b: 0xff, a: 0xff};

  const cx = (width - 1) / 2;
  const cy = (height - 1) / 2;
  const radius = Math.min(width, height) * 0.48;
  const r2 = radius * radius;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const inside = dx * dx + dy * dy <= r2;
      const offset = (y * width + x) * 4;
      if (!inside) {
        data[offset] = 0;
        data[offset + 1] = 0;
        data[offset + 2] = 0;
        data[offset + 3] = 0;
        continue;
      }
      data[offset] = bg.r;
      data[offset + 1] = bg.g;
      data[offset + 2] = bg.b;
      data[offset + 3] = bg.a;
    }
  }

  const glyph = [
    0b01111110,
    0b11000011,
    0b11000000,
    0b01111100,
    0b00000110,
    0b11000011,
    0b01111110,
    0b00000000,
  ];

  const scale = Math.max(1, Math.floor(size / 16));
  const glyphW = 8 * scale;
  const glyphH = 8 * scale;
  const startX = Math.floor((width - glyphW) / 2);
  const startY = Math.floor((height - glyphH) / 2);

  for (let gy = 0; gy < 8; gy++) {
    for (let gx = 0; gx < 8; gx++) {
      const on = (glyph[gy] >> (7 - gx)) & 1;
      if (!on) continue;
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const x = startX + gx * scale + sx;
          const y = startY + gy * scale + sy;
          if (x < 0 || y < 0 || x >= width || y >= height) continue;
          const offset = (y * width + x) * 4;
          data[offset] = fg.r;
          data[offset + 1] = fg.g;
          data[offset + 2] = fg.b;
          data[offset + 3] = fg.a;
        }
      }
    }
  }

  return createPng(width, height, data);
};

const ensureIcons = (outputIconsDir) => {
  fs.mkdirSync(outputIconsDir, {recursive: true});

  for (const size of [16, 48, 128]) {
    const filename = `icon${size}.png`;
    const outputPath = path.join(outputIconsDir, filename);

    const sourcePath = path.join(iconsDir, filename);
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, outputPath);
      continue;
    }

    if (!fs.existsSync(outputPath)) {
      fs.writeFileSync(outputPath, renderIconPng(size));
    }
  }
};

const copyRecursive = (source, destination) => {
  const stats = fs.statSync(source);

  if (stats.isDirectory()) {
    fs.mkdirSync(destination, {recursive: true});
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(destination, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(destination), {recursive: true});
    fs.copyFileSync(source, destination);
  }
};

const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {cwd: projectRoot, stdio: 'inherit'});
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} exited with code ${code ?? 'null'}`));
    });
  });

const node = process.execPath;
const viteCli = path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js');

fs.rmSync(distDir, {recursive: true, force: true});
fs.mkdirSync(distDir, {recursive: true});

await run(node, [viteCli, 'build']);

const manifest = readManifest();
fs.writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
ensureIcons(path.join(distDir, 'icons'));

console.log('Chrome extension bundle created at extension/dist');
