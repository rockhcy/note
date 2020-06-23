1. 基本命令
    1. 查看内核版本 `cat/proc/version`
    2. 查看发行版本 `cat/etc/redhat-release`
    3. 查看IP地址 `ip addr`,`ifconfig`这个命令在最小安装版上是没有的
2. 文件操作
    1.查找文件 `find / -name 'redis-conf' `
3. 防火墙操作
    systemctl status firewalld.service              # 查看防火墙状态，参数可选，status-查看状态；stop-关闭；start-开启；restart重启；enable 开机启动；disable 开机禁用；
    firewall-cmd --query-port=80/tcp                # 查看端口是否开放，可选参数 --list-port  查看开放列表；--add-port=80/tcp 添加端口；--prmanent 永久生效，没有此参数重启后失效
4. linux下启动jar包命令
    nohup java -jar -Xmx1024M  -c /usr/broker-a.properties -server.port=9002 XX.jar > XX.out 2>&1 
    nohup   忽略sighup(一种网络信号)，当收到shell关闭信号时，进程继续存在。
    &       后台运行，即使使用ctrl+c 也照样运行。但是关闭shell后进程结束。nohup 和 & 配合使用才能达到后台启动的效果
    >       日志重定向，> 和 >> 都是日志重定向，> 为覆盖写操作，>>为追加写操作，后面跟要写入的文件路径
    2>&1    0:标准输入，1：标准输出，2：错误信息输出。2>&1 将错误信息重定向到标准输出。他的格式一般为 `命令 > 文件 > 2>&1` 表示将正确和错误信息以覆盖写方式输出到文件中
    -c      没查到这个参数的意义，但是在rocketMQ中它是用来指定配置文件位置的， 在springboot中可以使用参数spring.profiles.active=来调整



**设置固定IP的方法**：修改`/etc/sysconfig/network-scripts/` 下的网卡配置文件，将`BOOTPROTO=DHCP`修改为`BOOTPROTO=static`,将`ONBOOT=no`修改为`ONBOOT=yes`；
然后添加`IPADDR=固定ip`、`GATEWAY=网关`、`NETMASK=子网掩码`、`DNS1=DNS地址`；
最后执行 `service network restart`

**需要安装的常用工具命令**：
lrzsz：用于windows和linux跨平台文件传输
unzip：解压zip文件
vim：linux下经典编辑工具