# vite-source


## vite-cli

## bin/vite执行的文件

本质上是个koa服务器, 通过浏览器自带的es module实现

import会自动触发浏览器的请求

## moduleRewritePlugin

修改路径, 将模块的路径转变成`/@modules/`

使用`es-module-lexer`和`magic-string`

## processPlugin

全局注入`process`, 浏览器中没有`process`, `process`只有在`node`中存在

## resolveModulePlugin

将`/@modules/`转换成绝对路径, 每个模块都不一样, 需要特殊处理

使用`find-up`向上递归查找目录

## serveStaticPlugin

根目录和`public`两个目录设置为静态目录

## vuePlugin

处理vue文件(2次http请求)
- 将`.vue`文件转换成路径带有`?type=template`的js文件
- 注入`__render`
- 再次请求路径带有`?type=template`的js文件
- 编译`template`的`content`
- 返回编译后的结果
