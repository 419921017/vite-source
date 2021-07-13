const fs = require('fs').promises;
const path = require('path');

const findUp = require('find-up');

let modulesRegexp = /\/@modules\//;

function resolveModulePlugin({ app, root }) {
  //
  app.use(async (ctx, next) => {
    if (!modulesRegexp.test(ctx.path)) {
      return next();
    }
    const moduleId = ctx.path.replace(modulesRegexp, '');
    ctx.type = 'js';
    let resolvedModule = await resolveModule(root, moduleId);
    const content = await fs.readFile(resolvedModule, 'utf-8');
    ctx.body = content;
  });
}

async function resolveModule(root, moduleId) {
  let nodeModules = await findUp('node_modules', {
    cwd: root,
    type: 'directory',
  });
  let modulePath;
  let len = 0;
  if (moduleId === 'vue') {
    moduleId = '@vue/runtime-dom';
    len = 5;
  } else if (moduleId.startsWith('@vue')) {
    len = 5;
  } else {
    // 只能拿到package中main对应的文件
    return require.resolve(moduleId);
    // return handleRequireModulePath(moduleId);
  }

  modulePath = path.resolve(
    nodeModules,
    `${moduleId}/dist/${moduleId.slice(len)}.esm-bundler.js`
  );
  return modulePath;
  // path.resolve(
  //   root,
  //   '../../node_modules',
  //   `@vue/${moduleId}/dist/${moduleId}.esm-bundler.js`
  // );
}

/**
 * 将package.json中的main对应的值转换成module
 *
 * @param {*} moduleId
 * @return {*}
 */
async function handleRequireModulePath(moduleId) {
  const mainPath = require.resolve(moduleId);
  const mainDir = path.dirname(mainPath);
  const packageContent = await fs.readFile(
    path.resolve(mainDir, mainPath, 'package.json'),
    'utf-8'
  );
  const packageJson = JSON.parse(packageContent);
  const modulePath = packageJson.module;
  const result = path.resolve(mainDir, modulePath);
  return result;
}

module.exports = resolveModulePlugin;
