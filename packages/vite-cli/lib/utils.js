const { Readable } = require('stream');

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

exports.readBody = readBody;
