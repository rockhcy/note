1. 基本命令
    1. 查看内核版本 `cat/proc/version`
    2. 查看发行版本 `cat/etc/redhat-release`
    3. 查看IP地址 `ip addr`,`ifconfig`这个命令在最小安装版上是没有的
2. 文件操作
    1.查找文件 `find / -name 'redis-conf' `



**设置固定IP的方法**：修改`/etc/sysconfig/network-scripts/` 下的网卡配置文件，将`BOOTPROTO=DHCP`修改为`BOOTPROTO=static`,将`ONBOOT=no`修改为`ONBOOT=yes`；
然后添加`IPADDR=固定ip`、`GATEWAY=网关`、`NETMASK=子网掩码`、`DNS1=DNS地址`；
最后执行 `service network restart`

**需要安装的常用工具命令**：
lrzsz：用于windows和linux跨平台文件传输
unzip：解压zip文件
vim：linux下经典编辑工具