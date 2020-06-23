先记录几个概念性的东西：
1. 有了异步处理方式为什么还需要使用消息队列
答：消息队列不单单是异步通知，还有解耦、消峰的作用。像dubbo这种rpc框架大多支持异步调用，但是无论怎么异步执行，主线程都需要等到所有调用完成后才能返回，而且中间如果增加或者减少调用环节，还需要修改代码。
而使用消息队列只需要将那些调用环节拆分为多个独立的服务，分别监听消息队列的信号就可以了。再加上消息队列自身有缓存能力，可以达到一个缓冲效果。
2. RocketMQ的存储机制
RockerMQ的消息可以分为3块：CommitLog 、ConsumeQueue 和 IndexFile。
![RocketMQ存储结构](./img/RockMQ存储模型.png)
CommitLog： 消息主体以及元数据的存储主体，存储 Producer 端写入的消息主体内容,消息内容不是定长的。单个文件大小默认1G ，文件名长度为20位，左边补零，剩余为起始偏移量，比如00000000000000000000代表了第一个文件，起始偏移量为0，文件大小为1G=1073741824；当第一个文件写满了，第二个文件为00000000001073741824，起始偏移量为1073741824，以此类推。消息主要是顺序写入日志文件，当文件满了，写入下一个文件。
为什么 CommitLog 文件要设计成固定大小的长度呢？提醒：内存映射机制。
ConsumeQueue： 消息消费队列。ConsumeQueue（逻辑消费队列）作为消费消息的索引，保存了指定 Topic 下的队列消息在 CommitLog 中的起始物理偏移量 offset ，消息大小 size 和消息 Tag 的 HashCode 值。consumequeue 文件可以看成是基于 topic 的 commitlog 索引文件，故 consumequeue 文件夹的组织方式如下：topic/queue/file三层组织结构，具体存储路径为：$HOME/store/consumequeue/{topic}/{queueId}/{fileName}。同样 consumequeue 文件采取定长设计，每一个条目共20个字节，分别为8字节的 commitlog 物理偏移量、4字节的消息长度、8字节tag hashcode，单个文件由30W个条目组成，可以像数组一样随机访问每一个条目，每个 ConsumeQueue文件大小约5.72M；
需要注意的是RockerMQ不会为每个Topic都分配一个存储文件(kafka是一个Topic对应一个文件)，这样做存储效率高，但是读取效率低。所以，在 RocketMQ 中又使用了 ConsumeQueue 作为每个队列的索引文件来 提升读取消息的效率。我们可以直接根据队列的消息序号，计算出索引的全局位置（索引序号*索引固定⻓度20），然后直接读取这条索引，再根据索引中记录的消息的全局位置，找到消息。
3. kafka使用zookeeper作为注册中心，而RocketMQ自带一个NameServer用于协调多个Broker，原理上差不多。
4. RocketMQ默认的配置非常吃内存，可以通过`vim runbroker.sh `来调整 ` JAVA_OPT="${JAVA_OPT} -server -Xms8g -Xmx8g -Xmn4g" `，否则很大几率是不能启动的。
    Xms :JVM在启动时申请的初始堆内存，默认为物理机的1/64但小于1G。当空余堆内存大于70%时，JVM就会调整heap到这个指定的值，可以认为他就是jvm的兜底堆空间。可通过-XX:MaxHeapFreeRation=来指定这个比列。Server端JVM最好将-Xms和-Xmx设为相同值，避免每次垃圾回收完成后JVM重新分配内存。
    Xmx ：JVM可申请的最大Heap值，默认值为物理内存的1/4但小于1G，当空余堆空间小于40%时，JVM会增大Heap到这个指定值，可以认为他就是JVM的最大堆空间。可通过-XX:MinHeapFreeRation=来指定这个比列。
    Xmn ：Java Heap Young区大小。整个堆大小=年轻代大小 + 年老代大小 + 持久代大小(相对于HotSpot 类型的虚拟机来说)。一般持久代固定为64M，所以当Xmn增大，老年代的空间就会减少。Sun推荐设置为整个堆的3/8
5. RocketMQ常用的操作命令
    nohup sh bin/mqnamesrv &        #启动namesrv服务
    nohup sh bin/mqbroker &         #启动broker服务，建议启动时指定 nohup sh bin/mqbroker -n localhost:9876 autoCreateTopicEnable=true -c conf/broker.conf &
    sh bin/mqshutdown broker        #关闭broker服务
    sh bin/mqshutdown namesrv       #关闭namesrv服务
6. 测试时遇到的坑
    6.1 发送信息时提示 No route info of this topic异常。
        请修改broker的启动参数，添加autoCreateTopicEnable=true，因为Broker默认禁止自动创建topic，如果用户没有事先手工创建topic就会提示启动该异常。
    6.2 发送信息时提示 .RemotingTooMuchRequestException: sendDefaultImpl call timeout
        请修改启动conf/broker.conf，`echo 'brokerIP1=200.200.3.38' > conf/broker.conf` .同时启动时指定使用该配置文件,启动参数中添加`-c conf/broker.conf`.
        这种情况一般出现在服务器上存在多块网卡，此时就需要指定ip地址。
7. RocketMQ的事务控制不同于数据库事务，不会整体成功或失败(据说3.x以前的版本会整体自动回滚)。我现在用的4.4版本，事务是通过补偿来实现最终一致性的。half消息会被发送到`RMQ_SYS_TRANS_HALF_TOPIC`这个主题中，在控制台看看可以，但是不要去取里面的数据。
8. RocketMQ的Consumer API名义上分为pull和push两种，其实本质上都是pull。DefaultMQPushConsumer其实并不是broker主动向consumer推送消息，而是consumer向broker发送请求，保持一种长连接。broker会每5秒检查一次是否有消息，如果有就发送给consumer。如果是单纯的推送是不应该有这个5秒延迟的。
9. 消息丢失的问题，可以通过修改落盘方式为同步落盘来解决。要落盘块可以使用FileChannel + DirectBuffer 池，使用堆外内存，加快内存拷贝。RandomAccessFile()获取到的就是一个FileChannel，留个影响，用到时再去详细研究
10. 关于消息堆积问题，可以再后台设置定时删除旧消息。同时根据TAG类型类分离消息，将重要的信息分开落库。
11. rocketmq支持定时消息，我觉得应该叫延迟消息比较合适， 通过`msg.setDelayTimeLevel(3)`来设置延迟级别：RcoketMQ的延时等级为：1s，5s，10s，30s，1m，2m，3m，4m，5m，6m，7m，8m，9m，10m，20m，30m，1h，2h。level=0，表示不延时。level=1，表示 1 级延时，对应延时 1s。level=2 表示 2 级延时，对应5s，以此类推。
这种模式适合消息生产和消费之间有时间窗口要求的场景，比如订单超过15分钟就投递一个关闭订单的消息等。
12. 有序消息。rocketmq的消息，在全局层面是无序的，但是在单个topic中的queue中是有序的，因此要实现有序消息，可以通过控制queue id来完成。比如支付中，通过对订单id取模，这样就能保证同一个订单下的所有数据必定都会发送到同一个queue中。
RocketMQ不同于其他MQ，不能上来就是干，需要修改配置文件`rocket/conf/2m-2s-async`，否则各种问题. RocketMQ默认的配置在开发测试环境下基本跑不起来(可能是我太穷了吧)，而且它的很多启动错误信息不像tomcat可以直接在控制全部看到，而是分散在很多日志文件中。发现启动错误一定要耐心查看每个logs下面的日志文件，不然盲目乱找只会浪费更多的时间。
```pro
#所属集群名字  
brokerClusterName=DefaultCluster
#broker名字,注意此处不同的配置文件填写的不一样
brokerName=broker-a
#0 表示 Master,>0 表示 Slave
brokerId=0
#nameServer地址,分号分割
namesrvAddr=127.0.0.1:9876

# **关键,多网卡下不指定IP可能抛出 .RemotingTooMuchRequestException: sendDefaultImpl call timeout 异常
brokerIP1=127.0.0.1

#在发送消息时,自动创建服务器不存在的topic,默认创建的队列数
defaultTopicQueueNums=4
#**是否允许 Broker 自动创建Topic,建议线下开启,线上关闭，这里设置了true似乎无效
autoCreateTopicEnable=true
#是否允许 Broker 自动创建订阅组,建议线下开启,线上关闭
autoCreateSubscriptionGroup=true
#Broker 对外服务的监听端口
listenPort=10911
#删除文件时间点,默认凌晨 4点
deleteWhen=04
#文件保留时间,默认 48 小时
fileReservedTime=48
#commitLog每个文件的大小默认1G
mapedFileSizeCommitLog=1073741824
#ConsumeQueue每个文件默认存30W条,根据业务情况调整
mapedFileSizeConsumeQueue=300000
#destroyMapedFileIntervalForcibly=120000
#redeleteHangedFileInterval=120000
#检测物理文件磁盘空间
diskMaxUsedSpaceRatio=88

#这里是我的 日志配置
#存储路径
storePathRootDir=/usr/mq/rocket/store
#commitLog 存储路径
storePathCommitLog=/usr/mq/rocket/store/commitlog
#消费队列存储路径存储路径
storePathConsumeQueue=/usr/mq/rocket/store/consumequeue
#消息索引存储路径
storePathIndex=/usr/mq/rocket/store/index
#checkpoint 文件存储路径，它是一个文件，因此再次路径下不能存在这样的文件夹，否则broker无法启动。linux下的文件是不强制要求有后缀名的
storeCheckpoint=/usr/mq/rocket/store/checkpoint
#abort 文件存储路径
abortFile=/usr/mq/rocket/store/abort


#限制的消息大小  
maxMessageSize=65536
#flushCommitLogLeastPages=4
#flushConsumeQueueLeastPages=2
#flushCommitLogThoroughInterval=10000
#flushConsumeQueueThoroughInterval=60000
#Broker 的角色
#- ASYNC_MASTER 异步复制Master
#- SYNC_MASTER 同步双写Master
#- SLAVE
brokerRole=ASYNC_MASTER
#刷盘方式
#- ASYNC_FLUSH 异步刷盘
#- SYNC_FLUSH 同步刷盘
flushDiskType=ASYNC_FLUSH

#checkTransactionMessageEnable=false
#发消息线程池数量
#sendMessageThreadPoolNums=128
#拉消息线程池数量
#pullMessageThreadPoolNums=128
```
进入conf目录，替换所有xml中的${user.home},保证日志路径正确。
    `sed -i 's#${user.home}#/usr/mq/rocket#g' *.xml `       # sed -i 's#原字符串#新字符串#g' 需要替换的文件，sed -i 批量替换

示例代码
```java
 public static void main(String[] args) throws MQClientException, UnsupportedEncodingException {
        //1.创建一个事务消息生产者
        //DefaultMQProducer producer = new DefaultMQProducer("order_producer");
        TransactionMQProducer producer = new TransactionMQProducer("tran_group");
        producer.setNamesrvAddr("192.168.50.144:9876");

        //2.指定消息监听对象，
        TransactionListenerImpl transactionListener = new TransactionListenerImpl();
        producer.setTransactionListener(transactionListener);

        //3.创建一个线程池
        ExecutorService executorService = new ThreadPoolExecutor(2, 5, 100, TimeUnit.SECONDS,
                new ArrayBlockingQueue<Runnable>(200), new ThreadFactory() {
            @Override
            public Thread newThread(Runnable r) {
                Thread thread = new Thread(r);
                thread.setName("client_transaction_msg");
                return thread;
            }
        });


        //4.将线程池给producer，因为消息回查是异步执行的
        producer.setExecutorService(executorService);
        producer.start();
        System.out.println("shifu=====================");
        Message msg = new Message("tran_message","tags","keys_","hello tran".getBytes(RemotingHelper.DEFAULT_CHARSET));
        //发送顺序消息，
//        producer.send(msg, new MessageQueueSelector() {
//            @Override
//            public MessageQueue select(List<MessageQueue> mqs, Message msg, Object arg) {
//                // arg的值其实就是orderId
//                        Integer id = (Integer) arg;
//
//                        // mqs是队列集合，也就是topic所对应的所有队列
//                        int index = id % mqs.size();
//
//                        // 这里根据前面的id对队列集合大小求余来返回所对应的队列
//                        return mqs.get(index);
//            }
//        },orderId);
        //发送事务消息
        TransactionSendResult sendResult = producer.sendMessageInTransaction(msg,"hello_hcy_tran");
        System.out.println( sendResult );
    }
```
```java
 public static void main(String[] args) throws MQClientException {
        //1.创建defaultMQConsumer
        DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("order_consumer2");
        //2.设置Namesrv地址
        consumer.setNamesrvAddr("192.168.50.144:9876");
        // 默认是集群模式，消息只会被消费一次，广播模式下才能实现消息广播
        consumer.setMessageModel(MessageModel.BROADCASTING);
        //3.设置从什么地方开始读取消息
        //CONSUME_FROM_LAST_OFFSET 默认策略，从该队列最尾开始消费，即跳过历史消息
        //CONSUME_FROM_FIRST_OFFSET 从队列最开始开始消费，即历史消息（还储存在broker的）全部消费一遍
        //CONSUME_FROM_TIMESTAMP 从某个时间点开始消费，和setConsumeTimestamp()配合使用，默认是半个小时以前
        consumer.setConsumeFromWhere(ConsumeFromWhere.CONSUME_FROM_FIRST_OFFSET);
        //4.设置要订阅的主题
        consumer.subscribe("RMQ_SYS_TRANS_HALF_TOPIC","*");
        //5.注册消息监听
        consumer.registerMessageListener(new MessageListenerOrderly() {
            @Override
            public ConsumeOrderlyStatus consumeMessage(List<MessageExt> msgs, ConsumeOrderlyContext context) {
                for ( MessageExt m:msgs ){
                    String topic = m.getTopic();
                    String tags = m.getTags();
                    String result = null;
                    try {
                        result = new String( m.getBody(), RemotingHelper.DEFAULT_CHARSET);
                        System.out.println( "消费信息，主题为："+ topic+",tags:"+tags+"消息体为："+result );
                    } catch (UnsupportedEncodingException e) {
                        e.printStackTrace();
                        return ConsumeOrderlyStatus.SUSPEND_CURRENT_QUEUE_A_MOMENT;
                    }
                }
                return ConsumeOrderlyStatus.SUCCESS;
            }
        });
        //6.启动消费服务
        consumer.start();
        System.out.println( "服务启动" );
    }
```