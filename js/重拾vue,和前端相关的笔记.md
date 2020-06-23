2019-9-9 打算重新捡起vue.js，刚好身边有个vue行家，这种机会怎么能错过呢！该文档用于记录过程中发现的一些疑问
### 环境配置
打算使用vsCode作为开发工具，相关的其他环境包括：
1. node.js 
2. npm 包管理工具，类似java的maven
3. vue-cli 我把它理解为类似springboot工程骨架，就是用来快速创建工程的
4. 安装vetur插件，使用vscode打开任意vue文件，如果没有对应的插件支持，vsCode会自动提示安装插件
5. 执行命令`npm run dev`启动项目。vue的项目开发需要依赖于node环境，它的启动、编译的操作都是通过命令执行的。这点和tomcat是不同的。
6. 执行命令`npm i element-ui -S`安装element-ui。这个操作类似于java中的通过maven引入依赖库
7. 在main.js中引入element-ui。
> 如下配置可以在项目文件夹下右键选择使用vscode打开项目
注意修改code.exe为你本地的vscode安装路径
```bat
Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\*\shell\VSCode]
@="Open with Code"
"Icon"="A:\\Microsoft VS Code\\Code.exe"

[HKEY_CLASSES_ROOT\*\shell\VSCode\command]
@="\"A:\\Microsoft VS Code\\Code.exe\" \"%1\""

Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\Directory\shell\VSCode]
@="Open with Code"
"Icon"="A:\\Microsoft VS Code\\Code.exe"

[HKEY_CLASSES_ROOT\Directory\shell\VSCode\command]
@="\"A:\\Microsoft VS Code\\Code.exe\" \"%V\""

Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\Directory\Background\shell\VSCode]
@="Open with Code"
"Icon"="A:\\Microsoft VS Code\\Code.exe"

[HKEY_CLASSES_ROOT\Directory\Background\shell\VSCode\command]
@="\"A:\\Microsoft VS Code\\Code.exe\" \"%V\""
```
> 在vsCode配置vue的文件模板的方法：在文件》首选项》用户代码片段，中修改vue.json中加入如下模板，以后再新建vue中输入vue会有光标提示，自动生成模板
```json
{
    "Print to console":{
        "prefix": "vue",
            "body": [
                "<template>",
                "  <div class=\"wrapper\">$0</div>",
                "</template>",
                "",
                "<script>",
                "export default {",
                "  components:{},",
                "  props:{},",
                "  data(){",
                "    return {",
                "    }",
                "  },",
                "  watch:{},",
                "  computed:{},",
                "  methods:{},",
                "  created(){},",
                "  mounted(){}",
                "}",
                "</script>",
                "<style lang=\"scss\" scoped>",
              
                "</style>"
            ],
            "description": "A vue file template"
    }
}
```
### 初次创建项目时遇到的一些问题记录：
1. 项目启动时一直提示错误.解决办法是执行命令 `npm install vue-style-loader css-loader sass-loader --save` 
原因是因为引入了element-ui的相关css等样式文件，在编译项目时需要上述loader才能正常编译这部分样式文件
```js
This dependency was not found:

* !!vue-style-loader!css-loader?{"sourceMap":true}!../../node_modules/vue-loader/lib/style-compiler/index?{"vue":true,"id":"data-v-10d9df09","scoped":true,"hasInlineConfig":false}!sass-loader?{"sourceMap":true}!../../node_modules/vue-loader/lib/selector?type=styles&index=0!./login.vue in ./src/components/login.vue

To install it, you can run: npm install --save !!vue-style-loader!css-loader?{"sourceMap":true}!../../node_modules/vue-loader/lib/style-compiler/index?{"vue":true,"id":"data-v-10d9df09","scoped":true,"hasInlineConfig":false}!sass-loader?{"sourceMap":true}!../../node_modules/vue-loader/lib/selector?type=styles&index=0!./login.vue
```
2. 执行命令 ` npm install sass-loader --save ` 时报错.解决办法：执行命令 `  npm install node-sass@latest `
```js
Module build failed: Error: Cannot find module 'node-sass'
    at Function.Module._resolveFilename (internal/modules/cjs/loader.js:582:15)
    at Module.require (internal/modules/cjs/loader.js:637:17)
    at require (internal/modules/cjs/helpers.js:22:18)
    at getDefaultSassImplementation (D:\test\vueDemo\demo1\project2\node_modules\sass-loader\dist\getDefaultSassImplementation.js:24:10)
    at getSassImplementation (D:\test\vueDemo\demo1\project2\node_modules\sass-loader\dist\getSassImplementation.js:19:72)
    at Object.loader (D:\test\vueDemo\demo1\project2\node_modules\sass-loader\dist\index.js:40:61)
```
3. 启动项目提示如下错误，解决办法是：修改package.json中的 ` "sass-loader": "^8.0.0" ` 为 ` "sass-loader": "^7.3.1" `,降低sass-loader的版本
```js
 error  in ./src/components/login.vue

Module build failed: TypeError: this.getResolve is not a function
    at Object.loader (D:\test\vueDemo\demo1\project2\node_modules\sass-loader\dist\index.js:52:26)
 @ ./node_modules/vue-style-loader!./node_modules/css-loader?{"sourceMap":true}!./node_modules/vue-loader/lib/style-compiler?{"vue":true,"id":"data-v-10d9df09","scoped":true,"hasInlineConfig":false}!./node_modules/sass-loader/dist/cjs.js?{"sourceMap":true}!./node_modules/vue-loader/lib/selector.js?type=styles&index=0!./src/components/login.vue 4:14-370 13:3-17:5 14:22-378
 @ ./src/components/login.vue
```
### JS相关知识点
1. var let const三个关键字的区别
var 是最常见的关键字，它可以申明块级别的变量，也能申明全局变量，还可以在代码段之后申明变量(先使用，后申明)。全局变量属于window对象，可以被window直接调用，且当全局变量和局部变量重叠时两者是可以互相修改的。
let 和var很相似，在函数体内时两者的作用域都是局部的，在函数体外时两者的作用域都是全局的。区别是函数体内外都有相同变量名时var申明的变量会相互影响，let申明的变量相互独立。并且let的变量不属于window，因此不能先使用后申明。
const 一般用于声明常量，必须在申明时初始化。但是它又不是真正的常量。如果你将它赋值为一个数值或字符串，它将不能在被赋值；如果你将它赋值为一个对象或者数组，你可以对这个对象或者数组增加、修改属性和值。const申明的变量同样不能先使用后申明。

### vue语法总结
1. title 提示信息 `<span v-bind:title="message2">title是做什么的</span> `
2. 循环 `<li v-for="item in message3" :key="item">
          {{item.text}}
        </li>`
3. 条件判断 `<p v-if="seen">我是要显示的内容</p>` 当seen 为 true是内容显示，否则不显示，页面上都不会有这个元素
4. 方法的申明、绑定、和触发。
```js
export default {
  data () {
    return {
      message: '我是要渲染的信息',
      message2: '我是要渲染的信息message2',
      message3: [
        {text: 'vue入门'},
        {text: 'vue放弃'},
        {text: '在入门'}
      ],
      message4: '我是要被方法触发的提示信息'
    }
  },
  //通过 methods申明方法，在和data进行数据交互时 需要使用this才能获取到数据对象
  methods: {
    reverseMessage: function () {
      this.message4 = this.message4.split('').reverse().join('')
    }
  }
}
```
`<button v-on:click="reverseMessage">反转消息</button>` 通过 `v-on` 绑定方法，`:click`定义事件触发类型，`reverseMessage` 绑定对应的方法
5. 组件引用，先引入对应组件，通过components声明，然后你就能将你定义的组件当作一个标签直接再页面上使用了.其实vue的组件就是自定义元素的一种.这种方式能很大程度减少页面代码编写
6. 父子组件传值。组件的作用域是相互独立的，因此不会相互干扰。它们间的值传递分为两个部分：
父组件将值传递给子组件：父组件通过` v-bind:fatherMessage="message5" `绑定值，子组件在通过`props:['fatherMessage']`获取到值。注意`fatherMessage`父组件绑定用的属性和子组件获取用的属性名称要一致。这种方式的值传递是单向的，只能由父到子。
`ref` 也能实现相同的效果，但是`ref`大多用于调用子组件中的方法的场景，`props` 才用于传递值。`ref` 的使用方法为：先在现在子组件中通过`<son ref="message6"></son>` 这种方式绑定一个属性，然后就能直接在自己的方法中调用 `this.$refs.message6.getmessage(this.message6)` ,`message6`为上面定义的属性，`getmessage(this.message6)` 为子组件中的一个方法，如果该方法可以接收参数，就能顺利将父组件中的值传递到子组件中。
子组件将值传递给父组件：子组件通过 `this.$emit('func',this.msg)`将值传递给父组件，同时func为``
