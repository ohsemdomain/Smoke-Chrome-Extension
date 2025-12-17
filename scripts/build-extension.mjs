import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import crypto from 'node:crypto';
import zlib from 'node:zlib';

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

const walkFiles = (rootDir, visitFile) => {
  for (const entry of fs.readdirSync(rootDir, {withFileTypes: true})) {
    const entryPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(entryPath, visitFile);
    } else if (entry.isFile()) {
      visitFile(entryPath);
    }
  }
};

const rewriteNextAssetPaths = (rootDir) => {
  const textExtensions = new Set(['.html', '.js', '.css', '.json', '.txt', '.map', '.xml', '.svg']);
  const from = '/_next';
  const to = '/next';

  walkFiles(rootDir, (filePath) => {
    if (!textExtensions.has(path.extname(filePath))) return;

    const original = fs.readFileSync(filePath, 'utf8');
    if (!original.includes(from)) return;

    const updated = original.replaceAll(from, to);
    fs.writeFileSync(filePath, updated);
  });
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

  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', iend),
  ]);
};

const renderIconPng = (size) => {
  const width = size;
  const height = size;
  const data = Buffer.alloc(width * height * 4);

  const bg = {r: 0x2f, g: 0x5a, b: 0x3b, a: 0xff};
  const fg = {r: 0xff, g: 0xff, b: 0xff, a: 0xff};

  const cx = (width - 1) / 2;
  const cy = (height - 1) / 2;
  const radius = Math.min(width, height) * 0.48;
  const r2 = radius * radius;

  // Background circle with transparent outside.
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

  // Simple "S" glyph (8x8) scaled to fit.
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
          const dx = x - cx;
          const dy = y - cy;
          if (dx * dx + dy * dy > r2) continue;
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

const ensurePngIcons = (iconsDir) => {
  fs.mkdirSync(iconsDir, {recursive: true});
  for (const size of [16, 48, 128]) {
    const pngPath = path.join(iconsDir, `icon${size}.png`);
    if (fs.existsSync(pngPath)) continue;
    fs.writeFileSync(pngPath, renderIconPng(size));
  }
};

const rewriteManifestIconsToPng = (manifest) => {
  const rewriteIconValue = (value) => {
    if (typeof value !== 'string') return value;
    if (value.endsWith('.png')) return value;
    if (value.endsWith('.svg')) return value.slice(0, -4) + '.png';
    return value;
  };

  if (manifest.action?.default_icon && typeof manifest.action.default_icon === 'object') {
    for (const key of Object.keys(manifest.action.default_icon)) {
      manifest.action.default_icon[key] = rewriteIconValue(manifest.action.default_icon[key]);
    }
  }

  if (manifest.icons && typeof manifest.icons === 'object') {
    for (const key of Object.keys(manifest.icons)) {
      manifest.icons[key] = rewriteIconValue(manifest.icons[key]);
    }
  }
};

const getHtmlAttributeValue = (attributes, name) => {
  const match = attributes.match(
    new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'),
  );
  return match ? match[1] ?? match[2] ?? match[3] ?? '' : null;
};

const externalizeInlineScripts = (rootDir) => {
  const inlineDir = path.join(rootDir, 'inline');
  fs.mkdirSync(inlineDir, {recursive: true});

  const scriptTag = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

  const htmlFiles = [];
  walkFiles(rootDir, (filePath) => {
    if (path.extname(filePath) === '.html') htmlFiles.push(filePath);
  });

  for (const htmlPath of htmlFiles) {
    const originalHtml = fs.readFileSync(htmlPath, 'utf8');
    let changed = false;

    const updatedHtml = originalHtml.replace(scriptTag, (fullMatch, attributesRaw, bodyRaw) => {
      const attributes = attributesRaw ?? '';
      const body = bodyRaw ?? '';

      if (/\bsrc\s*=/i.test(attributes)) return fullMatch;

      const type = getHtmlAttributeValue(attributes, 'type');
      if (type && !['text/javascript', 'application/javascript', 'module'].includes(type)) {
        return fullMatch;
      }

      if (!body.trim()) return fullMatch;

      const hash = crypto.createHash('sha256').update(body).digest('hex').slice(0, 16);
      const outFileName = `${hash}.js`;
      const outDiskPath = path.join(inlineDir, outFileName);
      const outWebPath = `/inline/${outFileName}`;

      if (!fs.existsSync(outDiskPath)) {
        fs.writeFileSync(outDiskPath, body.endsWith('\n') ? body : `${body}\n`);
      }

      const attributesWithoutNonce = attributes.replace(
        /\s*\bnonce\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
        '',
      );
      const normalizedAttributes = attributesWithoutNonce.trim();

      changed = true;
      return normalizedAttributes
        ? `<script ${normalizedAttributes} src="${outWebPath}"></script>`
        : `<script src="${outWebPath}"></script>`;
    });

    if (changed) {
      fs.writeFileSync(htmlPath, updatedHtml);
    }
  }
};

const readAndRewriteManifest = (sourcePath) => {
  const manifest = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

  // Chrome extension icons are most reliable as PNGs; ensure they exist and
  // rewrite any SVG icon references to PNG.
  const extensionRoot = path.dirname(sourcePath);
  ensurePngIcons(path.join(extensionRoot, 'icons'));
  rewriteManifestIconsToPng(manifest);

  if (Array.isArray(manifest.web_accessible_resources)) {
    for (const item of manifest.web_accessible_resources) {
      if (!item || !Array.isArray(item.resources)) continue;
      item.resources = item.resources.map((resource) => {
        if (typeof resource !== 'string') return resource;
        return resource.startsWith('_next/') ? `next/${resource.slice('_next/'.length)}` : resource;
      });
    }
  }

  return manifest;
};

fs.rmSync(distDir, {recursive: true, force: true});
fs.mkdirSync(distDir, {recursive: true});

copyRecursive(nextExportDir, distDir);

// Chrome extensions reserve path segments starting with "_", so rename Next's
// default "_next" asset folder and rewrite all exported references.
const nextDirFrom = path.join(distDir, '_next');
const nextDirTo = path.join(distDir, 'next');
if (fs.existsSync(nextDirFrom)) {
  fs.renameSync(nextDirFrom, nextDirTo);
}
rewriteNextAssetPaths(distDir);
externalizeInlineScripts(distDir);

const rewrittenManifest = readAndRewriteManifest(manifestPath);
fs.writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(rewrittenManifest, null, 2) + '\n');

const iconsDir = path.join(extensionRoot, 'icons');
if (fs.existsSync(iconsDir)) {
  copyRecursive(iconsDir, path.join(distDir, 'icons'));
}

console.log('Chrome extension bundle created at extension/dist');
