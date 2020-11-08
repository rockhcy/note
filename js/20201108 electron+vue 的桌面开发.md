###### 2020-11-8 最近这段时间对比了QT和其他几种常见的GUI技术栈，最终决定还是将js作为主要方向。这里主要记录下electron打包应用为桌面程序的步骤，后系需要将node.js系统过一遍。
将vue和electron 整合打包非常简单：
1. 修改用户目录下的`.npmrc`文件，在其中追加如下配置
```npm
prefixF:\nodejs\ndoe_global=
cacheF:\nodejs\node_cache=
prefix=F:\nodejs\node_global
cache=F:\nodejs\node_cache
registry=https://registry.npm.taobao.org/
// 上面都是node配置，下面这两句才是electron经行的地址
electron_mirror=https://npm.taobao.org/mirrors/electron/
electron-builder-binaries_mirror=https://npm.taobao.org/mirrors/electron-builder-binaries/
```
2. 进入项目目录，执行`vue add electron-builder`,将electron插件添加到vue中
3. 执行`npm run electron:serve` 以桌面程序的方式启动项目。这样可以直接看到效果。
4. 执行`npm run electron:build` 将项目打包为exe，双击执行后，项目会被安装到PC上。
这个项目的运行是不需要单独安装node环境的，因为项目中已经打包了一个node运行环境和一个删减后的浏览器。但是这样方式的安装装包会比较大，就算是空的vue项目也会有40M+.


