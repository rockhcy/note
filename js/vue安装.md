1.安装node.js，配置npm环境。
node和jdk不一样，它的安装很简单，直接下载执行exe就可以了，不需要配置环境变量。但是为了方便管理模块和缓存，需要执行如下操作来指定对应文件的存放位置。
npm install -g 默认会将这些全部模块安装到`C:\Users\用户名\AppData\Roaming\npm`下，占用C盘空间。这是非常不好的习惯。我们可以这样做
1.1在node安装目录下新建两个目录ndoe_global和node_cache
1.2打开cmd命令行，输入命令，指定这两个路径
`npm config set prefix "F:\nodejs\node_global"`
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
4.开始编码
```shell
#安装vue路由组件，--save 在包配置文件package.json文件添加对应的配置
cnpm install vue-router --save
#安装axios组件
cnpm install axios --save
#安装element-ui
cnpm install element-ui --save
```
4.2在创建项目文件夹，我习惯的目录结构如下，这个结构应该是不规范的，等熟悉了再去按规范调整，现在先入门
|—— public
|   |——favicon.ico
|   |——index.html
|—— src
|   |——assets                   静态资源文件
|   |——compinents               公共组件
|   |——config                   配置
|   |——router                   路由
|   |——views                    页面
|—— App.vue
|—— main.js
|—— babel.config.js
|—— package.json
|—— package-lock.json
4.3配置axios，为其添加put和delete支持。在config下添加axiosConfig.js，下入如下信息:
```js
import axios from 'axios';
let http = axios.create({
  baseURL: 'http://localhost:8080/',//请求地址
  withCredentials: true,//允许跨域
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
  },
  transformRequest: [function (data) {
    let newData = '';
    for (let k in data) {
      //if (data.hasOwnProperty(k) === true) {
      if (data.hasOwnProperty.call(true, k)) {
        newData += encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) + '&';
      }
    }
    return newData;
  }]
});

function apiAxios (method, url, params, response) {
  http({
    method: method,
    url: url,
    data: method === 'POST' || method === 'PUT' ? params : null,
    params: method === 'GET' || method === 'DELETE' ? params : null,
  }).then(function (res) {
    response(res);
  }).catch(function (err) {
    response(err);
  })
}

export default {
  get: function (url, params, response) {
    return apiAxios('GET', url, params, response)
  },
  post: function (url, params, response) {
    return apiAxios('POST', url, params, response)
  },
  put: function (url, params, response) {
    return apiAxios('PUT', url, params, response)
  },
  delete: function (url, params, response) {
    return apiAxios('DELETE', url, params, response)
  }
}
```
4.4在main.js中注入相关组件和配置
```js
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from './config/axiosConfig.js';
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.config.productionTip = false
Vue.use(ElementUI)
//Vue.prototyoe.$ajax = axios;
console.log(111)
console.log(Vue.prototype)
Vue.prototype.$http = axios;
new Vue({
  render: h => h(App),
  router
}).$mount('#app')

```
4.5添加页面，并在路由中注册
```js
import Vue from "vue"
import Router from "vue-router"
import login from "@/views/login"

Vue.use(Router)
export default new Router({
  routes: [
    {
      path: '/login',
      name: 'login',
      component: login
    }
  ]
})
```
vue整体学习路线和必须掌握的点：组件和路由、ajax、filter、VueX、vue声明周期函数
组件和路由：vue整体就是一个页面，每个组件都可以视为页面上的一小块。组件可以项目注册并调用。被注册的组件可以在父组件中充当一个html标签直接使用，因此组件名称应该尽可能避免单个单词。
当url发生变化时，页面会根据路由替换局部dom元素。
ajax：通过axios库来完成，就是一段配置，直接使用就好。
vue声明周期函数：和servlet声明周期函数一样，了解它的过程就好，要用到时自然会去联想到它。
父子组件互相传值：组件的作用域是相互独立的，因此不会相互干扰。它们间的值传递分为两个部分：
  父组件将值传递给子组件：父组件通过` v-bind:fatherMessage="message5" `绑定值，子组件在通过`props:['fatherMessage']`获取到值。注意`fatherMessage`父组件绑定用的属性和子组件获取用的属性名称要一致。这种方式的值传递是单向的，只能由父到子。
  `ref` 也能实现相同的效果，但是`ref`大多用于调用子组件中的方法的场景，`props` 才用于传递值。`ref` 的使用方法为：先在现在子组件中通过`<son ref="message6"></son>` 这种方式绑定一个属性，然后就能直接在自己的方法中调用 `this.$refs.message6.getmessage(this.message6)` ,`message6`为上面定义的属性，`getmessage(this.message6)` 为子组件中的一个方法，如果该方法可以接收参数，就能顺利将父组件中的值传递到子组件中。
  子组件将值传递给父组件：子组件通过 `this.$emit('func',this.msg)`将值传递给父组件，同时func为``
VueX：组件间是可以相互嵌套的，而且可以嵌套很多层。当出现多层嵌套或者页面组件关系比较复制时，可以使用Vuex来管理相互间的值传递。详情待定
filter：拦截器，还没看到。
其他就是一些模板语法了，和其他模板语法没什么区别，多用几次就熟悉了。





疑问：
1.我已经设置了node的环境变量，也设置了ndoe_global和node_cache，为什么npm install cnpm -g还是将cnpm添加到了C:\Users\rock\AppData\Roaming\npm下？
答：因为开始的环境变量配错了。如果npm的内容被下载到C:\Users\rock\AppData\Roaming\npm就一定是环境变量的问题。建议先解决这个文件在继续后面的操作，不然到处都是小错误。
2.记录下2.x和3.x的区别
我早年学过2.x，但是还没熟练就被抽调去写别的东西了，再回头都忘光了。这次下定决心要把它玩熟练再去弄别的。
2.1目录结构的变化，3.0通过vue create 创建项目，移除了config、build、static文件夹，添加了public文件夹，原来的index.html也移动到了public中。
2.2启动方式，2.0使用npm run dev，3.0使用rpm run serve，相关的端口、跨域等web设置在vue.config.js中完成(ps:还没找到设置位置？？)