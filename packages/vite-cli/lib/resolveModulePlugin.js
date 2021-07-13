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
    len = 4;
  }
  if (moduleId.includes('@vue')) {
    len = 4;
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

module.exports = resolveModulePlugin;
