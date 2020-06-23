1.安装node.js，配置npm环境。
node和jdk不一样，它的安装很简单，直接下载执行exe就可以了，不需要配置环境变量。但是为了方便管理模块和缓存，需要执行如下操作来指定对应文件的存放位置。
npm install -g 默认会将这些全部模块安装到`C:\Users\用户名\AppData\Roaming\npm`下，占用C盘空间。这是非常不好的习惯。我们可以这样做
1.1在node安装目录下新建两个目录ndoe_global和node_cache
1.2打开cmd命令行，输入命令，指定这两个路径
`npm config set prefix "F:\nodejs\ndoe_global"`
`npm config set cache "F:\nodejs\node_cache"`
执行 `npm root -g` 现在自己的`F:\nodejs\node_global\node_modules`表示设置成功
1.3关闭cmd窗口，设置环境变量。在【用户变量】下的【Path】将【C:\Users\rock\AppData\Roaming\npm】修改为【F:\nodejs\ndoe_global】同时增加【F:\nodejs】.如果不是要对全部用户生效可以不配置系统变量。
2.安装vue.js和vue-cli。vue的使用有两种方式：a.像jquery一样通过`<script>`标签引入,不推荐；b.通过npm安装，具体步骤如下：
2.1
```shell
# 查看npm版本，npm是nodejs的包管理器，一般在安装完nodejs时npm会一并安装。
npm -v 
# 安装cnpm。cnpm是npm的一个插件，因为npm的网站在境外，因此需要cnpm解决墙的问题。
npm install cnpm -g --registry=https://registry.npm.taobao.org
# 安装vue，如果提示cnpm不是内部或外部命令，就需要将cnpm所在目录添加到环境变量中
cnpm install vue
# 全局安装 vue-cli. vue-cli是vue提供的手脚架，用于快速构建项目模板。
cnpm install --global vue-cli
```
3.创建工程文件
```shell
# 创建一个基于 webpack 模板的新项目,如果提示vue命令不存在就是环境变量的问题，如果提示无法加载xxxvue.ps1，因为在此系统上禁止运行脚本，就删除F:\nodejs\node_global下的vue.ps1文件。
# vue init webpack 和 vue create 两个命令都是构建项目，init是2.x的方式，create 是3.x开始才有的。
vue create my-project
#启动项目，ps：怎么指定端口？？
npm run serve
```
vue中的main.js就是整个项目的入口，他会先引入基础组件，然后实例化vue.最后将App.vue中的内容渲染到指定的dom元素中(#app).原来的index.html在3.0中已经移动到public文件夹下了。





疑问：
1.我已经设置了node的环境变量，也设置了ndoe_global和node_cache，为什么npm install cnpm -g还是将cnpm添加到了C:\Users\rock\AppData\Roaming\npm下？
答：因为开始的环境变量配错了。如果npm的内容被下载到C:\Users\rock\AppData\Roaming\npm就一定是环境变量的问题。建议先解决这个文件在继续后面的操作，不然到处都是小错误。
2.记录下2.x和3.x的区别
我早年学过2.x，但是还没熟练就被抽调去写别的东西了，再回头都忘光了。这次下定决心要把它玩熟练再去弄别的。
2.1目录结构的变化，3.0通过vue create 创建项目，移除了config、build、static文件夹，添加了public文件夹，原来的index.html也移动到了public中。
2.2启动方式，2.0使用npm run dev，3.0使用rpm run serve，相关的端口、跨域等web设置在vue.config.js中完成(ps:还没找到设置位置？？)