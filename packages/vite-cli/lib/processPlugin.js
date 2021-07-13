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
    const html = readBody(ctx.body);
    ctx.body = html.replace(/<head>/, `${injection}`);
  });
}

module.exports = processPlugin;
