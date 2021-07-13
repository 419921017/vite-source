const path = require('path');
const { Readable } = require('stream');

const { parse } = require('es-module-lexer');
const MagicString = require('magic-string');

function moduleRewritePlugin({ app, root }) {
  app.use(async (ctx, next) => {
    await next();
    // 里面的中间件已经执行完成, 响应体已经有内容了
    if (ctx.body && ctx.response.is('js')) {
      const originContent = await readBody(ctx.body);
      console.log('originContent', originContent);
      const rewriteContent = await rewriteImports(originContent);
      ctx.body = rewriteContent;
    }
  });
}

function readBody(body) {
  // 如果响应体是一个流的话
  if (body instanceof Readable) {
    return new Promise((resolve, reject) => {
      let buffers = [];
      body
        .on('data', (chunk) => {
          buffers.push(chunk);
        })
        .on('end', () => {
          resolve(Buffer.concat(buffers).toString('utf-8'));
        });
    });
  } else {
    // 如响应体是一个字符串, buffer或者其他类型
    return body.toString('utf-8');
  }
}

async function rewriteImports(source) {
  let [imports] = await parse(source);
  if (imports.length > 0) {
    let magicString = new MagicString(source);
    for (let i = 0; i < imports.length; i++) {
      let { n, s, e } = imports[i];

      // 开始不是"." 也不是/ ","说明是个模块
      if (/^[^\/\.]/.test(n)) {
        // s和e永远指向最原始的索引
        magicString.overwrite(s, e, `/@modules/${n}`);
      }
    }
    return magicString.toString();
  }
  return source;
}

module.exports = moduleRewritePlugin;