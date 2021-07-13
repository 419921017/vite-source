const { readBody } = require('./utils');

function processPlugin({ app, root }) {
  let injection = `
    <script>
        window.process = {
            env: {
                NODE_ENV: 'development'
            }
        }
    </script>
  `;
  app.use(async (ctx, next) => {
    await next();
    // if (ctx.path.endsWith('.html')) {
    const html = await readBody(ctx.body);
    ctx.body = html.replace(/<head>/, `${injection}`);
    // }
  });
}

module.exports = processPlugin;
