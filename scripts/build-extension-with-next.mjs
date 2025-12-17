import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const run = (command, args, extraEnv = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: 'inherit',
      env: {...process.env, ...extraEnv},
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} exited with code ${code ?? 'null'}`));
    });
  });

const node = process.execPath;
const nextCli = path.join(projectRoot, 'node_modules', 'next', 'dist', 'bin', 'next');
const renameFallback = path.join(projectRoot, 'scripts', 'fs-rename-fallback.cjs');
const buildExtension = path.join(projectRoot, 'scripts', 'build-extension.mjs');

await run(
  node,
  ['-r', renameFallback, nextCli, 'build'],
  {EXTENSION_BUILD: 'true', NEXT_TELEMETRY_DISABLED: '1'},
);
await run(node, [buildExtension]);

