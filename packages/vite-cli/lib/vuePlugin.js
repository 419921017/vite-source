const path = require('path');
const fs = require('fs').promises;

const { parse, compileTemplate } = require('@vue/compiler-sfc');

const defaultExportRegexp = /export default/g;

function vuePlugin({ app, root }) {
  app.use(async (ctx, next) => {
    if (!ctx.path.endsWith('.vue')) {
      return next();
    }
    const filePath = path.join(root, ctx.path);
    const content = await fs.readFile(filePath, 'utf-8');
    let descriptor = parse(content).descriptor;
    console.log('descriptor', descriptor);
    // 请求的是.vue文件
    if (!ctx.query.type) {
      let code = ``;

      if (descriptor.script) {
        let content = descriptor.script.content;

        code += content.replace(defaultExportRegexp, 'const __script=');
      }
      if (descriptor.template) {
        const templateRequest = ctx.path + `?type=template`;
        code += `\nimport {render as __render} from ${JSON.stringify(
          templateRequest
        )}`;
        code += `\n__script.render = __render`;
      }
      code += `\nexport default __script`;
      ctx.type = 'js';
      ctx.body = code;
    } else {
      if (ctx.query.type === 'template') {
        ctx.type = 'js';
        let content = descriptor.template.content;

        const { code } = compileTemplate({ source: content });
        ctx.body = code;
      }
    }
  });
}

module.exports = vuePlugin;
