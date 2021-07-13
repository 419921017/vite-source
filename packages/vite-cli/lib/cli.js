const Koa = require('koa');
const moduleRewritePlugin = require('./moduleRewritePlugin');
const serveStaticPlugin = require('./serveStaticPlugin');

function createServer() {
  const app = new Koa();
  // 当前目录的文件
  const root = process.cwd();
  const context = { app, root };
  app.use((ctx, next) => {
    Object.assign(ctx, context);
    return next();
  });

  const resolvedPlugins = [moduleRewritePlugin, serveStaticPlugin];
  resolvedPlugins.forEach((plugin) => plugin(context));
  return app;
}

createServer().listen(4000, () => {
  console.log(`Dev server is running at:http://localhost:4000`);
});
