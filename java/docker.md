docker安装
```shell
#安装前需要注意：1.docker是基于go语言编写，需要linux内核 3.10以上支持；一般centos 6.5以上就可以了，我用的centos 7.2。
#2.docker只有linux版本，Windows版本不是官方做的，情况参考redis。一般来说我们建议使用linux版的

#移除旧的版本：
 yum remove docker 
                  docker-client 
                  docker-client-latest 
                  docker-common 
                  docker-latest 
                  docker-latest-logrotate 
                  docker-logrotate 
                  docker-selinux 
                  docker-engine-selinux 
                  docker-engine

#安装一些必要的系统工具：
 yum install -y yum-utils device-mapper-persistent-data lvm2
#添加软件源信息：(这个地方我掉过坑，参考我的上篇帖子)
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
#更新 yum 软件包索引
 yum makecache fast
#安装 Docker-ce：
yum -y install docker-ce
#启动 Docker 后台服务
systemctl start docker
#不报错就是安装好了！
#配置阿里云镜像加速
mkdir -p /etc/docker
vim /etc/docker/daemon.json
#写入自己的加速器地址，申请方法：在【阿里云】中搜索“容器镜像服务”，找到【镜像加速器】，将json写入文件就可以了
{
  "registry-mirrors":["https://g05sgp83.mirror.aliyuncs.com"]
}
#加载配置，重启docker服务
systemctl daemon-reload
systemctl restart docker
```
    docker常用的操作命令
    docker images               #列出本地主机上的镜像
    docker search               #查找镜像，
    docker pull 镜像名称:TAG    #拉取镜像，TAG为版本号，不写默认拉取last
    docker rmi 镜像名称ID       #删除镜像
    docker run [OPTIONS] IMAGE [COMMAND] #启动镜像，这个命令要特别说明下
    docker run --name=t2 -d -p:10000:10000 centos   #使用centos这个镜像新建并启动一个容器，容器的名称为t2，启动方式为后台运行，同时指定端口，将本地的10000端口映射到容器的10000端口上
    docker ps               #列出正在运行的容器，-a 列出全部，包括未运行的
    docker start 容器ID     #启动容器
    docker restart 容器id   #重启容器
    docker stop 容器id      #停止容器
    docker kill 容器id      #强杀，强制停止容器
    docker rm 容器id        #删除容器
    docker top 容器id       # 查看容器内运行的进程
    docker exec -it 容器id /bin/bash  #进入容器
    docker attach 容器id    #进入容器，推荐使用
    exit                    #退出容器，容器会停止
    ctrl+P+Q                #容器不停止退出
    docker cp 容器id:容器内路径 目的主机路径    # 将容器内的文件拷贝到主机上，容器内的路径tab键不会有
注意：
1.容器内部必须有一个前台进程，否则容器在执行完命令后会自动退出。exec和attach的区别就是exec会再启动一个前台交互进程，但是attach会继续使用原来的那个命令终端。
2.docker镜像都是只读的。当容器启动时，一个新的可写层被加载到镜像的顶部，这一层被称作“容器层”，在这之下的都叫“镜像层”。因此，只要还有容器和镜像关联，无论容器是否启动，都无法删除镜像。

    docker commit -m=提交信息 -a=作者 容器id 要创建的镜像名称:标签名    #提交容器副本使之成为一个新的镜像
    docker run -v 宿主机绝对路径目录:容器内目录 镜像名  #挂载数据卷，也就是将外部文件映射到容器内部使用
    注意：数据卷挂载的本质类似创建了一个快捷方式，宿主机和容器共享一份文件，因此修改是大家都能看到的。如果多个容器同时修改一份文件，可能导致都不能修改成功，参考windows下多用户操作一份文件。
    通过-v挂载的数据卷依赖外部环境，也可以通过修改dockerFile中的VOLUME来挂载数据，用到时再去看。
    数据卷容器：如果一个容器(a)挂载了数据卷，而后其他容器通过挂载这个(父容器)来实现数据共享,a容器就称为数据卷容器。这个功能感觉暂时用不到，需要时再去看。
    DockerFile：Docker镜像的构建文件，需要用到时再看。一般直接在基础镜像上修改然后提交比较合适，直接写DockerFile感觉不太适合开发人员。
    docker save -o 打包文件的路径 要打包的镜像id      # 将镜像打包，一般是我们自己修改过的镜像。打包文件一般为tar
    docker load < 打包镜像文件                       # 从文件中恢复镜像
    注意：我们通过文件恢复镜像时，命令行的输出可能会是一个很小的文件大小。因为“镜像层”是很多层累加起来的，打包时会将所有依赖层全部封装，但是恢复时会逐层检查，如果某层(比如基础镜像)已经存在了，就会直接引用这层。
    而且我发现docker命令在操作镜像时有个规律，都是"docker 命令 参数 镜像id" ，镜像id基本都是放在最后面的
3.docker容器启动时，可能会提示`iptables: No chain/target/match by that name.`。此时重启docker服务就能解决这个问题，原理我也不知道。在使用redis镜像时遇到过这样的情况。

##### 2020-11-09 补充关于容器内启动redis的相关命令笔记
`docker run -p 6379:6379 --name mdm-redis -v /hcy/redis/redis.conf:/etc/redis/redis.conf  -v /hcy/redis/redisData:/data -d redis redis-server /etc/redis/redis.conf --appendonly yes`
 启动一个docker容器，将6379映射到容器内的6379上，-v是文件夹映射，宿主机地址：容器地址；-d 后台启动。
 我启动时一直无法手动指定 /etc/redis/redis.conf 配置文件，不知道是否因为我使用的配置文件太老了。
 放弃指定该文件后启动成功。
 docker logs 容器id，可以查看到容器的启动日志，如果发现容器启动失败，可以使用该命令查看启动失败的原因。
 容器启动时的配置参数会被记录在 /var/lib/docker/containers/ 容器id/hostconfig.json 下，如果部分参数配置错了，可以直接修改该json。

 ##### 2020-12-1 补充一个docker容器启动时提示iptables: No chain/target/match by that name的问题
 问题：
 ```shell
 [root@localhost rocketmq4.7]# docker run -d --name myGuacd -p 4822:4822 guacamole/guacd
04d71dc910e5247cb10b599612835806f752140cf5a1f4bcaa2abc1350a12d76
docker: Error response from daemon: driver failed programming external connectivity on endpoint myGuacd (a5df94a8001917e0835c7fa2e7ca15e0597aea3a2074d1e551009a6d15803d62):  (iptables failed: iptables --wait -t nat -A DOCKER -p tcp -d 0/0 --dport 4822 -j DNAT --to-destination 172.17.0.3:4822 ! -i docker0: iptables: No chain/target/match by that name.
 (exit status 1)).
 ```
 还原现场：
 gua-java端启动时提示tunnel连接超时，检查后发现docker宿主机防火墙没开放端口，最近测试重建环境比较多，顺手就将firewalld给关了，然后发现tunnel还是连接超时。尝试重启docker容器，提示iptables: No chain/target/match by that name.
 解决办法：
 重启docker服务，问题解决。`service docker restart`

 ##### 2020-12-19 补充关于dockers安装后无法启动的问题
 问题：
 今天在一台空白的centos上安装docker，安装完成后启动提升
 `Job for docker.service failed because the control process exited with error code. See "systemctl status docker.service" and "journalctl -xe" for details.`
 网上说是linux内核版本不够，升级后还是无法解决。
 解决办法：
 执行 vi /etc/sysconfig/selinux , 把 selinux 属性值改为disabled。然后重启系统，docker就可以顺利启动了。