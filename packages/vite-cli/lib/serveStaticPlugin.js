const path = require('path');
const staticPlugin = require('koa-static');

function serveStaticPlugin({ app, root }) {
  // root
  app.use(staticPlugin(root));
  // root/public
  app.use(staticPlugin(path.join(root, 'public')));
}

module.exports = serveStaticPlugin;
