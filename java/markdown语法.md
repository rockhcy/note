# markdown语法规范

## 1.使用#表示标题

## 2.段落格式
*斜体*
**粗体**
***粗斜体***
~~删除线~~
<u>下划线</u>
5种分割线
***
* * *
---
- - - 
-----------------------------
[^脚注]
[`教钻石地方]

## 3.列表  有序用数字+.    无效直接用*
* 第一项
    * 1.1
        * 1.1.1
* 第二项

1. 你好
    1. java
    1. js
        1. sfa
3. 世界

## 区块
> 我是区块,我里面的字体背景色都会变化
***
>* 我也是区块，但是我是和列表一起的组合使用
>1. 第一点
>2. 第二点

## 代码块,我的语法是```语言 代码```
```java
public JSONArray selectRouters(){
        List<Routers> list = sysDao.selectAllRouters();
        JSONArray jar = new JSONArray();
        for(Routers r:list){
            if ( r.getParentId() ==0 ){
                r = recursiveRoutersTree(r,list);
                jar.add(r);
            }
        }
        return jar;
    }
```
## 链接
[百度的链接](http://www.baidu.com)
## 图片
![](../img/baidu.jpg)
## 表格   :-表示对其方式 :-: 表示居中对齐
| 表头aaaaaaaaaa | 标题aaaaaaaaaaaaaa|
|:----|:----:|
|asdf|asdf|
|asdf|asdf|

## 其他：markdown本质会将md文件编译为html文件，因此，在md中写html的语法标签也是可以的。同时markdown使用反斜杠来转义已经定义好的特殊符号，例如：
**我时没有转义的内容**
\*\*我是转义后的内容\*\*