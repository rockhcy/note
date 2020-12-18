###### 2020-11-13 今天开始研究Guacamole,目标是将UAM整合到全家桶中。我始终觉得UAM应该以无客户端版为主线。浏览器是跨平台的，就算需要客户端，通过js封装客户端的代价肯定是最小的。就算真有浏览器无法直接完成的功能，通过node调用dll和通过c++调用能有多大差别？
## 1 Guacamole入门
### 1.1 是什么？
apache Guacamole 是无客户端远程桌面网关，能同时支持VNC、RDP和SSH协议。简单来说就是可以将windows、linux等的远程桌面投射到浏览器上，通过浏览器直接访问桌面。
### 1.2 怎么用？
Guacamole 整个项目分为3部分：Guacamole-server、Guacamole-client和Web。官网将Guacamole-client和web归为一个项目。我习惯前后端分离，因此将他拆分为两个部分了(我要做二次开发才做的拆分，如果只是运维或基本使用可以不用拆分)。
1. 启动Guacamole 服务端
Guacamole-server使用c编写，我不懂c，也没打算改动这部分代码。可以直接docker拉取镜像启动就好。
`docker pull guacamole/guacd #拉取服务端镜像`
`docker run -d --name myGuacd -p 4822:4822 guacamole/guacd #启动服务，并将4822端口映射出来`
2. 启动Guacamole-client.这部分使用java编写，官网提供了war可以直接在tomcat中运行。这部分也就是我打算改造的。
我们先以最简化模式启动：以windows系统为例，你需要在user目录下创建一个`.guacamole`文件夹，我的路径为`C:\Users\rock\.guacamole`,然后再里面放入两个文件`guacamole.properties`和`user-mapping.xml`。配置如下
```pro
# guacamole.properties，用于配置服务端的ip和端口
guacd-hostname: 192.168.10.154
guacd-port:     4822
# 登陆账户验证地址，可以是xml文件，也可以是mysql数据库。这里使用xml入门
user-mapping:  ./user-mapping.xml
# 是否启用剪切板
enable-clipboard-integration: true
```
```xml
<?xml version="1.0" encoding="UTF-8"?>
<user-mapping>
    <!--用户信息 -->
    <authorize username="hcy" password="123">
        <protocol>rdp</protocol>
        <param name="hostname">192.168.10.132</param>
        <param name="port">3389</param>
        <param name="ignore-cert">true</param>
        <param name="username">administrator</param>
        <param name="password">qwer1234!</param>
    </authorize>
</user-mapping>
```
简述一下流程：用户使用hcy和123作为账号密码登陆web页面，等成功后java服务会将主机地址、远程端口、桌面账户、密码、协议一起发送给服务端。服务端根据这些信息发起远程连接，连接到实际PC上。然后将画面传给java，java再将信息发送给web页面。
因此、通过web登陆系统的人只需要知道web层面的密码，并不需要知道实际的桌面账户密码。
### 1.3 guacamole和传统远程桌面或者其他远程桌面软件的区别。
guacamole最大的优点是可以通过浏览器直接访问而无需任何插件，便捷性和跨平台就是它的最大优点。
缺点也很明显，因为浏览器的限制，复制、粘贴、文件传输和设备重定向，这些功能是不可能实现的。因为js无法直接访问本地文件。
guacamole还是提供了迂回的方法来解决文件传输的问题，比如剪切板和手动文件上传。
总的来说，实现远程桌面可以，但是要做usb设备重定向不行。如果要做可以考虑使用electron开发桌面程序来实现。
### 1.4 各种远程桌面协议优缺点比较
guacamole 能同时支持RDP、VNC、SSH3种远程桌面协议。但是主流的远程桌面协议一般指：RDP、VNC和SPICE。SSH通常用做命令行传输，在linux运维上使用比较多。面向普通客户的远程桌面一般不会考虑它。
1. RDP:由微软提出的软件桌面协议，windows的远程桌面就是起代表作。linux上需要单独安装`rdesktop`.
占用流量小，正常使用100-200k左右。支持色彩、音频、usb、本地磁盘映射、GPU加速和多显示支持。
RDP连接是基于会话通道的，就是说一个RDP会话只能被一方看到，重复连接前面的用户会自动锁屏(可配置)，多个连接是共享服务器资源的。这种模式适合虚拟桌面，但是不适合远程协助，因为无法共享屏幕。
PS:RDP因为是由微软在主导和维护，部分对国产化要求比较严格的政企会排斥基于RDP的产品。
2. SPICE
占用流量大，正常使用10-20M。功能方面RDP支持的它都支持。
SPICE的桌面是基于虚拟机的,它会为每个连接都创建一个虚拟机，因此资源都是独立的，属于云桌面的首选协议。
3. vnc
占用流量小，常用100k左右。但是它只做图形命令传输，且只能传输一个屏幕。不支持音频、不支持GPU加速、也不支持USB设备重定向。但是它的屏幕是共享的，非常适合远程协助。据说向日葵就是基于VNC做的。

注：VNC我当前能找到的开源实现为TigerVNC，git上有源码，但是配置界面很原始，画面也很卡，能看到明显的画面抖动。加上windows默认不支持VNC，而TigerVNC也不在维护windows下的分支，现有的最进发行版本也无法在w10上安装使用，因此不考虑使用VNC作为研究方向。

