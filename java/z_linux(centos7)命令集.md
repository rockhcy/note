1. 基本命令
    1. 查看内核版本 `cat/proc/version`
    2. 查看发行版本 `cat/etc/redhat-release`
    3. 查看IP地址 `ip addr`,`ifconfig`这个命令在最小安装版上是没有的
2. 文件操作
    1.查找文件 `find / -name 'redis-conf' `
3. 防火墙操作
    systemctl status firewalld.service              # 查看防火墙状态，参数可选，status-查看状态；stop-关闭；start-开启；restart重启；enable 开机启动；disable 开机禁用；
    firewall-cmd --query-port=80/tcp                # 查看端口是否开放，可选参数 --list-port  查看开放列表；--add-port=80/tcp 添加端口；--prmanent 永久生效，没有此参数重启后失效
    firewall-cmd --zone=public --add-port=80/tcp --permanent    # 将端口开放访问并永久生效
    firewall-cmd --zone=public --list-ports # 查看全部端口
    firewall-cmd --zone=public --remove-port=80/tcp --permanent #删除以添加的端口
    firewall-cmd --reload     # 重新加载配置
4. linux下启动jar包命令
    nohup java -jar -Xmx1024M  -c /usr/broker-a.properties -server.port=9002 XX.jar > XX.out 2>&1 
    nohup   忽略sighup(一种网络信号)，当收到shell关闭信号时，进程继续存在。
    &       后台运行，即使使用ctrl+c 也照样运行。但是关闭shell后进程结束。nohup 和 & 配合使用才能达到后台启动的效果
    >       日志重定向，> 和 >> 都是日志重定向，> 为覆盖写操作，>>为追加写操作，后面跟要写入的文件路径
    2>&1    0:标准输入，1：标准输出，2：错误信息输出。2>&1 将错误信息重定向到标准输出。他的格式一般为 `命令 > 文件 > 2>&1` 表示将正确和错误信息以覆盖写方式输出到文件中
    -c      没查到这个参数的意义，但是在rocketMQ中它是用来指定配置文件位置的， 在springboot中可以使用参数spring.profiles.active=来调整
5. 打包和解压
    tar -cvf web.tar ./web/                        #将当前目录下的web目录打包为web.tar压缩包
    参数说明： c   创建新的档案文件。如果用户想备份一个目录或是一些文件，就要选择这个选项。
              x   从档案文件中释放文件。解压参数
              v   详细报告tar处理的文件信息。如无此选项，tar不报告文件信息。
              z   用gzip来压缩/解压缩文件，加上该选项后可以将档案文件进行压缩，但还原时也一定要使用该选项进行解压缩。 
              f   使用档案文件或设备，这个选项通常是必选的。
6. yum install epel-release -y
    EPEL的全称是Extra Packages for Enterprise Linux。它主要为CentOS等linux发行版提供依赖包，安装它相当于添加了一个第三方源。CentOS等发行版为了保证自己的稳定性，官方仓库中并没有提供太多的软件，有实就需要使用第三方源来补充。
7. 离线下载RPM包
    yum install --downloadonly <package-name> 这种方式只能下载到你要的包，但是linux下一个包通常会有一串的依赖文件，离线安装rpm时通过会因为依赖不足导致rpm安装失败。
    yum-utils 是yum的一个补充工具，可以很方便的将包和包依赖一并下载到指定目录。注意：yumdownloader一次只能下载一组包。
    yum install yum-utils
    yumdownloader --resolve --destdir=/root/mypackages/ <package-name>
8. linux关机
    sync  #将数据由内存同步到硬盘中，很容易忽略的一个命令
    shutdown -h '系统将在10分钟后关闭' # 告诉大家系统会在10分钟后关机，并且会显示在登陆用户的当前屏幕中。可以不加后面的描述，不加就不会有提示
    shutdown –r now # 立刻重启
    shutdown -r +10 # 系统十分钟后重启
    reboot #重启，等同于shutdown –r now
    halt  #关机，等同于 shutdown –h now
9. 关于linux时间
    ls -l /etc/localtime    # 查看当前时区
    date -s "2021-01-06 14:19:00"   # 更新时间


**设置固定IP的方法**：修改`/etc/sysconfig/network-scripts/` 下的网卡配置文件，将`BOOTPROTO=DHCP`修改为`BOOTPROTO=static`,将`ONBOOT=no`修改为`ONBOOT=yes`；
然后添加`IPADDR=固定ip`、`GATEWAY=网关`、`NETMASK=子网掩码`、`DNS1=DNS地址`；
最后执行 `service network restart`

**需要安装的常用工具命令**：
lrzsz：用于windows和linux跨平台文件传输
unzip：解压zip文件
vim：linux下经典编辑工具这个主要是broker的服务端口号，作为对producer和consumer使用服务的端口号，默认为10911，可以通过配置文件中修改。