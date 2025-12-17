const fs = require('node:fs');
const path = require('node:path');

const ensureParentDirSync = (filePath) => {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
};

const copyAndRemoveSync = (source, destination) => {
  ensureParentDirSync(destination);
  const stats = fs.statSync(source);

  if (stats.isDirectory()) {
    fs.cpSync(source, destination, {recursive: true, force: true});
    fs.rmSync(source, {recursive: true, force: true});
    return;
  }

  fs.copyFileSync(source, destination);
  fs.unlinkSync(source);
};

const copyAndRemove = async (source, destination) => {
  await fs.promises.mkdir(path.dirname(destination), {recursive: true});
  const stats = await fs.promises.stat(source);

  if (stats.isDirectory()) {
    await fs.promises.cp(source, destination, {recursive: true, force: true});
    await fs.promises.rm(source, {recursive: true, force: true});
    return;
  }

  await fs.promises.copyFile(source, destination);
  await fs.promises.unlink(source);
};

const originalRenameSync = fs.renameSync.bind(fs);
fs.renameSync = (oldPath, newPath) => {
  try {
    return originalRenameSync(oldPath, newPath);
  } catch (error) {
    if (error && error.code === 'EXDEV') {
      copyAndRemoveSync(oldPath, newPath);
      return;
    }
    throw error;
  }
};

const originalRename = fs.rename.bind(fs);
fs.rename = (oldPath, newPath, callback) => {
  if (typeof callback !== 'function') {
    return originalRename(oldPath, newPath, callback);
  }

  return originalRename(oldPath, newPath, async (error) => {
    if (error && error.code === 'EXDEV') {
      try {
        await copyAndRemove(oldPath, newPath);
        callback(null);
      } catch (copyError) {
        callback(copyError);
      }
      return;
    }

    callback(error);
  });
};

if (fs.promises?.rename) {
  const originalPromisesRename = fs.promises.rename.bind(fs.promises);
  fs.promises.rename = async (oldPath, newPath) => {
    try {
      return await originalPromisesRename(oldPath, newPath);
    } catch (error) {
      if (error && error.code === 'EXDEV') {
        await copyAndRemove(oldPath, newPath);
        return;
      }
      throw error;
    }
  };
}

