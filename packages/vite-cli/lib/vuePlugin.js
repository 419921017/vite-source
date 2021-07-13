const path = require('path');
const fs = require('fs').promises;

const { parse, compileTemplate } = require('@vue/compiler-sfc');

const defaultExportRegexp = /export default/g;
function vuePlugin({ app, root }) {
  app.use(async (ctx, next) => {
    if (!ctx.path.endsWith('.vue')) {
      return next();
    }
    console.log('ctx.path', ctx.path);
    const filePath = path.join(root, ctx.path);
    const content = await fs.readFile(filePath, 'utf-8');
    console.log('content', content);
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
      console.log('code-vue', code);
      ctx.body = code;
    } else {
      console.log('ctx.query', ctx.query);
      console.log('ctx.query.type', ctx.query.type);
      if (ctx.query.type === 'template') {
        ctx.type = 'js';
        let content = descriptor.template.content;
        console.log('compileTemplate-template', content);

        const { code } = compileTemplate({ source: content });
        console.log('compileTemplate-code', code);
        ctx.body = code;
        console.log('code-template', code);
      }
    }
    // next();
  });
}

module.exports = vuePlugin;
